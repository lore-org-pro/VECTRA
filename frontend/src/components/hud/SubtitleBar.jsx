import React from 'react';
import { Mic, Bot } from 'lucide-react';

export default function SubtitleBar({
  userSubtitle = '',
  vectraSubtitle = '',
  state = 'reposo'
}) {
  return (
    <div className="vectra-subtitle-bar w-full flex flex-col gap-1.5 px-4 py-2 border-t border-[var(--bg-panel-border)] bg-[var(--bg-panel)] backdrop-blur-md z-10 font-mono select-none">
      {/* Subtítulo de VECTRA (Voz del Asistente) */}
      <div className="flex items-start gap-2.5">
        <div className="flex items-center gap-1.5 shrink-0 pt-0.5 text-[var(--primary)] font-bold text-xs">
          <Bot className="w-4 h-4" />
          <span>VECTRA:</span>
        </div>
        <div className="text-sm font-sans tracking-wide text-[var(--text-main)] min-h-[1.4rem] flex items-center">
          {vectraSubtitle ? (
            <span className="leading-snug">{vectraSubtitle}</span>
          ) : (
            <span className="text-[var(--text-muted)] italic text-xs">
              {state === 'pensando' ? 'Procesando tensores y relaciones vectoriales...' :
               state === 'escuchando' ? 'Atento al micrófono...' :
               'Sistema en reposo. Di "Hola Vectra" o presiona la barra espaciadora.'}
            </span>
          )}
        </div>
      </div>

      {/* Subtítulo del Usuario (Lo que está escuchando el Micrófono) */}
      {userSubtitle && (
        <div className="flex items-start gap-2.5 pt-1 border-t border-[var(--bg-panel-border)]/50">
          <div className="flex items-center gap-1.5 shrink-0 text-[var(--text-muted)] font-semibold text-xs">
            <Mic className="w-3.5 h-3.5 text-[var(--warning)] animate-pulse" />
            <span>USUARIO:</span>
          </div>
          <div className="text-xs text-[var(--text-muted)] italic">
            &ldquo;{userSubtitle}&rdquo;
          </div>
        </div>
      )}
    </div>
  );
}
