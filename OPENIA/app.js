const form = document.querySelector("#chat-form");
const promptInput = document.querySelector("#prompt");
const sendButton = document.querySelector("#send-button");
const messagesEl = document.querySelector("#messages");
const welcome = document.querySelector("#welcome");
const statusText = document.querySelector("#connection-status");
const statusDot = document.querySelector(".status-dot");
const history = [];
let busy = false;

function setStatus(text, online) {
  statusText.textContent = text;
  statusDot.classList.toggle("online", Boolean(online));
}

async function checkHealth() {
  try {
    const r = await fetch("/api/health");
    const data = await r.json();
    if (data.configured) setStatus("Motor configurado", true);
    else setStatus("Falta configurar la API", false);
  } catch {
    setStatus("Servidor desconectado", false);
  }
}

function addMessage(role, content) {
  welcome.hidden = true;
  const item = document.createElement("article");
  item.className = `message ${role}`;
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = role === "assistant" ? "✳" : "T";
  const body = document.createElement("div");
  body.className = "message-body";
  const label = document.createElement("div");
  label.className = "message-role";
  label.textContent = role === "assistant" ? "Nova" : "Tú";
  const text = document.createElement("div");
  text.className = "message-text";
  // textContent avoids interpreting model output as HTML.
  text.textContent = content;
  body.append(label, text);
  item.append(avatar, body);
  messagesEl.append(item);
  scrollToBottom();
  return item;
}

function addTyping() {
  welcome.hidden = true;
  const item = document.createElement("article");
  item.className = "message assistant";
  item.id = "typing-indicator";
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = "✳";
  const body = document.createElement("div");
  body.className = "message-body";
  const label = document.createElement("div");
  label.className = "message-role";
  label.textContent = "Nova está pensando";
  const typing = document.createElement("div");
  typing.className = "typing";
  typing.innerHTML = "<i></i><i></i><i></i>";
  body.append(label, typing);
  item.append(avatar, body);
  messagesEl.append(item);
  scrollToBottom();
  return item;
}

function scrollToBottom() {
  const container = document.querySelector("#conversation");
  container.scrollTop = container.scrollHeight;
}

async function sendMessage(rawText) {
  const content = rawText.trim();
  if (!content || busy) return;
  busy = true;
  sendButton.disabled = true;
  promptInput.disabled = true;
  history.push({ role: "user", content });
  addMessage("user", content);
  promptInput.value = "";
  promptInput.style.height = "auto";
  const typing = addTyping();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-30) })
    });
    const data = await response.json();
    typing.remove();
    if (!response.ok) throw new Error(data.error || "La solicitud no se pudo completar.");
    history.push({ role: "assistant", content: data.reply });
    addMessage("assistant", data.reply);
  } catch (error) {
    typing.remove();
    const message = error.message || "No pude conectar con el servidor.";
    addMessage("assistant", `No pude responder: ${message}`);
    // Remove the unanswered user turn from API history so the next turn is valid.
    history.pop();
  } finally {
    busy = false;
    sendButton.disabled = false;
    promptInput.disabled = false;
    promptInput.focus();
    checkHealth();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(promptInput.value);
});
promptInput.addEventListener("input", () => {
  promptInput.style.height = "auto";
  promptInput.style.height = `${Math.min(promptInput.scrollHeight, 160)}px`;
});
promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});
document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => sendMessage(button.dataset.prompt));
});
function resetChat() {
  if (busy) return;
  history.length = 0;
  messagesEl.replaceChildren();
  welcome.hidden = false;
  promptInput.focus();
}
document.querySelector("#new-chat").addEventListener("click", resetChat);
document.querySelector("#clear-chat").addEventListener("click", resetChat);
document.querySelector("#mobile-menu").addEventListener("click", () => {
  document.querySelector("#sidebar").classList.toggle("open");
});
document.querySelector(".main").addEventListener("click", (event) => {
  if (event.target.closest(".mobile-menu")) return;
  if (window.innerWidth <= 760) document.querySelector("#sidebar").classList.remove("open");
});
checkHealth();