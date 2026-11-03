// ========================================================
// VECTRA // STT SERVICE v5 — WAKE WORD + GROQ WHISPER + WIRELESS/USB MIC SUPPORT
// Optimizado para:
//   1) Wake word "VECTRA" siempre escuchando en segundo plano (sin clic)
//   2) Micrófonos inalámbricos de solapa / USB dongle para exposiciones
//   3) Selección automática de micrófono externo prioritario
//   4) Medidor VU de audio en tiempo real para verificar señal inalámbrica
//   5) MediaRecorder + Groq Whisper (latencia <500ms, inmune a Brave)
// ========================================================

const BACKEND_TRANSCRIBE = '/api/transcribe';

// Variantes fonéticas que el reconocedor puede transcribir cuando se dice "VECTRA"
const WAKE_WORDS = [
  'vectra', 'vepra', 'bectra', 'bepra', 'vecta', 'betra', 'veptra', 'vector',
  'vectra,', 'vectra.', 'ok vectra', 'oye vectra', 'hola vectra', 'hey vectra',
  'ey vectra', 'actra', 'fetra', 'negra', 'letra', 'spetra', 'vek', 'vektra'
];

export class SpeechRecognitionService {
  constructor() {
    // —— Estado de grabación ——
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isListening = false;
    this.stream = null;
    this.startTime = 0;

    // —— Dispositivos de audio ——
    this.availableDevices = [];
    this.selectedDeviceId = null;
    this.activeDeviceLabel = 'Micrófono por defecto';

    // —— Medidor VU de audio en tiempo real ——
    this.audioCtx = null;
    this.analyser = null;
    this.animFrameId = null;
    this.onAudioLevel = null; // (level: number 0.0 - 1.0)

    // —— Web Speech API (subtítulos en tiempo real) ——
    this.recognition = null;
    this.webSpeechTranscript = '';

    // —— Callbacks ——
    this.onInterimTranscript = null; // (text: string)
    this.onFinalTranscript = null;   // (text: string)
    this.onError = null;             // (err: string)
    this.onStateChange = null;       // (listening: boolean)
    this.onWakeWord = null;          // () => void — se dispara al detectar "VECTRA"

    // —— Config ——
    this.language = 'es-MX';
    this.minAudioMs = 280;

    // —— Cancelación de Ruido de Aula y Puerta de Ruido Digital (Noise Gate) ——
    this.classroomMode = true; // Activo por defecto: máxima inmunidad a murmullos escolares
    this.noiseGateThreshold = 0.045; // Umbral calibrado (se autocalibra con el ruido de fondo)
    this.noiseGateGainNode = null;
    this.noiseCalibrationSamples = [];
    this.speechFramesCount = 0;
    this.isGateOpen = false;
    this.onGateStateChange = null; // (open: boolean)

    // —— Wake Word Engine (siempre escuchando en segundo plano) ——
    this.wakeWordRecognition = null;   // Instancia separada de Web Speech API
    this.wakeWordActive = false;       // ¿Está el motor de wake word escuchando?
    this.wakeWordArmed = true;         // ¿Listo para disparar? Se desarma durante grabación Whisper
    this.wakeWordRestartTimer = null;  // Timer para relanzar wakeWord si se cierra solo
    this.isWakeWordMode = false;       // true = usa wake word en clase (sin push-to-talk)

    this._initWebSpeech();
    this.refreshDevices();

    // Detectar si conectan o desconectan el receptor USB del micrófono inalámbrico
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', () => {
        console.log('[SpeechRec] Cambio de dispositivos detectado (micrófono USB conectado/desconectado)');
        this.refreshDevices();
      });
    }
  }

  // ──────────────────────────────────────────────
  // 1. Detección y Selección de Micrófonos (Inalámbricos / USB)
  // ──────────────────────────────────────────────
  async refreshDevices() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return [];

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter((d) => d.kind === 'audioinput')
        .map((d, idx) => {
          const label = d.label || `Micrófono ${idx + 1}`;
          const isExternal = /(wireless|inalambrico|usb|clip|solapa|lavalier|dongle|boya|rode|dji|fifine|headset|extern)/i.test(label);
          return {
            deviceId: d.deviceId,
            label,
            groupId: d.groupId,
            isExternal
          };
        });

      this.availableDevices = audioInputs;

      // Auto-seleccionar micrófono inalámbrico/USB prioritario si el usuario no ha forzado uno
      if (!this.selectedDeviceId || !audioInputs.some((d) => d.deviceId === this.selectedDeviceId)) {
        const preferred = audioInputs.find((d) => d.isExternal) || audioInputs[0];
        if (preferred) {
          this.selectedDeviceId = preferred.deviceId;
          this.activeDeviceLabel = preferred.label;
          console.log(`[SpeechRec] 🎙️ Micrófono activo: "${preferred.label}" (Prioridad Inalámbrico/USB: ${preferred.isExternal})`);
        }
      }

      return audioInputs;
    } catch (err) {
      console.warn('[SpeechRec] Error enumerando dispositivos:', err.message);
      return [];
    }
  }

  setDevice(deviceId) {
    this.selectedDeviceId = deviceId;
    const found = this.availableDevices.find((d) => d.deviceId === deviceId);
    if (found) {
      this.activeDeviceLabel = found.label;
      console.log(`[SpeechRec] Micrófono cambiado a: "${found.label}"`);
    }
  }

  // ──────────────────────────────────────────────
  // 2. Web Speech API (subtítulos instantáneos)
  // ──────────────────────────────────────────────
  _initWebSpeech() {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.language;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      if (!this.isListening) return;
      let interim = '';
      let final = '';
      for (let i = 0; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t + ' ';
        else interim += t;
      }
      const combined = (final + interim).trim();
      if (combined) this.webSpeechTranscript = combined;

      if (this.onInterimTranscript && combined) {
        this.onInterimTranscript(combined);
      }
    };

    this.recognition.onerror = (event) => {
      if (event.error === 'network' || event.error === 'no-speech') return;
      console.warn('[WebSpeech] Aviso:', event.error);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        try { this.recognition.start(); } catch {}
      }
    };
  }

  // ──────────────────────────────────────────────
  // 2b. Wake Word Engine — "VECTRA" en segundo plano
  // Motor ligero de detección de palabra de activación.
  // Usa una instancia SEPARADA de Web Speech API en modo continuo
  // que SOLO escucha la palabra "VECTRA" (y variantes fonéticas).
  // Cuando la detecta, lanza automáticamente la grabación Whisper.
  // ──────────────────────────────────────────────
  startWakeWordEngine() {
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;
    if (!SpeechRecognition) {
      console.warn('[WakeWord] Web Speech API no disponible en este navegador.');
      return;
    }
    if (this.wakeWordActive) return; // Ya está corriendo

    this.isWakeWordMode = true;
    this.wakeWordArmed = true;
    this._launchWakeWordInstance();
    console.log('[WakeWord] 🎙️ Motor de wake word "VECTRA" iniciado — siempre escuchando en segundo plano.');
  }

  _launchWakeWordInstance() {
    if (!this.isWakeWordMode) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      this.wakeWordRecognition = new SpeechRecognition();
      this.wakeWordRecognition.continuous = true;
      this.wakeWordRecognition.interimResults = true;
      this.wakeWordRecognition.lang = this.language;
      this.wakeWordRecognition.maxAlternatives = 3; // Más alternativas = más chances de detectar "VECTRA" con ruido

      this.wakeWordActive = true;

      this.wakeWordRecognition.onresult = (event) => {
        if (!this.wakeWordArmed || this.isListening) return;

        // Buscar la palabra clave en TODOS los resultados e hipótesis (incluso intermedios)
        for (let i = event.resultIndex; i < event.results.length; i++) {
          for (let a = 0; a < event.results[i].length; a++) {
            const raw = event.results[i][a].transcript.toLowerCase().trim();
            // Comprobar todas las variantes fonéticas de "VECTRA"
            const detected = WAKE_WORDS.some((w) => raw.includes(w));
            if (detected) {
              console.log(`[WakeWord] ✅ Wake word detectado: "${raw}" → Iniciando grabación Whisper...`);
              this._onWakeWordDetected();
              return;
            }
          }
        }
      };

      this.wakeWordRecognition.onerror = (event) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        console.warn('[WakeWord] Error:', event.error);
        this.wakeWordActive = false;
        // Reintentar automáticamente si el modo sigue activo
        if (this.isWakeWordMode) {
          clearTimeout(this.wakeWordRestartTimer);
          this.wakeWordRestartTimer = setTimeout(() => this._launchWakeWordInstance(), 1200);
        }
      };

      this.wakeWordRecognition.onend = () => {
        this.wakeWordActive = false;
        if (this.isWakeWordMode && !this.isListening) {
          // Reinicar inmediatamente para que no haya gap de detección
          clearTimeout(this.wakeWordRestartTimer);
          this.wakeWordRestartTimer = setTimeout(() => this._launchWakeWordInstance(), 300);
        }
      };

      this.wakeWordRecognition.start();
    } catch (err) {
      console.warn('[WakeWord] No se pudo iniciar:', err.message);
      this.wakeWordActive = false;
    }
  }

  _onWakeWordDetected() {
    // Desarmar para no disparar doble mientras grabamos
    this.wakeWordArmed = false;

    // Notificar a la UI para mostrar feedback visual/sonoro de activación
    if (this.onWakeWord) this.onWakeWord();

    // Pausar el reconocedor de wake word durante la grabación
    try { this.wakeWordRecognition?.abort(); } catch {}
    this.wakeWordActive = false;

    // Iniciar grabación Whisper completa
    this.start().then(() => {
      // Auto-detener tras 6 segundos de silencio (protección en clase ruidosa)
      // El stop() real lo hace el usuario o el noise gate
    }).catch((err) => {
      console.warn('[WakeWord] Error al iniciar grabación tras wake word:', err);
      this._rearmWakeWord();
    });

    // Auto-stop tras 7 segundos si el usuario no detuvo manualmente
    clearTimeout(this._wakeAutoStopTimer);
    this._wakeAutoStopTimer = setTimeout(() => {
      if (this.isListening) {
        console.log('[WakeWord] ⏱️ Auto-stop por timeout de 7s');
        this.stop();
      }
    }, 7000);
  }

  _rearmWakeWord() {
    clearTimeout(this._wakeAutoStopTimer);
    this.wakeWordArmed = true;
    if (this.isWakeWordMode && !this.isListening) {
      // Relanzar el motor de escucha wake word
      if (!this.wakeWordActive) {
        clearTimeout(this.wakeWordRestartTimer);
        this.wakeWordRestartTimer = setTimeout(() => this._launchWakeWordInstance(), 400);
      }
    }
  }

  stopWakeWordEngine() {
    this.isWakeWordMode = false;
    this.wakeWordArmed = false;
    this.wakeWordActive = false;
    clearTimeout(this.wakeWordRestartTimer);
    clearTimeout(this._wakeAutoStopTimer);
    try { this.wakeWordRecognition?.abort(); } catch {}
    this.wakeWordRecognition = null;
    console.log('[WakeWord] Motor de wake word detenido.');
  }

  // ──────────────────────────────────────────────
  // 3. Iniciar Grabación (Push-to-Talk o Toggle)
  // ──────────────────────────────────────────────
  async start() {
    if (this.isListening) return;

    this.isListening = true;
    this.startTime = Date.now();
    this.audioChunks = [];
    this.webSpeechTranscript = '';

    if (this.onStateChange) this.onStateChange(true);

    // Configuración acústica calibrada para entornos con ruido de aula o exterior:
    // echoCancellation: elimina el eco y reverberación de las paredes del aula
    // noiseSuppression: filtro activo contra murmullos y ruido ambiental
    // voiceIsolation: aislamiento de voz nativo en navegadores Chromium modernos
    const constraints = {
      audio: {
        channelCount: 1,
        sampleRate: 48000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        // Extensiones de aislamiento de voz para Google Chrome / Chromium
        voiceIsolation: true,
        googEchoCancellation: true,
        googAutoGainControl: true,
        googNoiseSuppression: true,
        googHighpassFilter: true,
        googTypingNoiseDetection: true,
        ...(this.selectedDeviceId ? { deviceId: { exact: this.selectedDeviceId } } : {})
      }
    };

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('insecure_origin');
      }
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      if (err.message === 'insecure_origin' || !window.isSecureContext) {
        console.warn('[SpeechRec] Contexto no seguro o mediaDevices no disponible. Se requiere HTTPS para el micrófono en red.');
        this.isListening = false;
        if (this.onStateChange) this.onStateChange(false);
        if (this.onError) this.onError('insecure_origin');
        return;
      }
      // Si falló con deviceId exacto, intentar con constraints genéricas con supresión de ruido
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (err2) {
        console.error('[SpeechRec] Micrófono inaccesible:', err2.message);
        this.isListening = false;
        if (this.onStateChange) this.onStateChange(false);
        if (this.onError) this.onError('mic_denied');
        return;
      }
    }

    // Actualizar etiqueta del dispositivo activo
    const track = this.stream.getAudioTracks()[0];
    if (track && track.label) {
      this.activeDeviceLabel = track.label;
    }

    // Iniciar cadena de procesamiento DSP en tiempo real (Filtros + VU Meter)
    this._startAudioDSP();

    // Subtítulos en paralelo si el navegador lo permite
    if (this.recognition) {
      try { this.recognition.start(); } catch {}
    }

    // MediaRecorder con stream limpio de hardware (aislamiento de voz APM nativo en C++ de Chromium)
    const mimeType = this._chooseMimeType();
    const recordStream = this.stream;
    try {
      this.mediaRecorder = new MediaRecorder(recordStream, mimeType ? { mimeType } : {});
    } catch {
      this.mediaRecorder = new MediaRecorder(recordStream);
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.audioChunks.push(e.data);
    };

    this.mediaRecorder.start(80);
    console.log(`[SpeechRec] 🎙️ Grabando con filtro antirruido desde: "${this.activeDeviceLabel}"`);
  }

  // ──────────────────────────────────────────────
  // 4. Cadena DSP de Audio y Puerta de Ruido Digital (Noise Gate)
  // ──────────────────────────────────────────────
  _startAudioDSP() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx || !this.stream) return;

      this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      const source = this.audioCtx.createMediaStreamSource(this.stream);

      // A) Filtro Paso Alto Etapa 1 (115Hz): suprime zumbidos de aire acondicionado y resonancias graves
      const highpass1 = this.audioCtx.createBiquadFilter();
      highpass1.type = 'highpass';
      highpass1.frequency.value = 115;
      highpass1.Q.value = 0.707;

      // B) Filtro Paso Alto Etapa 2 (135Hz): pendiente empinada de 24dB/octava contra ruido de pasos y mesas
      const highpass2 = this.audioCtx.createBiquadFilter();
      highpass2.type = 'highpass';
      highpass2.frequency.value = 135;
      highpass2.Q.value = 0.707;

      // C) Filtro Paso Bajo (3800Hz): elimina siseos, tecleos y murmullos agudos lejanos del salón
      const lowpass = this.audioCtx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 3800;
      lowpass.Q.value = 0.8;

      // D) Filtro Peaking a 2.6kHz: realza formantes vocales y articulación de consonantes en español
      const voiceBoost = this.audioCtx.createBiquadFilter();
      voiceBoost.type = 'peaking';
      voiceBoost.frequency.value = 2600;
      voiceBoost.Q.value = 1.3;
      voiceBoost.gain.value = 4.5;

      // E) Compresor dinámico: nivela la voz cercana y comprime picos repentinos
      const compressor = this.audioCtx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, this.audioCtx.currentTime);
      compressor.knee.setValueAtTime(8, this.audioCtx.currentTime);
      compressor.ratio.setValueAtTime(4.5, this.audioCtx.currentTime);
      compressor.attack.setValueAtTime(0.003, this.audioCtx.currentTime);
      compressor.release.setValueAtTime(0.20, this.audioCtx.currentTime);

      // F) Puerta de Ruido Digital (Noise Gate): atenúa en 98% el ruido cuando nadie habla de cerca
      this.noiseGateGainNode = this.audioCtx.createGain();
      this.noiseGateGainNode.gain.setValueAtTime(0.02, this.audioCtx.currentTime);

      // G) Analizador VU
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.25;

      // H) Destino de stream procesado y limpio para alimentar MediaRecorder
      const dest = this.audioCtx.createMediaStreamDestination();

      // Cadena en serie: source -> highpass1 -> highpass2 -> lowpass -> voiceBoost -> compressor -> noiseGate -> analyser -> dest
      source.connect(highpass1);
      highpass1.connect(highpass2);
      highpass2.connect(lowpass);
      lowpass.connect(voiceBoost);
      voiceBoost.connect(compressor);
      compressor.connect(this.noiseGateGainNode);
      this.noiseGateGainNode.connect(this.analyser);
      this.noiseGateGainNode.connect(dest);

      this.processedStream = dest.stream;

      const buffer = new Uint8Array(this.analyser.frequencyBinCount);
      this.noiseCalibrationSamples = [];
      this.speechFramesCount = 0;
      this.isGateOpen = false;
      const dspStartTime = Date.now();

      const checkVolume = () => {
        if (!this.isListening) return;
        this.analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) sum += buffer[i];
        const avg = sum / buffer.length;
        const normalized = Math.min(1.0, Math.max(0.0, avg / 128.0));

        const elapsed = Date.now() - dspStartTime;

        // Autocalibración del ruido ambiental del aula durante los primeros 120ms
        if (elapsed < 120) {
          this.noiseCalibrationSamples.push(normalized);
        } else if (this.noiseCalibrationSamples.length > 0) {
          const avgNoise = this.noiseCalibrationSamples.reduce((a, b) => a + b, 0) / this.noiseCalibrationSamples.length;
          // El umbral de la puerta se coloca un 55% por encima del ruido ambiental medido
          this.noiseGateThreshold = Math.max(0.035, Math.min(0.22, avgNoise * 1.55));
          this.noiseCalibrationSamples = [];
          console.log(`[SpeechRec] 🛡️ Ruido de fondo aula: ${(avgNoise * 100).toFixed(1)}% | Umbral puerta: ${(this.noiseGateThreshold * 100).toFixed(1)}%`);
        }

        // Control adaptativo de la Puerta de Ruido (Noise Gate)
        if (normalized >= this.noiseGateThreshold) {
          this.speechFramesCount++;
          if (this.noiseGateGainNode) {
            this.noiseGateGainNode.gain.setTargetAtTime(1.0, this.audioCtx.currentTime, 0.008);
          }
          if (!this.isGateOpen) {
            this.isGateOpen = true;
            if (this.onGateStateChange) this.onGateStateChange(true);
          }
        } else {
          if (this.noiseGateGainNode) {
            this.noiseGateGainNode.gain.setTargetAtTime(0.02, this.audioCtx.currentTime, 0.06);
          }
          if (this.isGateOpen) {
            this.isGateOpen = false;
            if (this.onGateStateChange) this.onGateStateChange(false);
          }
        }

        if (this.onAudioLevel) {
          this.onAudioLevel(normalized);
        }

        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      this.animFrameId = requestAnimationFrame(checkVolume);
    } catch (err) {
      console.warn('[SpeechRec] Error en DSP/VU meter:', err.message);
      this.processedStream = null;
    }
  }

  _stopAudioMeter() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try { this.audioCtx.close(); } catch {}
      this.audioCtx = null;
    }
    this.processedStream = null;
    if (this.onAudioLevel) {
      this.onAudioLevel(0);
    }
  }

  // ──────────────────────────────────────────────
  // 5. Detener Grabación y Enviar a Whisper
  // ──────────────────────────────────────────────
  stop() {
    if (!this.isListening) return;
    this.isListening = false;
    this._stopAudioMeter();

    if (this.recognition) {
      try { this.recognition.abort(); } catch {}
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.onstop = () => {
        this._stopAudioMeter();
        if (this.stream) {
          this.stream.getTracks().forEach((t) => t.stop());
          this.stream = null;
        }
        this._processAudio();
      };
      try {
        this.mediaRecorder.stop();
      } catch {
        this._stopAudioMeter();
        if (this.stream) {
          this.stream.getTracks().forEach((t) => t.stop());
          this.stream = null;
        }
        this._processAudio();
      }
    } else {
      this._stopAudioMeter();
      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
        this.stream = null;
      }
      this._processAudio();
    }

    if (this.onStateChange) this.onStateChange(false);

    // Si estábamos en modo wake word, re-armar el motor para escuchar el próximo "VECTRA"
    if (this.isWakeWordMode) {
      this._rearmWakeWord();
    }
  }

  // ──────────────────────────────────────────────
  // 6. Transcripción con Groq Whisper
  // ──────────────────────────────────────────────
  async _processAudio() {
    const elapsed = Date.now() - this.startTime;

    // Si no hubo energía vocal por encima del umbral de ruido del aula, descartar ruido silenciosamente
    if (this.audioChunks.length === 0 || elapsed < this.minAudioMs) {
      const wsText = this.webSpeechTranscript.trim();
      if (wsText && this.onFinalTranscript) {
        this.onFinalTranscript(wsText);
      } else if (this.onError) {
        this.onError('empty_transcript');
      }
      return;
    }

    const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
    const audioBlob = new Blob(this.audioChunks, { type: mimeType });

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const response = await fetch(BACKEND_TRANSCRIBE, {
        method: 'POST',
        headers: {
          'Content-Type': mimeType
        },
        body: arrayBuffer,
        signal: AbortSignal.timeout(12000)
      });

      const data = await response.json().catch(() => ({ text: '' }));
      const text = (data.text || '').trim();

      if (text) {
        console.log(`[SpeechRec] ✅ Whisper: "${text}" (${data.durationMs || 0}ms)`);
        if (this.onFinalTranscript) this.onFinalTranscript(text);
      } else {
        const wsText = this.webSpeechTranscript.trim();
        if (wsText && this.onFinalTranscript) {
          this.onFinalTranscript(wsText);
        } else if (this.onError) {
          this.onError('empty_transcript');
        }
      }
    } catch (err) {
      console.warn('[SpeechRec] Whisper fallback:', err.message);
      const wsText = this.webSpeechTranscript.trim();
      if (wsText && this.onFinalTranscript) {
        this.onFinalTranscript(wsText);
      } else if (this.onError) {
        this.onError('empty_transcript');
      }
    }
  }

  _chooseMimeType() {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ];
    return candidates.find((t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) || '';
  }

  toggle() {
    if (this.isListening) this.stop();
    else this.start();
    return this.isListening;
  }

  setLanguage(lang) {
    this.language = lang;
    if (this.recognition) this.recognition.lang = lang;
  }
}

export const speechService = new SpeechRecognitionService();
