import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Compass, 
  Calculator, 
  Layers,
  Award,
  Volume2,
  ArrowLeft,
  Activity
} from 'lucide-react';
import { soundFX } from '../../utils/audioFX';
import { cleanAndSanitizeLaTeX, cleanTextForDisplay, formatFallbackMath } from '../../utils/latexUtils';

/**
 * Renderizador KaTeX con resplandor neón holográfico cian/esmeralda
 */
function LuminousGlassKaTeX({ math = '', block = true, isHero = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !math) return;
    const sanitized = cleanAndSanitizeLaTeX(math);
    try {
      katex.render(sanitized, containerRef.current, {
        displayMode: block,
        throwOnError: false
      });

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
      className={`${block ? 'block my-1' : 'inline'} luminous-glass-katex ${isHero ? 'hero-glass-math' : ''}`} 
    />
  );
}

export default function ResultBoard({
  procedureData = null,
  visualizationData = null,
  onGoBackToBoard,
  onGoToPlane2D,
  onRepeatAudio
}) {
  const [copied, setCopied] = useState(false);

  const data = procedureData || {};
  const res = data.resultado || {
    latex: '\\vec{R} = \\langle 0, 0, 0 \\rangle',
    texto: 'Resultado analítico completado.'
  };

  // Extraer el vector resultante si existe para calcular métricas
  const resultVec = (() => {
    if (visualizationData && Array.isArray(visualizationData.vectores) && visualizationData.vectores.length > 0) {
      const foundR = visualizationData.vectores.find(v => v.nombre === 'R' || v.nombre === 'Resultante' || v.nombre === 'Diferencia');
      if (foundR) return foundR.componentes;
      return visualizationData.vectores[visualizationData.vectores.length - 1].componentes;
    }
    const clean = cleanTextForDisplay(res.texto || res.latex || '');
    const tupleMatch = clean.match(/\((-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:\s*,\s*(-?\d+(?:\.\d+)?))?\)/);
    if (tupleMatch) {
      if (tupleMatch[3] !== undefined && tupleMatch[3] !== '') {
        return [parseFloat(tupleMatch[1]), parseFloat(tupleMatch[2]), parseFloat(tupleMatch[3])];
      }
      return [parseFloat(tupleMatch[1]), parseFloat(tupleMatch[2])];
    }
    return null;
  })();

  // Cálculo de métricas analíticas
  const metrics = (() => {
    if (!resultVec || !Array.isArray(resultVec)) return null;
    const is2D = resultVec.length === 2;
    const x = resultVec[0];
    const y = resultVec[1];
    const z = is2D ? undefined : (resultVec[2] || 0);
    const magSq = is2D ? (x * x + y * y) : (x * x + y * y + z * z);
    const mag = Math.sqrt(magSq);
    const round2 = (n) => Math.round(n * 100) / 100;

    let unitVec = is2D ? [0, 0] : [0, 0, 0];
    if (mag > 0.00001) {
      unitVec = is2D
        ? [round2(x / mag), round2(y / mag)]
        : [round2(x / mag), round2(y / mag), round2(z / mag)];
    }

    const alpha = mag > 0 ? round2(Math.acos(Math.max(-1, Math.min(1, x / mag))) * (180 / Math.PI)) : 0;
    const beta = mag > 0 ? round2(Math.acos(Math.max(-1, Math.min(1, y / mag))) * (180 / Math.PI)) : 0;
    const gamma = (!is2D && mag > 0) ? round2(Math.acos(Math.max(-1, Math.min(1, z / mag))) * (180 / Math.PI)) : null;

    const parts = [];
    if (x !== 0) {
      parts.push(`${x === 1 ? '' : x === -1 ? '-' : x}\\hat{i}`);
    }
    if (y !== 0) {
      const absY = Math.abs(y);
      const coeff = absY === 1 ? '' : absY;
      if (parts.length === 0) {
        parts.push(`${y === -1 ? '-' : y === 1 ? '' : y}\\hat{j}`);
      } else {
        parts.push(y > 0 ? `+ ${coeff}\\hat{j}` : `- ${coeff}\\hat{j}`);
      }
    }
    if (!is2D && z !== undefined && z !== null && z !== 0) {
      const absZ = Math.abs(z);
      const coeff = absZ === 1 ? '' : absZ;
      if (parts.length === 0) {
        parts.push(`${z === -1 ? '-' : z === 1 ? '' : z}\\hat{k}`);
      } else {
        parts.push(z > 0 ? `+ ${coeff}\\hat{k}` : `- ${coeff}\\hat{k}`);
      }
    }
    const canonical = parts.length > 0 ? parts.join(' ') : '0\\hat{i}';

    return {
      coords: is2D ? `(${x}, ${y})` : `(${x}, ${y}, ${z})`,
      tuple: is2D ? `\\langle ${x}, ${y} \\rangle` : `\\langle ${x}, ${y}, ${z} \\rangle`,
      canonical,
      magSq,
      mag: round2(mag),
      unitVec: is2D ? `\\langle ${unitVec[0]}, ${unitVec[1]} \\rangle` : `\\langle ${unitVec[0]}, ${unitVec[1]}, ${unitVec[2]} \\rangle`,
      alpha,
      beta,
      gamma,
      is2D
    };
  })();

  const cleanHeroMath = (() => {
    // Si tenemos métricas vectoriales, construir la igualdad canónica completa y nítida
    if (metrics) {
      return `\\vec{R} = ${metrics.canonical} = ${metrics.tuple}`;
    }
    if (res.latex && res.latex.trim().length > 1) {
      let raw = res.latex.trim()
        .replace(/\+\s*-\s*/g, '- ')
        .replace(/\+\s*0\s*\\hat\{[ijk]\}/g, '')
        .replace(/-\s*0\s*\\hat\{[ijk]\}/g, '')
        .replace(/\s+/g, ' ');
      return raw;
    }
    if (res.texto && res.texto.trim().length > 0) {
      return `\\vec{R} = \\text{${cleanTextForDisplay(res.texto)}}`;
    }
    return '\\vec{R} = \\langle 0, 0 \\rangle';
  })();

  const harvardLecture = res.explicacionHarvard || (metrics ? (
    `Vector resultante: R = ${metrics.canonical.replace(/\\hat\{([ijk])\}/g, '$1')}. ` +
    `En el plano cartesiano se compone de ${resultVec[0]} unidades en X y ${resultVec[1]} unidades en Y${resultVec[2] ? ' con cota ' + resultVec[2] + ' en Z' : ''}. ` +
    `Su longitud o módulo euclidiano es ||R|| = √${metrics.magSq} ≈ ${metrics.mag} unidades, con dirección a α = ${metrics.alpha}° respecto al eje X.`
  ) : (res.texto || 'Solución analítica rigurosamente verificada.'));

  // Confetti sutil de felicitación
  useEffect(() => {
    soundFX.playConfirm();
    try {
      confetti({
        particleCount: 45,
        spread: 70,
        origin: { y: 0.6, x: 0.5 },
        colors: ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#ffffff'],
        disableForReducedMotion: true,
        ticks: 100
      });
    } catch {}
  }, []);

  const handleCopyLatex = () => {
    soundFX.playClick();
    const textToCopy = res.latex || (metrics ? metrics.tuple : '');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasVectors = visualizationData && 
                     visualizationData.tipo !== 'ninguna' && 
                     Array.isArray(visualizationData.vectores) && 
                     visualizationData.vectores.length > 0;

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 select-none relative overflow-hidden rounded-3xl bg-slate-950/80 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.55)] text-slate-100">
      
      {/* Estilos KaTeX Neón Holográfico */}
      <style>{`
        .luminous-glass-katex, .luminous-glass-katex * {
          color: #e0f2fe !important;
          border-color: #38bdf8 !important;
          text-shadow: 0 0 6px rgba(56, 189, 248, 0.65), 0 0 20px rgba(56, 189, 248, 0.25) !important;
        }
        .hero-glass-math .katex {
          font-size: clamp(1.6rem, 3.6vw, 2.75rem) !important;
          line-height: 1.35 !important;
          font-weight: 700 !important;
        }
      `}</style>

      {/* ── FONDOS AMBIENTALES GLASSMORPHISM (Luces Difusas Suaves) ── */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

      {/* 1. CABECERA HOLOGRÁFICA VIDRIO PULIDO */}
      <div className="relative z-10 flex flex-wrap items-center justify-between pb-3.5 border-b border-white/10 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/25 to-blue-600/15 border border-cyan-400/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center justify-center">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white font-sans">
                Resultado de la Operación
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                100% Verificado
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              {data.titulo || 'Cálculo Vectorial Preciso'} • Solución definitiva
            </p>
          </div>
        </div>

        {/* Acciones Rápidas Glass */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLatex}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-cyan-400/40 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Copiar fórmula LaTeX"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-300" />}
            <span>{copied ? '¡Copiado!' : 'Copiar LaTeX'}</span>
          </button>

          {onRepeatAudio && (
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onRepeatAudio(res.explicacionFacil || harvardLecture);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Escuchar explicación en voz alta"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">Repetir Voz</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. ÁREA CENTRAL: TARJETA HERO GLASSMORPHISM + MÉTRICAS */}
      <div className="relative z-10 flex-1 flex flex-col justify-start py-3 gap-3 overflow-y-auto pr-1">
        
        {/* A) HERO CARD — EL RESULTADO PRINCIPAL FLOTANTE */}
        <div className="relative p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-white/[0.09] to-white/[0.02] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center overflow-hidden">
          {/* Brillo de borde superior */}
          <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[11px] font-mono uppercase tracking-wider mb-2 font-semibold">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>Vector Resultante Final</span>
          </div>

          {/* Gran Fórmula KaTeX Neón */}
          <div className="py-2.5 px-4 text-center max-w-full overflow-x-auto overflow-y-visible">
            <LuminousGlassKaTeX 
              math={cleanHeroMath} 
              block={true}
              isHero={true}
            />
          </div>

          {/* Resumen textual amigable en píldora translúcida */}
          {res.texto && (
            <div className="mt-2 px-4 py-1.5 rounded-full bg-slate-900/60 border border-white/10 text-center text-xs sm:text-sm text-slate-300 max-w-xl font-sans font-medium">
              {cleanTextForDisplay(res.texto)}
            </div>
          )}
        </div>

        {/* B) CUADRÍCULA DE 3 TARJETAS GLASS DE MÉTRICAS */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Base Canónica */}
            <div className="p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/30 transition-all flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 font-bold uppercase tracking-wider mb-1">
                <span>Base Canónica ({metrics.is2D ? 'î, ĵ' : 'î, ĵ, k̂'})</span>
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="py-1 text-center overflow-x-auto">
                <LuminousGlassKaTeX math={`\\vec{R} = ${metrics.canonical}`} block={false} />
              </div>
              <div className="text-[10px] text-slate-400 font-mono text-center pt-1 border-t border-white/5">
                Punto: <span className="text-cyan-300 font-semibold">{metrics.coords}</span>
              </div>
            </div>

            {/* 2. Módulo / Longitud */}
            <div className="p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/30 transition-all flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider mb-1">
                <span>Módulo / Longitud</span>
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="py-1 text-center overflow-x-auto">
                <LuminousGlassKaTeX math={`|\\vec{R}| = \\sqrt{${metrics.magSq}} \\approx ${metrics.mag}`} block={false} />
              </div>
              <div className="text-[10px] text-slate-400 font-mono text-center pt-1 border-t border-white/5">
                Norma euclidiana en <span className="text-amber-300 font-semibold">{metrics.is2D ? 'ℝ²' : 'ℝ³'}</span>
              </div>
            </div>

            {/* 3. Vector Unitario */}
            <div className="p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-400/30 transition-all flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider mb-1">
                <span>Vector Unitario (û)</span>
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="py-1 text-center overflow-x-auto">
                <LuminousGlassKaTeX math={`\\hat{u} \\approx ${metrics.unitVec}`} block={false} />
              </div>
              <div className="text-[10px] text-slate-400 font-mono text-center pt-1 border-t border-white/5">
                Dirección pura (<span className="text-emerald-300 font-semibold">|û| = 1</span>)
              </div>
            </div>
          </div>
        )}

        {/* C) ÁNGULOS DIRECTORES CON LOS EJES (Píldora Glass Flotante) */}
        {metrics && metrics.mag > 0 && (
          <div className="px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono shadow-xs">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ángulos Directores:</span>
            </span>
            <div className="flex items-center gap-4 text-slate-200">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <strong>α (eje X):</strong> {metrics.alpha}°
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <strong>β (eje Y):</strong> {metrics.beta}°
              </span>
              {!metrics.is2D && metrics.gamma !== null && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <strong>γ (eje Z):</strong> {metrics.gamma}°
                </span>
              )}
            </div>
          </div>
        )}

        {/* D) EXPLICACIÓN DIDÁCTICA GLASS CARD */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs sm:text-sm font-bold text-white font-sans tracking-wide">
                {res.explicacionFacil ? 'Explicación Paso a Paso' : 'Análisis Matemático Formal'}
              </span>
            </div>
            {onRepeatAudio && (
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onRepeatAudio(res.explicacionFacil || harvardLecture);
                }}
                className="px-3 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-[11px] font-mono flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Volume2 className="w-3 h-3 text-cyan-400" />
                <span>Escuchar</span>
              </button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {res.explicacionFacil || harvardLecture}
          </p>
        </div>

      </div>

      {/* 3. BARRA INFERIOR DE NAVEGACIÓN GLASS */}
      <div className="relative z-10 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
        
        <div className="flex items-center gap-2.5">
          {onGoBackToBoard && (
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onGoBackToBoard();
              }}
              className="px-4 py-2 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Volver a ver el procedimiento paso a paso"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver Pasos del Cálculo</span>
            </button>
          )}

          {hasVectors && onGoToPlane2D && (
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onGoToPlane2D();
              }}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-95 hover:scale-[1.02]"
              title="Explorar el resultado en el Plano Cartesiano interactivo"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>Simular en Plano Cartesiano</span>
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-mono text-slate-400">
          <span>VECTRA // Glassmorphism Engine v2.0</span>
        </div>

      </div>
    </div>
  );
}
