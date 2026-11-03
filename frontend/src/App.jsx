import React, { useState, useEffect, useRef, useCallback } from 'react';
import HeaderHUD from './components/hud/HeaderHUD';
import SubtitleBar from './components/hud/SubtitleBar';
import ControlBar from './components/hud/ControlBar';
import CartoonFace from './components/face/CartoonFace';
import ProcedureBoard from './components/board/ProcedureBoard';
import ResultBoard from './components/board/ResultBoard';
import { cleanTextForDisplay } from './utils/latexUtils';
import VectorScene from './components/visualizer3d/VectorScene';
import PresenterPanel from './components/presenter/PresenterPanel';
import { soundFX } from './utils/audioFX';
import { speechService } from './services/speechRecognition';
import { audioPlayer } from './services/audioPlayer';
import { askVectra, fetchTTS } from './services/api';
import { Mic, Sparkles, ArrowLeft, Sun, Moon, Volume2, Bot, Box, Layers, Trophy } from 'lucide-react';

export default function App() {
  // 1. Estados de Pantalla: 'face' (solo la cara en fondo blanco) | 'workspace' (cara + procedimiento con dígitos)
  const [screenMode, setScreenMode] = useState(() => {
    try {
      return window.location.search.includes('pizarra') ? 'workspace' : 'face';
    } catch {
      return 'face';
    }
  });

  // Modo de vista en Workspace: 'board' (Pizarrón completo) | 'visualizer3d' (Espacio 3D completo)
  const [workspaceView, setWorkspaceView] = useState('board');

  // Aviso discreto si el navegador (como Brave) bloquea el micrófono de Google
  const [braveMicNotice, setBraveMicNotice] = useState(false);

  // 2. Estados Visuales y de Expresión Facial (Rostro Clásico Exclusivo)
  const [isStarted, setIsStarted] = useState(false);
  const [theme, setTheme] = useState('cyan');
  const [systemState, setSystemState] = useState('reposo');
  const [emotion, setEmotion] = useState('neutral');
  const [viseme, setViseme] = useState('closed');
  const [audioLevel, setAudioLevel] = useState(0);

  // 4. Control de Audio y Micrófono
  const [isListening, setIsListening] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isWakeWordMode, setIsWakeWordMode] = useState(false);
  const [wakeWordPulse, setWakeWordPulse] = useState(false); // feedback visual al detectar "VECTRA"

  // 5. Telemetría de IA y Enrutador
  const [activeProvider, setActiveProvider] = useState('VECTRA AI');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [forcedProvider, setForcedProvider] = useState(null);
  const [history, setHistory] = useState([]);

  // 6. Subtítulos y Sugerencias de Interacción
  const [userSubtitle, setUserSubtitle] = useState('');
  const [vectraSubtitle, setVectraSubtitle] = useState('¡Saludos! Soy VECTRA, sincronizado con la vanguardia de octubre de 2026. Ciencia, IA, física o álgebra vectorial... ¿En qué gran enigma nos sumergimos hoy?');
  const [suggestions, setSuggestions] = useState([
    '¿Cuál es el último modelo de Google Gemini?',
    '¿Qué has aprendido?',
    'Suma los vectores (2, 3, -1) y (1, -4, 2)',
    'Aprende que mi proyecto se llama Jarvis'
  ]);
  const [lastResultText, setLastResultText] = useState('');

  // 7. Pizarra de Pasos y Visualizador 3D
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [procedureData, setProcedureData] = useState(() => {
    try {
      if (window.location.search.includes('vector')) {
        return {
          titulo: 'Suma de Vectores en el Espacio',
          pasos: [
            {
              titulo: 'Planteamiento: Base Canónica Tridimensional',
              latex: 'A = \\langle 2, 3, -1 \\rangle,\\quad B = \\langle 1, -4, 2 \\rangle',
              explicacion: 'Identificamos las componentes en base estándar tridimensional.'
            },
            {
              titulo: 'Suma Componente a Componente',
              latex: 'A + B = \\langle 2+1,\\; 3-4,\\; -1+2 \\rangle = \\langle 3, -1, 1 \\rangle',
              explicacion: 'Sumamos individualmente las componentes X, Y, Z.'
            }
          ],
          resultado: {
            latex: 'A + B = \\langle 3, -1, 1 \\rangle',
            texto: 'El vector suma es (3, -1, 1).'
          }
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  const [visualizationData, setVisualizationData] = useState(() => {
    try {
      if (window.location.search.includes('vector')) {
        return {
          tipo: 'suma',
          vectores: [
            { nombre: 'A', componentes: [2, 3, -1], color: '#00f0ff' },
            { nombre: 'B', componentes: [1, -4, 2], color: '#ffaa00' },
            { nombre: 'R', componentes: [3, -1, 1], color: '#10b981' }
          ]
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  // 8. Panel de Presentador (Tecla P)
  const [showPresenter, setShowPresenter] = useState(false);

  // 9. Medición acústica del Micrófono (Solapa/USB)
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const [micLabel, setMicLabel] = useState(() => speechService.activeDeviceLabel || '');
  const [availableMics, setAvailableMics] = useState([]);

  useEffect(() => {
    speechService.refreshDevices().then((devs) => {
      setAvailableMics(devs || []);
      setMicLabel(speechService.activeDeviceLabel);
    });
  }, []);

  const handleSwitchMic = useCallback((deviceId) => {
    speechService.setDevice(deviceId);
    setMicLabel(speechService.activeDeviceLabel);
    soundFX.playClick();
  }, []);

  // Ref para cancelar secuencias del profesor si el usuario interrumpe o sale
  const sequenceCancelRef = useRef(false);

  // Refs para evitar closures estancados en callbacks de voz
  const isMicMutedRef = useRef(isMicMuted);
  const screenModeRef = useRef(screenMode);
  const forcedProviderRef = useRef(forcedProvider);
  const historyRef = useRef(history);

  useEffect(() => { isMicMutedRef.current = isMicMuted; }, [isMicMuted]);
  useEffect(() => { screenModeRef.current = screenMode; }, [screenMode]);
  useEffect(() => { forcedProviderRef.current = forcedProvider; }, [forcedProvider]);
  useEffect(() => { historyRef.current = history; }, [history]);

  // Aplicar tema en el elemento raíz HTML
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Conectar AudioPlayer a Visemas y Nivel de Audio para Lip-Sync
  useEffect(() => {
    audioPlayer.onViseme = (v) => setViseme(v);
    audioPlayer.onAudioLevel = (lvl) => setAudioLevel(lvl);
    audioPlayer.onStart = () => setSystemState('hablando');
    audioPlayer.onEnd = () => {
      setSystemState('reposo');
      setEmotion('neutral');
      setViseme('closed');
      setAudioLevel(0);
    };
    return () => { audioPlayer.stop(); };
  }, []);

  // Proceso Central: Interrogación a la IA, Detección de Comandos y Síntesis de Voz
  const handleProcessQuestion = useCallback(async (queryText) => {
    if (!queryText || typeof queryText !== 'string' || !queryText.trim()) return;
    audioPlayer.stop();

    // Limpiar palabra de activación ("Vepra", "Vectra", etc.) si viene en el texto
    const cleanedText = queryText
      .replace(/^(?:hola\s+|oye\s+)?(?:vepra|vectra|bepra|bectra|vecta|betra|veptra)[\s,.:;¡!¿?]+/i, '')
      .trim() || queryText.trim();

    setUserSubtitle(cleanedText);

    // 1. Detección de comandos de voz para volver al rostro ("ya", "listo", "volver", etc.)
    const cleanCommand = cleanedText.toLowerCase().trim().replace(/[.,!¡¿?]/g, '');
    const returnCommands = [
      'ya', 'listo', 'volver', 'regresar', 'terminar', 'gracias',
      'sal', 'salir', 'cerrar', 'atras', 'atrás', 'eso es todo', 'ok ya', 'volver a la cara'
    ];

    if (screenModeRef.current === 'workspace' && returnCommands.includes(cleanCommand)) {
      audioPlayer.stop();
      setScreenMode('face');
      setSystemState('reposo');
      setEmotion('neutral');
      setUserSubtitle('');
      const exitMsg = 'Entendido. Regresando al modo principal.';
      setVectraSubtitle(exitMsg);
      soundFX.playConfirm();

      try {
        const ttsRes = await fetchTTS(exitMsg);
        if (ttsRes && ttsRes.audioUrl) {
          await audioPlayer.playUrl(ttsRes.audioUrl);
        } else {
          audioPlayer.speakBrowser(exitMsg);
        }
      } catch {
        audioPlayer.speakBrowser(exitMsg);
      }
      return;
    }

    // 2. Estado de procesamiento con Razonamiento Previo (no salta intempestivamente)
    setSystemState('pensando');
    setEmotion('pensando');
    setVectraSubtitle('Analizando consulta y estructurando respuesta...');
    soundFX.playConfirm();

    try {
      // Breve pausa deliberada de razonamiento cognitivo (500ms) para asimilar y no precipitarse
      await new Promise(r => setTimeout(r, 500));

      const response = await askVectra(
        cleanedText,
        historyRef.current,
        forcedProviderRef.current
      );

      const usedName = response._meta?.providerName || 'VECTRA AI';
      const usedId = response._meta?.providerUsed || 'demo';
      setActiveProvider(usedName);
      setIsDemoMode(usedId === 'demo');

      setEmotion(response.emocion || 'neutral');
      setVectraSubtitle(response.habla || 'Procedimiento completado.');

      // Guardar sugerencias interactivas si vienen en la respuesta limpiando cualquier código LaTeX crudo
      if (Array.isArray(response.sugerencias) && response.sugerencias.length > 0) {
        setSuggestions(response.sugerencias.map(cleanTextForDisplay));
      }
      setLastResultText(response.resultado?.texto || '');

      // 3. Decidir el modo de pantalla según si la respuesta es matemática o conversacional
      // Para saludos y charlas casuales: NUNCA sacar la pizarra, mantenerse en el rostro
      const normInput = cleanedText.toLowerCase().trim().replace(/[¿?¡!.,]/g, '');
      const isGreeting = /^(?:hola|buen(?:os)?\s*(?:dias|tardes|noches)|que\s*tal|como\s*estas|saludos|hey|hola\s*vectra|buenas|quien\s*eres)$/i.test(normInput);

      const hasMathSteps = Array.isArray(response.pasos) && response.pasos.length > 0;
      const has3DVectors = response.visualizacion &&
                           response.visualizacion.tipo !== 'ninguna' &&
                           Array.isArray(response.visualizacion.vectores) &&
                           response.visualizacion.vectores.length > 0;

      // Filtrar falsos pasos de saludo que algunos LLMs puedan emitir
      const hasRealMathContent = response.pasos?.some(p => (p.latex && p.latex.trim().length > 0) && !/saludo/i.test(p.titulo || ''));

      const isMathProblem = !isGreeting && ((hasMathSteps && hasRealMathContent) || has3DVectors);

      if (isMathProblem) {
        // Transición a la pantalla de trabajo iniciando SIEMPRE con el Pizarrón a pantalla completa
        setScreenMode('workspace');
        setWorkspaceView('board');
        setProcedureData(response);
        setVisualizationData(response.visualizacion);
        setActiveStepIndex(0);
      } else {
        // Mantenerse en el rostro holográfico para conversación, saludos y charla
        setScreenMode('face');
        setProcedureData(null);
      }

      // Guardar en memoria de conversación (últimos 6 turnos)
      setHistory((prev) => [
        ...prev.slice(-6),
        { role: 'user', content: queryText },
        { role: 'assistant', content: JSON.stringify(response) }
      ]);

      // 4. Síntesis y Reproducción Guiada del Profesor
      if (isMathProblem && hasMathSteps) {
        // Modo Profesor Didáctico Automático: Paso 1 -> Paso 2 -> Paso 3
        sequenceCancelRef.current = false;

        const playText = async (text) => {
          if (!text || sequenceCancelRef.current) return;
          try {
            const ttsRes = await fetchTTS(text);
            if (sequenceCancelRef.current) return;
            if (ttsRes?.audioUrl) {
              await audioPlayer.playUrl(ttsRes.audioUrl);
            } else {
              await audioPlayer.speakBrowser(text);
            }
          } catch {
            // Si falla TTS, usar browser — speakBrowser ya retorna Promise
            await audioPlayer.speakBrowser(text);
          }
        };

        (async () => {
          // A) Narrar introducción "habla"
          if (response.habla && !sequenceCancelRef.current) {
            setVectraSubtitle(response.habla);
            await playText(response.habla);
            if (sequenceCancelRef.current) return;
            await new Promise((r) => setTimeout(r, 400));
          }

          // B) Narrar cada paso secuencialmente
          const steps = response.pasos;
          for (let i = 0; i < steps.length; i++) {
            if (sequenceCancelRef.current || screenModeRef.current !== 'workspace') break;

            setActiveStepIndex(i);
            const speechText = steps[i].locucion || steps[i].explicacion || steps[i].titulo;
            setVectraSubtitle(speechText);
            await playText(speechText);

            if (sequenceCancelRef.current) break;
            if (i < steps.length - 1) {
              await new Promise((r) => setTimeout(r, 1200));
            }
          }

          // C) Al culminar los pasos en el pizarrón:
          // Transición directa al Pizarrón de Resultado aparte
          if (!sequenceCancelRef.current && screenModeRef.current === 'workspace') {
            await new Promise((r) => setTimeout(r, 600));
            if (sequenceCancelRef.current) return;

            // Abrir el Pizarrón de Resultado aparte
            setWorkspaceView('result');
            soundFX.playConfirm();

            // Locución magistral de cátedra universitaria nivel Harvard
            const resultSpeech = response.resultado?.explicacionHarvard
              || (response.resultado?.texto
                ? `Conclusión y solución definitiva: ${response.resultado.texto}`
                : 'Aquí apreciamos la conclusión y solución definitiva en el pizarrón de resultado.');
            setVectraSubtitle(resultSpeech);
            await playText(resultSpeech);
            if (sequenceCancelRef.current) return;

            const has3D = response.visualizacion &&
                          response.visualizacion.tipo !== 'ninguna' &&
                          Array.isArray(response.visualizacion.vectores) &&
                          response.visualizacion.vectores.length > 0;

            if (has3D) {
              await new Promise((r) => setTimeout(r, 800));
              if (sequenceCancelRef.current) return;

              const invite3D = 'El cálculo ha sido verificado con rigor analítico. Cuando gustes, pulsa en "Explorar en Espacio 3D" para interactuar con la geometría espacial tridimensional.';
              setVectraSubtitle(invite3D);
              await playText(invite3D);
            }
          }
        })();

      } else if (response.habla) {
        // Conversación / charla sin pizarra — UN SOLO camino de audio
        let ttsOk = false;
        try {
          const ttsRes = await fetchTTS(response.habla);
          if (ttsRes?.audioUrl) {
            await audioPlayer.playUrl(ttsRes.audioUrl);
            ttsOk = true;
          }
        } catch { /* silencioso */ }
        if (!ttsOk) {
          await audioPlayer.speakBrowser(response.habla);
        }
      }
    } catch (err) {
      console.error('Error procesando consulta:', err);
      setSystemState('error');
      setEmotion('duda');
      const errMsg = 'Ocurrió una anomalía transitoria. Modo de respaldo activo.';
      setVectraSubtitle(errMsg);
      audioPlayer.speakBrowser(errMsg);
      setTimeout(() => {
        setSystemState('reposo');
        setEmotion('neutral');
      }, 4000);
    }
  }, []);

  // Función para re-escuchar el audio hablado actual
  const handleReplayTTS = useCallback(async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!vectraSubtitle) return;
    audioPlayer.stop();
    soundFX.playClick();
    try {
      const ttsRes = await fetchTTS(vectraSubtitle);
      if (ttsRes && ttsRes.audioUrl) {
        await audioPlayer.playUrl(ttsRes.audioUrl);
      } else {
        audioPlayer.speakBrowser(vectraSubtitle);
      }
    } catch {
      audioPlayer.speakBrowser(vectraSubtitle);
    }
  }, [vectraSubtitle]);

  // Función para regresar al rostro holográfico manualmente
  const handleReturnToFace = useCallback(() => {
    sequenceCancelRef.current = true;
    audioPlayer.stop();
    setScreenMode('face');
    setWorkspaceView('board');
    setSystemState('reposo');
    setEmotion('neutral');
    setUserSubtitle('');
    setVectraSubtitle('VECTRA en línea. Listo para tu siguiente pregunta.');
    soundFX.playConfirm();
  }, []);

  // Conectar Web Speech API para reconocimiento continuo de voz en español
  useEffect(() => {
    speechService.onInterimTranscript = (text) => {
      if (!isMicMutedRef.current) {
        setUserSubtitle(text);
        setSystemState('escuchando');
      }
    };

    speechService.onFinalTranscript = (finalText) => {
      if (isMicMutedRef.current || !finalText || finalText.trim().length < 1) return;
      const text = finalText.trim();

      // Si dicen "ya", "volver a la cara" o "salir" para salir del procedimiento
      if (/^(?:ya|volver|volver a la cara|cerrar|listo|eso es todo)$/i.test(text.replace(/[.,?!]/g, '').trim())) {
        handleReturnToFace();
        return;
      }

      // Comandos por voz para alternar entre pizarra y 3D en modo workspace
      const lowerVoice = text.toLowerCase().replace(/[.,?!]/g, '').trim();
      if (screenModeRef.current === 'workspace') {
        if (/^(?:ver 3d|mostrar 3d|espacio 3d|grafico 3d|ejemplo visual|ver visual|ver ejemplo visual)$/i.test(lowerVoice)) {
          setWorkspaceView('visualizer3d');
          soundFX.playConfirm();
          return;
        }
        if (/^(?:ver pizarra|mostrar pizarra|volver a la pizarra|la pizarra|ver pasos|ver matematicas)$/i.test(lowerVoice)) {
          setWorkspaceView('board');
          soundFX.playConfirm();
          return;
        }
      }

      // Procesar DIRECTAMENTE la pregunta hablada (sin requerir decir "vepra")
      // Si por costumbre dijeron "vepra, 2 + 2", se limpia la palabra "vepra" automáticamente
      const stripped = text
        .replace(/^(?:hola\s+|oye\s+)?(?:vepra|vectra|bepra|bectra|vecta|betra|veptra)[\s,.:;¡!¿?]+/i, '')
        .trim() || text;

      handleProcessQuestion(stripped);
    };

    speechService.onStateChange = (listening) => {
      setIsListening(listening);
      if (listening) {
        setMicLabel(speechService.activeDeviceLabel);
      } else {
        setMicAudioLevel(0);
      }
    };

    speechService.onAudioLevel = (lvl) => {
      setMicAudioLevel(lvl);
    };

    speechService.onError = (err) => {
      console.warn('SpeechRecognition error:', err);
      setIsListening(false);
      setSystemState('reposo');
      // mic_denied o insecure_origin: mostrar aviso contextual
      if (err === 'mic_denied' || err === 'not-allowed' || err === 'insecure_origin') {
        setBraveMicNotice(true);
      } else if (err === 'ruido_ambiental_filtrado' || err === 'empty_transcript') {
        // En aulas ruidosas: notificar sutilmente que la puerta de ruido bloqueó el ruido exterior
        setVectraSubtitle('🛡️ Ruido de fondo filtrado. Habla más cerca de tu micrófono de solapa.');
        setEmotion('neutral');
        setTimeout(() => {
          setVectraSubtitle((prev) => (prev.startsWith('🛡️ Ruido') ? '' : prev));
        }, 3000);
      } else if (err === 'whisper_failed') {
        setVectraSubtitle('Conexión de voz inestable (hotspot móvil). Intenta de nuevo o escribe tu consulta.');
        setEmotion('duda');
        setTimeout(() => {
          setVectraSubtitle((prev) => (prev.startsWith('Conexión') ? '' : prev));
          setEmotion('neutral');
        }, 3500);
      }
    };

    // Wake word callback — feedback visual/sonoro cuando se detecta "VECTRA"
    speechService.onWakeWord = () => {
      soundFX.playClick();
      setWakeWordPulse(true);
      setSystemState('escuchando');
      setVectraSubtitle('🎙️ ¡Te escucho! Di tu pregunta...');
      setTimeout(() => setWakeWordPulse(false), 1200);
    };
  }, [handleProcessQuestion]);

  // Atajos de Teclado Globales (Barra Espaciadora para Push-to-Talk)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        if (screenModeRef.current === 'workspace') handleReturnToFace();
      } else if (e.key.toLowerCase() === 'p') {
        soundFX.playConfirm();
        setShowPresenter((prev) => !prev);
      } else if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (!isMicMutedRef.current) {
          audioPlayer.stop();
          soundFX.playClick();
          setSystemState('escuchando');
          // start() es ahora async (solicita micrófono) — no bloquea el handler
          speechService.start().catch((err) => {
            console.warn('[App] No se pudo iniciar micrófono:', err);
            setSystemState('reposo');
          });
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setSystemState('pensando');
        speechService.stop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleReturnToFace]);

  // Desbloqueo inicial silencioso con la primera interacción del usuario
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!isStarted) {
        setIsStarted(true);
        soundFX.init();
        audioPlayer.init();
        // NO iniciar micrófono automáticamente — el usuario debe presionar Espacio
        // para que el navegador pueda conceder permisos dentro de un gesto del usuario
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [isStarted]);

  // Alternar Micrófono manualmente (botón del HUD)
  const handleToggleMic = () => {
    if (isListening) {
      speechService.stop();
    } else {
      audioPlayer.stop();
      speechService.start().catch((err) => {
        console.warn('[App] Error al iniciar micrófono:', err);
      });
    }
  };

  // Silenciador de emergencia (isMicMuted)
  const handleToggleMicMute = () => {
    const newMuted = !isMicMuted;
    setIsMicMuted(newMuted);
    if (newMuted) {
      speechService.stop();
    }
  };

  // Activar / Desactivar modo Wake Word "VECTRA" para clases con ruido de fondo
  const handleToggleWakeWord = useCallback(() => {
    if (isMicMuted) return; // No activar si el mic está silenciado
    if (isWakeWordMode) {
      speechService.stopWakeWordEngine();
      setIsWakeWordMode(false);
      setVectraSubtitle('Modo de clase desactivado. Usa Espacio o el botón para hablar.');
      setTimeout(() => setVectraSubtitle(''), 3000);
    } else {
      speechService.startWakeWordEngine();
      setIsWakeWordMode(true);
      setVectraSubtitle('🏫 Modo Clase activado — Di "VECTRA" para activarme sin tocar nada.');
      soundFX.playConfirm();
      setTimeout(() => setVectraSubtitle((p) => p.startsWith('🏫') ? '' : p), 5000);
    }
  }, [isWakeWordMode, isMicMuted]);

  return (
    <div className="vectra-app-container relative w-screen h-screen flex flex-col justify-between select-none overflow-hidden bg-white text-slate-800">
      {/* Aviso si el navegador rechazó el micrófono */}
      {braveMicNotice && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2 rounded-full text-xs font-sans shadow-md flex items-center gap-3">
          {typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? (
            <span className="flex items-center gap-2">
              🔒 <strong>Micrófono bloqueado por HTTP:</strong> En otra PC se requiere HTTPS para usar el micrófono.
              <a
                href={`https://${window.location.host}`}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-0.5 rounded-full transition-all"
              >
                Cambiar a HTTPS
              </a>
            </span>
          ) : (
            <span>
              🎙️ <strong>Micrófono bloqueado.</strong> Haz clic en el candado o permisos de la URL del navegador y permite el micrófono, o escribe en la barra inferior.
            </span>
          )}
          <button
            onClick={() => setBraveMicNotice(false)}
            className="text-amber-800 hover:text-black font-bold text-xs cursor-pointer ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ÁREA PRINCIPAL: SOLAMENTE LA CARA CENTRADA (FONDO BLANCO) O MODO PROCEDIMIENTO */}
      {screenMode === 'face' ? (
        /* ========================================================
           A) MODO SOLAMENTE LA CARA (FONDO BLANCO PURO) + HUD CONVERSACIONAL
           ======================================================== */
        <main 
          onMouseDown={(e) => {
            if (e.target.closest('button, input, textarea, a')) return;
            if (!isMicMutedRef.current) {
              audioPlayer.stop();
              soundFX.playClick();
              speechService.start();
              setSystemState('escuchando');
            }
          }}
          onMouseUp={(e) => {
            if (e.target.closest('button, input, textarea, a')) return;
            setSystemState('pensando');
            speechService.stop();
          }}
          onTouchStart={(e) => {
            if (e.target.closest('button, input, textarea, a')) return;
            if (!isMicMutedRef.current) {
              audioPlayer.stop();
              soundFX.playClick();
              speechService.start();
              setSystemState('escuchando');
            }
          }}
          onTouchEnd={(e) => {
            if (e.target.closest('button, input, textarea, a')) return;
            setSystemState('pensando');
            speechService.stop();
          }}
          className="flex-1 w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 relative bg-white select-none overflow-hidden cursor-pointer"
          title="Mantén presionada la barra espaciadora o haz clic sostenido en el fondo para hablar"
        >
          {/* 1. Header superior discreto con pregunta del usuario o badge de estado */}
          <div className="w-full max-w-3xl flex flex-col items-center gap-1.5 z-10 shrink-0 pointer-events-auto">
            {userSubtitle ? (
              <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-slate-100 border border-slate-200 shadow-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500">TÚ:</span>
                <span className="text-xs font-sans text-slate-800 font-medium italic truncate max-w-[280px] sm:max-w-[480px]">
                  &ldquo;{userSubtitle}&rdquo;
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600">
                  <Bot className="w-3.5 h-3.5 text-cyan-600" />
                  <span>VECTRA // Actualizado a Octubre 2026</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFX.playClick();
                    handleProcessQuestion('¿Qué has aprendido?');
                  }}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[10px] font-mono text-emerald-800 font-semibold transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                  title="Ver memoria continua y aprendizajes acumulados"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                  <span>🧠 Memoria Viva</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Rostro animado interactivo clásico */}
          <div className="w-full flex-1 min-h-0 flex items-center justify-center relative pointer-events-none py-1">
            <CartoonFace
              state={systemState}
              emotion={emotion}
              viseme={viseme}
              audioLevel={audioLevel}
              isSpeaking={systemState === 'hablando'}
            />
          </div>

          {/* 3. Panel de Diálogo y Sugerencias Interactivas */}
          <div className="w-full max-w-3xl flex flex-col items-center gap-2 z-20 shrink-0 pointer-events-auto pb-1">
            {/* Tarjeta de habla / respuesta de VECTRA */}
            <div className="w-full bg-slate-50/90 border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex items-start justify-between gap-3 transition-all">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <div className={`mt-0.5 p-1 rounded-lg shrink-0 ${
                  systemState === 'hablando' ? 'bg-emerald-100 text-emerald-600 animate-pulse' :
                  systemState === 'pensando' ? 'bg-amber-100 text-amber-600 animate-spin' :
                  'bg-cyan-100 text-cyan-700'
                }`}>
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-700">
                      VECTRA
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-white text-slate-600 border border-slate-200">
                      {systemState === 'hablando' ? '🔊 Hablando' : systemState === 'pensando' ? '⚙ Razonando' : 'Listo'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-sans text-slate-800 leading-snug font-normal">
                    {vectraSubtitle}
                  </p>
                  {lastResultText && lastResultText !== vectraSubtitle && !lastResultText.startsWith('Listo') && (
                    <p className="text-[11px] font-sans text-slate-600 mt-1 pt-1 border-t border-slate-200/60 leading-snug">
                      💡 <strong>Conclusión:</strong> {lastResultText}
                    </p>
                  )}
                </div>
              </div>

              {/* Botón de Replay Audio */}
              <button
                type="button"
                onClick={handleReplayTTS}
                className="shrink-0 p-2 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs"
                title="Repetir audio en voz alta"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Sugerencias Interactivas Clickables */}
            {suggestions && suggestions.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-3xl">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFX.playClick();
                      handleProcessQuestion(sug);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-sans font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black border border-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title={`Preguntar: "${sug}"`}
                  >
                    <Sparkles className="w-3 h-3 text-cyan-600 shrink-0" />
                    <span className="truncate max-w-[260px] sm:max-w-none">{cleanTextForDisplay(sug)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      ) : (
        /* ========================================================
           B) MODO PROCEDIMIENTO — Layout limpio en 3 zonas
           ======================================================== */
        <main className="flex-1 w-full h-full flex flex-col overflow-hidden" style={{ background: '#f1f5f9' }}>

          {/* ── TOPBAR ── controles + pestañas + sugerencias */}
          <div className="flex items-center gap-2.5 px-3 py-2 bg-white border-b border-slate-200 shrink-0 min-w-0">
            {/* Botón VOLVER */}
            <button
              onClick={handleReturnToFace}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-black active:scale-[0.97] text-white font-mono text-[11px] font-bold tracking-wider shadow-xs transition-all duration-150 cursor-pointer shrink-0"
              title="Volver a la cara (o di 'ya' / Escape)"
            >
              <ArrowLeft className="w-3 h-3" />
              VOLVER
            </button>

            {/* PESTAÑAS: Separación limpia entre Pizarrón de Pasos, Pizarrón de Resultado y Espacio 3D */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setWorkspaceView('board');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                  workspaceView === 'board'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Ver pizarrón de procedimiento matemático paso a paso"
              >
                <span>📋 Procedimiento</span>
                {procedureData?.pasos?.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    workspaceView === 'board' ? 'bg-emerald-900 text-emerald-100' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {activeStepIndex + 1}/{procedureData.pasos.length}
                  </span>
                )}
              </button>

              {procedureData?.resultado && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setWorkspaceView('result');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                    workspaceView === 'result'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title="Ver Pizarrón de Resultado Final"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-200" />
                  <span>🏆 Resultado</span>
                  {workspaceView === 'result' && (
                    <Sparkles className="w-2.5 h-2.5 text-amber-200 animate-pulse" />
                  )}
                </button>
              )}

              {visualizationData && visualizationData.tipo !== 'ninguna' && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setWorkspaceView('visualizer3d');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                    workspaceView === 'visualizer3d'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title="Ver representación visual en 3D interactivo"
                >
                  <Box className="w-3.5 h-3.5 text-cyan-200" />
                  <span>🌐 Espacio 3D</span>
                  {workspaceView !== 'visualizer3d' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping shrink-0" />
                  )}
                </button>
              )}
            </div>

            {/* Texto resultado: SOLO visible en el último paso o en vista 3D */}
            {((activeStepIndex >= (procedureData?.pasos?.length || 1) - 1) || workspaceView === 'visualizer3d') && procedureData?.resultado?.texto && (
              <span className="hidden xl:inline font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                ✓ {procedureData.resultado.texto}
              </span>
            )}

            {/* Sugerencias horizontales scrolleables */}
            {suggestions && suggestions.length > 0 && (
              <div
                className="flex items-center gap-1.5 overflow-x-auto flex-1 min-w-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0">Sugerencias:</span>
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { soundFX.playClick(); handleProcessQuestion(sug); }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-sans font-medium bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-800 border border-slate-200 hover:border-cyan-300 active:scale-[0.97] transition-all cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-cyan-500 shrink-0" />
                    <span>{cleanTextForDisplay(sug)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── CONTENIDO PRINCIPAL: cara izquierda | pizarrón o 3D a pantalla completa a la derecha ── */}
          <div className="flex-1 min-h-0 flex gap-2.5 p-2.5 overflow-hidden">

            {/* ── COLUMNA IZQUIERDA: CARA + DIÁLOGO ── */}
            <div className="w-[28%] min-w-[200px] max-w-[280px] shrink-0 flex flex-col gap-2 min-h-0">

              {/* Panel de la cara clásico */}
              <div className="flex-1 min-h-0 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-md flex items-center justify-center">
                <CartoonFace
                  state={systemState}
                  emotion={emotion}
                  viseme={viseme}
                  audioLevel={audioLevel}
                  isSpeaking={systemState === 'hablando'}
                />
              </div>

              {/* Tarjeta de diálogo de VECTRA */}
              <div className="shrink-0 rounded-2xl border border-slate-200 bg-white shadow-sm px-3 py-2.5 flex flex-col gap-1.5">
                {/* Header de la tarjeta */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                    <Bot className="w-3 h-3 text-cyan-500" />
                    VECTRA
                  </span>
                  <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                    systemState === 'hablando'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                      : systemState === 'pensando'
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {systemState === 'hablando' ? '🔊 Hablando'
                      : systemState === 'pensando' ? '⚙ Razonando'
                      : '● Listo'}
                  </span>
                </div>

                {/* Texto del subtítulo */}
                <p className="text-[11px] font-sans text-slate-700 leading-relaxed line-clamp-5">
                  {vectraSubtitle}
                </p>

                {/* Pregunta del usuario si existe */}
                {userSubtitle && (
                  <p className="text-[10px] font-sans text-slate-400 italic border-t border-slate-100 pt-1.5 line-clamp-2">
                    Tú: "{userSubtitle}"
                  </p>
                )}

                {/* Botón Repetir Audio */}
                <button
                  type="button"
                  onClick={handleReplayTTS}
                  className="self-start flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 text-[10px] font-mono border border-slate-200 transition-all cursor-pointer mt-0.5"
                  title="Repetir audio"
                >
                  <Volume2 className="w-3 h-3" />
                  Repetir
                </button>
              </div>
            </div>

            {/* ── COLUMNA DERECHA: PIZARRA O VISUALIZADOR 3D A PANTALLA COMPLETA (NUNCA JUNTOS/PEGADOS) ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden h-full">

              {workspaceView === 'board' ? (
                /* 1) Pizarrón de Pasos a altura completa, espacioso y sin recortes */
                <div className="flex-1 min-h-0 rounded-2xl overflow-hidden shadow-lg h-full flex flex-col">
                  <ProcedureBoard
                    procedureData={procedureData}
                    activeStepIndex={activeStepIndex}
                    onStepChange={(idx) => setActiveStepIndex(idx)}
                    onGoToResult={() => setWorkspaceView('result')}
                    onExplainEasier={() => handleProcessQuestion('Explícalo de forma más simple y con analogías cotidianas.')}
                    onExplainDetail={() => handleProcessQuestion('Explícalo con toda la rigurosidad matemática y formal.')}
                  />
                </div>
              ) : workspaceView === 'result' ? (
                /* 2) Pizarrón de Resultado Final Exclusivo de Honor */
                <div className="flex-1 min-h-0 rounded-2xl overflow-hidden shadow-lg h-full flex flex-col">
                  <ResultBoard
                    procedureData={procedureData}
                    visualizationData={visualizationData}
                    onGoBackToBoard={() => setWorkspaceView('board')}
                    onGoTo3D={() => setWorkspaceView('visualizer3d')}
                    onRepeatAudio={(customSpeech) => {
                      const textToSpeak = customSpeech || procedureData?.resultado?.explicacionHarvard || procedureData?.resultado?.texto;
                      if (textToSpeak) {
                        setVectraSubtitle(textToSpeak);
                        fetchTTS(textToSpeak)
                          .then(res => res?.audioUrl ? audioPlayer.playUrl(res.audioUrl) : audioPlayer.speakBrowser(textToSpeak))
                          .catch(() => audioPlayer.speakBrowser(textToSpeak));
                      }
                    }}
                  />
                </div>
              ) : (
                /* 3) Espacio 3D a altura completa con toda su interactividad */
                <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-950 shadow-lg h-full relative flex flex-col">
                  {visualizationData && visualizationData.tipo !== 'ninguna' ? (
                    <VectorScene
                      visualizationData={visualizationData}
                      theme={theme}
                      harvardLecture={procedureData?.resultado?.explicacionFacil || procedureData?.resultado?.explicacionHarvard || speechText}
                      onSpeakLecture={(customText) => {
                        const textToSpeak = customText || procedureData?.resultado?.explicacionFacil || procedureData?.resultado?.explicacionHarvard || procedureData?.resultado?.texto || speechText;
                        if (textToSpeak) {
                          setVectraSubtitle(textToSpeak);
                          fetchTTS(textToSpeak)
                            .then(res => res?.audioUrl ? audioPlayer.playUrl(res.audioUrl) : audioPlayer.speakBrowser(textToSpeak))
                            .catch(() => audioPlayer.speakBrowser(textToSpeak));
                        }
                      }}
                      onGoBackToResult={() => setWorkspaceView('result')}
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
                      <Box className="w-10 h-10 text-slate-600" />
                      <p className="font-mono text-sm text-slate-300">No hay datos geométricos tridimensionales para este cálculo.</p>
                      <button
                        type="button"
                        onClick={() => setWorkspaceView('board')}
                        className="px-4 py-1.5 rounded-full bg-emerald-700 text-white font-mono text-xs hover:bg-emerald-600 transition-all cursor-pointer mt-2"
                      >
                        Regresar al Pizarrón
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* 3. Barra Inferior de Control HUD (Siempre visible para hablar o escribir) */}
      <footer className="w-full px-4 py-3 bg-white/90 backdrop-blur-md border-t border-slate-200 shrink-0 z-30">
        <ControlBar
          isListening={isListening}
          onToggleMic={handleToggleMic}
          onSubmitText={handleProcessQuestion}
          state={systemState}
          audioLevel={micAudioLevel}
          micLabel={micLabel}
          availableMics={availableMics}
          onSwitchMic={handleSwitchMic}
          isWakeWordMode={isWakeWordMode}
          onToggleWakeWord={handleToggleWakeWord}
          wakeWordPulse={wakeWordPulse}
        />
      </footer>

      {/* Panel Oculto del Presentador (Tecla P) */}
      <PresenterPanel
        isOpen={showPresenter}
        onClose={() => setShowPresenter(false)}
        forcedProvider={forcedProvider}
        setForcedProvider={setForcedProvider}
        onLaunchQuestion={handleProcessQuestion}
        isMicMuted={isMicMuted}
        onToggleMicMute={handleToggleMicMute}
      />
    </div>
  );
}
