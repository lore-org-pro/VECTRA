// ========================================================
// VECTRA // SIMULADOR INTERACTIVO EN PLANO CARTESIANO 2D
// Basado directamente en las láminas escolares del usuario:
// 1) "Tipos de Vectores" (Iguales, Equipolentes, Paralelos, Opuestos)
// 2) "Plano Cartesiano y Vectores" (Ejes X/Y, Origen, Robótica)
// ========================================================
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, Volume2, RotateCcw, ZoomIn, ZoomOut, Bot, Eye, 
  Layers, Move, Info, Compass, Play, Pause, ChevronRight, School
} from 'lucide-react';
import { soundFX } from '../../utils/audioFX';

// ── DEFINICIONES Y CASOS DE LA LÁMINA ESCOLAR ──
const TIPOS_VECTORES_DATA = {
  iguales: {
    id: 'iguales',
    num: '1',
    titulo: 'Vectores Iguales',
    tag: 'Mismo módulo, dirección y sentido',
    descripcion: 'Tienen exactamente el mismo módulo (tamaño), la misma dirección (inclinación) y el mismo sentido (hacia dónde apunta la flecha).',
    ejemplo: 'A = (3, 2), B = (3, 2)',
    vectores: [
      { id: 'A', nombre: 'A', x: 3, y: 2, ox: 0, oy: 0, color: '#a855f7', label: 'A = (3, 2)' },
      { id: 'B', nombre: 'B', x: 3, y: 2, ox: 0.2, oy: -0.2, color: '#c084fc', label: 'B = (3, 2)' }
    ],
    locucion: 'Vectores iguales. Tienen el mismo módulo, dirección y sentido, como los vectores A y B que miden exactamente lo mismo y apuntan al mismo lado.'
  },
  equipolentes: {
    id: 'equipolentes',
    num: '2',
    titulo: 'Vectores Equipolentes',
    tag: 'Mismo módulo, dirección y sentido en distintas posiciones',
    descripcion: 'Tienen el mismo módulo, dirección y sentido, aunque se encuentren en posiciones diferentes del plano cartesiano. Representan el mismo desplazamiento o fuerza.',
    ejemplo: 'A = (4, 1) en origen, B = (4, 1) en (1, 2)',
    vectores: [
      { id: 'A', nombre: 'A', x: 4, y: 1, ox: 0, oy: 0, color: '#3b82f6', label: 'A = (4, 1) en (0,0)' },
      { id: 'B', nombre: 'B', x: 4, y: 1, ox: 1, oy: 2, color: '#60a5fa', label: 'B = (4, 1) en (1,2)' }
    ],
    locucion: 'Vectores equipolentes. Tienen el mismo tamaño y dirección, pero nacen en posiciones diferentes del plano, representando el mismo movimiento en otro lugar.'
  },
  paralelos: {
    id: 'paralelos',
    num: '3',
    titulo: 'Vectores Paralelos',
    tag: 'Direcciones paralelas, módulos y sentidos variables',
    descripcion: 'Sus direcciones son paralelas (tienen la misma inclinación o pendiente). Pueden tener diferentes módulos (tamaños) y sentidos (mismo sentido o sentidos contrarios).',
    ejemplo: 'A = (5, 0), B = (3, 0)',
    vectores: [
      { id: 'A', nombre: 'A', x: 5, y: 0, ox: 0, oy: 1, color: '#10b981', label: 'A = (5, 0)' },
      { id: 'B', nombre: 'B', x: 3, y: 0, ox: 0, oy: -1, color: '#f59e0b', label: 'B = (3, 0)' }
    ],
    locucion: 'Vectores paralelos. Sus direcciones son paralelas como las vías de un tren. Pueden tener diferentes tamaños y sentidos.'
  },
  opuestos: {
    id: 'opuestos',
    num: '4',
    titulo: 'Vectores Opuestos',
    tag: 'Mismo módulo y dirección, sentidos contrarios',
    descripcion: 'Tienen el mismo módulo (longitud) y la misma dirección (misma recta de acción), pero sentidos contrarios (apuntan en sentidos exactamente opuestos: 180° de diferencia). Al sumarlos se cancelan a cero.',
    ejemplo: 'A = (4, 2), B = (-4, -2)',
    vectores: [
      { id: 'A', nombre: 'A', x: 4, y: 2, ox: 0, oy: 0, color: '#3b82f6', label: 'A = (4, 2)' },
      { id: 'B', nombre: 'B', x: -4, y: -2, ox: 0, oy: 0, color: '#ef4444', label: 'B = (-4, -2)' }
    ],
    locucion: 'Vectores opuestos. Tienen la misma medida pero apuntan en sentidos exactamente contrarios. Si los sumas, su resultado es cero.'
  }
};

const PLANO_CARTESIANO_LAMINADATA = {
  titulo: 'Plano Cartesiano y Vectores',
  conceptos: [
    { label: 'Eje X', desc: 'Representa la posición horizontal.', color: '#38bdf8' },
    { label: 'Eje Y', desc: 'Representa la posición vertical.', color: '#34d399' },
    { label: 'Origen (0, 0)', desc: 'Es el punto central donde se cruzan ambos ejes.', color: '#fbbf24' }
  ],
  ejemplos: [
    { id: 'A', nombre: 'A', x: 0, y: 3, ox: 0, oy: 0, color: '#ef4444', label: 'A (0, 3)', desc: 'Se desplaza tres unidades hacia arriba' },
    { id: 'B', nombre: 'B', x: 4, y: 0, ox: 0, oy: 0, color: '#3b82f6', label: 'B (4, 0)', desc: 'Se desplaza cuatro unidades hacia la derecha' },
    { id: 'C', nombre: 'C', x: 3, y: 2, ox: 0, oy: 0, color: '#10b981', label: 'C (3, 2)', desc: 'Tres a la derecha y dos hacia arriba' }
  ],
  robotica: 'En robótica, el plano cartesiano permite establecer coordenadas exactas para que un robot pueda desplazarse hacia una posición específica.'
};

export default function CartesianPlane2D({
  visualizationData = null,
  procedureData = null,
  onSpeakLecture = null,
  onGoBackToResult = null,
  onSwitchTo3D = null
}) {
  const containerRef = useRef(null);

  // ── ESTADOS DEL VISUALIZADOR ──
  // modos: 'operacion' | 'tipos' | 'lamina_plano' | 'libre'
  const [activeTab, setActiveTab] = useState(() => {
    if (visualizationData?.tipo === 'tipos_vectores') return 'tipos';
    if (visualizationData?.tipo === 'plano_cartesiano') return 'lamina_plano';
    return 'operacion';
  });

  const [selectedTipo, setSelectedTipo] = useState(() => {
    return visualizationData?.subtipo || 'iguales';
  });

  // Opciones de visualización
  const [themeMode, setThemeMode] = useState('pizarron'); // 'pizarron' (verde oscuro) | 'milimetrado' (papel cuadriculado) | 'oscuro' (cyberpunk)
  const [showProjections, setShowProjections] = useState(true);
  const [showHeadToTail, setShowHeadToTail] = useState(false); // Método Cabeza-Cola
  const [showGridLabels, setShowGridLabels] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Coordenadas del cursor
  const [mouseCoord, setMouseCoord] = useState(null);

  // Animación del robot (Lámina escolar)
  const [robotPos, setRobotPos] = useState(null); // { x, y }
  const [isRobotMoving, setIsRobotMoving] = useState(false);
  const [selectedRobotVector, setSelectedRobotVector] = useState('C');

  // Tarjeta explicativa flotante
  const [showExplanationCard, setShowExplanationCard] = useState(true);

  // Vectores del modo libre
  const [freeVectors, setFreeVectors] = useState([
    { id: 'F1', nombre: 'v1', x: 4, y: 3, ox: 0, oy: 0, color: '#38bdf8', label: 'v1 = (4, 3)' },
    { id: 'F2', nombre: 'v2', x: -2, y: 4, ox: 0, oy: 0, color: '#f59e0b', label: 'v2 = (-2, 4)' }
  ]);
  const [draggingVector, setDraggingVector] = useState(null);

  // ── DETECCIÓN DE VECTORES DE LA OPERACIÓN MATEMÁTICA ──
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
  const displayOperationVectors = useMemo(() => {
    if (!showHeadToTail || operationVectors.length < 2) return operationVectors;
    const vA = operationVectors[0];
    return operationVectors.map((v, i) => {
      if (i === 1) {
        // El vector B se dibuja naciendo en la punta de A
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

  // ── SELECCIÓN DE VECTORES ACTIVOS SEGÚN PESTAÑA ──
  const activeVectors = useMemo(() => {
    if (activeTab === 'operacion') {
      return displayOperationVectors.length > 0 ? displayOperationVectors : TIPOS_VECTORES_DATA.iguales.vectores;
    }
    if (activeTab === 'tipos') {
      return TIPOS_VECTORES_DATA[selectedTipo]?.vectores || [];
    }
    if (activeTab === 'lamina_plano') {
      return PLANO_CARTESIANO_LAMINADATA.ejemplos;
    }
    if (activeTab === 'libre') {
      return freeVectors;
    }
    return [];
  }, [activeTab, displayOperationVectors, selectedTipo, freeVectors]);

  // Rango máximo para calibrar la escala visual
  const maxCoordinate = useMemo(() => {
    let maxVal = 5;
    activeVectors.forEach(v => {
      const tipX = Math.abs(v.ox + v.x);
      const tipY = Math.abs(v.oy + v.y);
      if (tipX > maxVal) maxVal = tipX;
      if (tipY > maxVal) maxVal = tipY;
    });
    return Math.max(6, Math.ceil(maxVal + 2));
  }, [activeVectors]);

  // Dimensiones del lienzo SVG
  const width = 800;
  const height = 540;
  const cx = width / 2 + pan.x;
  const cy = height / 2 + pan.y;

  // Escala: píxeles por unidad matemática
  const scale = (Math.min(width, height) / (maxCoordinate * 2.2)) * zoom;

  // Conversión entre coordenadas matemáticas y coordenadas SVG de pantalla
  const toScreenX = useCallback((mathX) => cx + mathX * scale, [cx, scale]);
  const toScreenY = useCallback((mathY) => cy - mathY * scale, [cy, scale]); // Invertido: Y positivo hacia arriba
  const toMathX = useCallback((screenX) => (screenX - cx) / scale, [cx, scale]);
  const toMathY = useCallback((screenY) => (cy - screenY) / scale, [cy, scale]);

  // ── GESTIÓN DE RATÓN / PAN / ZOOM ──
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

    // Arrastre en modo libre
    if (draggingVector) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const mX = Math.round(toMathX(mouseX));
      const mY = Math.round(toMathY(mouseY));
      setFreeVectors(prev => prev.map(v => v.id === draggingVector ? { ...v, x: mX, y: mY, label: `${v.nombre} = (${mX}, ${mY})` } : v));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingVector(null);
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

  // ── SIMULADOR DE ROBOT (Lámina escolar) ──
  const startRobotSimulation = (vecKey = selectedRobotVector) => {
    soundFX.playConfirm();
    setIsRobotMoving(true);
    const targetVec = PLANO_CARTESIANO_LAMINADATA.ejemplos.find(v => v.id === vecKey) || PLANO_CARTESIANO_LAMINADATA.ejemplos[2];

    setRobotPos({ x: 0, y: 0 });
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.04;
      if (progress >= 1) {
        clearInterval(interval);
        setRobotPos({ x: targetVec.x, y: targetVec.y });
        setIsRobotMoving(false);
      } else {
        setRobotPos({
          x: Math.round(targetVec.x * progress * 10) / 10,
          y: Math.round(targetVec.y * progress * 10) / 10
        });
      }
    }, 40);
  };

  // ── NARRACIÓN POR VOZ (ELI5) ──
  const handleSpeakCurrent = () => {
    soundFX.playClick();
    if (!onSpeakLecture) return;

    if (activeTab === 'tipos') {
      const data = TIPOS_VECTORES_DATA[selectedTipo];
      const speech = `¡Te explico los ${data.titulo}! ${data.descripcion} Por ejemplo: ${data.ejemplo}. Conocer los tipos de vectores permite comparar movimientos y saber cómo actúan las fuerzas.`;
      onSpeakLecture(speech);
      return;
    }

    if (activeTab === 'lamina_plano') {
      const speech = `¡Te explico el plano cartesiano de tu lámina escolar! Es un sistema con dos ejes perpendiculares: el eje X horizontal en azul, el eje Y vertical en verde, y el origen donde se cruzan en cero cero. El vector A sube 3 unidades, el vector B avanza 4 a la derecha, y el vector C avanza 3 a la derecha y 2 arriba. En robótica, estas coordenadas permiten que un robot sepa exactamente hacia dónde moverse.`;
      onSpeakLecture(speech);
      return;
    }

    // Modo Operación Vectorial
    if (operationVectors.length >= 2) {
      const vA = operationVectors[0];
      const vB = operationVectors[1];
      const vR = operationVectors.find(v => v.isResult) || operationVectors[operationVectors.length - 1];
      const speech = `¡Mira el plano cartesiano! En la pantalla tienes el vector A en (${vA.x}, ${vA.y}) y el vector B en (${vB.x}, ${vB.y}). La flecha verde brillante es la resultante R en (${vR.x}, ${vR.y}): es el camino directo que une el punto de partida con el final. ¡Sumar vectores es encontrar ese atajo!`;
      onSpeakLecture(speech);
      return;
    }

    onSpeakLecture('En el plano cartesiano, cada flecha te muestra exactamente cuántos pasos dar en la línea horizontal X y cuántos en la vertical Y.');
  };

  // Estilos de tema visual
  const themeStyles = {
    pizarron: {
      bg: 'bg-[#0b1f14]',
      gridColor: 'rgba(52, 211, 153, 0.12)',
      gridSubColor: 'rgba(52, 211, 153, 0.05)',
      axisX: '#38bdf8',
      axisY: '#34d399',
      textColor: '#a7f3d0',
      originColor: '#fbbf24'
    },
    milimetrado: {
      bg: 'bg-[#f8fafc]',
      gridColor: 'rgba(148, 163, 184, 0.35)',
      gridSubColor: 'rgba(148, 163, 184, 0.18)',
      axisX: '#0284c7',
      axisY: '#059669',
      textColor: '#334155',
      originColor: '#d97706'
    },
    oscuro: {
      bg: 'bg-[#090d16]',
      gridColor: 'rgba(6, 182, 212, 0.15)',
      gridSubColor: 'rgba(6, 182, 212, 0.05)',
      axisX: '#00f0ff',
      axisY: '#10b981',
      textColor: '#94a3b8',
      originColor: '#eab308'
    }
  }[themeMode];

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full flex flex-col overflow-hidden select-none font-sans ${themeStyles.bg}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* ── CABECERA SUPERIOR: TABS DE MODOS + HERRAMIENTAS ── */}
      <div className="z-20 px-3 py-2 bg-slate-950/85 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0 text-white">
        
        {/* Selector de Pestañas Principales */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-full border border-slate-700/60 shadow-inner">
          <button
            onClick={() => { soundFX.playClick(); setActiveTab('operacion'); }}
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'operacion'
                ? 'bg-cyan-500 text-slate-950 shadow-md scale-105'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Operación Actual</span>
          </button>

          <button
            onClick={() => { soundFX.playClick(); setActiveTab('tipos'); }}
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'tipos'
                ? 'bg-purple-600 text-white shadow-md scale-105'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Lámina escolar: Tipos de Vectores"
          >
            <Layers className="w-3.5 h-3.5 text-purple-300" />
            <span>Tipos de Vectores</span>
          </button>

          <button
            onClick={() => { soundFX.playClick(); setActiveTab('lamina_plano'); }}
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'lamina_plano'
                ? 'bg-emerald-600 text-white shadow-md scale-105'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Lámina escolar: Plano Cartesiano y Robótica"
          >
            <School className="w-3.5 h-3.5 text-emerald-300" />
            <span>Lámina Escolar (Plano)</span>
          </button>

          <button
            onClick={() => { soundFX.playClick(); setActiveTab('libre'); }}
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'libre'
                ? 'bg-amber-600 text-white shadow-md scale-105'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Arrastra las puntas para mover vectores libremente"
          >
            <Move className="w-3.5 h-3.5 text-amber-300" />
            <span>Pizarra Libre</span>
          </button>
        </div>

        {/* Botonera de Utilidades y Voz */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Botón de Voz ELI5 */}
          {onSpeakLecture && (
            <button
              onClick={handleSpeakCurrent}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/30 to-emerald-500/30 hover:from-amber-500/40 hover:to-emerald-500/40 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Escuchar explicación pedagógica nivel niño de 5 años"
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
              title="Fondo Pizarrón Escolar Verde"
            >
              Pizarrón
            </button>
            <button
              onClick={() => setThemeMode('milimetrado')}
              className={`px-2 py-0.5 rounded-full transition-colors ${themeMode === 'milimetrado' ? 'bg-sky-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Fondo Papel Milimetrado Claro"
            >
              Papel
            </button>
            <button
              onClick={() => setThemeMode('oscuro')}
              className={`px-2 py-0.5 rounded-full transition-colors ${themeMode === 'oscuro' ? 'bg-cyan-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Fondo Oscuro Digital"
            >
              Cyber
            </button>
          </div>

          {/* Toggle de Proyecciones punteadas */}
          <button
            onClick={() => { soundFX.playClick(); setShowProjections(p => !p); }}
            className={`p-1.5 rounded-full border transition-all cursor-pointer ${showProjections ? 'bg-cyan-900/60 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
            title="Mostrar/Ocultar proyecciones a los ejes X e Y"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Método Cabeza-Cola (en modo Operación) */}
          {activeTab === 'operacion' && operationVectors.length >= 2 && (
            <button
              onClick={() => { soundFX.playClick(); setShowHeadToTail(h => !h); }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                showHeadToTail 
                  ? 'bg-amber-600 text-white border-amber-400 shadow-sm' 
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Alternar entre origen común y método cabeza-cola"
            >
              {showHeadToTail ? 'Cabeza-Cola Activo' : 'Cabeza-Cola'}
            </button>
          )}

          {/* Zoom y Reset */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/60 rounded-full px-1 py-0.5 text-slate-300">
            <button onClick={() => setZoom(z => Math.min(3.5, z * 1.2))} className="p-1 hover:text-white" title="Acercar">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setZoom(z => Math.max(0.5, z * 0.8))} className="p-1 hover:text-white" title="Alejar">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleResetView} className="p-1 hover:text-white" title="Centrar origen">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alternar a 3D si lo desea */}
          {onSwitchTo3D && (
            <button
              onClick={onSwitchTo3D}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Ver en Espacio Tridimensional 3D"
            >
              <span>3D</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── SUB-BARRA DE TIPOS DE VECTORES (Cuando está en modo Tipos) ── */}
      {activeTab === 'tipos' && (
        <div className="z-10 px-3 py-1.5 bg-purple-950/80 backdrop-blur-md border-b border-purple-800/60 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold text-purple-300 uppercase tracking-wider shrink-0">
              Lámina:
            </span>
            {Object.values(TIPOS_VECTORES_DATA).map(item => (
              <button
                key={item.id}
                onClick={() => { soundFX.playClick(); setSelectedTipo(item.id); }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedTipo === item.id
                    ? 'bg-purple-600 text-white shadow-md scale-105'
                    : 'bg-purple-900/40 text-purple-200 hover:bg-purple-900/70 border border-purple-700/40'
                }`}
              >
                {item.num}. {item.titulo}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-purple-200/90 font-mono hidden md:inline truncate">
            {TIPOS_VECTORES_DATA[selectedTipo].tag}
          </span>
        </div>
      )}

      {/* ── SUB-BARRA DE LÁMINA ESCOLAR Y ROBÓTICA ── */}
      {activeTab === 'lamina_plano' && (
        <div className="z-10 px-3 py-1.5 bg-emerald-950/80 backdrop-blur-md border-b border-emerald-800/60 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-emerald-300 uppercase tracking-wider shrink-0">
              Ejemplos Lámina:
            </span>
            {PLANO_CARTESIANO_LAMINADATA.ejemplos.map(ej => (
              <button
                key={ej.id}
                onClick={() => {
                  soundFX.playClick();
                  setSelectedRobotVector(ej.id);
                  startRobotSimulation(ej.id);
                }}
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  selectedRobotVector === ej.id ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-900/40 text-emerald-200 hover:bg-emerald-900/70 border border-emerald-700/40'
                }`}
                style={{ borderLeft: `3px solid ${ej.color}` }}
              >
                <span>{ej.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => startRobotSimulation(selectedRobotVector)}
            disabled={isRobotMoving}
            className="px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50"
            title="Ver robot desplazándose según las coordenadas del vector"
          >
            <Bot className="w-3.5 h-3.5 animate-bounce" />
            <span>{isRobotMoving ? 'Robot en movimiento...' : 'Simular Robot 🤖'}</span>
          </button>
        </div>
      )}

      {/* ── ÁREA CENTRAL: LIENZO SVG INTERACTIVO ── */}
      <div 
        className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
      >
        <svg 
          className="w-full h-full block"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* DEFINICIÓN DE MARCADORES DE FLECHA (Punta de vector) */}
          <defs>
            {activeVectors.map((v) => (
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
            {/* Marcador genérico */}
            <marker id="arrowhead_default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
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
            
            // Líneas secundarias y principales
            for (let i = -gridRange; i <= gridRange; i++) {
              if (i === 0) continue; // Los ejes se dibujan después
              const sx = toScreenX(i);
              const sy = toScreenY(i);

              // Líneas verticales (X constante)
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

              // Líneas horizontales (Y constante)
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
                // Números en X
                lines.push(
                  <text
                    key={`num_x_${i}`}
                    x={sx}
                    y={toScreenY(0) + 14}
                    fill={themeStyles.textColor}
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    opacity="0.8"
                  >
                    {i}
                  </text>
                );
                // Números en Y
                lines.push(
                  <text
                    key={`num_y_${i}`}
                    x={toScreenX(0) - 8}
                    y={sy + 3}
                    fill={themeStyles.textColor}
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                    opacity="0.8"
                  >
                    {i}
                  </text>
                );
              }
            }
            return lines;
          })()}

          {/* 2. EJES COORDENADOS PRINCIPALES (X en horizontal, Y en vertical) */}
          {/* Eje X */}
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
            +X (Horizontal)
          </text>

          {/* Eje Y */}
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
            +Y (Vertical)
          </text>

          {/* 3. ETIQUETA DEL ORIGEN (0, 0) */}
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
          <text x={width - 45} y={45} fill={themeStyles.textColor} opacity="0.25" fontSize="16" fontWeight="bold">I (+,+)</text>
          <text x={45} y={45} fill={themeStyles.textColor} opacity="0.25" fontSize="16" fontWeight="bold">II (-,+)</text>
          <text x={45} y={height - 35} fill={themeStyles.textColor} opacity="0.25" fontSize="16" fontWeight="bold">III (-,-)</text>
          <text x={width - 45} y={height - 35} fill={themeStyles.textColor} opacity="0.25" fontSize="16" fontWeight="bold">IV (+,-)</text>

          {/* 5. PROYECCIONES A LOS EJES (Líneas punteadas de componentes) */}
          {showProjections && activeVectors.map((v) => {
            const startX = toScreenX(v.ox);
            const startY = toScreenY(v.oy);
            const endX = toScreenX(v.ox + v.x);
            const endY = toScreenY(v.oy + v.y);

            return (
              <g key={`proj_${v.id}`} opacity="0.75">
                {/* Proyección vertical al eje X */}
                <line
                  x1={endX}
                  y1={endY}
                  x2={endX}
                  y2={toScreenY(0)}
                  stroke={v.color}
                  strokeWidth="1.2"
                  strokeDasharray="3,3"
                />
                {/* Proyección horizontal al eje Y */}
                <line
                  x1={endX}
                  y1={endY}
                  x2={toScreenX(0)}
                  y2={endY}
                  stroke={v.color}
                  strokeWidth="1.2"
                  strokeDasharray="3,3"
                />
                {/* Punto en eje X */}
                <circle cx={endX} cy={toScreenY(0)} r="2.5" fill={v.color} />
                {/* Punto en eje Y */}
                <circle cx={toScreenX(0)} cy={endY} r="2.5" fill={v.color} />
              </g>
            );
          })}

          {/* 6. DIBUJO DE LOS VECTORES COMO FLECHAS DE COLORES */}
          {activeVectors.map((v) => {
            const startX = toScreenX(v.ox);
            const startY = toScreenY(v.oy);
            const endX = toScreenX(v.ox + v.x);
            const endY = toScreenY(v.oy + v.y);
            const mag = Math.round(Math.sqrt(v.x * v.x + v.y * v.y) * 10) / 10;
            const angleDeg = Math.round(Math.atan2(v.y, v.x) * (180 / Math.PI) * 10) / 10;

            const isFree = activeTab === 'libre';

            return (
              <g key={`vec_${v.id}`} className="transition-all duration-300">
                {/* Sombra o brillo exterior */}
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

                {/* Flecha principal del vector */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={v.color}
                  strokeWidth={v.isResult ? '3.5' : '2.8'}
                  strokeLinecap="round"
                  markerEnd={`url(#arrowhead_${v.id})`}
                />

                {/* Punto de origen del vector (si no es 0,0) */}
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

                {/* Zona de agarre interactiva para el modo libre */}
                {isFree && (
                  <circle
                    cx={endX}
                    cy={endY}
                    r="9"
                    fill={v.color}
                    fillOpacity="0.3"
                    stroke={v.color}
                    strokeWidth="2"
                    className="cursor-pointer hover:scale-125 transition-transform"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggingVector(v.id);
                    }}
                  />
                )}

                {/* BADGE HOLOGRÁFICO CON NOMBRE Y COORDENADAS */}
                <g transform={`translate(${endX + (v.x >= 0 ? 8 : -75)}, ${endY + (v.y >= 0 ? -12 : 16)})`}>
                  <rect
                    width="70"
                    height="22"
                    rx="5"
                    fill="#0f172a"
                    fillOpacity="0.88"
                    stroke={v.color}
                    strokeWidth="1.2"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                  />
                  <text
                    x="35"
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

          {/* 7. ROBOT ANIMADO (Lámina escolar) */}
          {activeTab === 'lamina_plano' && robotPos && (
            <g 
              transform={`translate(${toScreenX(robotPos.x) - 15}, ${toScreenY(robotPos.y) - 15})`}
              className="transition-all duration-75"
            >
              <rect width="30" height="30" rx="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" filter="drop-shadow(0 0 8px #10b981)" />
              <text x="15" y="20" fontSize="16" textAnchor="middle">🤖</text>
            </g>
          )}
        </svg>

        {/* Coordenadas en vivo bajo el mouse */}
        {mouseCoord && (
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700/60 font-mono text-[10px] text-cyan-300 pointer-events-none shadow">
            Cursor: X: {mouseCoord.x}, Y: {mouseCoord.y}
          </div>
        )}
      </div>

      {/* ── PANEL INFERIOR DIDÁCTICO (Explicación de la lámina escolar) ── */}
      {showExplanationCard && (
        <div className="z-10 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0 text-white shadow-2xl">
          
          <div className="flex-1">
            {activeTab === 'tipos' && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span className="font-bold text-xs text-purple-300 uppercase tracking-wider font-mono">
                    {TIPOS_VECTORES_DATA[selectedTipo].num}. {TIPOS_VECTORES_DATA[selectedTipo].titulo}
                  </span>
                  <span className="text-[10px] bg-purple-900/60 text-purple-200 px-2 py-0.2 rounded border border-purple-700 font-mono">
                    {TIPOS_VECTORES_DATA[selectedTipo].ejemplo}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-snug">
                  {TIPOS_VECTORES_DATA[selectedTipo].descripcion}
                </p>
                <p className="text-[10px] text-slate-400 italic">
                  💡 <strong>Importancia:</strong> Conocer los tipos de vectores permite comparar movimientos, representar desplazamientos y comprender cómo interactúan diferentes fuerzas.
                </p>
              </div>
            )}

            {activeTab === 'lamina_plano' && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-xs text-emerald-300 uppercase tracking-wider font-mono">
                    ¿Qué es el plano cartesiano?
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-snug">
                  Es un sistema de referencia formado por dos ejes perpendiculares que permiten localizar puntos mediante coordenadas:
                  <strong className="text-sky-300"> Eje X</strong> (horizontal), 
                  <strong className="text-emerald-300"> Eje Y</strong> (vertical) y 
                  <strong className="text-amber-300"> Origen (0, 0)</strong> donde se cruzan.
                </p>
                <p className="text-[10px] text-slate-400">
                  🤖 <strong>Aplicación práctica:</strong> {PLANO_CARTESIANO_LAMINADATA.robotica}
                </p>
              </div>
            )}

            {activeTab === 'operacion' && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-bold text-xs text-cyan-300 uppercase tracking-wider font-mono">
                    Simulación del Cálculo en el Plano ℝ²
                  </span>
                  {showHeadToTail && (
                    <span className="text-[10px] bg-amber-900/60 text-amber-200 px-2 py-0.2 rounded border border-amber-700 font-mono">
                      Método del Polígono (Cabeza y Cola)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-200 leading-snug">
                  {procedureData?.resultado?.texto || 'Visualización de vectores en dos dimensiones.'}
                  {showHeadToTail
                    ? ' Observa cómo el vector B nace en la punta del vector A para formar directamente el vector resultante R.'
                    : ' Las líneas punteadas muestran el desglose exacto de cada vector sobre los ejes horizontal y vertical.'}
                </p>
              </div>
            )}

            {activeTab === 'libre' && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-bold text-xs text-amber-300 uppercase tracking-wider font-mono">
                    Modo Pizarra Libre Interactiva
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-snug">
                  Haz clic y arrastra los círculos de las puntas de los vectores para cambiar sus coordenadas en vivo durante tu exposición en clase.
                </p>
              </div>
            )}
          </div>

          {/* Botón Volver al Pizarrón de Resultado */}
          {onGoBackToResult && (
            <button
              onClick={() => { soundFX.playClick(); onGoBackToResult(); }}
              className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold border border-slate-700 transition-all cursor-pointer shrink-0"
            >
              Volver al Pizarrón
            </button>
          )}
        </div>
      )}
    </div>
  );
}
