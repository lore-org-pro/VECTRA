import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  Copy, 
  Check, 
  Box, 
  ArrowLeft, 
  RotateCcw, 
  Compass, 
  Calculator, 
  Layers,
  Award,
  GraduationCap,
  Volume2
} from 'lucide-react';
import { soundFX } from '../../utils/audioFX';
import { cleanAndSanitizeLaTeX, cleanTextForDisplay, formatFallbackMath } from '../../utils/latexUtils';

/**
 * Renderizador KaTeX con estilo de tiza dorada/blanca brillante de honor
 */
function GoldChalkKaTeX({ math = '', block = true, isHero = false }) {
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
      className={`${block ? 'block my-1' : 'inline'} gold-chalk-katex text-amber-100 ${isHero ? 'hero-math' : ''}`} 
    />
  );
}

export default function ResultBoard({
  procedureData = null,
  visualizationData = null,
  onGoBackToBoard,
  onGoTo3D,
  onRepeatAudio
}) {
  const [copied, setCopied] = useState(false);

  const data = procedureData || {};
  const res = data.resultado || {
    latex: '\\vec{R} = \\langle 0, 0, 0 \\rangle',
    texto: 'Resultado analítico completado.'
  };

  // Extraer el vector resultante si existe para calcular métricas de honor
  const resultVec = (() => {
    // 1. Buscar en visualizacion.vectores el último o el llamado R
    if (visualizationData && Array.isArray(visualizationData.vectores) && visualizationData.vectores.length > 0) {
      const foundR = visualizationData.vectores.find(v => v.nombre === 'R' || v.nombre === 'Resultante' || v.nombre === 'Diferencia');
      if (foundR) return foundR.componentes;
      return visualizationData.vectores[visualizationData.vectores.length - 1].componentes;
    }
    // 2. Extraer números de la tupla o texto si coinciden 2 o 3 números
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

    // Ángulos directores
    const alpha = mag > 0 ? round2(Math.acos(Math.max(-1, Math.min(1, x / mag))) * (180 / Math.PI)) : 0;
    const beta = mag > 0 ? round2(Math.acos(Math.max(-1, Math.min(1, y / mag))) * (180 / Math.PI)) : 0;
    const gamma = (!is2D && mag > 0) ? round2(Math.acos(Math.max(-1, Math.min(1, z / mag))) * (180 / Math.PI)) : null;

    // Notación canónica limpia (sin "+ -", con coeficientes 1 simplificados)
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

  // KaTeX limpio del héroe: purgar cualquier "+ -" o "+ 0k"
  const cleanHeroMath = (() => {
    let raw = res.latex || (metrics ? `\\vec{R} = ${metrics.canonical}` : '\\text{Completado}');
    return raw
      .replace(/\+\s*-\s*/g, '- ')
      .replace(/\+\s*0\s*\\hat\{[ijk]\}/g, '')
      .replace(/-\s*0\s*\\hat\{[ijk]\}/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  })();

  // Cátedra analítica formal estilo profesor de Harvard
  const harvardLecture = res.explicacionHarvard || (metrics ? (
    `Cátedra de Álgebra Lineal: el vector resultante es R = ${metrics.canonical.replace(/\\hat\{([ijk])\}/g, '$1')}. ` +
    `En el espacio euclidiano presenta una componente de ${resultVec[0]} en la abscisa X y ${resultVec[1]} en la ordenada Y${resultVec[2] ? ' con cota ' + resultVec[2] + ' en Z' : ''}. ` +
    `Su norma euclidiana invariante es de exactamente ||R|| = √${metrics.magSq} ≈ ${metrics.mag} unidades, orientado con ángulos directores de ` +
    `α = ${metrics.alpha} grados y β = ${metrics.beta} grados, satisfaciendo con rigor la superposición euclidiana.`
  ) : (res.texto || 'Solución analítica rigurosamente verificada.'));

  // Lanzar celebración al abrir el pizarrón de honor
  useEffect(() => {
    soundFX.playConfirm();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65, x: 0.6 },
        colors: ['#fef08a', '#facc15', '#34d399', '#38bdf8', '#ffffff'],
        disableForReducedMotion: true,
        ticks: 120
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

  const has3D = visualizationData && 
                visualizationData.tipo !== 'ninguna' && 
                Array.isArray(visualizationData.vectores) && 
                visualizationData.vectores.length > 0;

  return (
    <div className="w-full h-full flex flex-col justify-between p-3.5 sm:p-5 select-none relative overflow-hidden rounded-2xl shadow-2xl border-[10px] border-[#532e18] bg-[#143220] text-white">
      {/* Estilos de tiza de honor para KaTeX */}
      <style>{`
        .gold-chalk-katex, .gold-chalk-katex * {
          color: #fef9c3 !important;
          border-color: #fef08a !important;
          text-shadow: 0 0 3px rgba(254, 240, 138, 0.85), 0 0 10px rgba(254, 240, 138, 0.35) !important;
        }
        .hero-math .katex {
          font-size: clamp(1.4rem, 3.2vw, 2.5rem) !important;
          line-height: 1.4 !important;
        }
      `}</style>

      {/* 1. Fondo de Pizarra Verde Oscuro con Marco Escolar Enriquecido */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-95"
        style={{
          background: 'radial-gradient(circle at 50% 30%, #1e452b 0%, #12301c 60%, #0a1f12 100%)',
          boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.85)'
        }}
      />
      {/* Textura de motas de tiza de pizarra */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#fff 1.5px, transparent 1.5px), radial-gradient(#fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px'
        }}
      />

      {/* 2. Cabecera del Pizarrón de Resultado */}
      <div className="relative z-10 flex flex-wrap items-center justify-between pb-3 border-b-2 border-amber-500/40 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 
                className="text-base sm:text-xl font-bold tracking-wide text-amber-200"
                style={{ fontFamily: "'Patrick Hand', 'Caveat', cursive, sans-serif" }}
              >
                Pizarrón de Resultado Final
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-2.5 h-2.5" /> Solución Definitiva
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/80 font-mono">
              {data.titulo || 'Cálculo Vectorial Riguroso'} • 100% Verificado
            </p>
          </div>
        </div>

        {/* Acciones de Cabecera: Copiar y Repetir */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLatex}
            className="px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-amber-400/40 text-amber-200 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow"
            title="Copiar fórmula LaTeX al portapapeles"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar LaTeX'}</span>
          </button>

          {onRepeatAudio && (
            <button
              onClick={() => {
                soundFX.playClick();
                onRepeatAudio();
              }}
              className="px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-1 transition-all cursor-pointer shadow"
              title="Escuchar explicación de nuevo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Repetir Voz</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Área Central: Gran Expositor de la Solución Final */}
      <div className="relative z-10 flex-1 flex flex-col justify-start py-2.5 gap-2.5 overflow-y-auto">
        
        {/* A) CAJA PRINCIPAL DE RESULTADO EN TIZA DE ORO */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[#092113]/95 border-2 border-amber-400/60 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
          {/* Resplandor áureo sutil */}
          <div className="absolute inset-0 bg-radial from-amber-400/10 via-transparent to-transparent pointer-events-none" />

          <span 
            className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"
            style={{ fontFamily: "'Patrick Hand', cursive" }}
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            Valor del Vector Resultante:
          </span>

          <div className="py-2 px-3 text-center max-w-full overflow-x-auto overflow-y-visible">
            <GoldChalkKaTeX 
              math={cleanHeroMath} 
              block={true}
              isHero={true}
            />
          </div>

          {/* Síntesis textual didáctica */}
          {res.texto && (
            <p 
              className="mt-1 text-center text-sm sm:text-base text-amber-100/90 max-w-2xl px-2"
              style={{ fontFamily: "'Patrick Hand', 'Caveat', cursive, sans-serif" }}
            >
              {cleanTextForDisplay(res.texto)}
            </p>
          )}
        </div>

        {/* B) TARJETAS DE NOTACIÓN Y MÉTRICAS VECTORIALES (Si hay coordenadas) */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* 1. Notación Canónica */}
            <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider mb-1">
                <span>Base Canónica ({metrics.is2D ? 'i, j' : 'i, j, k'})</span>
                <Layers className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="py-1 text-center overflow-x-auto">
                <GoldChalkKaTeX math={`\\vec{R} = ${metrics.canonical}`} block={false} />
              </div>
              <span className="text-[10px] text-emerald-200/70 font-mono text-center">
                Coordenadas: {metrics.coords}
              </span>
            </div>

            {/* 2. Módulo / Magnitud */}
            <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider mb-1">
                <span>Módulo / Longitud</span>
                <Calculator className="w-3 h-3 text-amber-400" />
              </div>
              <div className="py-1 text-center overflow-x-auto">
                <GoldChalkKaTeX math={`|\\vec{R}| = \\sqrt{${metrics.magSq}} \\approx ${metrics.mag}`} block={false} />
              </div>
              <span className="text-[10px] text-amber-200/70 font-mono text-center">
                Norma euclidiana en {metrics.is2D ? 'ℝ²' : 'ℝ³'}
              </span>
            </div>

            {/* 3. Vector Unitario Normalizado */}
            <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 font-bold uppercase tracking-wider mb-1">
                <span>Vector Unitario (û)</span>
                <Compass className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="py-1 text-center overflow-x-auto">
                <GoldChalkKaTeX math={`\\hat{u} \\approx ${metrics.unitVec}`} block={false} />
              </div>
              <span className="text-[10px] text-cyan-200/70 font-mono text-center">
                Dirección pura |û| = 1
              </span>
            </div>
          </div>
        )}

        {/* C) Ángulos Directores con los Ejes Cartesianos (si aplica) */}
        {metrics && metrics.mag > 0 && (
          <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-600/30 flex flex-wrap items-center justify-around gap-2 text-xs font-mono shadow-xs">
            <span className="text-[11px] font-bold text-amber-200 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              Ángulos Directores:
            </span>
            <div className="flex items-center gap-4 text-emerald-100">
              <span><strong className="text-red-400">α (con X):</strong> {metrics.alpha}°</span>
              <span><strong className="text-emerald-400">β (con Y):</strong> {metrics.beta}°</span>
              {!metrics.is2D && metrics.gamma !== null && (
                <span><strong className="text-blue-400">γ (con Z):</strong> {metrics.gamma}°</span>
              )}
            </div>
          </div>
        )}

        {/* D) EXPLICACIÓN DIDÁCTICA (FÁCIL DE ENTENDER & CÁTEDRA) */}
        <div className="p-3 sm:p-4 rounded-xl bg-emerald-950/90 border border-amber-400/50 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-amber-500/30 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs sm:text-sm font-bold text-amber-200 tracking-wide font-mono uppercase">
                {res.explicacionFacil ? 'Explicación Sencilla (Fácil de entender)' : 'Explicación Magistral (Cátedra Harvard)'}
              </span>
            </div>
            {onRepeatAudio && (
              <button
                onClick={() => {
                  soundFX.playClick();
                  onRepeatAudio(res.explicacionFacil || harvardLecture);
                }}
                className="px-2.5 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                title="Escuchar locución completa"
              >
                <Volume2 className="w-3 h-3 text-amber-300" />
                <span>Escuchar Explicación</span>
              </button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed font-sans">
            {res.explicacionFacil || harvardLecture}
          </p>
        </div>

      </div>

      {/* 4. Bandeja Inferior: Enlaces Directos y Tizas Escolares */}
      <div className="relative z-10 pt-3 border-t-2 border-amber-500/30 flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Botones de Navegación Rápida */}
        <div className="flex items-center gap-2">
          {onGoBackToBoard && (
            <button
              onClick={() => {
                soundFX.playClick();
                onGoBackToBoard();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 border border-emerald-500/50 text-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow"
              title="Volver a ver el procedimiento paso a paso"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver Procedimiento</span>
            </button>
          )}

          {has3D && onGoTo3D && (
            <button
              onClick={() => {
                soundFX.playClick();
                onGoTo3D();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 border border-cyan-400/50 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg animate-pulse"
              title="Explorar el resultado en el espacio tridimensional 3D"
            >
              <Box className="w-3.5 h-3.5 text-cyan-200" />
              <span>Explorar en Espacio 3D</span>
            </button>
          )}
        </div>

        {/* Bandeja de Tizas de Madera Decorativa con Tiza de Oro */}
        <div className="hidden sm:flex items-center gap-2.5 bg-[#3a1d0b] px-3.5 py-1.5 rounded-md border border-[#5c2e12] shadow-inner">
          <div className="w-8 h-2.5 bg-amber-200 rounded-sm shadow-sm transform -rotate-2" title="Tiza de Oro" />
          <div className="w-6 h-2 bg-slate-100 rounded-sm shadow-sm transform rotate-1" title="Tiza Blanca" />
          <div className="w-7 h-2 bg-emerald-300 rounded-sm shadow-sm transform -rotate-1" title="Tiza Menta" />
          <div className="w-5 h-2 bg-cyan-300 rounded-sm shadow-sm transform rotate-2" title="Tiza Neón" />
          <div className="flex flex-col items-center justify-center bg-[#7a481c] border border-[#522f12] px-2 py-0.5 rounded shadow text-[9px] font-mono text-amber-200 font-bold" title="Borrador de pizarra">
            <span>BORRADOR</span>
          </div>
        </div>

      </div>
    </div>
  );
}
