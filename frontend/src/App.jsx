import React, { useState, useEffect, useRef, useCallback } from 'react';
import HeaderHUD from './components/hud/HeaderHUD';
import SubtitleBar from './components/hud/SubtitleBar';
import ControlBar from './components/hud/ControlBar';
import CartoonFace from './components/face/CartoonFace';
import ProcedureBoard from './components/board/ProcedureBoard';
import ResultBoard from './components/board/ResultBoard';
import { cleanTextForDisplay } from './utils/latexUtils';
import CartesianPlane2D from './components/visualizer2d/CartesianPlane2D';
import PresenterPanel from './components/presenter/PresenterPanel';
import { soundFX } from './utils/audioFX';
import { speechService } from './services/speechRecognition';
import { audioPlayer } from './services/audioPlayer';
import { askVectra, fetchTTS } from './services/api';
import { Mic, Sparkles, ArrowLeft, Sun, Moon, Volume2, Bot, Layers, Trophy, Compass } from 'lucide-react';

export default function App() {
  // 1. Estados de Pantalla: 'face' (solo la cara en fondo blanco) | 'workspace' (cara + procedimiento con dígitos)
  const [screenMode, setScreenMode] = useState(() => {
    try {
      return window.location.search.includes('pizarra') ? 'workspace' : 'face';
    } catch {
      return 'face';
    }
  });

  // Modo de vista en Workspace: 'board' (Pizarrón de pasos) | 'result' (Resultado de honor) | 'plane2d' (Plano Cartesiano 2D)
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
    'Tipos de vectores',
    '¿Qué es el plano cartesiano?',
    'Suma los vectores (1, -4) y (4, -3)',
    'Vectores opuestos',
    '¿Cuál es el último modelo de Google Gemini?'
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
        // Transición a la pantalla de trabajo
        setScreenMode('workspace');
        const isPlanoOrTipos = /tipos?\s*de\s*vectores?|plano\s*cartesiano|vectores?\s*opuestos?|vectores?\s*iguales?|vectores?\s*equipolentes?|vectores?\s*paralelos?/i.test(cleanedText);
        setWorkspaceView(isPlanoOrTipos ? 'plane2d' : 'board');
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

      // Comandos por voz para alternar entre pizarra y plano cartesiano en modo workspace
      const lowerVoice = text.toLowerCase().replace(/[.,?!]/g, '').trim();
      if (screenModeRef.current === 'workspace') {
        if (/^(?:ver 2d|plano cartesiano|el plano|ver plano|ver simulacion|simulacion 2d|plano|ver 3d|mostrar 3d|espacio 3d|grafico|ejemplo visual|ver visual|ver ejemplo visual)$/i.test(lowerVoice)) {
          setWorkspaceView('plane2d');
          soundFX.playConfirm();
          return;
        }
        if (/^(?:ver pizarra|mostrar pizarra|volver a la pizarra|la pizarra|ver pasos|ver matematicas|volver al procedimiento)$/i.test(lowerVoice)) {
          setWorkspaceView('board');
          soundFX.playConfirm();
          return;
        }
        if (/^(?:ver resultado|mostrar resultado|el resultado|resultado final)$/i.test(lowerVoice)) {
          setWorkspaceView('result');
          soundFX.playConfirm();
          return;
        }
      }

      // Procesar DIRECTAMENTE la pregunta hablada (sin requerir decir "vectra")
      // Limpiar prefijos de aula ("oye vectra", "por favor suma", "bro calcula", etc.)
      const cleanedVoice = text
        .replace(/^(?:hola\s+|oye\s+|buenas\s+|bro\s+|amigo\s+)?(?:vepra|vectra|bepra|bectra|vecta|betra|veptra)[\s,.:;¡!¿?]+/i, '')
        .replace(/^(?:por\s*favor\s+|puedes\s+|quiero\s+que\s+(?:me\s+)?(?:hagas|calcules|sumes|restes)\s+|haz\s+(?:la\s+)?(?:operacion|calculo)\s*(?:de)?\s*)+/i, '')
        .trim();
      const stripped = cleanedVoice || text;

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

  // Atajos de Teclado Globales: PTT EXCLUSIVO con la Barra Espaciadora
  // Se desactiva la activación por ratón para eliminar errores de colisión y foco
  const isSpacePressedRef = useRef(false);

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

        // Desenfocar inmediatamente cualquier botón para que el navegador no lo active con Space
        if (document.activeElement && document.activeElement !== document.body && document.activeElement.blur) {
          document.activeElement.blur();
        }

        if (isSpacePressedRef.current) return;
        isSpacePressedRef.current = true;

        if (!isMicMutedRef.current) {
          audioPlayer.stop();
          soundFX.playClick();
          setSystemState('escuchando');
          speechService.start().catch((err) => {
            console.warn('[App] No se pudo iniciar micrófono:', err);
            setSystemState('reposo');
            isSpacePressedRef.current = false;
          });
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isSpacePressedRef.current) return;
        isSpacePressedRef.current = false;
        setSystemState('pensando');
        speechService.stop();
      }
    };

    const handleWindowBlur = () => {
      if (isSpacePressedRef.current) {
        isSpacePressedRef.current = false;
        speechService.stop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [handleReturnToFace]);

  // Desbloqueo inicial silencioso con la primera interacción del usuario
  // Solo inicializa el subsistema de audio y sintetizador — SIN motores espía en segundo plano
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!isStarted) {
        setIsStarted(true);
        soundFX.init();
        audioPlayer.init();
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [isStarted]);

  // Click en el icono de micrófono del HUD: Guía al usuario a usar la Barra Espaciadora
  // para evitar fallos de colisión de mouse y foco en la feria
  const handleToggleMic = () => {
    soundFX.playClick();
    setVectraSubtitle('🎙️ Mantén presionada la Barra Espaciadora [ESPACIO] para hablar y suéltala al terminar.');
    setTimeout(() => {
      setVectraSubtitle((prev) => (prev.startsWith('🎙️ Mantén') ? '' : prev));
    }, 3500);
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
    <div className="vectra-app-container relative w-screen h-screen flex flex-col justify-between select-none overflow-hidden bg-[#060913] text-slate-100">
      {/* ── FONDOS AMBIENTALES CYBER-GLASSMORPHISM (ORBES DE LUZ CÓSMICA) ── */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[28rem] h-[28rem] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-emerald-600/10 blur-[130px] pointer-events-none" />

      {/* Aviso si el navegador rechazó el micrófono */}
      {braveMicNotice && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-amber-500/20 border border-amber-400/40 text-amber-200 px-4 py-2 rounded-full text-xs font-sans shadow-xl backdrop-blur-xl flex items-center gap-3">
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
            className="text-amber-200 hover:text-white font-bold text-xs cursor-pointer ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ÁREA PRINCIPAL: SOLAMENTE LA CARA CENTRADA O MODO PROCEDIMIENTO */}
      {screenMode === 'face' ? (
        /* ========================================================
           A) MODO SOLAMENTE LA CARA + HUD CONVERSACIONAL (CYBER-GLASS)
           ======================================================== */
        <main
          className="flex-1 w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 relative bg-transparent select-none overflow-hidden z-10"
          title="Mantén presionada la barra espaciadora [ESPACIO] para hablar"
        >
          {/* 1. Header superior discreto con pregunta del usuario o badge de estado */}
          <div className="w-full max-w-3xl flex flex-col items-center gap-1.5 z-10 shrink-0 pointer-events-auto">
            {userSubtitle ? (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-xl border border-white/15 shadow-xl">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-cyan-400">TÚ:</span>
                <span className="text-xs font-sans text-slate-200 font-medium italic truncate max-w-[280px] sm:max-w-[480px]">
                  &ldquo;{userSubtitle}&rdquo;
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 text-[10px] font-mono text-slate-300 shadow-sm">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span>VECTRA // Holographic AI System</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFX.playClick();
                    handleProcessQuestion('¿Qué has aprendido?');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-[10px] font-mono text-emerald-300 font-semibold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                  title="Ver memoria continua y aprendizajes acumulados"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
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
          <div className="w-full max-w-3xl flex flex-col items-center gap-2.5 z-20 shrink-0 pointer-events-auto pb-1">
            {/* Tarjeta de habla / respuesta de VECTRA */}
            <div className="w-full bg-slate-950/75 backdrop-blur-2xl border border-white/15 rounded-3xl px-5 py-3.5 shadow-2xl flex items-start justify-between gap-3 transition-all">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`mt-0.5 p-2 rounded-2xl shrink-0 ${
                  systemState === 'hablando' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 animate-pulse' :
                  systemState === 'pensando' ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30 animate-spin' :
                  'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                }`}>
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-400">
                      VECTRA
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.08] text-slate-300 border border-white/10">
                      {systemState === 'hablando' ? '🔊 Hablando' : systemState === 'pensando' ? '⚙ Razonando' : 'Listo'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-sans text-slate-100 leading-snug font-normal">
                    {vectraSubtitle}
                  </p>
                  {lastResultText && lastResultText !== vectraSubtitle && !lastResultText.startsWith('Listo') && (
                    <p className="text-[11px] font-sans text-emerald-300 mt-1.5 pt-1.5 border-t border-white/10 leading-snug">
                      💡 <strong>Conclusión:</strong> {lastResultText}
                    </p>
                  )}
                </div>
              </div>

              {/* Botón de Replay Audio */}
              <button
                type="button"
                onClick={handleReplayTTS}
                className="shrink-0 p-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] active:scale-95 text-slate-300 hover:text-white border border-white/15 transition-all cursor-pointer shadow-sm"
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
                    className="px-3.5 py-1.5 rounded-full text-xs font-sans font-medium bg-slate-900/70 hover:bg-cyan-950/70 text-slate-300 hover:text-cyan-200 border border-white/10 hover:border-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title={`Preguntar: "${sug}"`}
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate max-w-[260px] sm:max-w-none">{cleanTextForDisplay(sug)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      ) : (
        /* ========================================================
           B) MODO PROCEDIMIENTO — Layout Cyber-Glassmorphism
           ======================================================== */
        <main className="flex-1 w-full h-full flex flex-col overflow-hidden bg-transparent relative z-10">

          {/* ── TOPBAR ── controles + pestañas + sugerencias */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-950/75 backdrop-blur-2xl border-b border-white/10 shrink-0 min-w-0 shadow-lg">
            {/* Botón VOLVER */}
            <button
              onClick={handleReturnToFace}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-[0.97] text-white font-mono text-[11px] font-bold tracking-wider border border-white/15 shadow-sm transition-all duration-150 cursor-pointer shrink-0"
              title="Volver a la cara (o di 'ya' / Escape)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              VOLVER
            </button>

            {/* PESTAÑAS: Separación limpia entre Pizarrón de Pasos, Pizarrón de Resultado y Espacio 3D */}
            <div className="flex items-center bg-white/[0.05] p-1 rounded-full border border-white/10 shrink-0 gap-1">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setWorkspaceView('board');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                  workspaceView === 'board'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                }`}
                title="Ver pizarrón de procedimiento matemático paso a paso"
              >
                <span>📋 Procedimiento</span>
                {procedureData?.pasos?.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    workspaceView === 'board' ? 'bg-emerald-950 text-emerald-200 border border-emerald-400/30' : 'bg-white/10 text-slate-300'
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
                  className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                    workspaceView === 'result'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
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
                <>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setWorkspaceView('plane2d');
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                      workspaceView === 'plane2d'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                    }`}
                    title="Ver simulación interactiva en el Plano Cartesiano 2D"
                  >
                    <Compass className="w-3.5 h-3.5 text-cyan-200" />
                    <span>📐 Plano Cartesiano</span>
                    {workspaceView !== 'plane2d' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Texto resultado: SOLO visible en el último paso o en vista de plano cartesiano */}
            {((activeStepIndex >= (procedureData?.pasos?.length || 1) - 1) || workspaceView === 'plane2d') && procedureData?.resultado?.texto && (
              <span className="hidden xl:inline font-mono text-[10px] text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-3 py-1 rounded-full whitespace-nowrap shrink-0 shadow-sm">
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
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-sans font-medium bg-white/[0.06] hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-200 border border-white/10 hover:border-cyan-400/30 active:scale-[0.97] transition-all cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                    <span>{cleanTextForDisplay(sug)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── CONTENIDO PRINCIPAL: cara izquierda | pizarrón o simulador a pantalla completa a la derecha ── */}
          <div className="flex-1 min-h-0 flex gap-3 p-3 overflow-hidden">

            {/* ── COLUMNA IZQUIERDA: CARA + DIÁLOGO (DARK GLASSMORPHISM) ── */}
            <div className="w-[28%] min-w-[210px] max-w-[290px] shrink-0 flex flex-col gap-2.5 min-h-0">

              {/* Panel de la cara clásico */}
              <div className="flex-1 min-h-0 rounded-3xl overflow-hidden bg-slate-900/60 backdrop-blur-2xl border border-white/15 shadow-2xl flex items-center justify-center p-2">
                <CartoonFace
                  state={systemState}
                  emotion={emotion}
                  viseme={viseme}
                  audioLevel={audioLevel}
                  isSpeaking={systemState === 'hablando'}
                  dark={true}
                />
              </div>

              {/* Tarjeta de diálogo de VECTRA */}
              <div className="shrink-0 rounded-3xl border border-white/15 bg-slate-950/75 backdrop-blur-2xl shadow-2xl px-4 py-3 flex flex-col gap-2">
                {/* Header de la tarjeta */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    VECTRA
                  </span>
                  <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                    systemState === 'hablando'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 animate-pulse'
                      : systemState === 'pensando'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                      : 'bg-white/[0.08] text-slate-400 border-white/10'
                  }`}>
                    {systemState === 'hablando' ? '🔊 Hablando'
                      : systemState === 'pensando' ? '⚙ Razonando'
                      : '● Listo'}
                  </span>
                </div>

                {/* Texto del subtítulo */}
                <p className="text-xs font-sans text-slate-100 leading-relaxed line-clamp-5">
                  {vectraSubtitle}
                </p>

                {/* Pregunta del usuario si existe */}
                {userSubtitle && (
                  <p className="text-[10px] font-sans text-slate-400 italic border-t border-white/10 pt-1.5 line-clamp-2">
                    Tú: "{userSubtitle}"
                  </p>
                )}

                {/* Botón Repetir Audio */}
                <button
                  type="button"
                  onClick={handleReplayTTS}
                  className="self-start flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] active:scale-95 text-slate-300 hover:text-white text-[10px] font-mono border border-white/15 transition-all cursor-pointer mt-0.5"
                  title="Repetir audio"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Repetir
                </button>
              </div>
            </div>

            {/* ── COLUMNA DERECHA: PIZARRA O VISUALIZADOR A PANTALLA COMPLETA ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden h-full">

              {workspaceView === 'board' ? (
                /* 1) Pizarrón de Pasos a altura completa, espacioso y sin recortes */
                <div className="flex-1 min-h-0 rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col">
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
                <div className="flex-1 min-h-0 rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col">
                  <ResultBoard
                    procedureData={procedureData}
                    visualizationData={visualizationData}
                    onGoBackToBoard={() => setWorkspaceView('board')}
                    onGoToPlane2D={() => setWorkspaceView('plane2d')}
                    onRepeatAudio={(customSpeech) => {
                      const textToSpeak = customSpeech || procedureData?.resultado?.explicacionFacil || procedureData?.resultado?.explicacionHarvard || procedureData?.resultado?.texto;
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
                /* 3) SIMULADOR EN PLANO CARTESIANO 2D DE LA OPERACIÓN ACTUAL */
                <div className="flex-1 min-h-0 rounded-3xl overflow-hidden border border-white/15 bg-slate-950/80 backdrop-blur-2xl shadow-2xl h-full relative flex flex-col">
                  <CartesianPlane2D
                    visualizationData={visualizationData}
                    procedureData={procedureData}
                    onSpeakLecture={(customText) => {
                      const textToSpeak = customText || procedureData?.resultado?.explicacionFacil || procedureData?.resultado?.explicacionHarvard || procedureData?.resultado?.texto;
                      if (textToSpeak) {
                        setVectraSubtitle(textToSpeak);
                        fetchTTS(textToSpeak)
                          .then(res => res?.audioUrl ? audioPlayer.playUrl(res.audioUrl) : audioPlayer.speakBrowser(textToSpeak))
                          .catch(() => audioPlayer.speakBrowser(textToSpeak));
                      }
                    }}
                    onGoBackToResult={() => setWorkspaceView('result')}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* 3. Barra Inferior de Control HUD (Siempre visible para hablar o escribir) */}
      <footer className="w-full px-4 py-3 bg-slate-950/85 backdrop-blur-2xl border-t border-white/10 shrink-0 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <ControlBar
          isListening={isListening}
          onToggleMic={handleToggleMic}
          onSubmitText={handleProcessQuestion}
          state={systemState}
          audioLevel={micAudioLevel}
          micLabel={micLabel}
          availableMics={availableMics}
          onSwitchMic={handleSwitchMic}
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
