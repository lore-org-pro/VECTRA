import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { animate } from 'animejs';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  FastForward,
  Sparkles,
  Gauge
} from 'lucide-react';
import { soundFX } from '../../utils/audioFX';
import { audioPlayer } from '../../services/audioPlayer';
import { cleanAndSanitizeLaTeX, cleanTextForDisplay, formatFallbackMath } from '../../utils/latexUtils';

/**
 * Renderizador de KaTeX seguro con estilo de tiza blanca/crema
 */
function ChalkKaTeX({ math = '', block = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !math) return;
    const sanitized = cleanAndSanitizeLaTeX(math);
    try {
      katex.render(sanitized, containerRef.current, {
        displayMode: block,
        throwOnError: false
      });

      // Si KaTeX generó un nodo de error interno, rescatar con formato amigable
      const errorNode = containerRef.current.querySelector('.katex-error');
      if (errorNode) {
        const fallback = formatFallbackMath(math);
        katex.render(cleanAndSanitizeLaTeX(fallback), containerRef.current, {
          displayMode: block,
          throwOnError: false
        });
      }
    } catch {
      if (containerRef.current) {
        containerRef.current.innerText = formatFallbackMath(math);
      }
    }
  }, [math, block]);

  return (
    <span 
      ref={containerRef} 
      className={`${block ? 'block my-1' : 'inline'} chalk-katex text-white filter drop-shadow-[0_0_1px_rgba(255,255,255,0.8)]`} 
    />
  );
}

/**
 * Tokenizador para dividir expresiones matemáticas en símbolos individuales para dibujo paso a paso
 */
function tokenizeMath(str) {
  if (!str) return [];
  return str.split(/(\s+|[+\-*\/=^()\[\],]|\d+(?:\.\d+)?|\S)/g).filter(Boolean);
}

export default function ProcedureBoard({
  procedureData = null,
  activeStepIndex = 0,
  onStepChange,
  onGoToResult,
  onExplainEasier,
  onExplainDetail
}) {
  const data = procedureData || {
    titulo: 'Pizarrón Escolar de Procedimiento',
    pasos: [
      {
        titulo: 'Planteamiento: Suma Aritmética',
        latex: '1 + 1',
        explicacion: 'Identificamos los sumandos: operando izquierdo 1 y operando derecho 1.'
      },
      {
        titulo: 'Procedimiento de Cálculo',
        latex: '1 + 1 = 2',
        explicacion: 'Efectuando la suma paso a paso obtenemos el resultado 2.'
      }
    ],
    resultado: {
      latex: '1 + 1 = 2',
      texto: 'El resultado es 2.'
    }
  };

  const steps = data.pasos || [];
  const isLastStep = steps.length <= 1 || activeStepIndex >= steps.length - 1;
  const currentStep = steps[activeStepIndex] || steps[0] || {
    titulo: 'Procedimiento de Cálculo',
    latex: '1 + 1 = 2',
    explicacion: 'Calculando...'
  };

  const rawFormula = currentStep.latex || '';
  const sanitizedFormula = cleanAndSanitizeLaTeX(rawFormula);
  const isMatrixOrComplex = /pmatrix|matrix|aligned|\\vec|\\mathbf|\\frac|\^|_|\\cdot|\\times/i.test(sanitizedFormula);
  const isSimpleMath = !isMatrixOrComplex && /^[\d\s+\-*\/=().^,]+$/.test(sanitizedFormula);
  const tokens = isSimpleMath ? tokenizeMath(sanitizedFormula) : [];

  // Velocidad de dibujo: 'despacio' (Profesor ~850ms), 'normal' (~450ms), 'rapido' (~200ms)
  const [speedMode, setSpeedMode] = useState('despacio');

  const speedConfig = {
    despacio: { tokenDelay: 850, charDelay: 40, latexStep: 2, label: '🐢 Despacio (Profesor)' },
    normal: { tokenDelay: 450, charDelay: 25, latexStep: 4, label: '⚡ Normal' },
    rapido: { tokenDelay: 200, charDelay: 15, latexStep: 8, label: '⏩ Rápido' }
  }[speedMode] || { tokenDelay: 850, charDelay: 40, latexStep: 2, label: '🐢 Despacio' };

  // Estados de animación de dibujo con anime.js
  const [tokenProgress, setTokenProgress] = useState(0);
  const [latexProgress, setLatexProgress] = useState(0);
  const [writtenExplanation, setWrittenExplanation] = useState('');
  const [isWriting, setIsWriting] = useState(true);
  const [showResult, setShowResult] = useState(false);

  // Reiniciar y animar dibujo cuando cambia el paso o la velocidad
  useEffect(() => {
    setIsWriting(true);
    setTokenProgress(0);
    setLatexProgress(0);
    setWrittenExplanation('');
    setShowResult(false);

    let isCancelled = false;
    const explanationText = currentStep.explicacion || '';

    if (isSimpleMath) {
      // DIBUJO AL PASO SINCRONIZADO CON LA VOZ (ANIME.JS & AUDIO PLAYER)
      let currentToken = 0;
      const totalTokens = tokens.length;
      let tokenInterval = null;

      const advanceToken = () => {
        if (currentToken >= totalTokens) return;
        currentToken += 1;
        setTokenProgress(currentToken);
        soundFX.playChalk();

        const tokenIdx = currentToken - 1;
        setTimeout(() => {
          const el = document.querySelector(`.chalk-token-${tokenIdx}`);
          if (el) {
            try {
              animate(el, {
                scale: [0.3, 1.15, 1],
                opacity: [0, 1],
                translateY: [-10, 0],
                duration: 500,
                ease: 'outBack'
              });
            } catch {}
          }
        }, 10);
      };

      // Si el audio está activo, sincronizamos directamente con el audioPlayer
      const prevTimeUpdate = audioPlayer.onTimeUpdate;
      audioPlayer.onTimeUpdate = (currentTime, duration, fraction) => {
        if (isCancelled) return;

        // La primera mitad del audio (0% a 55%) revela los números según el avance de la voz
        if (totalTokens > 0) {
          const speechPart = Math.min(1.0, fraction / 0.55);
          const targetToken = Math.min(totalTokens, Math.floor(speechPart * (totalTokens + 0.3)));
          
          while (currentToken < targetToken) {
            advanceToken();
          }
        }

        // De 55% a 92% escribe la explicación en pizarra
        if (fraction >= 0.55 && explanationText.length > 0) {
          const expFraction = Math.min(1.0, (fraction - 0.55) / 0.37);
          const chars = Math.floor(expFraction * explanationText.length);
          setWrittenExplanation(explanationText.slice(0, chars));
        }

        // Al finalizar el audio
        if (fraction >= 0.94) {
          setIsWriting(false);
          if (isLastStep) {
            setShowResult(true);
          }
        }
      };

      // Fallback con temporizador si el audio no está sonando (por ejemplo en repetición manual)
      if (!audioPlayer.isPlaying) {
        tokenInterval = setInterval(() => {
          if (isCancelled) return;
          advanceToken();

          if (currentToken >= totalTokens) {
            clearInterval(tokenInterval);
            setTimeout(() => {
              if (!isCancelled) startExplanationTyping();
            }, 500);
          }
        }, speedConfig.tokenDelay);
      }

      return () => {
        isCancelled = true;
        if (tokenInterval) clearInterval(tokenInterval);
        audioPlayer.onTimeUpdate = prevTimeUpdate;
      };
    } else {
      // FÓRMULA COMPLEJA: Revelado gradual con tiza
      let p = 0;
      let latexInterval = null;

      const prevTimeUpdate = audioPlayer.onTimeUpdate;
      audioPlayer.onTimeUpdate = (currentTime, duration, fraction) => {
        if (isCancelled) return;
        const targetP = Math.min(100, Math.floor((fraction / 0.6) * 100));
        if (targetP > p) {
          p = targetP;
          setLatexProgress(p);
          if (p % 10 === 0) soundFX.playChalk();
        }

        if (fraction >= 0.6 && explanationText.length > 0) {
          const expFraction = Math.min(1.0, (fraction - 0.6) / 0.35);
          const chars = Math.floor(expFraction * explanationText.length);
          setWrittenExplanation(explanationText.slice(0, chars));
        }

        if (fraction >= 0.95) {
          setIsWriting(false);
          if (isLastStep) {
            setShowResult(true);
          }
        }
      };

      if (!audioPlayer.isPlaying) {
        latexInterval = setInterval(() => {
          if (isCancelled) return;
          p += speedConfig.latexStep;
          if (p % 10 === 0) soundFX.playChalk();
          setLatexProgress(Math.min(100, p));

          if (p >= 100) {
            clearInterval(latexInterval);
            setTimeout(() => {
              if (!isCancelled) startExplanationTyping();
            }, 400);
          }
        }, 70);
      }

      return () => {
        isCancelled = true;
        if (latexInterval) clearInterval(latexInterval);
        audioPlayer.onTimeUpdate = prevTimeUpdate;
      };
    }

    function startExplanationTyping() {
      let charIdx = 0;
      const charInterval = setInterval(() => {
        if (isCancelled) return;
        charIdx += 2;
        setWrittenExplanation(explanationText.slice(0, charIdx));
        if (charIdx % 10 === 0) soundFX.playChalk();

        if (charIdx >= explanationText.length) {
          clearInterval(charInterval);
          setIsWriting(false);
          soundFX.playConfirm();

          if (isLastStep) {
            setShowResult(true);

            // Celebración sutil con canvas-confetti al finalizar la solución definitiva
            try {
              confetti({
                particleCount: 40,
                spread: 55,
                origin: { y: 0.72, x: 0.65 },
                colors: ['#fef08a', '#34d399', '#6ee7b7', '#fde047', '#ffffff'],
                disableForReducedMotion: true,
                ticks: 100
              });
            } catch {}

            // Animar la tarjeta de resultado con anime.js
            setTimeout(() => {
              const card = document.querySelector('.chalk-result-card');
              if (card) {
                try {
                  animate(card, {
                    scale: [0.85, 1],
                    opacity: [0, 1],
                    translateY: [15, 0],
                    duration: 650,
                    ease: 'outElastic(1, .8)'
                  });
                } catch {}
              }
            }, 50);
          }
        }
      }, speedConfig.charDelay);
    }
  }, [activeStepIndex, currentStep.latex, currentStep.explicacion, speedMode]);

  // Completar animación de inmediato
  const handleSkipAnimation = () => {
    soundFX.playClick();
    setTokenProgress(tokens.length);
    setLatexProgress(100);
    setWrittenExplanation(currentStep.explicacion || '');
    setIsWriting(false);
    if (isLastStep) {
      setShowResult(true);
    }
  };

  // Repetir dibujo desde el inicio
  const handleReplay = () => {
    soundFX.playClick();
    setTokenProgress(0);
    setLatexProgress(0);
    setWrittenExplanation('');
    setShowResult(false);
    setIsWriting(true);
  };

  const handlePrev = () => {
    if (activeStepIndex > 0) {
      soundFX.playClick();
      onStepChange(activeStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeStepIndex < steps.length - 1) {
      soundFX.playClick();
      onStepChange(activeStepIndex + 1);
    }
  };

  // Alternar velocidad
  const cycleSpeed = () => {
    soundFX.playClick();
    if (speedMode === 'despacio') setSpeedMode('normal');
    else if (speedMode === 'normal') setSpeedMode('rapido');
    else setSpeedMode('despacio');
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-5 select-none relative overflow-hidden rounded-3xl bg-slate-950/80 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.55)] text-slate-100">
      {/* Estilos globales neón para KaTeX con espaciado anti-clipping */}
      <style>{`
        .chalk-katex, .chalk-katex * {
          color: #e0f2fe !important;
          border-color: #38bdf8 !important;
          text-shadow: 0 0 6px rgba(56, 189, 248, 0.6), 0 0 18px rgba(56, 189, 248, 0.25) !important;
        }
        .chalk-katex .katex-display {
          margin: 0.15em 0 !important;
        }
        .chalk-katex .katex {
          font-size: clamp(1.2rem, 2.4vw, 2rem) !important;
          line-height: 1.35 !important;
        }
      `}</style>

      {/* ── FONDOS AMBIENTALES GLASSMORPHISM ── */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/12 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-emerald-500/12 blur-3xl pointer-events-none" />

      {/* 2. Cabecera del Pizarrón: Título y Controles */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-white font-sans">
              {data.titulo || 'Procedimiento Matemático Paso a Paso'}
            </h2>
            <div className="text-[11px] text-cyan-300/80 font-mono font-semibold">
              PASO {activeStepIndex + 1} DE {steps.length}
            </div>
          </div>
        </div>

        {/* Acciones: Selector de Velocidad, Replay y Skip */}
        <div className="flex items-center gap-2">
          {/* Selector de Velocidad de Dibujo */}
          <button
            onClick={cycleSpeed}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Cambiar velocidad de dibujo"
          >
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>{speedConfig.label}</span>
          </button>

          <button
            onClick={handleReplay}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 text-xs font-mono flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Repetir paso"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Repetir</span>
          </button>

          {isWriting && (
            <button
              onClick={handleSkipAnimation}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-mono flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Mostrar todo de golpe"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Todo</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Área Central de Dibujo de Números (Al paso, despacio como profesor) */}
      <div className="relative z-10 flex-1 flex flex-col justify-start py-1.5 px-1 overflow-y-auto">
        {/* Píldora de Razonamiento Previo (Muestra que pensó antes de calcular) */}
        {data.razonamiento && (
          <div className="mb-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-xs flex items-center justify-between gap-2 shadow-xs shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span className="font-mono text-[10px] text-cyan-300 font-bold uppercase tracking-wider shrink-0">
                Razonamiento:
              </span>
              <span className="text-emerald-200/90 font-sans text-xs truncate">
                {data.razonamiento.dominio} • {data.razonamiento.estrategia}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0 font-semibold">
              ✓ Verificado
            </span>
          </div>
        )}

        {/* Título del paso */}
        <div className="mb-1 shrink-0">
          <span 
            className="text-sm sm:text-base font-bold text-emerald-200 tracking-wide"
            style={{ fontFamily: "'Patrick Hand', 'Caveat', cursive, sans-serif" }}
          >
            {currentStep.titulo}
          </span>
        </div>

        {/* Pizarra glass interior: Espacio amplio sin cortes en el borde superior */}
        <div className="my-2 p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-cyan-400/30 shadow-[0_12px_36px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center min-h-[110px] relative overflow-x-auto overflow-y-visible">
          {/* Brillo de borde superior sutil */}
          <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

          {isSimpleMath ? (
            /* ========================================================
               A) DIBUJO DESPACIO DE NÚMEROS Y SÍMBOLOS
               ======================================================== */
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2.5 text-3xl sm:text-5xl md:text-6xl font-bold tracking-wider text-white py-1">
              {tokens.slice(0, tokenProgress).map((tok, i) => {
                if (tok === ' ') return <span key={i} className="inline-block w-2 sm:w-3">&nbsp;</span>;
                const isOp = ['+', '-', '*', '/', '=', '×', '÷'].includes(tok.trim());
                return (
                  <span
                    key={i}
                    className={`chalk-token-${i} inline-block mx-0.5 ${
                      isOp ? 'text-cyan-300 font-extrabold' : 'text-white font-bold'
                    }`}
                    style={{
                      fontFamily: "'JetBrains Mono', 'Chakra Petch', sans-serif",
                      textShadow: '0 0 6px rgba(56,189,248,0.7), 0 0 16px rgba(56,189,248,0.3)'
                    }}
                  >
                    {tok}
                  </span>
                );
              })}

              {/* Cursor activo animado que dibuja los trazos */}
              {tokenProgress < tokens.length && (
                <span className="inline-flex items-center text-cyan-400 animate-pulse text-2xl sm:text-4xl ml-2">
                  |
                </span>
              )}
            </div>
          ) : (
            /* ========================================================
               B) FÓRMULA LATEX COMPLEJA (Vectores, matrices, integrales)
               ======================================================== */
            <div className="relative w-full text-center py-2 overflow-y-visible">
              <div 
                className="transition-all duration-100 overflow-x-auto overflow-y-visible py-2"
                style={{ clipPath: `inset(-40px ${100 - latexProgress}% -40px -40px)` }}
              >
                <ChalkKaTeX math={sanitizedFormula} block={true} />
              </div>
              {latexProgress < 100 && (
                <span 
                  className="absolute top-1/2 -translate-y-1/2 text-cyan-400 text-xl animate-pulse pointer-events-none"
                  style={{ left: `${Math.max(0, Math.min(95, latexProgress))}%` }}
                >
                  ✎
                </span>
              )}
            </div>
          )}
        </div>

        {/* Explicación didáctica en tarjeta glass */}
        {writtenExplanation && (
          <div className="mt-2 p-3 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 shadow-md">
            <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
              {cleanTextForDisplay(writtenExplanation)}
              {isWriting && writtenExplanation.length < (currentStep.explicacion || '').length && (
                <span className="inline-block w-1.5 h-3.5 bg-cyan-400 ml-1 animate-pulse" />
              )}
            </p>
          </div>
        )}

        {/* Acceso al Pizarrón de Resultado Final (Al culminar los pasos) */}
        {isLastStep && onGoToResult && (
          <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 border border-cyan-400/30 flex flex-wrap items-center justify-between gap-3 shadow-lg shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span className="font-bold text-cyan-100 text-xs sm:text-sm tracking-wide font-sans">
                Procedimiento completado. Puedes ver el análisis completo en el Pizarrón de Resultado.
              </span>
            </div>

            <button
              onClick={() => {
                soundFX.playClick();
                onGoToResult();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
            >
              <span>Ver Resultado Final</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Barra Inferior de Navegación de Pasos */}
      <div className="relative z-10 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        {/* Navegación de Pasos */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={activeStepIndex === 0}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm active:scale-95"
            title="Paso anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>

          {activeStepIndex < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-100 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all shadow-sm active:scale-95"
              title="Paso siguiente"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : onGoToResult ? (
            <button
              onClick={() => {
                soundFX.playClick();
                onGoToResult();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-lg animate-pulse active:scale-95"
              title="Abrir Pizarrón de Resultado Final"
            >
              <span>Ver Resultado Final</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-mono text-slate-400">
          <span>VECTRA // Procedimiento Paso a Paso</span>
        </div>
      </div>
    </div>
  );
}
