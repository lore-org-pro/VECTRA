// ========================================================
// VECTRA // PROCEDURAL SCI-FI AUDIO FX (Web Audio API)
// ========================================================

class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 880, duration = 0.08, type = 'sine', gainVal = 0.05) {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignorar si el audio context aún está bloqueado
    }
  }

  // Sonido de clic sci-fi sutil
  playClick() {
    this.playBeep(1200, 0.04, 'triangle', 0.03);
  }

  // Confirmación positiva (dos tonos ascendentes)
  playConfirm() {
    if (!this.enabled || !this.ctx) return;
    this.playBeep(600, 0.06, 'sine', 0.04);
    setTimeout(() => this.playBeep(900, 0.08, 'sine', 0.04), 60);
  }

  // Cambio de estado o alerta
  playAlert() {
    this.playBeep(450, 0.15, 'sawtooth', 0.02);
  }

  // Sonido de encendido / boot
  playBoot() {
    if (!this.enabled || !this.ctx) return;
    const freqs = [300, 450, 600, 900, 1200];
    freqs.forEach((f, i) => {
      setTimeout(() => this.playBeep(f, 0.1, 'sine', 0.04), i * 70);
    });
  }

  // Sonido suave de tiza escribiendo en la pizarra
  playChalk() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.value = 1800 + Math.random() * 800;
      filter.Q.value = 2.5;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450 + Math.random() * 200, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.045);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch {}
  }

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

export const soundFX = new SoundFX();
