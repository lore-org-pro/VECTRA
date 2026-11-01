# Nova — IA web conectada a OpenAI

Proyecto inicial con interfaz web, servidor Node.js y conexión real a la API de OpenAI mediante la Responses API.

## Requisitos

- Node.js 20 o posterior.
- Una clave de API de OpenAI.
- Acceso a la API habilitado y facturación/crédito configurados según las condiciones de tu cuenta.

**ChatGPT Plus/Free y la API son servicios separados.** Una suscripción a ChatGPT no incluye automáticamente crédito de API.

## Instalación en Windows

1. Instala Node.js desde https://nodejs.org/ (versión LTS).
2. Descomprime el proyecto en una carpeta.
3. Abre esa carpeta en VS Code.
4. Abre una terminal en VS Code.
5. Instala las dependencias:

   ```bash
   npm install
   ```

6. Copia `.env.example` y renombra la copia a `.env`.
7. Abre `.env` y reemplaza `pega_aqui_tu_clave_secreta` por tu clave real. No pongas comillas ni compartas esa clave.
8. Si el modelo configurado no está disponible en tu proyecto de API, cambia `OPENAI_MODEL` por el identificador de un modelo al que sí tengas acceso.
9. Arranca la aplicación:

   ```bash
   npm start
   ```

10. Abre http://localhost:3000 en tu navegador.

## Conseguir y proteger la clave

Entra en la plataforma para desarrolladores de OpenAI: https://platform.openai.com/api-keys

Crea una clave para tu proyecto y guárdala únicamente en `.env`, que está excluido por `.gitignore`. Nunca la escribas en `public/app.js`, `index.html`, ni la compartas por chat o subas a GitHub. Si se expone, revócala y crea otra.

## Probar que el servidor está activo

Abre http://localhost:3000/api/health. Debería devolver JSON con `ok: true`. Si `configured` aparece como `false`, falta completar `.env`.

## Estructura

- `server.js`: servidor Express y endpoint `/api/chat`.
- `public/index.html`: interfaz.
- `public/styles.css`: estilos adaptable a móvil y PC.
- `public/app.js`: lógica del chat en el navegador.
- `.env.example`: plantilla de configuración sin secretos.

## Notas

- La conversación se mantiene en memoria del navegador mientras no se borre o recargue la página; todavía no se guarda en una base de datos.
- El endpoint tiene un límite básico de solicitudes, pero antes de publicar en internet hay que añadir autenticación, límites por usuario, control de gasto y monitorización.
- La aplicación requiere internet para llamar a OpenAI.
- La API puede cobrar por el uso. Configura límites de gasto y revisa el panel de uso.
- Este proyecto no es el modelo de OpenAI entrenado desde cero; es tu propia aplicación que se conecta de forma segura a un modelo disponible mediante la API.
