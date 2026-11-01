# VECTRA // Asistente Holográfico JARVIS para Álgebra Vectorial y Geometría Analítica

> **VECTRA** es una aplicación web interactiva de proyección en pantalla gigante que combina un **rostro holográfico animado en 3D (Three.js a 60 FPS)** con **sincronización labial en tiempo real**, una **pizarra analítica con fórmulas en KaTeX** y un **espacio tridimensional vectorial**, respaldado por un **Router de IA multi-proveedor con failover automático** y un **motor matemático verificador determinista**.

---

## 🚀 Características Principales

- **Rostro Holográfico 3D a 60 FPS**: Malla procedural con seguimiento ocular del cursor, parpadeo procedural, expresiones emocionales (*reposo, escuchando, pensando, hablando, error, feliz*) y visemas dinámicos para lip-sync en tiempo real.
- **Pizarra KaTeX de Alta Visibilidad**: Desglose analítico paso a paso con tipografía grande y controles interactivos (*anterior, siguiente, más fácil, más detalle*).
- **Espacio Vectorial 3D Interactivo**: Ejes cartesianos $X, Y, Z$, paralelogramos de suma, arcos angulares, proyecciones ortogonales y planos en el espacio.
- **Motor Matemático Verificador**: El LLM no es la fuente de verdad aritmética; el motor determinista verifica y corrige cada cálculo antes de proyectarlo.
- **Router Multi-Proveedor con Failover de 7 Niveles**: Groq ➔ Gemini ➔ OpenRouter ➔ Mistral ➔ NVIDIA NIM ➔ **Ollama Local (Offline)** ➔ **Modo Demo Offline**.
- **Cadena de Voz Resiliente**: ElevenLabs (Flash v2.5) con fallback transparente a la voz en español del navegador (`SpeechSynthesis`) y caché persistente de audio SHA-256.
- **Panel de Control del Presentador (Tecla P)**: Telemetría de latencias, cuotas en vivo, forzado de proveedores y disparador instantáneo de las 15 preguntas de demo.
- **Modo Quiz Interactivo**: Retos vectoriales en 3 dificultades con celebración de confeti.

---

## 📋 Requisitos Previos

- **Node.js**: Versión 18 o superior instalada ([Descargar Node.js](https://nodejs.org/)).
- **Navegador Web Moderno**: Chrome, Brave, Edge o Firefox (soporte para Web Audio API, Web Speech API y WebGL).
- *(Opcional para modo 100% offline)*: **Ollama** ([Descargar Ollama](https://ollama.com/)).

---

## 🛠️ Instalación Rápida

1. **Clonar o descargar el proyecto**:
   ```bash
   cd Jarvis
   ```

2. **Instalar dependencias del Backend y Frontend**:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

3. **Configurar Variables de Entorno (Opcional pero recomendado)**:
   Copia el archivo de plantilla `.env.example` como `.env`:
   ```bash
   cp .env.example .env
   ```
   *Nota: Si no colocas ninguna clave, VECTRA funcionará automáticamente en Modo Demo Offline o mediante Ollama local sin fallar jamás.*

---

## 🔑 Cómo Obtener Claves Gratuitas de IA y Voz

| Proveedor | Enlace Gratuito | Beneficios |
| :--- | :--- | :--- |
| **Groq Cloud** | [console.groq.com/keys](https://console.groq.com/keys) | Velocidad extrema (<600 ms) con Llama 3.3 70B. |
| **Google Gemini** | [aistudio.google.com](https://aistudio.google.com/) | Cuota gratuita amplia para Gemini 2.0 Flash. |
| **OpenRouter** | [openrouter.ai/keys](https://openrouter.ai/keys) | Acceso a modelos con sufijo `:free`. |
| **Mistral AI** | [console.mistral.ai](https://console.mistral.ai/) | Alta capacidad en idioma español. |
| **NVIDIA NIM** | [build.nvidia.com](https://build.nvidia.com/) | 1000 créditos de inferencia rápida gratuitos. |
| **ElevenLabs** | [elevenlabs.io](https://elevenlabs.io/) | Voz hiperrealista con modelo `eleven_flash_v2_5`. |

### Cómo Configurar Ollama Local (100% Offline)
Si no deseas depender de internet en el salón de clases o auditorio:
1. Instala Ollama desde [ollama.com](https://ollama.com).
2. Descarga un modelo de matemáticas o lenguaje:
   ```bash
   ollama run qwen2.5:7b
   # O alternativamente:
   ollama run llama3.1
   ```
3. VECTRA se conectará automáticamente a `http://localhost:11434`.

---

## ▶️ Ejecución del Proyecto

1. **Iniciar todo el sistema (Frontend en puerto 5173 y Backend en puerto 3001)**:
   ```bash
   npm run dev
   ```
2. **Abrir en el navegador**:
   Visita **`http://localhost:5173`**.
3. **Inicializar VECTRA**:
   Haz clic en el botón central **"INICIALIZAR SISTEMA VECTRA"** para desbloquear el audio y el micrófono.

---

## 🧪 Scripts de Diagnóstico y Pruebas

- **Comprobar el Motor Matemático Determinista**:
  ```bash
  npm run test:math
  ```
- **Verificar el Estado de Conexión de todos los Proveedores de IA**:
  ```bash
  npm run check:providers
  ```
- **Precalentar y Cachear los Audios de las 15 Preguntas de Demostración**:
  ```bash
  npm run preheat:cache
  ```

---

## 🎮 Atajos de Teclado en Vivo

- **`Espacio` (Mantener presionado)**: Modo Push-to-Talk para hablar con el micrófono eliminando ruidos de sala.
- **`1`**: Layout con Rostro Holográfico Grande (50% pantalla).
- **`2`**: Layout con Pizarra Analítica Grande (56% pantalla).
- **`3`**: Layout con Espacio Tridimensional Grande (56% pantalla).
- **`4`**: Layout Balanceado por defecto.
- **`P`**: Abre o cierra el **Panel de Control del Presentador** (telemetría de latencias, disparador de preguntas de demo, forzado de IA).
- **`F11`**: Pantalla completa sin bordes ni barras del navegador.

---

## 📺 Recomendaciones para Proyector en Vivo

1. **Resolución**: Configura la salida HDMI a 1080p (1920x1080, formato 16:9).
2. **Selector de Tema**: Usa el tema **Cian** o **Ámbar** en auditorios iluminados para obtener máximo contraste.
3. **Consumo de Datos y Privacidad**: Las capas gratuitas de APIs externas pueden usar datos para entrenamiento; no envíes información privada de los estudiantes.
4. **Respaldo sin Internet**: Ten siempre abierto el Panel de Presentador (`P`) para disparar preguntas con un solo clic si el salón presenta problemas de red o acústica.

---

*Desarrollado con arquitectura de misión crítica para garantizar cero fallos en vivo.*
