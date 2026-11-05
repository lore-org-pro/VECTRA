import React, { useState, useEffect, useRef } from 'react';

/**
 * VECTRA // CARTOON FACE (ESTILO ANIMADO 2D EXPRESIVO)
 * 
 * - Ojos caricaturescos grandes con pupilas centradas fijas (mirando a la persona)
 * - Reflejos brillantes duales en las pupilas
 * - Cejas perfectamente alineadas y simétricas
 * - Boca animada expresiva con apertura silábica fluida, dientes superiores,
 *   lengua dinámica reactiva a la voz y hoyuelos que cobran vida al hablar.
 */
export default function CartoonFace({
  state = 'reposo',
  emotion = 'neutral',
  viseme = 'closed',
  audioLevel = 0,
  isSpeaking = false,
  dark = true
}) {
  const containerRef = useRef(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [blinkProgress, setBlinkProgress] = useState(0);
  const [speechTick, setSpeechTick] = useState(0);

  // Parpadeo suave y natural (con probabilidad de doble pestañeo)
  useEffect(() => {
    let timeout;

    const scheduleBlink = () => {
      const nextBlinkDelay = 2200 + Math.random() * 2800;
      timeout = setTimeout(() => {
        setIsBlinking(true);
        let progress = 0;
        const step = () => {
          progress += 0.14;
          if (progress <= 1) {
            setBlinkProgress(Math.sin(progress * Math.PI));
            requestAnimationFrame(step);
          } else {
            setIsBlinking(false);
            setBlinkProgress(0);
            if (Math.random() < 0.22) {
              setTimeout(() => {
                setIsBlinking(true);
                let p2 = 0;
                const step2 = () => {
                  p2 += 0.16;
                  if (p2 <= 1) {
                    setBlinkProgress(Math.sin(p2 * Math.PI));
                    requestAnimationFrame(step2);
                  } else {
                    setIsBlinking(false);
                    setBlinkProgress(0);
                    scheduleBlink();
                  }
                };
                requestAnimationFrame(step2);
              }, 120);
            } else {
              scheduleBlink();
            }
          }
        };
        requestAnimationFrame(step);
      }, nextBlinkDelay);
    };

    scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Estado activo de habla
  const activelySpeaking = state === 'hablando' || isSpeaking || audioLevel > 0.04;

  // Ciclo continuo de habla fluida (simulación silábica natural)
  useEffect(() => {
    if (!activelySpeaking) {
      setSpeechTick(0);
      return;
    }
    let animId;
    let t = 0;
    const loop = () => {
      t += 0.24;
      setSpeechTick(t);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [activelySpeaking]);

  // Escala del ojo por parpadeo (1 = abierto, 0.04 = cerrado)
  const eyeScaleY = isBlinking ? Math.max(0.04, 1 - blinkProgress) : 1;

  // Estados de expresión según 'emotion'
  // Si emotion === 'pensando', pupilas miran hacia arriba a la derecha (pensativo clásico)
  const isThinking = emotion === 'pensando' || state === 'pensando';
  const pupilOffsetX = isThinking ? 14 : 0;
  const pupilOffsetY = isThinking ? -18 : 0;

  // Colores dinámicos adaptados al modo oscuro cyber-glassmorphism
  const strokeColor = dark ? '#f1f5f9' : '#111827';
  const browColor = dark ? '#f8fafc' : '#111827';

  // Parámetros dinámicos de la boca animada
  const speechCadence = activelySpeaking ? (Math.sin(speechTick * 1.4) * 0.5 + 0.5) : 0;
  const audioBoost = Math.max(audioLevel * 1.8, activelySpeaking ? 0.4 : 0);

  // Apertura vertical de la boca
  const mouthOpenHeight = activelySpeaking
    ? Math.min(82, 22 + audioBoost * 46 + speechCadence * 16)
    : emotion === 'feliz' ? 44 : 14;

  // Ancho horizontal de la boca que modula con el habla
  const mouthWidthHalf = activelySpeaking
    ? 96 + Math.cos(speechTick * 1.1) * 12 + audioBoost * 8
    : 86;

  const mouthCenterY = 415;
  const mouthLeftX = 400 - mouthWidthHalf;
  const mouthRightX = 400 + mouthWidthHalf;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none overflow-hidden bg-transparent"
    >
      <svg
        viewBox="0 0 800 600"
        className="w-full h-full max-w-4xl max-h-[85vh] drop-shadow-2xl"
      >
        <defs>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow 
              dx="0" 
              dy="4" 
              stdDeviation={dark ? "6" : "10"} 
              floodColor={dark ? "#38bdf8" : "#000000"} 
              floodOpacity={dark ? "0.35" : "0.10"} 
            />
          </filter>

          {/* Clip path para la cavidad bucal */}
          <clipPath id="mouthClipDynamic">
            <path
              d={`M ${mouthLeftX} ${mouthCenterY} Q 400 ${mouthCenterY - mouthOpenHeight * 0.15} ${mouthRightX} ${mouthCenterY} Q 400 ${mouthCenterY + mouthOpenHeight * 1.35} ${mouthLeftX} ${mouthCenterY} Z`}
            />
          </clipPath>
        </defs>

        {/* ========================================================
            1. CEJAS CARICATURESCAS (PERFECTAMENTE ALINEADAS Y SIMÉTRICAS)
            ======================================================== */}
        <g id="eyebrows">
          {/* Ceja Izquierda (Centrada simétricamente sobre el ojo izquierdo x=300) */}
          <path
            d={
              emotion === 'pensando'
                ? "M 225 112 Q 300 78 375 120 Q 300 68 225 112 Z" // Inclinada pensativa
                : emotion === 'feliz'
                ? "M 225 118 Q 300 80 375 118 Q 300 70 225 118 Z" // Arqueada feliz
                : emotion === 'enfasis'
                ? "M 225 106 Q 300 68 375 106 Q 300 58 225 106 Z" // Alzada con énfasis e ímpetu
                : emotion === 'duda'
                ? "M 225 102 Q 300 66 375 108 Q 300 56 225 102 Z" // Curiosa alzada estilo Spock
                : "M 225 128 Q 300 92 375 128 Q 300 82 225 128 Z" // Neutral alineada
            }
            fill={browColor}
            filter="url(#softGlow)"
            className="transition-all duration-200"
            style={{
              transformOrigin: '300px 110px',
              transform: activelySpeaking
                ? `translateY(${Math.sin(speechTick * 0.8) * 2.5}px)`
                : 'translateY(0px)'
            }}
          />

          {/* Ceja Derecha (Centrada simétricamente sobre el ojo derecho x=500) */}
          <path
            d={
              emotion === 'pensando'
                ? "M 425 120 Q 500 78 575 112 Q 500 68 425 120 Z" // Inclinada pensativa
                : emotion === 'feliz'
                ? "M 425 118 Q 500 80 575 118 Q 500 70 425 118 Z" // Arqueada feliz
                : emotion === 'enfasis'
                ? "M 425 106 Q 500 68 575 106 Q 500 58 425 106 Z" // Alzada con énfasis
                : emotion === 'duda'
                ? "M 425 134 Q 500 102 575 130 Q 500 92 425 134 Z" // Inquisitiva levemente ceñuda
                : "M 425 128 Q 500 92 575 128 Q 500 82 425 128 Z" // Neutral alineada
            }
            fill={browColor}
            filter="url(#softGlow)"
            className="transition-all duration-200"
            style={{
              transformOrigin: '500px 110px',
              transform: activelySpeaking
                ? `translateY(${Math.sin(speechTick * 0.8) * 2.5}px)`
                : 'translateY(0px)'
            }}
          />
        </g>

        {/* ========================================================
            2. OJOS GRANDES CARICATURESCOS (PUPILAS FIJAS A LA PERSONA)
            ======================================================== */}
        <g id="eyes" filter="url(#softGlow)">
          {/* A) OJO IZQUIERDO */}
          <g style={{ transformOrigin: '300px 240px', transform: `scaleY(${eyeScaleY})` }}>
            <ellipse
              cx="300"
              cy="240"
              rx="78"
              ry="96"
              fill="#ffffff"
              stroke={strokeColor}
              strokeWidth="9"
            />
            {/* Pupila Negra Grande con brillo doble fijo (se mueve si está pensando) */}
            <g style={{
              transform: `translate(${pupilOffsetX}px, ${pupilOffsetY}px)`,
              transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
            }}>
              <ellipse
                cx="300"
                cy="240"
                rx="46"
                ry="58"
                fill="#0a0f1d"
              />
              {/* Brillo Mayor (arriba a la derecha) */}
              <circle
                cx="318"
                cy="222"
                r="16"
                fill="#ffffff"
              />
              {/* Brillo Menor (abajo a la izquierda) */}
              <circle
                cx="284"
                cy="256"
                r="8"
                fill="#ffffff"
              />
            </g>
          </g>

          {/* B) OJO DERECHO */}
          <g style={{ transformOrigin: '500px 240px', transform: `scaleY(${eyeScaleY})` }}>
            <ellipse
              cx="500"
              cy="240"
              rx="78"
              ry="96"
              fill="#ffffff"
              stroke={strokeColor}
              strokeWidth="9"
            />
            {/* Pupila Negra Grande con brillo doble fijo (se mueve si está pensando) */}
            <g style={{
              transform: `translate(${pupilOffsetX}px, ${pupilOffsetY}px)`,
              transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
            }}>
              <ellipse
                cx="500"
                cy="240"
                rx="46"
                ry="58"
                fill="#0a0f1d"
              />
              {/* Brillo Mayor (arriba a la derecha) */}
              <circle
                cx="518"
                cy="222"
                r="16"
                fill="#ffffff"
              />
              {/* Brillo Menor (abajo a la izquierda) */}
              <circle
                cx="484"
                cy="256"
                r="8"
                fill="#ffffff"
              />
            </g>
          </g>
        </g>

        {/* ========================================================
            3. BOCA CARICATURESCA ANIMADA DE ALTA EXPRESIÓN
            ======================================================== */}
        <g id="mouth" filter="url(#softGlow)">
          {activelySpeaking ? (
            /* --- BOCA ABIERTA ANIMADA HABLANDO (DIENTES BLANCOS + LENGUA DINÁMICA) --- */
            <g>
              {/* Cavidad Bucal Roja Oscura */}
              <path
                d={`M ${mouthLeftX} ${mouthCenterY} Q 400 ${mouthCenterY - mouthOpenHeight * 0.15} ${mouthRightX} ${mouthCenterY} Q 400 ${mouthCenterY + mouthOpenHeight * 1.35} ${mouthLeftX} ${mouthCenterY} Z`}
                fill="#38090d"
                stroke={strokeColor}
                strokeWidth="8"
                strokeLinejoin="round"
              />

              {/* Elementos interiores recortados por clipPath */}
              <g clipPath="url(#mouthClipDynamic)">
                {/* Dientes Superiores Blancos */}
                <path
                  d={`M ${mouthLeftX + 8} ${mouthCenterY - 4} Q 400 ${mouthCenterY + Math.min(22, mouthOpenHeight * 0.38)} ${mouthRightX - 8} ${mouthCenterY - 4} L ${mouthRightX - 8} ${mouthCenterY + 18} Q 400 ${mouthCenterY + 26} ${mouthLeftX + 8} ${mouthCenterY + 18} Z`}
                  fill="#ffffff"
                  stroke="#e2e8f0"
                  strokeWidth="1.5"
                />

                {/* Lengua Rosa/Roja Dinámica que sube y baja con el habla */}
                <ellipse
                  cx={400 + Math.sin(speechTick * 0.9) * 8}
                  cy={mouthCenterY + mouthOpenHeight * 1.15}
                  rx={mouthWidthHalf * 0.58}
                  ry={Math.max(16, mouthOpenHeight * 0.55)}
                  fill="#ef4444"
                />
                {/* Brillo sutil de la lengua */}
                <ellipse
                  cx={400 + Math.sin(speechTick * 0.9) * 8}
                  cy={mouthCenterY + mouthOpenHeight * 1.05}
                  rx={mouthWidthHalf * 0.38}
                  ry={Math.max(8, mouthOpenHeight * 0.28)}
                  fill="#f87171"
                  opacity="0.85"
                />
              </g>

              {/* Contorno exterior del labio superior e inferior */}
              <path
                d={`M ${mouthLeftX} ${mouthCenterY} Q 400 ${mouthCenterY - mouthOpenHeight * 0.15} ${mouthRightX} ${mouthCenterY}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d={`M ${mouthLeftX} ${mouthCenterY} Q 400 ${mouthCenterY + mouthOpenHeight * 1.35} ${mouthRightX} ${mouthCenterY}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Hoyuelos y comisuras que bailan con la voz */}
              <path
                d={`M ${mouthLeftX - 4} ${mouthCenterY - 6} Q ${mouthLeftX - 10} ${mouthCenterY + 6} ${mouthLeftX - 2} ${mouthCenterY + 12}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d={`M ${mouthRightX + 4} ${mouthCenterY - 6} Q ${mouthRightX + 10} ${mouthCenterY + 6} ${mouthRightX + 2} ${mouthCenterY + 12}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="6"
                strokeLinecap="round"
              />
            </g>
          ) : emotion === 'pensando' ? (
            /* --- BOCA PENSANDO (CURVA CURIOSA CON HOYUELO) --- */
            <g>
              <path
                d="M 330 435 Q 405 422 470 438"
                fill="none"
                stroke={strokeColor}
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path d="M 326 430 Q 324 439 332 441" fill="none" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
            </g>
          ) : emotion === 'feliz' ? (
            /* --- BOCA SONRIENTE AMPLIA (CUTE CARTOON SMILE) --- */
            <g>
              <path
                d="M 295 418 Q 400 482 505 418"
                fill="none"
                stroke={strokeColor}
                strokeWidth="9"
                strokeLinecap="round"
              />
              <path d="M 288 408 Q 286 420 295 426" fill="none" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
              <path d="M 512 408 Q 514 420 505 426" fill="none" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
            </g>
          ) : (
            /* --- BOCA NEUTRAL / REPOSO (AMABLE, SIMÉTRICA Y AMISTOSA) --- */
            <g>
              <path
                d="M 320 425 Q 400 465 480 425"
                fill="none"
                stroke={strokeColor}
                strokeWidth="8.5"
                strokeLinecap="round"
              />
              {/* Hoyuelos laterales simétricos */}
              <path d="M 314 418 Q 311 428 321 432" fill="none" stroke={strokeColor} strokeWidth="5.5" strokeLinecap="round" />
              <path d="M 486 418 Q 489 428 479 432" fill="none" stroke={strokeColor} strokeWidth="5.5" strokeLinecap="round" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
