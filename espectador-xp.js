let xp = 0;
let nivel = 1;
let xpMax = 20;
let nivelAnterior = 1;
const xpBar = document.getElementById("xp-bar-grande");
const xpText = document.getElementById("xp-text-grande");
const nivelGrande = document.getElementById("nivel-grande");
const nombreUsuario = document.getElementById("nombre-usuario");
const monedas = document.getElementById("monedas");
const notificationModal = document.getElementById("notification-modal");
const notificationLevel = document.getElementById("notification-level");
function inicializar() {
  cargarDatosUsuario();
  configurarEventos();
  iniciarSistemaXP();
}

function cargarDatosUsuario() {
  try {
    const estado = localStorage.getItem('appState');
    if (estado) {
      const datos = JSON.parse(estado);
      if (datos.user) {
        nivel = datos.user.nivel || 1;
        xp = datos.user.puntos || 0;
        xpMax = calcularXPMaximo(nivel);
        actualizarUI();
        
        if (nombreUsuario) {
          nombreUsuario.textContent = datos.user.nombre || "Usuario";
        }
        
        if (monedas) {
          monedas.textContent = datos.user.monedas || 0;
        }
        
        nivelAnterior = nivel;
      }
    }
  } catch (error) {
    console.error('Error cargando datos del usuario:', error);
  }
}

function calcularXPMaximo(nivel) {
  return 20 * Math.pow(2, nivel - 1);
}

function configurarEventos() {
  const logoutButton = document.querySelector('.logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', cerrarSesion);
  }
}

function cerrarSesion() {
  localStorage.removeItem('appState');
  window.location.href = 'index.html';
}

function iniciarSistemaXP() {
  setInterval(aumentarXP, 2000);
}

function aumentarXP() {
  xp++;
  
  if (xp >= xpMax) {
    subirNivel();
  }
  
  actualizarUI();
  guardarProgreso();
}

function subirNivel() {
  nivelAnterior = nivel;
  nivel++;
  xp = 0;
  xpMax = calcularXPMaximo(nivel);
  mostrarNotificacionNivel();
  actualizarEstadoGlobal();
}

function mostrarNotificacionNivel() {
  if (notificationModal && notificationLevel) {
    notificationLevel.textContent = nivel;
    notificationModal.classList.add('show');
    reproducirSonidoCelebracion();
    setTimeout(() => {
      cerrarNotificacion();
    }, 5000);
  }
}

function reproducirSonidoCelebracion() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log('No se pudo reproducir sonido de celebración');
  }
}

function cerrarNotificacion() {
  if (notificationModal) {
    notificationModal.classList.remove('show');
  }
}

function closeNotification() {
  cerrarNotificacion();
}

function actualizarUI() {
  if (xpBar) {
    xpBar.style.width = `${(xp / xpMax) * 100}%`;
  }
  
  if (xpText) {
    xpText.textContent = `XP: ${xp} / ${xpMax}`;
  }
  
  if (nivelGrande) {
    nivelGrande.textContent = nivel;
  }
}

function guardarProgreso() {
  try {
    const estado = localStorage.getItem('appState');
    if (estado) {
      const datos = JSON.parse(estado);
      if (datos.user) {
        datos.user.nivel = nivel;
        datos.user.puntos = xp;
        localStorage.setItem('appState', JSON.stringify(datos));
      }
    }
  } catch (error) {
    console.error('Error guardando progreso:', error);
  }
}

function actualizarEstadoGlobal() {
  try {
    const estado = localStorage.getItem('appState');
    if (estado) {
      const datos = JSON.parse(estado);
      if (datos.user) {
        datos.user.nivel = nivel;
        datos.user.puntos = xp;
        localStorage.setItem('appState', JSON.stringify(datos));
        
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('streamboost');
          bc.postMessage({ 
            type: 'SPECTATOR_LEVEL_UP', 
            level: nivel,
            previousLevel: nivelAnterior
          });
        } else {
          localStorage.setItem('lastSpectatorLevelUp', JSON.stringify({
            type: 'SPECTATOR_LEVEL_UP',
            level: nivel,
            previousLevel: nivelAnterior
          }));
        }
      }
    }
  } catch (error) {
    console.error('Error actualizando estado global:', error);
  }
}

document.addEventListener('DOMContentLoaded', inicializar);