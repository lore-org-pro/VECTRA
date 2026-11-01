import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cpu, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Power, 
  Mic, 
  MicOff, 
  Volume2, 
  Zap,
  List,
  Database
} from 'lucide-react';
import { getProvidersTelemetry, testProvider, toggleProvider, getDemoQuestions, getSupabaseStatus } from '../../services/api';
import { soundFX } from '../../utils/audioFX';

export default function PresenterPanel({
  isOpen,
  onClose,
  forcedProvider,
  setForcedProvider,
  onLaunchQuestion,
  isMicMuted,
  onToggleMicMute
}) {
  const [telemetry, setTelemetry] = useState(null);
  const [supabaseStatus, setSupabaseStatus] = useState(null);
  const [demoQuestions, setDemoQuestions] = useState([]);
  const [testingAll, setTestingAll] = useState(false);
  const [activeTab, setActiveTab] = useState('providers'); // 'providers' | 'questions' | 'tts'

  const fetchTelemetry = async () => {
    try {
      const data = await getProvidersTelemetry();
      setTelemetry(data);
      const sbData = await getSupabaseStatus();
      setSupabaseStatus(sbData);
    } catch (err) {
      console.warn('Error obteniendo telemetría:', err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchTelemetry();
    getDemoQuestions().then(setDemoQuestions).catch(() => {});
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleToggle = async (providerId, currentStatus) => {
    soundFX.playClick();
    const newActive = currentStatus !== 'ACTIVE';
    await toggleProvider(providerId, newActive);
    fetchTelemetry();
  };

  const handleTestAll = async () => {
    soundFX.playConfirm();
    setTestingAll(true);
    if (telemetry && telemetry.providers) {
      for (const p of telemetry.providers) {
        if (p.active) {
          try {
            await testProvider(p.id);
          } catch {}
        }
      }
    }
    await fetchTelemetry();
    setTestingAll(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="hud-panel max-w-4xl w-full max-h-[90vh] rounded-lg border border-[var(--primary)] glow-box flex flex-col overflow-hidden">
        {/* Header del Panel de Presentador */}
        <div className="p-4 border-b border-[var(--bg-panel-border)] flex items-center justify-between bg-black/60 font-mono">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-[var(--primary)] animate-pulse" />
            <h2 className="font-orbitron font-bold text-sm tracking-widest text-[var(--primary)] glow-primary">
              PANEL DE CONTROL DEL PRESENTADOR [TECLA P]
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Estado de Supabase */}
            <div className={`px-2.5 py-1 text-[11px] rounded border flex items-center gap-1.5 ${
              supabaseStatus?.connected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              <Database className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{supabaseStatus?.connected ? 'SUPABASE: ONLINE' : 'SUPABASE: OFFLINE'}</span>
            </div>

            {/* Silenciador de Emergencia */}
            <button
              onClick={onToggleMicMute}
              className={`px-3 py-1 text-xs rounded border flex items-center gap-1.5 transition-colors ${
                isMicMuted ? 'bg-[var(--danger)] text-white border-[var(--danger)]' : 'bg-black/40 text-[var(--text-main)] border-[var(--bg-panel-border)]'
              }`}
            >
              {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isMicMuted ? 'MICRÓFONO MUTED' : 'MICRO ACTIVO'}</span>
            </button>

            <button
              onClick={() => { soundFX.playClick(); onClose(); }}
              className="p-1 rounded text-[var(--text-muted)] hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex items-center gap-1 px-4 pt-2 border-b border-[var(--bg-panel-border)] bg-black/40 font-mono text-xs">
          <button
            onClick={() => setActiveTab('providers')}
            className={`px-3 py-1.5 border-b-2 transition-all ${
              activeTab === 'providers' ? 'border-[var(--primary)] text-[var(--primary)] font-bold' : 'border-transparent text-[var(--text-muted)] hover:text-white'
            }`}
          >
            ROUTER IA ({telemetry?.providers?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 border-b-2 transition-all ${
              activeTab === 'questions' ? 'border-[var(--primary)] text-[var(--primary)] font-bold' : 'border-transparent text-[var(--text-muted)] hover:text-white'
            }`}
          >
            PREGUNTAS DE DEMO ({demoQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('tts')}
            className={`px-3 py-1.5 border-b-2 transition-all ${
              activeTab === 'tts' ? 'border-[var(--primary)] text-[var(--primary)] font-bold' : 'border-transparent text-[var(--text-muted)] hover:text-white'
            }`}
          >
            SÍNTESIS DE VOZ (TTS)
          </button>
        </div>

        {/* Contenido de la Pestaña Activa */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
          {/* TAB 1: PROVEEDORES */}
          {activeTab === 'providers' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-black/40 rounded border border-[var(--bg-panel-border)]">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)]">FORZAR PROVEEDOR:</span>
                  <select
                    value={forcedProvider || ''}
                    onChange={(e) => setForcedProvider(e.target.value || null)}
                    className="bg-black border border-[var(--bg-panel-border)] rounded px-2 py-1 text-xs text-[var(--primary)] outline-none"
                  >
                    <option value="">Automático (Failover en Cascada)</option>
                    {telemetry?.providers?.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleTestAll}
                  disabled={testingAll}
                  className="hud-btn text-xs py-1 px-3 border-[var(--primary)]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingAll ? 'animate-spin' : ''}`} />
                  <span>{testingAll ? 'PROBANDO...' : 'PROBAR TODOS'}</span>
                </button>
              </div>

              {/* Tabla de Proveedores */}
              <div className="border border-[var(--bg-panel-border)] rounded overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/60 border-b border-[var(--bg-panel-border)] text-[var(--text-muted)] text-[11px]">
                      <th className="p-2.5">PRIORIDAD</th>
                      <th className="p-2.5">PROVEEDOR</th>
                      <th className="p-2.5">ESTADO</th>
                      <th className="p-2.5">LATENCIA</th>
                      <th className="p-2.5">RPM USADO</th>
                      <th className="p-2.5">RPD USADO</th>
                      <th className="p-2.5 text-right">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--bg-panel-border)]/50">
                    {telemetry?.providers?.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-2.5 text-[var(--primary)] font-bold">#{p.priority}</td>
                        <td className="p-2.5 font-semibold text-[var(--text-main)]">
                          <div>{p.name}</div>
                          <div className="text-[10px] text-[var(--text-muted)] font-normal">{p.model}</div>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'ACTIVE' ? 'bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/40' :
                            p.status === 'COOLDOWN' ? 'bg-[var(--warning)]/20 text-[var(--warning)] border border-[var(--warning)]/40' :
                            'bg-[var(--danger)]/20 text-[var(--danger)] border border-[var(--danger)]/40'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-[var(--text-main)]">
                          {p.averageLatencyMs > 0 ? `${p.averageLatencyMs} ms` : '—'}
                        </td>
                        <td className="p-2.5 text-[var(--text-muted)]">
                          {p.rpmCount} / {p.limits?.rpm || '∞'}
                        </td>
                        <td className="p-2.5 text-[var(--text-muted)]">
                          {p.rpdCount} / {p.limits?.rpd || '∞'}
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => handleToggle(p.id, p.status)}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                              p.status === 'ACTIVE' ? 'bg-red-500/20 text-red-300 hover:bg-red-500/40' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40'
                            }`}
                          >
                            {p.status === 'ACTIVE' ? 'DESACTIVAR' : 'ACTIVAR'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: 15 PREGUNTAS DE DEMO */}
          {activeTab === 'questions' && (
            <div className="space-y-2">
              <p className="text-[var(--text-muted)] text-xs mb-3">
                Haz clic en cualquier pregunta para dispararla de inmediato en vivo durante la presentación:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {demoQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      soundFX.playConfirm();
                      onLaunchQuestion(q.pregunta);
                      onClose();
                    }}
                    className="p-3 bg-black/50 border border-[var(--bg-panel-border)] hover:border-[var(--primary)] rounded cursor-pointer transition-all hover:bg-white/5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-[var(--primary)] font-bold mb-1">
                        <span>PREGUNTA #{idx + 1}</span>
                        <span className="uppercase">{q.titulo}</span>
                      </div>
                      <p className="text-xs text-[var(--text-main)] font-sans line-clamp-2">
                        {q.pregunta}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-[var(--secondary)]">
                      <Play className="w-3 h-3" />
                      <span>DISPARAR AHORA</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ESTADO TTS & CACHÉ */}
          {activeTab === 'tts' && (
            <div className="space-y-4">
              <div className="p-4 bg-black/50 border border-[var(--bg-panel-border)] rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">PROVEEDOR PRINCIPAL:</span>
                  <span className="font-bold text-[var(--primary)]">ElevenLabs (Flash v2.5)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">ESTADO DE API KEY:</span>
                  <span className={telemetry?.ttsStats?.elevenLabsConfigured ? 'text-[var(--success)] font-bold' : 'text-[var(--warning)] font-bold'}>
                    {telemetry?.ttsStats?.elevenLabsConfigured ? 'CONFIGURADA' : 'NO CONFIGURADA (USANDO VOZ DEL NAVEGADOR)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">CARACTERES SINTETIZADOS EN ESTA SESIÓN:</span>
                  <span className="text-white font-bold">{telemetry?.ttsStats?.charsUsedSession || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">CADENA DE RESPALDO AUTOMÁTICA:</span>
                  <span className="text-[var(--success)] font-bold">Google Neural TTS (es-MX MP3)</span>
                </div>
              </div>

              {/* Tarjeta de Supabase */}
              <div className="p-4 bg-black/50 border border-[var(--bg-panel-border)] rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">BASE DE DATOS:</span>
                  <span className="font-bold text-[var(--primary)]">Supabase Cloud (PostgreSQL)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">ESTADO DE CONEXIÓN:</span>
                  <span className={supabaseStatus?.connected ? 'text-[var(--success)] font-bold' : 'text-[var(--warning)] font-bold'}>
                    {supabaseStatus?.connected ? 'CONECTADO Y SINCRONIZADO' : 'OFFLINE / RESPALDO LOCAL'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">CONSULTAS REGISTRADAS EN LA SESIÓN:</span>
                  <span className="text-white font-bold">{supabaseStatus?.totalLogsCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">PROYECTO:</span>
                  <span className="text-[var(--text-muted)] font-mono text-[10px]">rimvdlxfvafknrgbmedv.supabase.co</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
