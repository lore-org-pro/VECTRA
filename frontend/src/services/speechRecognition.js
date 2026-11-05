// ========================================================
// VECTRA // STT SERVICE v6 — DUAL ENGINE (WEB SPEECH + GROQ WHISPER)
// Optimizado para máxima captación en laptops y aulas escolares:
// 1) Cero muting destructivo: captura 100% clara de cualquier micrófono
// 2) Web Speech API de alta velocidad como motor primario (0ms de latencia)
// 3) Whisper como respaldo automático si el navegador no soporta Web Speech
// 4) Constraints universales con deviceId "ideal" (nunca OverconstrainedError)
// 5) Nunca descarta texto en tránsito al soltar el botón o la barra espaciadora
// ========================================================

const BACKEND_TRANSCRIBE = '/api/transcribe';

const WAKE_WORDS = [
  'vectra', 'vepra', 'bectra', 'bepra', 'vecta', 'betra', 'veptra', 'vector',
  'ok vectra', 'oye vectra', 'hola vectra', 'hey vectra', 'ey vectra', 'vektra'
];

export class SpeechRecognitionService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isListening = false;
    this.stream = null;
    this.startTime = 0;

    // Dispositivos
    this.availableDevices = [];
    this.selectedDeviceId = null;
    this.activeDeviceLabel = 'Micrófono por defecto';

    // VU Meter (solo monitoreo visual, sin mutear audio)
    this.audioCtx = null;
    this.analyser = null;
    this.animFrameId = null;
    this.onAudioLevel = null; // (level: number 0.0 - 1.0)

    // Web Speech API
    this.recognition = null;
    this.webSpeechTranscript = '';
    this.finalTranscriptCaptured = false;

    // Wake Word engine
    this.wakeWordActive = false;
    this._wakeRec = null;
    this._wakeRearmTimer = null;
    this.onWakeWord = null;

    // Callbacks
    this.onInterimTranscript = null;
    this.onFinalTranscript = null;
    this.onError = null;
    this.onStateChange = null;

    // Config
    this.language = 'es-MX';
    this.minAudioMs = 200;

    this._initWebSpeech();
    this.refreshDevices();

    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', () => {
        this.refreshDevices();
      });
    }
  }

  // ──────────────────────────────────────────────
  // 1. Detección y Selección de Micrófonos
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

      if (!this.selectedDeviceId || !audioInputs.some((d) => d.deviceId === this.selectedDeviceId)) {
        const preferred = audioInputs.find((d) => d.isExternal) || audioInputs[0];
        if (preferred) {
          this.selectedDeviceId = preferred.deviceId;
          this.activeDeviceLabel = preferred.label;
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
    }
  }

  // ──────────────────────────────────────────────
  // 2. Web Speech API (Reconocimiento Primario Instantáneo)
  // ──────────────────────────────────────────────
  _initWebSpeech() {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SpeechRecognition) return;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;
      this.recognition.maxAlternatives = 2;

      this.recognition.onresult = (event) => {
        // SEGURIDAD TOTAL: Si el usuario NO tiene presionada la barra espaciadora, ignorar cualquier audio
        if (!this.isListening) return;

        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const t = res[0]?.transcript || '';
          if (res.isFinal) {
            final += t + ' ';
          } else {
            interim += t;
          }
        }

        const combined = (final + interim).trim();
        if (combined && this.isListening) {
          this.webSpeechTranscript = combined;
          if (this.onInterimTranscript) {
            this.onInterimTranscript(combined);
          }
        }
      };

      this.recognition.onerror = (event) => {
        if (event.error === 'network' || event.error === 'no-speech' || event.error === 'aborted') return;
        console.warn('[WebSpeech] Aviso:', event.error);
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try { this.recognition.start(); } catch {}
        }
      };
    } catch (err) {
      console.warn('[WebSpeech] Fallo al inicializar:', err.message);
    }
  }

  // ──────────────────────────────────────────────
  // 3. Iniciar Grabación (Push-To-Talk Exclusivo con Espacio)
  // ──────────────────────────────────────────────
  // ──────────────────────────────────────────────
  async start() {
    if (this.isListening) return;

    this.isListening = true;
    this.startTime = Date.now();
    this.audioChunks = [];
    this.webSpeechTranscript = '';
    this.finalTranscriptCaptured = false;

    if (this.onStateChange) this.onStateChange(true);

    // Constraints con supresión de ruido activa y SIN AGC descontrolado
    // (autoGainControl: false evita que el micro amplifique el vocerío del aula durante las pausas)
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: false,
        ...(this.selectedDeviceId ? { deviceId: { ideal: this.selectedDeviceId } } : {})
      }
    };

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('insecure_origin');
      }
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      if (err.message === 'insecure_origin' || !window.isSecureContext) {
        this.isListening = false;
        if (this.onStateChange) this.onStateChange(false);
        if (this.onError) this.onError('insecure_origin');
        return;
      }
      try {
        // Fallback a cualquier micrófono disponible
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err2) {
        console.error('[SpeechRec] Error accediendo a micrófono:', err2.message);
        this.isListening = false;
        if (this.onStateChange) this.onStateChange(false);
        if (this.onError) this.onError('mic_denied');
        return;
      }
    }

    const track = this.stream.getAudioTracks()[0];
    if (track?.label) {
      this.activeDeviceLabel = track.label;
    }

    // Iniciar filtro de aislamiento vocal y medidor de audio VU
    const recordStream = this._startAudioMeter() || this.stream;

    // Iniciar Web Speech API para subtítulos en vivo durante la pulsación
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch {}
    }

    // MediaRecorder de audio filtrado para Whisper (aislador de vocerío escolar)
    const mimeType = this._chooseMimeType();
    try {
      this.mediaRecorder = new MediaRecorder(recordStream, mimeType ? { mimeType } : {});
    } catch {
      this.mediaRecorder = new MediaRecorder(this.stream);
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.audioChunks.push(e.data);
    };

    try {
      this.mediaRecorder.start(100);
    } catch {}

    console.log(`[SpeechRec] 🎙️ Escuchando activamente desde: "${this.activeDeviceLabel}"`);
  }

  // ──────────────────────────────────────────────
  // 5. Cadena DSP de Aislamiento Vocal y Medidor VU
  // ──────────────────────────────────────────────
  _startAudioMeter() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx || !this.stream) return this.stream;

      this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      const source = this.audioCtx.createMediaStreamSource(this.stream);

      // FILTRO PASO ALTO 130 Hz: Corta retumbos graves de sala, ruidos de mesa y pisadas
      const highpass = this.audioCtx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 130;

      // FILTRO PASO BAJO 4600 Hz: Corta chillidos lejanos y ruidos de fondo de alta frecuencia
      const lowpass = this.audioCtx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 4600;

      // REALCE DE PRESENCIA VOCAL EN 2200 Hz (+4 dB): Prioriza la voz cercana al micro
      const presence = this.audioCtx.createBiquadFilter();
      presence.type = 'peaking';
      presence.frequency.value = 2200;
      presence.Q.value = 1.0;
      presence.gain.value = 4.0;

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.3;

      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(presence);
      presence.connect(this.analyser);

      let recordStream = this.stream;
      if (this.audioCtx.createMediaStreamDestination) {
        const dest = this.audioCtx.createMediaStreamDestination();
        presence.connect(dest);
        recordStream = dest.stream;
      }

      const buffer = new Uint8Array(this.analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!this.isListening) return;
        this.analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) sum += buffer[i];
        const avg = sum / buffer.length;
        const normalized = Math.min(1.0, Math.max(0.0, avg / 120.0));

        if (this.onAudioLevel) {
          this.onAudioLevel(normalized);
        }

        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      this.animFrameId = requestAnimationFrame(checkVolume);
      return recordStream;
    } catch (err) {
      console.warn('[SpeechRec] Error en medidor VU:', err.message);
      return this.stream;
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
    if (this.onAudioLevel) {
      this.onAudioLevel(0);
    }
  }

  // ──────────────────────────────────────────────
  // 6. Detener Grabación y Procesar Transcripción
  // ──────────────────────────────────────────────
  stop() {
    if (!this.isListening) return;
    this.isListening = false;
    this._stopAudioMeter();

    // Abortar inmediatamente Web Speech para evitar que escuche los altavoces de la laptop
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
    }

    // Detener MediaRecorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.onstop = () => {
        this._finalizeStop();
      };
      try {
        this.mediaRecorder.stop();
      } catch {
        this._finalizeStop();
      }
    } else {
      this._finalizeStop();
    }

    if (this.onStateChange) this.onStateChange(false);
  }

  async _finalizeStop() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }

    // PRIORIDAD AL MOTOR NEURONAL WHISPER EN AULAS RUIDOSAS CON VOCERÍO:
    // Whisper analiza el espectrograma completo y discrimina las voces lejanas.
    // Web Speech API se usa únicamente como respaldo si Whisper no responde.
    await this._processWithWhisper();
  }

  async _processWithWhisper() {
    const elapsed = Date.now() - this.startTime;
    const wsFallback = (this.webSpeechTranscript || '').trim();

    if (this.audioChunks.length === 0 || elapsed < this.minAudioMs) {
      if (wsFallback && this.onFinalTranscript) {
        this.onFinalTranscript(wsFallback);
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
        signal: AbortSignal.timeout(9000)
      });

      const data = await response.json().catch(() => ({ text: '' }));
      const text = (data.text || '').trim();

      if (text) {
        console.log(`[SpeechRec] ✅ Whisper (Voz aislada sin vocerío): "${text}"`);
        this.finalTranscriptCaptured = true;
        if (this.onFinalTranscript) this.onFinalTranscript(text);
      } else if (wsFallback) {
        console.log(`[SpeechRec] ⚠️ Respaldo Web Speech: "${wsFallback}"`);
        this.finalTranscriptCaptured = true;
        if (this.onFinalTranscript) this.onFinalTranscript(wsFallback);
      } else if (this.onError) {
        this.onError('empty_transcript');
      }
    } catch (err) {
      console.warn('[SpeechRec] Whisper no disponible por red, usando Web Speech:', err.message);
      if (wsFallback && this.onFinalTranscript) {
        this.onFinalTranscript(wsFallback);
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

  // ──────────────────────────────────────────────
  // WAKE WORD ENGINE — Modo Clase: "Di VECTRA para activarme"
  // ──────────────────────────────────────────────

  startWakeWordEngine() {
    if (this.wakeWordActive) return;
    this.wakeWordActive = true;
    this.onWakeWord = this.onWakeWord || null;
    console.log('[WakeWord] Motor de palabra de activación iniciado — Di "VECTRA" para hablar.');
    this._launchWakeWordInstance();
  }

  _launchWakeWordInstance() {
    if (!this.wakeWordActive) return;
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;
    if (!SpeechRecognition) {
      console.warn('[WakeWord] Web Speech API no disponible en este navegador.');
      return;
    }

    const wakeRec = new SpeechRecognition();
    this._wakeRec = wakeRec;
    wakeRec.continuous = false;
    wakeRec.interimResults = false;
    wakeRec.lang = this.language;
    wakeRec.maxAlternatives = 3;

    wakeRec.onresult = (event) => {
      if (!this.wakeWordActive) return;
      for (let i = 0; i < event.results.length; i++) {
        for (let j = 0; j < event.results[i].length; j++) {
          const heard = (event.results[i][j].transcript || '').toLowerCase().trim();
          const matched = WAKE_WORDS.some((w) => heard.includes(w));
          if (matched) {
            console.log(`[WakeWord] ✅ Detectado: "${heard}" — activando micrófono...`);
            if (this.onWakeWord) this.onWakeWord();
            // Iniciar grabación PTT automáticamente por 5 segundos
            this.start().then(() => {
              setTimeout(() => {
                if (this.isListening) this.stop();
              }, 5000);
            }).catch(() => {});
            return;
          }
        }
      }
      this._rearmWakeWord();
    };

    wakeRec.onerror = (e) => {
      if (e.error === 'aborted' || e.error === 'no-speech') {
        this._rearmWakeWord();
        return;
      }
      console.warn('[WakeWord] Error:', e.error);
      this._rearmWakeWord();
    };

    wakeRec.onend = () => {
      this._rearmWakeWord();
    };

    try {
      wakeRec.start();
    } catch (err) {
      console.warn('[WakeWord] No se pudo arrancar:', err.message);
      setTimeout(() => this._rearmWakeWord(), 1500);
    }
  }

  _rearmWakeWord() {
    if (!this.wakeWordActive) return;
    // No rearmar si ya estamos grabando activamente
    if (this.isListening) {
      setTimeout(() => this._rearmWakeWord(), 1000);
      return;
    }
    clearTimeout(this._wakeRearmTimer);
    this._wakeRearmTimer = setTimeout(() => {
      if (this.wakeWordActive && !this.isListening) {
        this._launchWakeWordInstance();
      }
    }, 400);
  }

  stopWakeWordEngine() {
    this.wakeWordActive = false;
    clearTimeout(this._wakeRearmTimer);
    if (this._wakeRec) {
      try { this._wakeRec.abort(); } catch {}
      this._wakeRec = null;
    }
    console.log('[WakeWord] Motor de palabra de activación detenido.');
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
