# LISTA DE COMPROBACIÓN PRE-VUELO // VECTRA (10 MINUTOS ANTES)

Realiza esta secuencia paso a paso antes de conectar la laptop al proyector frente al público.

---

### 1. Conexión y Pantalla
- [ ] Conectar la laptop al proyector mediante HDMI o DisplayPort.
- [ ] Configurar el modo de pantalla en Windows: **"Solo segunda pantalla"** o **"Duplicar"** a resolución nativa 1080p (1920x1080, proporción 16:9).
- [ ] Abrir el navegador en `http://localhost:5173` y presionar **F11** para entrar a pantalla completa.

### 2. Audio y Micrófono
- [ ] Conectar los parlantes o el sistema de sonido del auditorio y ajustar el volumen al 70%.
- [ ] Verificar que el micrófono seleccionado en el navegador sea el micrófono correcto (no el integrado si se usa un micrófono de solapa o de mano).
- [ ] Hacer clic en el botón inicial **"INICIALIZAR SISTEMA VECTRA"** para desbloquear el AudioContext.
- [ ] Hablar con el micrófono y comprobar que el anillo de la base del rostro 3D reacciona a las ondas vocales.

### 3. Diagnóstico de IA y Verificación Técnica
- [ ] Abrir una terminal y ejecutar:
  ```bash
  npm run test:math
  ```
  *(Debe mostrar 11/11 pruebas aprobadas en verde)*.
- [ ] Ejecutar el verificador de APIs:
  ```bash
  npm run check:providers
  ```
- [ ] Si vas a exponer sin internet garantizado:
  1. Asegúrate de tener Ollama corriendo: `ollama run qwen2.5:7b`.
  2. O mantén activo el **Modo Demo Offline** en el Panel de Presentador (tecla `P`).

### 4. Caché de Audio
- [ ] Si cuentas con clave de ElevenLabs, ejecuta antes de la exposición:
  ```bash
  npm run preheat:cache
  ```
  *(Esto almacena en disco los MP3 de las 15 preguntas de demo para que no consuman créditos ni requieran latencia en vivo)*.

### 5. Atajos Clave de Emergencia
- [ ] **Barra Espaciadora**: Mantener presionada para Push-to-Talk si hay eco en la sala.
- [ ] **Tecla `P`**: Abre el Panel de Control del Presentador para forzar proveedores o disparar preguntas con un clic.
- [ ] **Teclas `1`, `2`, `3`, `4`**: Alternan instantáneamente entre Rostro Grande, Pizarra Grande, 3D Grande y Vista Balanceada.
- [ ] **Campo de Texto Inferior**: Permite escribir directamente una pregunta si el micrófono presenta fallos de hardware.
