import React, { useState } from 'react';
import { Mic, MicOff, Send, MessageSquare, Radio, Volume2 } from 'lucide-react';
import { soundFX } from '../../utils/audioFX';

export default function ControlBar({
  isListening,
  onToggleMic,
  onSubmitText,
  state,
  audioLevel = 0,
  micLabel = '',
  availableMics = [],
  onSwitchMic
}) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    soundFX.playConfirm();
    onSubmitText(inputText.trim());
    setInputText('');
  };

  const handleMicPress = () => {
    soundFX.playClick();
    onToggleMic();
  };

  const stateLabel = {
    reposo: 'REPOSO',
    pensando: '⚙ PROCESANDO...',
    hablando: '🔊 HABLANDO',
    escuchando: '🎙 ESCUCHANDO',
    error: '⚠ ERROR'
  }[state] || state?.toUpperCase() || 'REPOSO';

  const isWireless = /(wireless|inalambrico|usb|clip|solapa|lavalier|dongle|boya|rode|dji|fifine)/i.test(micLabel);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
      {/* 1. Botón Principal de Micrófono (PTT) con VU Meter y Selector de Micrófonos */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="relative">
          <button
            onClick={handleMicPress}
            className={`relative p-3 rounded-full border transition-all cursor-pointer ${
              isListening
                ? 'bg-red-500 border-red-600 text-white shadow-lg shadow-red-500/30'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:border-slate-400 shadow-sm'
            }`}
            title={isListening ? 'Soltar para procesar...' : 'Activar Micrófono (o mantén Barra Espaciadora)'}
          >
            {isListening ? <Mic className="w-5 h-5 text-white animate-pulse" /> : <MicOff className="w-5 h-5" />}
            {isListening && (
              <span
                className="absolute inset-0 rounded-full bg-red-400 pointer-events-none transition-transform duration-75"
                style={{
                  transform: `scale(${1 + audioLevel * 0.8})`,
                  opacity: 0.25 + audioLevel * 0.5
                }}
              />
            )}
          </button>
        </div>

        <div className="flex flex-col text-xs font-sans">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              {isListening ? 'CAPTURANDO VOZ' : 'ESPACIO = HABLAR'}
            </span>
            {isWireless && (
              <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-300">
                <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                MIC EXTERNO
              </span>
            )}
            {/* Selector de micrófono si hay más de 1 conectado */}
            {availableMics.length > 1 && (
              <select
                value={availableMics.find((m) => m.label === micLabel)?.deviceId || ''}
                onChange={(e) => onSwitchMic && onSwitchMic(e.target.value)}
                className="text-[9px] font-mono bg-slate-200/90 hover:bg-slate-300 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300 outline-none max-w-[140px] truncate cursor-pointer transition-colors"
                title="Cambiar micrófono activo"
              >
                {availableMics.map((m) => (
                  <option key={m.deviceId} value={m.deviceId}>
                    {m.isExternal ? '🎙️ ' : '💻 '}
                    {m.label.replace(/\([0-9a-f:]+\)/i, '').slice(0, 24)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`font-bold text-[11px] ${
              state === 'pensando' ? 'text-amber-600' :
              state === 'hablando' ? 'text-emerald-600' :
              state === 'escuchando' ? 'text-blue-600' :
              'text-slate-600'
            }`}>{stateLabel}</span>

            {/* Medidor VU visual cuando está escuchando */}
            {isListening && (
              <div className="flex items-center gap-0.5 h-3 px-1.5 bg-slate-200 rounded-full overflow-hidden w-16" title="Nivel de voz">
                {[...Array(6)].map((_, i) => {
                  const threshold = (i + 1) / 6;
                  const active = audioLevel >= threshold * 0.55;
                  return (
                    <div
                      key={i}
                      className={`flex-1 h-2 rounded-xs transition-colors duration-75 ${
                        active
                          ? i < 4 ? 'bg-emerald-500' : 'bg-amber-500'
                          : 'bg-slate-300'
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Campo de Texto de Entrada */}
      <form onSubmit={handleSubmit} className="w-full sm:flex-1 max-w-2xl flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Pregunta con tu micrófono de solapa (Espacio) o escribe aquí..."
            className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-500 rounded-full px-5 py-2.5 text-xs font-sans text-slate-900 placeholder-slate-400 outline-none transition-all shadow-inner"
          />
        </div>
        <button
          type="submit"
          className="bg-slate-900 hover:bg-black text-white text-xs font-semibold py-2.5 px-5 rounded-full flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
          title="Enviar pregunta"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden md:inline">ENVIAR</span>
        </button>
      </form>

      {/* 3. Indicador de Comando de Salida */}
      <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
        <span>Di <strong className="text-slate-800">"ya"</strong> para volver al rostro</span>
      </div>
    </div>
  );
}
