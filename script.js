// =========================
// 🧠 Estado Inicial Global
// =========================
const INITIAL_STATE = {
  user: {
    nombre: "espectador",
    rol: "espectador",
    nivel: 1,
    puntos: 0,
    monedas: 250,
    horasTx: 0,
    regalosComprados: []
  },
  streamer: {
    regalosRecibidos: [],
    totalPuntosRecibidos: 0
  },
  niveles: {
    horasRequeridas: [0, 5, 15, 35, 60, 100],
    puntosRequeridos: [0, 50, 120, 250, 500]
  },
  txSession: null,
  regalos: [
    { id: 1, nombre: "Corazón", icono: "❤️", costo: 10, puntos: 5 },
    { id: 2, nombre: "Estrella", icono: "⭐", costo: 25, puntos: 12 },
    { id: 3, nombre: "Fuego", icono: "🔥", costo: 50, puntos: 25 },
    { id: 4, nombre: "Rayo", icono: "⚡", costo: 100, puntos: 50 },
    { id: 5, nombre: "Diamante", icono: "💎", costo: 200, puntos: 100 },
    { id: 6, nombre: "Corona", icono: "👑", costo: 500, puntos: 250 },
    { id: 7, nombre: "Rocket", icono: "🚀", costo: 1000, puntos: 500 },
    { id: 8, nombre: "Trophy", icono: "🏆", costo: 2000, puntos: 1000 }
  ]
};

// =========================
// 💾 Manejo de Estado
// =========================
function getState() {
  const stored = localStorage.getItem("appState");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Asegurar estructura mínima
      parsed.user ||= INITIAL_STATE.user;
      parsed.streamer ||= INITIAL_STATE.streamer;
      parsed.niveles ||= INITIAL_STATE.niveles;
      parsed.regalos ||= INITIAL_STATE.regalos;
      return parsed;
    } catch {
      localStorage.removeItem("appState");
    }
  }
  localStorage.setItem("appState", JSON.stringify(INITIAL_STATE));
  return INITIAL_STATE;
}

function setState(state) {
  localStorage.setItem("appState", JSON.stringify(state));
  return state;
}

// =========================
// 🔊 Comunicación entre pestañas
// =========================
let broadcastChannel = null;
function initBroadcastChannel() {
  if (typeof BroadcastChannel !== "undefined") {
    broadcastChannel = new BroadcastChannel("streamboost");
  }
}

function notifySpectatorsLevelUp(level) {
  const payload = { type: "LEVEL_UP", level };
  broadcastChannel
    ? broadcastChannel.postMessage(payload)
    : localStorage.setItem("lastLevelUp", JSON.stringify(payload));
}

// =========================
// 📊 Renderizadores
// =========================
function renderStreamer() {
  const state = getState();
  const horasEl = document.getElementById("horas-transmitidas");
  if (horasEl) horasEl.textContent = state.user.horasTx;

  const progress = progresoHoras(state.user, state.niveles);
  const bar = document.getElementById("hoursProgress");
  if (bar) bar.style.width = `${progress.pct}%`;
}

function renderEspectador() {
  const state = getState();
  const nombreEl = document.getElementById("nombre-usuario");
  const monedasEl = document.getElementById("monedas");
  if (nombreEl) nombreEl.textContent = state.user.nombre;
  if (monedasEl) monedasEl.textContent = state.user.monedas;
}

// =========================
// 💬 Notificaciones
// =========================
function showNotification(title, message) {
  const modal = document.getElementById("notification-modal");
  const titleEl = document.getElementById("notification-title");
  const msgEl = document.getElementById("notification-message");
  const closeBtn = document.getElementById("notification-close");

  if (!modal || !titleEl || !msgEl) return;
  titleEl.textContent = title;
  msgEl.textContent = message;
  modal.classList.add("show");

  closeBtn.onclick = () => modal.classList.remove("show");
  modal.onclick = e => e.target === modal && modal.classList.remove("show");
  document.onkeydown = e => e.key === "Escape" && modal.classList.remove("show");
}

// =========================
// 🔐 Login y Registro
// =========================
function manejarLogin(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.toLowerCase();
  const pass = document.getElementById("password").value;

  let user;
  const reg = JSON.parse(localStorage.getItem("usuarioRegistrado") || "null");

  if (reg && reg.email.toLowerCase() === email) user = reg;
  else if (email.includes("streamer"))
    user = { ...INITIAL_STATE.user, rol: "streamer", nombre: "Streamer" };
  else
    user = { ...INITIAL_STATE.user, rol: "espectador", nombre: "Espectador" };

  const state = getState();
  state.user = user;
  setState(state);

  showNotification("Bienvenido", `Hola ${user.nombre}`);
  setTimeout(() => {
    window.location.href =
      user.rol === "streamer"
        ? "dashboard-streamer.html"
        : "perfil-espectador.html";
  }, 1000);
}

function manejarRegistro(e) {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const rol = document.getElementById("rol").value;

  if (!nombre || !email || !password || !rol)
    return alert("Completa todos los campos.");

  const nuevo = {
    nombre,
    email,
    rol,
    nivel: 1,
    puntos: 0,
    monedas: 250,
    horasTx: 0,
    regalosComprados: []
  };

  localStorage.setItem("usuarioRegistrado", JSON.stringify(nuevo));
  showNotification("Registro exitoso", "¡Ya puedes iniciar sesión!");
  setTimeout(() => (window.location.href = "index.html"), 1500);
}

function cerrarSesion() {
  localStorage.removeItem("appState");
  window.location.href = "index.html";
}

// =========================
// ⚙️ Utilidades
// =========================
function progresoHoras(user, niveles) {
  const horas = user.horasTx;
  const req = niveles.horasRequeridas;
  let nivel = req.findIndex((h, i) => horas < req[i + 1]) + 1;
  if (!nivel) nivel = req.length;
  const prev = req[nivel - 2] || 0;
  const next = req[nivel - 1] || horas;
  const pct = ((horas - prev) / (next - prev)) * 100;
  return { lvl: nivel, pct: Math.min(pct, 100) };
}

// =========================
// 🚀 Inicialización
// =========================
document.addEventListener("DOMContentLoaded", () => {
  initBroadcastChannel();
  renderStreamer();
  renderEspectador();

  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", manejarLogin);

  const registerForm = document.getElementById("registerForm");
  if (registerForm) registerForm.addEventListener("submit", manejarRegistro);
});
