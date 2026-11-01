import React, { useState } from 'react';
import { Power, ShieldCheck, Cpu, Sparkles, Volume2 } from 'lucide-react';
import { soundFX } from '../../utils/audioFX';
import { audioPlayer } from '../../services/audioPlayer';

export default function StartModal({ onStart }) {
  const [booting, setBooting] = useState(false);
  const [bootStep, setBootStep] = useState('ESPERANDO AUTORIZACIÓN DEL OPERADOR');

  const handleStart = () => {
    soundFX.init();
    audioPlayer.init();
    soundFX.playBoot();
    setBooting(true);

    const steps = [
      'CALIBRANDO RED NEURONAL HOLOGRÁFICA...',
      'SINCRONIZANDO ESPACIO VECTORIAL 3D...',
      'VERIFICANDO ROUTER MULTI-PROVEEDOR (GROQ/GEMINI/OLLAMA)...',
      'DESBLOQUEANDO SUBSISTEMA DE AUDIO Y VISEMAS...',
      'VECTRA ONLINE // BIENVENIDO'
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setBootStep(step);
        if (index === steps.length - 1) {
          setTimeout(() => {
            onStart();
          }, 400);
        }
      }, (index + 1) * 350);
    });
  };

  return (
    <div 
      onClick={handleStart}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] select-none cursor-pointer"
    >
      {/* Marco Futurista Semitransparente para ver el rostro 3D detrás */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="hud-panel max-w-lg w-full p-8 border border-[var(--primary)] glow-box rounded-2xl flex flex-col items-center text-center relative overflow-hidden bg-black/75 backdrop-blur-md shadow-[0_0_50px_rgba(0,240,255,0.25)]"
      >
        {/* Esquinas decorativas */}
        <div className="corner-tl" />
        <div className="corner-tr" />
        <div className="corner-bl" />
        <div className="corner-br" />

        {/* Círculo Holográfico Central */}
        <div className="w-20 h-20 rounded-full border-2 border-[var(--primary)] flex items-center justify-center mb-6 relative bg-[var(--primary-dark)]/30">
          <Cpu className="w-10 h-10 text-[var(--primary)] animate-pulse" />
          <div className="absolute inset-0 rounded-full border border-dashed border-[var(--primary)] animate-radar" />
        </div>

        {/* Título y Descripción */}
        <h2 className="font-orbitron font-black text-2xl tracking-widest text-[var(--primary)] glow-primary mb-2">
          SISTEMA VECTRA
        </h2>
        <p className="text-xs font-mono text-[var(--text-muted)] tracking-wider mb-6">
          ASISTENTE HOLOGRÁFICO CONVERSACIONAL DE ÁLGEBRA VECTORIAL & GEOMETRÍA ANALÍTICA
        </p>

        {/* Resumen de Capacidades */}
        <div className="w-full bg-black/50 border border-[var(--bg-panel-border)] rounded p-3 mb-6 text-left text-xs font-mono space-y-1.5 text-[var(--text-main)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" />
            <span>Motor Matemático Verificador en tiempo real</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>Rostro Holográfico 3D con Lip-Sync reactivo</span>
          </div>
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-[var(--secondary)]" />
            <span>Voz de alta fidelidad con cadena de respaldo total</span>
          </div>
        </div>

        {/* Estado del Boot */}
        <div className="w-full font-mono text-[11px] text-[var(--primary)] mb-6 h-6 flex items-center justify-center">
          {bootStep}
        </div>

        {/* Botón de Inicialización */}
        <button
          onClick={handleStart}
          disabled={booting}
          className={`w-full py-3.5 rounded font-orbitron font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all ${
            booting
              ? 'bg-[var(--primary)]/50 text-black cursor-wait'
              : 'bg-[var(--primary)] hover:bg-white text-black glow-box cursor-pointer'
          }`}
        >
          <Power className="w-4 h-4" />
          {booting ? 'INICIALIZANDO...' : 'INICIALIZAR SISTEMA VECTRA'}
        </button>

        <p className="text-[10px] font-mono text-[var(--text-muted)] mt-4">
          * Activa el AudioContext y concede acceso al micrófono para la proyección en vivo.
        </p>
      </div>
    </div>
  );
}
