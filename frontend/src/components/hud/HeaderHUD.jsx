import React, { useState, useEffect } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Activity, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { soundFX } from '../../utils/audioFX';

export default function HeaderHUD({
  theme,
  setTheme,
  activeProvider = 'GROQ-LLAMA3.3',
  systemState = 'reposo',
  screenMode = 'face',
  onReturnToFace,
  isDemoMode = false,
  onOpenPresenter
}) {
  const [timeStr, setTimeStr] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Reloj en tiempo real
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('es-MX', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        }) + '.' + Math.floor(now.getMilliseconds() / 100)
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 100);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    soundFX.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSoundToggle = () => {
    const enabled = soundFX.toggleSound();
    setSoundEnabled(enabled);
    if (enabled) soundFX.playConfirm();
  };

  const themes = [
    { id: 'cyan', label: 'CIAN', color: '#00f0ff' },
    { id: 'blue', label: 'AZUL', color: '#2d82ff' },
    { id: 'green', label: 'VERDE', color: '#00ff73' },
    { id: 'amber', label: 'ÁMBAR', color: '#ffaa00' }
  ];

  return (
    <header className="vectra-header h-14 border-b border-[var(--bg-panel-border)] bg-[var(--bg-panel)] backdrop-blur-md px-4 flex items-center justify-between z-20 select-none">
      {/* 1. Logo e Identidad del Sistema */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded border border-[var(--primary)] flex items-center justify-center bg-[var(--primary-dark)]/40 relative glow-box">
          <span className="font-orbitron font-bold text-sm text-[var(--primary)]">V</span>
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--primary)] animate-ping" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-orbitron font-black text-base tracking-widest text-[var(--primary)] glow-primary">
              VECTRA
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--primary-dark)] text-[var(--primary)] font-mono border border-[var(--primary)]/30">
              JARVIS-AI
            </span>
          </div>
          <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-wider">
            {screenMode === 'face' ? 'MODO HOLOGRÁFICO // ESPERANDO VOZ' : 'MODO DESARROLLO ANALÍTICO & 3D'}
          </p>
        </div>
      </div>

      {/* 2. Botón Destacado: VOLVER AL ROSTRO (cuando está en workspace) */}
      {screenMode === 'workspace' && (
        <button
          onClick={() => {
            soundFX.playConfirm();
            onReturnToFace();
          }}
          className="hud-btn bg-[var(--primary)] text-black font-bold px-4 py-1.5 rounded-full glow-box flex items-center gap-2 animate-pulse"
          title="Regresar a la cara holográfica (o di 'ya' con tu voz)"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VOLVER AL ROSTRO (o di "ya") [Esc]</span>
        </button>
      )}

      {/* 3. Telemetría Central: Proveedor IA + Modo + Reloj */}
      <div className="flex items-center gap-4">
        <div 
          onClick={onOpenPresenter}
          title="Abrir Panel Presentador (Tecla P)"
          className="cursor-pointer flex items-center gap-2 px-3 py-1 rounded border border-[var(--bg-panel-border)] bg-black/40 hover:border-[var(--primary)] transition-all font-mono text-xs"
        >
          <Cpu className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span className="text-[var(--text-muted)]">IA:</span>
          <span className={`font-semibold ${isDemoMode ? 'text-[var(--warning)]' : 'text-[var(--primary)]'}`}>
            {isDemoMode ? 'MODO DEMO OFFLINE' : activeProvider}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] bg-white/5 px-1 rounded ml-1">P</span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded border border-[var(--bg-panel-border)] bg-black/40 font-mono text-xs">
          <Activity className="w-3.5 h-3.5 text-[var(--success)]" />
          <span className="text-[var(--text-muted)]">ESTADO:</span>
          <span className="font-semibold text-[var(--text-main)] uppercase">{systemState}</span>
        </div>

        <div className="hidden lg:flex items-center font-mono text-xs tracking-widest text-[var(--primary)] px-2 py-1 bg-black/50 border border-[var(--bg-panel-border)] rounded">
          {timeStr}
        </div>
      </div>

      {/* 4. Selector de Temas, Sonido y Pantalla Completa */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded border border-[var(--bg-panel-border)]">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); soundFX.playClick(); }}
              title={`Tema ${t.label}`}
              className={`w-4 h-4 rounded-full transition-transform ${theme === t.id ? 'scale-125 ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}
              style={{ backgroundColor: t.color }}
            />
          ))}
        </div>

        <button
          onClick={handleSoundToggle}
          title={soundEnabled ? 'Silenciar Efectos' : 'Activar Efectos'}
          className="p-1.5 rounded border border-[var(--bg-panel-border)] hover:border-[var(--primary)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[var(--danger)]" />}
        </button>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa (F11)'}
          className="p-1.5 rounded border border-[var(--bg-panel-border)] hover:border-[var(--primary)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
