import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "40kb" }));
app.use("/api/", rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Has enviado muchas solicitudes. Espera un minuto e inténtalo otra vez." }
}));

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, configured: Boolean(process.env.OPENAI_API_KEY) });
});

app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "pega_aqui_tu_clave_secreta") {
    return res.status(503).json({
      error: "Falta configurar OPENAI_API_KEY en el archivo .env del servidor."
    });
  }

  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
    return res.status(400).json({ error: "Envía una conversación válida de hasta 30 mensajes." });
  }

  const safeMessages = [];
  for (const item of messages) {
    if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string") {
      return res.status(400).json({ error: "Formato de mensaje inválido." });
    }
    const content = item.content.trim();
    if (content.length > 8000) {
      return res.status(400).json({ error: "Cada mensaje debe tener como máximo 8,000 caracteres." });
    }
    if (content) safeMessages.push({ role: item.role, content });
  }

  if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
    return res.status(400).json({ error: "El último mensaje debe ser del usuario." });
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions: "Te llamas Nova. Eres una asistente útil, clara y amable. Responde en el idioma del usuario. Explica los temas paso a paso cuando sea útil. Si no sabes algo, dilo con honestidad.",
      input: safeMessages
    });
    res.json({ reply: response.output_text || "No pude generar una respuesta esta vez." });
  } catch (error) {
    console.error("OpenAI API error:", error?.status || "", error?.message || "Error desconocido");
    if (error?.status === 401) {
      return res.status(502).json({ error: "La API rechazó la clave. Revisa OPENAI_API_KEY en tu archivo .env." });
    }
    if (error?.status === 429) {
      return res.status(429).json({ error: "La API alcanzó un límite o no tiene crédito disponible. Revisa el uso y la facturación de tu cuenta de API." });
    }
    res.status(502).json({ error: "No se pudo conectar con el motor de IA. Revisa tu conexión, el nombre del modelo y la configuración de la API." });
  }
});

app.listen(port, () => {
  console.log(`Nova está lista en http://localhost:${port}`);
});