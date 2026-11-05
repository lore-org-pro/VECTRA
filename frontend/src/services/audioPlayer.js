// ========================================================
// VECTRA // BULLETPROOF AUDIO PLAYER WITH VISUAL ANALYSER
// ========================================================

export class AudioPlayerService {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.currentSource = null;
    this.currentAudio = null;
    this.isPlaying = false;
    this.animationId = null;

    this.onViseme = null;
    this.onAudioLevel = null;
    this.onStart = null;
    this.onEnd = null;
    this.onTimeUpdate = null; // (currentTime, duration, fraction)

    // Configuración de audio
    this.rate = 1.0;
    this.volume = 1.0;

    // Cache de voces del navegador
    this.availableVoices = [];
    this.initVoices();
  }

  /**
   * Inicialización segura del AudioContext dentro de un gesto del usuario
   */
  init() {
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.audioCtx = new AudioCtx();
          this.analyser = this.audioCtx.createAnalyser();
          this.analyser.fftSize = 512;
          this.analyser.smoothingTimeConstant = 0.4;
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
    } catch (err) {
      console.warn('[AudioPlayer] Error inicializando AudioContext:', err);
    }
  }

  initVoices() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      try {
        this.availableVoices = window.speechSynthesis.getVoices() || [];
      } catch {}
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  getBestSpanishVoice() {
    let voices = [];
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        voices = window.speechSynthesis.getVoices() || [];
        if (voices.length > 0) {
          this.availableVoices = voices;
        }
      } catch {}
    }
    if (voices.length === 0) {
      voices = this.availableVoices || [];
    }

    // Filtrar estrictamente voces en español (lang empieza con 'es' o nombre incluye spanish/español)
    const spanishVoices = voices.filter((v) => {
      const lang = (v.lang || '').toLowerCase();
      const name = (v.name || '').toLowerCase();
      // Descartar categóricamente voces en inglés u otros idiomas
      if (lang.startsWith('en') || lang.startsWith('fr') || lang.startsWith('de') || lang.startsWith('pt')) return false;
      return lang.startsWith('es') || name.includes('spanish') || name.includes('español');
    });

    if (spanishVoices.length === 0) {
      return null;
    }

    // 1. Voces neurales / naturales de alta calidad de Microsoft o Google en español latinoamericano (es-MX / es-US / es-419)
    const naturalLatin = spanishVoices.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      const isLatin = lang.includes('mx') || lang.includes('us') || lang.includes('419') || lang.includes('co') || lang.includes('ar');
      const isNatural = name.includes('natural') || name.includes('online') || name.includes('google');
      return isLatin && isNatural;
    });
    if (naturalLatin) return naturalLatin;

    // 2. Voces masculinas en español (Jorge, Raul, Pablo, Diego, etc.)
    const maleKeywords = ['jorge', 'raul', 'pablo', 'diego', 'alvaro', 'enrique', 'carlos', 'mateo', 'miguel', 'david', 'manuel', 'antonio', 'pedro', 'juan', 'male', 'hombre'];
    const femaleKeywords = ['sabina', 'paulina', 'helena', 'monica', 'laura', 'elena', 'lucia', 'victoria', 'mia', 'sofia', 'zira', 'eva', 'hilda', 'female', 'mujer'];

    const maleEs = spanishVoices.find((v) => {
      const name = v.name.toLowerCase();
      const isMale = maleKeywords.some((k) => name.includes(k));
      const isFemale = femaleKeywords.some((k) => name.includes(k));
      return isMale && !isFemale;
    });
    if (maleEs) return maleEs;

    // 3. Voces mexicanas o latinoamericanas generales
    const latinEs = spanishVoices.find((v) => {
      const lang = v.lang.toLowerCase();
      return lang.includes('mx') || lang.includes('us') || lang.includes('419');
    });
    if (latinEs) return latinEs;

    // 4. Cualquier voz en español garantizada
    return spanishVoices[0] || null;
  }

  /**
   * Reproduce audio desde una URL (MP3 generado por backend o en caché)
   * Usa Web Audio API (decodeAudioData) para sincronización labial exacta,
   * con respaldo automático e instantáneo a HTML5 Audio.
   */
  async playUrl(url) {
    this.stop();
    this.init();

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch {}
    }

    // INTENTO 1: Web Audio Buffer (Análisis espectral y visemas de alta fidelidad)
    if (this.audioCtx && this.analyser) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);

        const source = this.audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = this.rate;

        // CADENA DSP ACÚSTICA PARA FERIAS Y AULAS ESCOLARES (Potencia, Brillo y Compresión Broadcast)
        // 1. Filtro paso alto para cortar retumbos graves de mesa y evitar distorsión en parlantes de laptop/proyector
        const highPass = this.audioCtx.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.frequency.value = 85;

        // 2. Calidez vocal controlada (sin resonancia opaca)
        const bassWarmth = this.audioCtx.createBiquadFilter();
        bassWarmth.type = 'peaking';
        bassWarmth.frequency.value = 220;
        bassWarmth.Q.value = 1.1;
        bassWarmth.gain.value = 1.5;

        // 3. Resaltado de formantes de inteligibilidad (3000 Hz) para atravesar murmullos escolares
        const voiceClarity = this.audioCtx.createBiquadFilter();
        voiceClarity.type = 'peaking';
        voiceClarity.frequency.value = 3000;
        voiceClarity.Q.value = 1.2;
        voiceClarity.gain.value = 5.5; // +5.5 dB de presencia para máxima inteligibilidad en aulas ruidosas

        // 4. Compresor de emisión (Broadcast Leveler) que eleva sílabas suaves sin saturar
        const compressor = this.audioCtx.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.knee.value = 4;
        compressor.ratio.value = 8;
        compressor.attack.value = 0.002;
        compressor.release.value = 0.12;

        // 5. Ganancia de amplificación maestra para eventos escolares
        const gainNode = this.audioCtx.createGain();
        gainNode.gain.value = Math.min(2.0, this.volume * 1.85); // Amplificación limpia de +5.3 dB

        // Conectar la cadena analítica completa
        source.connect(highPass);
        highPass.connect(bassWarmth);
        bassWarmth.connect(voiceClarity);
        voiceClarity.connect(compressor);
        compressor.connect(this.analyser);
        this.analyser.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        this.currentSource = source;
        this.isPlaying = true;
        this.playbackStartTime = this.audioCtx.currentTime;
        this.playbackDuration = audioBuffer.duration;

        if (this.onStart) this.onStart();
        this.startAnalysisLoop();

        return new Promise((resolve) => {
          source.onended = () => {
            if (this.onTimeUpdate) this.onTimeUpdate(this.playbackDuration, this.playbackDuration, 1.0);
            this.stop();
            if (this.onEnd) this.onEnd();
            resolve();
          };
          source.start(0);
        });
      } catch (decodeErr) {
        console.warn('[AudioPlayer] Decodificación Web Audio falló, activando HTML5 Audio:', decodeErr.message);
      }
    }

    // INTENTO 2: HTML5 Audio Directo (Supervivencia ante bloqueos de decodificación)
    return new Promise((resolve) => {
      try {
        const audio = new Audio();
        audio.src = url;
        audio.volume = this.volume;
        audio.playbackRate = this.rate;
        this.currentAudio = audio;

        audio.onplay = () => {
          this.isPlaying = true;
          if (this.onStart) this.onStart();
          this.startSimulatedLipSync();
        };

        audio.onended = () => {
          this.stop();
          if (this.onEnd) this.onEnd();
          resolve();
        };

        audio.onerror = (e) => {
          console.warn('[AudioPlayer] HTML5 Audio error:', e);
          this.stop();
          if (this.onEnd) this.onEnd();
          resolve();
        };

        audio.play().catch((playErr) => {
          console.warn('[AudioPlayer] audio.play() bloqueado por navegador:', playErr);
          this.stop();
          if (this.onEnd) this.onEnd();
          resolve();
        });
      } catch (err) {
        console.warn('[AudioPlayer] Error general en HTML5 Audio:', err);
        this.stop();
        if (this.onEnd) this.onEnd();
        resolve();
      }
    });
  }

  /**
   * Respaldo por voz del navegador (SpeechSynthesis)
   * Retorna una Promise que resuelve cuando termina de hablar.
   * Incluye keepalive para Chrome/Brave que pausa la síntesis a los ~15s.
   */
  speakBrowser(text) {
    this.stop();
    if (typeof window === 'undefined' || !window.speechSynthesis) return Promise.resolve();

    return new Promise((resolve) => {
      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX';
        utterance.rate = 1.0; // Cadencia natural y enérgica
        utterance.pitch = 1.02; // Tono claro y brillante para cortar el murmullo de sala
        utterance.volume = 1.0; // Volumen al 100% máximo del sistema

        const voice = this.getBestSpanishVoice();
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        }

        // Keepalive: Chrome pausa la síntesis cada ~14-15s; este intervalo la reanuda
        let keepAliveInterval = null;
        const startKeepAlive = () => {
          clearInterval(keepAliveInterval);
          keepAliveInterval = setInterval(() => {
            if (!window.speechSynthesis.speaking) {
              clearInterval(keepAliveInterval);
              return;
            }
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }, 12000);
        };

        utterance.onstart = () => {
          this.isPlaying = true;
          if (this.onStart) this.onStart();
          this.startSimulatedLipSync();
          startKeepAlive();
        };

        const finish = () => {
          clearInterval(keepAliveInterval);
          this.stop();
          if (this.onEnd) this.onEnd();
          resolve();
        };

        utterance.onend = finish;
        utterance.onerror = (e) => {
          // 'interrupted' es normal cuando se cancela intencionalmente — no loguear
          if (e.error !== 'interrupted' && e.error !== 'canceled') {
            console.warn('[AudioPlayer] SpeechSynthesis error:', e.error);
          }
          finish();
        };

        window.speechSynthesis.speak(utterance);

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (err) {
        console.warn('[AudioPlayer] SpeechSynthesis error general:', err);
        this.stop();
        if (this.onEnd) this.onEnd();
        resolve();
      }
    });
  }

  /**
   * Bucle de análisis de frecuencias para visemas
   */
  startAnalysisLoop() {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const update = () => {
      if (!this.isPlaying) return;
      this.analyser.getByteFrequencyData(dataArray);

      // Reporte de sincronización de tiempo en alta precisión
      if (this.audioCtx && this.playbackStartTime && this.playbackDuration) {
        const elapsed = this.audioCtx.currentTime - this.playbackStartTime;
        const frac = Math.min(1.0, Math.max(0, elapsed / this.playbackDuration));
        if (this.onTimeUpdate) {
          this.onTimeUpdate(elapsed, this.playbackDuration, frac);
        }
      }

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      const normalizedLevel = Math.min(1.0, avg / 75);

      if (this.onAudioLevel) {
        this.onAudioLevel(normalizedLevel);
      }

      let lowEnergy = 0;
      let midEnergy = 0;
      let highEnergy = 0;

      for (let i = 2; i < 8; i++) lowEnergy += dataArray[i];
      for (let i = 8; i < 24; i++) midEnergy += dataArray[i];
      for (let i = 24; i < 60; i++) highEnergy += dataArray[i];

      let viseme = 'closed';
      if (normalizedLevel > 0.07) {
        if (midEnergy > lowEnergy && midEnergy > highEnergy) {
          viseme = 'A';
        } else if (highEnergy > midEnergy) {
          viseme = highEnergy > 500 ? 'E' : 'I';
        } else {
          viseme = lowEnergy > 500 ? 'O' : 'U';
        }
      }

      if (this.onViseme) {
        this.onViseme(viseme);
      }

      this.animationId = requestAnimationFrame(update);
    };

    update();
  }

  startSimulatedLipSync() {
    const visemes = ['A', 'E', 'I', 'O', 'U', 'closed'];
    const interval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(interval);
        if (this.onViseme) this.onViseme('closed');
        if (this.onAudioLevel) this.onAudioLevel(0);
        return;
      }
      const v = visemes[Math.floor(Math.random() * visemes.length)];
      if (this.onViseme) this.onViseme(v);
      if (this.onAudioLevel) this.onAudioLevel(0.4 + Math.random() * 0.4);
    }, 120);
  }

  stop() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch {}
      this.currentSource = null;
    }
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    if (this.onViseme) this.onViseme('closed');
    if (this.onAudioLevel) this.onAudioLevel(0);
  }

  /**
   * Obtiene datos de frecuencia espectral en tiempo real para visualizadores holográficos
   */
  getFrequencyData(binCount = 32) {
    if (!this.analyser) return new Uint8Array(binCount);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data.slice(0, binCount);
  }
}

export const audioPlayer = new AudioPlayerService();
