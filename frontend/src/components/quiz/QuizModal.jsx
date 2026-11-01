import React, { useState } from 'react';
import { Trophy, CheckCircle, XCircle, ArrowRight, X, Sparkles } from 'lucide-react';
import { soundFX } from '../../utils/audioFX';
import confetti from 'canvas-confetti';

const QUIZ_QUESTIONS = {
  facil: [
    {
      pregunta: '¿Cuál es la magnitud del vector v = (3, 4, 0)?',
      opciones: ['5', '7', '12', '25'],
      correcta: 0,
      explicacion: 'Aplicando Pitágoras: √(3² + 4² + 0²) = √(9 + 16) = √25 = 5.'
    },
    {
      pregunta: 'Si sumas el vector A = (1, 2, 3) y B = (2, -1, 1), ¿cuál es la primera componente (x)?',
      opciones: ['1', '2', '3', '0'],
      correcta: 2,
      explicacion: 'Sumando las componentes x: 1 + 2 = 3.'
    }
  ],
  intermedio: [
    {
      pregunta: 'Si el producto punto entre dos vectores no nulos es cero, ¿cuál es el ángulo entre ellos?',
      opciones: ['0°', '45°', '90°', '180°'],
      correcta: 2,
      explicacion: 'Un producto escalar de 0 indica que los vectores son perpendiculares (90°).'
    },
    {
      pregunta: '¿Cuál es el vector unitario en la dirección de v = (0, 3, 0)?',
      opciones: ['(0, 1, 0)', '(0, 3, 0)', '(1, 1, 1)', '(0, 0, 1)'],
      correcta: 0,
      explicacion: 'Dividiendo entre su magnitud 3: (0/3, 3/3, 0/3) = (0, 1, 0).'
    }
  ],
  avanzado: [
    {
      pregunta: '¿Hacia dónde apunta el vector resultante del producto cruz A x B si A apunta en +X y B apunta en +Y?',
      opciones: ['Hacia +Z', 'Hacia -Z', 'Hacia +X', 'Hacia el origen'],
      correcta: 0,
      explicacion: 'Por la regla de la mano derecha: i x j = k (+Z).'
    },
    {
      pregunta: 'Si tres vectores son coplanares (están en el mismo plano), ¿cuál es el volumen del paralelepípedo que forman?',
      opciones: ['1', 'Depende de la base', '0', 'Infinito'],
      correcta: 2,
      explicacion: 'Como están en el mismo plano no tienen altura tridimensional, por lo que su producto triple y volumen es 0.'
    }
  ]
};

export default function QuizModal({ isOpen, onClose, onCelebrate }) {
  const [difficulty, setDifficulty] = useState('facil');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  if (!isOpen) return null;

  const currentList = QUIZ_QUESTIONS[difficulty] || QUIZ_QUESTIONS.facil;
  const currentQ = currentList[currentIndex] || currentList[0];

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correcta) {
      soundFX.playConfirm();
      setScore((s) => s + 1);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      if (onCelebrate) onCelebrate();
    } else {
      soundFX.playAlert();
    }
  };

  const handleNext = () => {
    soundFX.playClick();
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentIndex < currentList.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="hud-panel max-w-xl w-full p-6 rounded-lg border border-[var(--secondary)] glow-box">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--bg-panel-border)] font-mono">
          <div className="flex items-center gap-2 text-[var(--secondary)]">
            <Trophy className="w-5 h-5 text-[var(--warning)]" />
            <h3 className="font-orbitron font-bold text-sm tracking-wider">
              MODO QUIZ // RETO DE ÁLGEBRA VECTORIAL
            </h3>
          </div>
          <button
            onClick={() => { soundFX.playClick(); onClose(); }}
            className="p-1 rounded text-[var(--text-muted)] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Dificultad */}
        <div className="flex items-center gap-2 my-4 font-mono text-xs">
          <span className="text-[var(--text-muted)]">NIVEL:</span>
          {['facil', 'intermedio', 'avanzado'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setDifficulty(lvl);
                setCurrentIndex(0);
                setSelectedOption(null);
                setIsAnswered(false);
              }}
              className={`px-3 py-1 rounded uppercase transition-all ${
                difficulty === lvl ? 'bg-[var(--secondary)] text-white font-bold glow-box' : 'bg-white/5 text-[var(--text-muted)] hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
          <div className="ml-auto text-[var(--warning)] font-bold">
            ACIERTOS: {score}
          </div>
        </div>

        {/* Tarjeta de Pregunta */}
        <div className="p-4 bg-black/60 rounded border border-[var(--bg-panel-border)] my-4">
          <p className="font-sans text-base text-[var(--text-main)] font-semibold leading-relaxed">
            {currentQ.pregunta}
          </p>
        </div>

        {/* Opciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-4 font-mono text-xs">
          {currentQ.opciones.map((op, idx) => {
            let btnStyle = 'bg-black/40 border-[var(--bg-panel-border)] hover:border-[var(--secondary)] text-[var(--text-main)]';
            if (isAnswered) {
              if (idx === currentQ.correcta) {
                btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
              } else if (idx === selectedOption) {
                btnStyle = 'bg-red-500/20 border-red-500 text-red-300';
              } else {
                btnStyle = 'opacity-40 border-[var(--bg-panel-border)]';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isAnswered}
                className={`p-3 rounded border text-left flex items-center justify-between transition-all ${btnStyle}`}
              >
                <span>{op}</span>
                {isAnswered && idx === currentQ.correcta && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                {isAnswered && idx === selectedOption && idx !== currentQ.correcta && <XCircle className="w-4 h-4 text-red-400" />}
              </button>
            );
          })}
        </div>

        {/* Explicación didáctica */}
        {isAnswered && (
          <div className="p-3 bg-white/5 rounded border border-[var(--bg-panel-border)] text-xs font-mono text-[var(--text-muted)] my-3">
            <span className="font-bold text-[var(--primary)] mr-1">EXPLICACIÓN:</span>
            {currentQ.explicacion}
          </div>
        )}

        {/* Botón Siguiente */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full mt-2 py-2.5 hud-btn text-xs font-mono border-[var(--secondary)] text-[var(--secondary)] flex items-center justify-center gap-2"
          >
            <span>SIGUIENTE RETO</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
