// Script unificado para StreamBoost

// Estado inicial de la aplicación
const INITIAL_STATE = {
  user: {
    nombre: "Nicolás Arozena",
    rol: "streamer",
    monedas: 250,
    horasTx: 37.5
  }
};

// Obtener estado desde localStorage o inicializar
function getState() {
  const stored = localStorage.getItem('appState');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('appState', JSON.stringify(INITIAL_STATE));
  return INITIAL_STATE;
}

// Renderizar dashboard del streamer
function renderStreamer() {
  const streamerContainer = document.getElementById('ds-streamer');
  if (!streamerContainer) return;
  
  const state = getState();
  const horasElement = document.getElementById('horas-transmitidas');
  
  if (horasElement) {
    horasElement.textContent = state.user.horasTx;
  }
}

// Renderizar perfil del espectador
function renderEspectador() {
  const espectadorContainer = document.getElementById('pf-espectador');
  if (!espectadorContainer) return;
  
  const state = getState();
  const monedasElement = document.getElementById('monedas-badge');
  const nombreElement = document.getElementById('nombre-usuario');
  
  if (monedasElement) {
    monedasElement.textContent = `Monedas: ${state.user.monedas}`;
  }
  
  if (nombreElement) {
    nombreElement.textContent = state.user.nombre;
  }
}

// Función para manejar el login (mantener compatibilidad)
function manejarLogin(evento) {
  evento.preventDefault();
  
  var usuario = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  
  if (usuario === 'streamer' && password === 'streamer') {
    // Actualizar estado para streamer
    const state = getState();
    state.user.rol = 'streamer';
    localStorage.setItem('appState', JSON.stringify(state));
    
    alert('¡Bienvenido Streamer!');
    window.location.href = 'dashboard-streamer.html';
    return;
  }
  
  if (usuario === 'espectador' && password === 'espectador') {
    // Actualizar estado para espectador
    const state = getState();
    state.user.rol = 'espectador';
    localStorage.setItem('appState', JSON.stringify(state));
    
    alert('¡Bienvenido Espectador!');
    window.location.href = 'perfil-espectador.html';
    return;
  }
  
  alert('Credenciales incorrectas. Usa: streamer/streamer o espectador/espectador');
}

// Función para manejar el registro
function manejarRegistro(evento) {
  evento.preventDefault();
  alert('Registro exitoso, ya puedes iniciar sesión');
  window.location.href = 'index.html';
}

// Función para cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('appState');
  window.location.href = 'index.html';
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  // Renderizar dashboard del streamer si existe
  renderStreamer();
  
  // Renderizar perfil del espectador si existe
  renderEspectador();
  
  // Configurar formularios si existen
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', manejarLogin);
  }
  
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', manejarRegistro);
  }
});