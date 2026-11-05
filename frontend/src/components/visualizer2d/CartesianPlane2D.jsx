// ========================================================
// VECTRA // SIMULADOR EN PLANO CARTESIANO 2D (OPERACIÓN ACTUAL)
// Enfocado exclusivamente en la operación matemática actual
// Con cuadrícula nítida, proyecciones, componentes y método de polígono
// ========================================================
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { 
  Sparkles, RotateCcw, ZoomIn, ZoomOut, Eye, 
  Compass, ArrowLeft
} from 'lucide-react';
import { soundFX } from '../../utils/audioFX';

export default function CartesianPlane2D({
  visualizationData = null,
  procedureData = null,
  onSpeakLecture = null,
  onGoBackToResult = null
}) {
  const containerRef = useRef(null);

  // Opciones de visualización (por defecto Cyber Dark Obsidian)
  const [themeMode, setThemeMode] = useState('oscuro'); // 'oscuro' (cyber) | 'pizarron' (verde escolar) | 'milimetrado' (papel)
  const [showProjections, setShowProjections] = useState(true);
  const [showHeadToTail, setShowHeadToTail] = useState(false); // Método Cabeza-Cola
  const [showGridLabels, setShowGridLabels] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Coordenadas bajo el cursor
  const [mouseCoord, setMouseCoord] = useState(null);

  // ── EXTRACCIÓN DE LOS VECTORES DE LA OPERACIÓN ACTUAL ──
  const operationVectors = useMemo(() => {
    const rawVecs = visualizationData?.vectores || [];
    if (!Array.isArray(rawVecs) || rawVecs.length === 0) return [];

    return rawVecs.map((v, i) => {
      const comp = v.componentes || v.coords || [0, 0];
      const x = comp[0] !== undefined ? comp[0] : 0;
      const y = comp[1] !== undefined ? comp[1] : 0;
      const isResult = v.nombre === 'R' || v.nombre === 'Resultante' || v.isResult || i === rawVecs.length - 1;
      const color = v.color || (isResult ? '#10b981' : i === 0 ? '#38bdf8' : '#f59e0b');

      return {
        id: v.nombre || `vec_${i}`,
        nombre: v.nombre || (isResult ? 'R' : String.fromCharCode(65 + i)),
        x,
        y,
        ox: 0,
        oy: 0,
        color,
        isResult,
        label: `${v.nombre || (isResult ? 'R' : String.fromCharCode(65 + i))} = (${x}, ${y})`
      };
    });
  }, [visualizationData]);

  // Si se activa "Método Cabeza-Cola / Polígono", desplazar el vector B al final de A
  const displayVectors = useMemo(() => {
    if (!showHeadToTail || operationVectors.length < 2) return operationVectors;
    const vA = operationVectors[0];
    return operationVectors.map((v, i) => {
      if (i === 1) {
        return {
          ...v,
          ox: vA.x,
          oy: vA.y,
          headToTail: true
        };
      }
      return v;
    });
  }, [operationVectors, showHeadToTail]);

  // Rango máximo para calibrar la escala visual
  const maxCoordinate = useMemo(() => {
    let maxVal = 5;
    displayVectors.forEach(v => {
      const tipX = Math.abs(v.ox + v.x);
      const tipY = Math.abs(v.oy + v.y);
      if (tipX > maxVal) maxVal = tipX;
      if (tipY > maxVal) maxVal = tipY;
    });
    return Math.max(6, Math.ceil(maxVal + 2));
  }, [displayVectors]);

  // Dimensiones del lienzo SVG
  const width = 800;
  const height = 540;
  const cx = width / 2 + pan.x;
  const cy = height / 2 + pan.y;

  // Escala: píxeles por unidad matemática
  const scale = (Math.min(width, height) / (maxCoordinate * 2.2)) * zoom;

  // Conversión entre coordenadas matemáticas y pantalla SVG
  const toScreenX = useCallback((mathX) => cx + mathX * scale, [cx, scale]);
  const toScreenY = useCallback((mathY) => cy - mathY * scale, [cy, scale]);
  const toMathX = useCallback((screenX) => (screenX - cx) / scale, [cx, scale]);
  const toMathY = useCallback((screenY) => (cy - screenY) / scale, [cy, scale]);

  // ── RATÓN Y PAN ──
  const handleMouseDown = (e) => {
    if (e.target.closest('button, input, select')) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const mX = Math.round(toMathX(mouseX) * 10) / 10;
      const mY = Math.round(toMathY(mouseY) * 10) / 10;
      setMouseCoord({ x: mX, y: mY });
    }

    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoom(z => Math.max(0.5, Math.min(3.5, z * zoomFactor)));
  };

  const handleResetView = () => {
    soundFX.playClick();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // ── EXPLICACIÓN DE VOZ (ELI5) ──
  const handleSpeakCurrent = () => {
    soundFX.playClick();
    if (!onSpeakLecture) return;

    if (operationVectors.length >= 2) {
      const vA = operationVectors[0];
      const vB = operationVectors[1];
      const vR = operationVectors.find(v => v.isResult) || operationVectors[operationVectors.length - 1];
      const speech = `¡Mira el plano cartesiano! En la pantalla tienes el vector A en (${vA.x}, ${vA.y}) y el vector B en (${vB.x}, ${vB.y}). La flecha verde brillante es la resultante R en (${vR.x}, ${vR.y}): es el camino directo que une el inicio en (0,0) con la meta final. ¡Sumar vectores es encontrar ese atajo directo en el plano cartesiano!`;
      onSpeakLecture(speech);
      return;
    }

    if (operationVectors.length === 1) {
      const v = operationVectors[0];
      const speech = `En el plano cartesiano ves el vector ${v.nombre} en (${v.x}, ${v.y}). La línea punteada muestra su avance en el eje horizontal X y su elevación en el eje vertical Y.`;
      onSpeakLecture(speech);
      return;
    }

    onSpeakLecture('En el plano cartesiano, cada flecha te muestra con exactitud cuántos pasos dar en el eje X horizontal y cuántos en el eje Y vertical.');
  };

  // Estilos de tema visual
  const themeStyles = {
    pizarron: {
      bg: 'bg-[#0b1f14]',
      gridColor: 'rgba(52, 211, 153, 0.12)',
      axisX: '#38bdf8',
      axisY: '#34d399',
      textColor: '#a7f3d0',
      originColor: '#fbbf24'
    },
    milimetrado: {
      bg: 'bg-[#f8fafc]',
      gridColor: 'rgba(148, 163, 184, 0.35)',
      axisX: '#0284c7',
      axisY: '#059669',
      textColor: '#334155',
      originColor: '#d97706'
    },
    oscuro: {
      bg: 'bg-[#090d16]',
      gridColor: 'rgba(6, 182, 212, 0.15)',
      axisX: '#00f0ff',
      axisY: '#10b981',
      textColor: '#94a3b8',
      originColor: '#eab308'
    }
  }[themeMode];

  const opTitle = procedureData?.titulo || 'Operación Vectorial en el Plano';

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full flex flex-col overflow-hidden select-none font-sans ${themeStyles.bg}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* ── BARRA SUPERIOR: OPERACIÓN ACTUAL + HERRAMIENTAS ── */}
      <div className="z-20 px-3 py-2 bg-slate-950/85 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0 text-white">
        
        {/* Título de la Operación Actual */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-full border border-cyan-500/40 text-cyan-300 shadow-inner">
            <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '25s' }} />
            <span className="font-bold text-xs tracking-wider uppercase font-mono">
              Plano Cartesiano ℝ²:
            </span>
            <span className="text-xs text-slate-200 font-semibold truncate max-w-[240px] sm:max-w-md">
              {opTitle}
            </span>
          </div>

          {/* Toggle Cabeza-Cola (cuando hay 2 o más vectores) */}
          {operationVectors.length >= 2 && (
            <button
              onClick={() => { soundFX.playClick(); setShowHeadToTail(h => !h); }}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                showHeadToTail 
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md scale-105' 
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
              }`}
              title="Alternar entre origen común (0,0) y método del polígono (cabeza y cola)"
            >
              {showHeadToTail ? '✓ Método Cabeza-Cola' : 'Método Cabeza-Cola'}
            </button>
          )}
        </div>

        {/* Herramientas de visualización */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Botón de Voz ELI5 */}
          {onSpeakLecture && (
            <button
              onClick={handleSpeakCurrent}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/30 to-emerald-500/30 hover:from-amber-500/40 hover:to-emerald-500/40 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Escuchar explicación paso a paso de la operación en el plano"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Explicar Plano 🔊</span>
            </button>
          )}

          {/* Selector de Tema visual */}
          <div className="flex items-center bg-slate-900 border border-slate-700/60 rounded-full p-0.5 text-[10px]">
            <button
              onClick={() => setThemeMode('pizarron')}
              className={`px-2 py-0.5 rounded-full transition-colors ${themeMode === 'pizarron' ? 'bg-emerald-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Pizarrón Verde Escolar"
            >
              Pizarrón
            </button>
            <button
              onClick={() => setThemeMode('milimetrado')}
              className={`px-2 py-0.5 rounded-full transition-colors ${themeMode === 'milimetrado' ? 'bg-sky-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Papel Milimetrado"
            >
              Papel
            </button>
            <button
              onClick={() => setThemeMode('oscuro')}
              className={`px-2 py-0.5 rounded-full transition-colors ${themeMode === 'oscuro' ? 'bg-cyan-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Modo Oscuro"
            >
              Cyber
            </button>
          </div>

          {/* Toggle Proyecciones */}
          <button
            onClick={() => { soundFX.playClick(); setShowProjections(p => !p); }}
            className={`p-1.5 rounded-full border transition-all cursor-pointer ${showProjections ? 'bg-cyan-900/60 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
            title="Mostrar/Ocultar proyecciones punteadas a los ejes X e Y"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Zoom y Centrado */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/60 rounded-full px-1 py-0.5 text-slate-300">
            <button onClick={() => setZoom(z => Math.min(3.5, z * 1.2))} className="p-1 hover:text-white" title="Acercar">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setZoom(z => Math.max(0.5, z * 0.8))} className="p-1 hover:text-white" title="Alejar">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleResetView} className="p-1 hover:text-white" title="Centrar origen (0, 0)">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── LIENZO SVG DEL PLANO CARTESIANO ── */}
      <div 
        className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
      >
        <svg 
          className="w-full h-full block"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* DEFINICIÓN DE PUNTAS DE FLECHA */}
          <defs>
            {displayVectors.map((v) => (
              <marker
                key={`arrow_${v.id}`}
                id={`arrowhead_${v.id}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={v.color} />
              </marker>
            ))}
            <marker id="axis_arrow_x" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 2 L 8 5 L 0 8 z" fill={themeStyles.axisX} />
            </marker>
            <marker id="axis_arrow_y" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 2 L 8 5 L 0 8 z" fill={themeStyles.axisY} />
            </marker>
          </defs>

          {/* 1. CUADRÍCULA MILIMÉTRICA */}
          {(() => {
            const lines = [];
            const gridRange = Math.ceil(maxCoordinate * 1.5);
            
            for (let i = -gridRange; i <= gridRange; i++) {
              if (i === 0) continue;
              const sx = toScreenX(i);
              const sy = toScreenY(i);

              // Verticales
              lines.push(
                <line
                  key={`vx_${i}`}
                  x1={sx}
                  y1={0}
                  x2={sx}
                  y2={height}
                  stroke={themeStyles.gridColor}
                  strokeWidth={i % 5 === 0 ? '1.2' : '0.7'}
                  strokeDasharray={i % 5 === 0 ? 'none' : '2,2'}
                />
              );

              // Horizontales
              lines.push(
                <line
                  key={`hy_${i}`}
                  x1={0}
                  y1={sy}
                  x2={width}
                  y2={sy}
                  stroke={themeStyles.gridColor}
                  strokeWidth={i % 5 === 0 ? '1.2' : '0.7'}
                  strokeDasharray={i % 5 === 0 ? 'none' : '2,2'}
                />
              );

              // Números en los ejes
              if (showGridLabels && (i % (gridRange > 12 ? 2 : 1) === 0)) {
                lines.push(
                  <text
                    key={`num_x_${i}`}
                    x={sx}
                    y={toScreenY(0) + 14}
                    fill={themeStyles.textColor}
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    opacity="0.85"
                  >
                    {i}
                  </text>
                );
                lines.push(
                  <text
                    key={`num_y_${i}`}
                    x={toScreenX(0) - 8}
                    y={sy + 3}
                    fill={themeStyles.textColor}
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                    opacity="0.85"
                  >
                    {i}
                  </text>
                );
              }
            }
            return lines;
          })()}

          {/* 2. EJES PRINCIPALES */}
          {/* Eje X (horizontal) */}
          <line
            x1={0}
            y1={toScreenY(0)}
            x2={width - 15}
            y2={toScreenY(0)}
            stroke={themeStyles.axisX}
            strokeWidth="2.2"
            markerEnd="url(#axis_arrow_x)"
          />
          <text
            x={width - 25}
            y={toScreenY(0) - 8}
            fill={themeStyles.axisX}
            fontSize="12"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            +X
          </text>

          {/* Eje Y (vertical) */}
          <line
            x1={toScreenX(0)}
            y1={height}
            x2={toScreenX(0)}
            y2={15}
            stroke={themeStyles.axisY}
            strokeWidth="2.2"
            markerEnd="url(#axis_arrow_y)"
          />
          <text
            x={toScreenX(0) + 10}
            y={22}
            fill={themeStyles.axisY}
            fontSize="12"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            +Y
          </text>

          {/* 3. ORIGEN (0, 0) */}
          <circle
            cx={toScreenX(0)}
            cy={toScreenY(0)}
            r="4.5"
            fill={themeStyles.originColor}
            stroke="#ffffff"
            strokeWidth="1.5"
            className="animate-pulse"
          />
          <text
            x={toScreenX(0) - 8}
            y={toScreenY(0) + 15}
            fill={themeStyles.originColor}
            fontSize="10"
            fontWeight="bold"
            fontFamily="monospace"
            textAnchor="end"
          >
            (0, 0) Origen
          </text>

          {/* 4. CUADRANTES SUTILES */}
          <text x={width - 45} y={45} fill={themeStyles.textColor} opacity="0.22" fontSize="15" fontWeight="bold">I (+,+)</text>
          <text x={45} y={45} fill={themeStyles.textColor} opacity="0.22" fontSize="15" fontWeight="bold">II (-,+)</text>
          <text x={45} y={height - 35} fill={themeStyles.textColor} opacity="0.22" fontSize="15" fontWeight="bold">III (-,-)</text>
          <text x={width - 45} y={height - 35} fill={themeStyles.textColor} opacity="0.22" fontSize="15" fontWeight="bold">IV (+,-)</text>

          {/* 5. PROYECCIONES A LOS EJES */}
          {showProjections && displayVectors.map((v) => {
            const endX = toScreenX(v.ox + v.x);
            const endY = toScreenY(v.oy + v.y);

            return (
              <g key={`proj_${v.id}`} opacity="0.75">
                <line
                  x1={endX}
                  y1={endY}
                  x2={endX}
                  y2={toScreenY(0)}
                  stroke={v.color}
                  strokeWidth="1.2"
                  strokeDasharray="3,3"
                />
                <line
                  x1={endX}
                  y1={endY}
                  x2={toScreenX(0)}
                  y2={endY}
                  stroke={v.color}
                  strokeWidth="1.2"
                  strokeDasharray="3,3"
                />
                <circle cx={endX} cy={toScreenY(0)} r="2.5" fill={v.color} />
                <circle cx={toScreenX(0)} cy={endY} r="2.5" fill={v.color} />
              </g>
            );
          })}

          {/* 6. VECTORES DE LA OPERACIÓN ACTUAL */}
          {displayVectors.map((v) => {
            const startX = toScreenX(v.ox);
            const startY = toScreenY(v.oy);
            const endX = toScreenX(v.ox + v.x);
            const endY = toScreenY(v.oy + v.y);

            return (
              <g key={`vec_${v.id}`} className="transition-all duration-300">
                {/* Sombra / Brillo */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={v.color}
                  strokeWidth="7"
                  strokeOpacity="0.2"
                  strokeLinecap="round"
                />

                {/* Flecha principal */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={v.color}
                  strokeWidth={v.isResult ? '3.8' : '2.8'}
                  strokeLinecap="round"
                  markerEnd={`url(#arrowhead_${v.id})`}
                />

                {/* Punto de origen si no es (0,0) */}
                {(v.ox !== 0 || v.oy !== 0) && (
                  <circle
                    cx={startX}
                    cy={startY}
                    r="3.5"
                    fill={v.color}
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                )}

                {/* BADGE HOLOGRÁFICO CON NOMBRE Y COORDENADAS */}
                <g transform={`translate(${endX + (v.x >= 0 ? 8 : -75)}, ${endY + (v.y >= 0 ? -12 : 16)})`}>
                  <rect
                    width="72"
                    height="22"
                    rx="5"
                    fill="#0f172a"
                    fillOpacity="0.9"
                    stroke={v.color}
                    strokeWidth="1.2"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                  />
                  <text
                    x="36"
                    y="14"
                    fill={v.color}
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {v.nombre} ({v.x}, {v.y})
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Coordenadas del cursor en vivo */}
        {mouseCoord && (
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700/60 font-mono text-[10px] text-cyan-300 pointer-events-none shadow">
            Cursor: X: {mouseCoord.x}, Y: {mouseCoord.y}
          </div>
        )}
      </div>

      {/* ── PANEL INFERIOR: RESUMEN DE LA OPERACIÓN ── */}
      <div className="z-10 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0 text-white shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-xs text-cyan-300 uppercase tracking-wider font-mono">
              Operación Vectorial en el Plano ℝ²
            </span>
            {showHeadToTail && (
              <span className="text-[10px] bg-amber-900/60 text-amber-200 px-2 py-0.2 rounded border border-amber-700 font-mono">
                Método del Polígono (Cabeza-Cola)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-200 leading-snug">
            {procedureData?.resultado?.texto || 'Visualización de vectores de la operación actual en dos dimensiones.'}
            {showHeadToTail
              ? ' Observa cómo el vector B se traslada a la punta del vector A para revelar directamente la flecha resultante R.'
              : ' Las líneas punteadas muestran la proyección de cada vector en los ejes horizontal X y vertical Y.'}
          </p>
        </div>

        {/* Botón Volver al Pizarrón */}
        {onGoBackToResult && (
          <button
            onClick={() => { soundFX.playClick(); onGoBackToResult(); }}
            className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold border border-slate-700 transition-all cursor-pointer shrink-0 flex items-center gap-1.5 active:scale-95 shadow"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Pizarrón</span>
          </button>
        )}
      </div>
    </div>
  );
}
