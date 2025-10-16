// =========================
// 🧠 Estado Inicial Global
// =========================
const INITIAL_STATE = {
  user: {
    nombre: "",
    rol: "",
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
// 💾 Manejo de Usuarios
// =========================
function obtenerUsuarios() {
  return JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
}

function guardarUsuarios(usuarios) {
  localStorage.setItem("usuariosRegistrados", JSON.stringify(usuarios));
}

// =========================
// 🔐 Registro
// =========================
function manejarRegistro(e) {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const rol = document.getElementById("rol").value;

  if (!nombre || !email || !password || !rol) {
    return alert("Completa todos los campos.");
  }

  const usuarios = obtenerUsuarios();
  if (usuarios.some(u => u.email === email)) {
    return alert("Ese correo ya está registrado.");
  }

  const nuevoUsuario = {
    nombre,
    email,
    password,
    rol,
    nivel: 1,
    puntos: 0,
    monedas: 250,
    horasTx: 0,
    regalosComprados: []
  };

  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);

  alert("✅ Registro exitoso. ¡Ya puedes iniciar sesión!");
  window.location.href = "index.html";
}

// =========================
// 🔑 Login
// =========================
function manejarLogin(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(u => u.email === email && u.password === password);

  if (!usuario) {
    alert("❌ Credenciales incorrectas o usuario no registrado.");
    return;
  }

  localStorage.setItem("usuarioActivo", JSON.stringify(usuario));
  alert(`Bienvenido ${usuario.nombre}`);

  // Redirigir según el rol
  if (usuario.rol === "streamer") {
    window.location.href = "dashboard-streamer.html";
  } else {
    window.location.href = "perfil-espectador.html";
  }
}

// =========================
// 🚪 Cerrar sesión
// =========================
function cerrarSesion() {
  localStorage.removeItem("usuarioActivo");
  window.location.href = "index.html";
}

// =========================
// 🧩 Verificación de acceso
// =========================
function protegerPagina(rolPermitido = null) {
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuarioActivo) {
    alert("Debes iniciar sesión para acceder al sistema.");
    window.location.href = "index.html";
    return;
  }

  if (rolPermitido && usuarioActivo.rol !== rolPermitido) {
    alert("Acceso denegado para tu rol.");
    window.location.href = "index.html";
    return;
  }

  // Mostrar nombre en la página (si existe el elemento)
  const nombreEl = document.getElementById("nombre-usuario");
  if (nombreEl) nombreEl.textContent = usuarioActivo.nombre;

  const monedasEl = document.getElementById("monedas");
  if (monedasEl) monedasEl.textContent = usuarioActivo.monedas;
}

// =========================
// 🚀 Inicialización
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", manejarLogin);

  const registerForm = document.getElementById("registerForm");
  if (registerForm) registerForm.addEventListener("submit", manejarRegistro);

  const logoutBtn = document.querySelector(".logout-button");
  if (logoutBtn) logoutBtn.addEventListener("click", cerrarSesion);
});
