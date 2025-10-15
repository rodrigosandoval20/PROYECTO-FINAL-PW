// Script unificado para StreamBoost

// Estado inicial de la aplicación
const INITIAL_STATE = {
  user: { 
    nombre: "espectador", 
    rol: "espectador", 
    nivel: 1, 
    puntos: 0, 
    monedas: 250, 
    horasTx: 0 
  },
  niveles: { 
    horasRequeridas: [0,5,15,35,60,100], 
    puntosRequeridos: [0,50,120,250,500] 
  },
  txSession: null // { startedAt, accHoursBefore, lastHeartbeat }
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

// Guardar estado en localStorage
function setState(state) {
  localStorage.setItem('appState', JSON.stringify(state));
  return state;
}

// Variables globales para heartbeat
let heartbeatInterval = null;
let broadcastChannel = null;

// Canal de comunicación entre pestañas
function initBroadcastChannel() {
  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel('streamboost');
  }
}

// Notificar a espectadores sobre subida de nivel
function notifySpectatorsLevelUp(level) {
  const payload = { type: "LEVEL_UP", level };
  
  if (broadcastChannel) {
    broadcastChannel.postMessage(payload);
  } else {
    // Fallback usando localStorage
    localStorage.setItem('lastLevelUp', JSON.stringify(payload));
  }
}

// Calcular progreso de horas hacia el siguiente nivel
function progresoHoras(user, niveles) {
  const horasActuales = user.horasTx;
  const reqHoras = niveles.horasRequeridas;
  
  // Encontrar el nivel actual basado en horas
  let nivelActual = 1;
  for (let i = reqHoras.length - 1; i >= 0; i--) {
    if (horasActuales >= reqHoras[i]) {
      nivelActual = i + 1;
      break;
    }
  }
  
  // Si ya está en el nivel máximo
  if (nivelActual >= reqHoras.length) {
    return { lvl: nivelActual, faltan: 0, pct: 100 };
  }
  
  const horasRequeridas = reqHoras[nivelActual];
  const horasActualesEnNivel = horasActuales - reqHoras[nivelActual - 1];
  const horasNecesariasEnNivel = horasRequeridas - reqHoras[nivelActual - 1];
  
  const faltan = horasRequeridas - horasActuales;
  const pct = Math.min(100, (horasActualesEnNivel / horasNecesariasEnNivel) * 100);
  
  return { lvl: nivelActual, faltan: Math.max(0, faltan), pct };
}

// Liquidar horas transcurridas
function settleElapsedHours() {
  const state = getState();
  
  if (state.txSession) {
    const now = Date.now();
    const elapsedMs = now - state.txSession.startedAt;
    const elapsedHours = elapsedMs / (1000 * 60 * 60); // Convertir a horas
    const totalHours = state.txSession.accHoursBefore + elapsedHours;
    
    state.user.horasTx = Math.round(totalHours * 100) / 100; // 2-3 decimales
    setState(state);
  }
  
  return state;
}

// Iniciar transmisión
function startTransmission() {
  const state = getState();
  
  if (state.txSession) {
    alert('Ya hay una transmisión en curso');
    return;
  }
  
  state.txSession = {
    startedAt: Date.now(),
    accHoursBefore: state.user.horasTx,
    lastHeartbeat: Date.now()
  };
  
  setState(state);
  setRTMPStatus(true);
  startHeartbeat();
  renderStreamer();
  
  alert('Transmisión iniciada');
}

// Finalizar transmisión
function stopTransmission() {
  const state = getState();
  
  if (!state.txSession) {
    alert('No hay transmisión en curso');
    return;
  }
  
  // Liquidar horas
  settleElapsedHours();
  
  // Verificar si subió de nivel
  const oldLevel = state.user.nivel;
  const progreso = progresoHoras(state.user, state.niveles);
  
  if (progreso.lvl > oldLevel) {
    state.user.nivel = progreso.lvl;
    setState(state);
    alert(`🎉 ¡Subiste al nivel ${progreso.lvl}!`);
    notifySpectatorsLevelUp(progreso.lvl);
  }
  
  // Limpiar sesión
  state.txSession = null;
  setState(state);
  
  setRTMPStatus(false);
  stopHeartbeat();
  renderStreamer();
  
  alert('Transmisión finalizada');
}

// Configurar estado RTMP
function setRTMPStatus(connected) {
  const statusElement = document.getElementById('rtmp-status');
  if (statusElement) {
    statusElement.textContent = connected ? 'RTMP: conectado' : 'RTMP: desconectado';
    statusElement.className = connected ? 'rtmp-connected' : 'rtmp-disconnected';
  }
}

// Iniciar heartbeat
function startHeartbeat() {
  if (heartbeatInterval) return;
  
  heartbeatInterval = setInterval(() => {
    const state = getState();
    if (state.txSession) {
      state.txSession.lastHeartbeat = Date.now();
      setState(state);
      renderStreamer(); // Actualizar UI
    }
  }, 5000); // Cada 5 segundos
}

// Detener heartbeat
function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

// Renderizar dashboard del streamer
function renderStreamer() {
  const state = settleElapsedHours(); // Siempre liquidar primero
  const streamerContainer = document.getElementById('ds-streamer');
  if (!streamerContainer) return;
  
  // Actualizar horas transmitidas
  const horasElement = document.getElementById('horas-transmitidas');
  if (horasElement) {
    horasElement.textContent = state.user.horasTx;
  }
  
  // Actualizar botones
  const btnStart = document.getElementById('btnStart');
  const btnStop = document.getElementById('btnStop');
  
  if (btnStart && btnStop) {
    const hasSession = !!state.txSession;
    btnStart.disabled = hasSession;
    btnStop.disabled = !hasSession;
  }
  
  // Actualizar barra de progreso
  const progreso = progresoHoras(state.user, state.niveles);
  const progressBar = document.getElementById('hoursProgress');
  const hoursToNext = document.getElementById('hoursToNext');
  
  if (progressBar) {
    progressBar.style.width = `${progreso.pct}%`;
  }
  
  if (hoursToNext) {
    if (progreso.faltan > 0) {
      hoursToNext.textContent = `Faltan ${progreso.faltan.toFixed(1)} h para el nivel ${progreso.lvl + 1}`;
    } else {
      hoursToNext.textContent = `¡Nivel máximo alcanzado!`;
    }
  }
  
  // Actualizar estado RTMP
  setRTMPStatus(!!state.txSession);
}

// Renderizar perfil del espectador
function renderEspectador() {
  const state = getState();
  const espectadorContainer = document.getElementById('pf-espectador');
  if (!espectadorContainer) return;
  
  // Actualizar saludo con nombre del usuario
  const saludoElement = document.getElementById('saludo-usuario');
  if (saludoElement) {
    saludoElement.textContent = `Hola, ${state.user.nombre}`;
  }
  
  // Actualizar rol
  const rolElement = document.getElementById('rol-usuario');
  if (rolElement) {
    rolElement.textContent = state.user.rol;
  }
  
  // Actualizar monedas
  const monedasElement = document.getElementById('monedas');
  if (monedasElement) {
    monedasElement.textContent = state.user.monedas;
  }
}

// Función para manejar el login
function manejarLogin(evento) {
  evento.preventDefault();
  
  const email = document.getElementById('email').value.toLowerCase();
  const password = document.getElementById('password').value;
  
  let user;
  
  // Determinar rol y nombre basado en email
  if (email.includes('streamer')) {
    user = { 
      nombre: "streamer", 
      rol: "streamer", 
      nivel: 1, 
      puntos: 0, 
      monedas: 250, 
      horasTx: 0 
    };
  } else {
    user = { 
      nombre: "espectador", 
      rol: "espectador", 
      nivel: 1, 
      puntos: 0, 
      monedas: 250, 
      horasTx: 0 
    };
  }
  
  // Actualizar estado
  const state = getState();
  state.user = user;
  setState(state);
  
  // Redirigir según rol
  if (user.rol === 'streamer') {
    alert('¡Bienvenido Streamer!');
    window.location.href = 'dashboard-streamer.html';
  } else {
    alert('¡Bienvenido Espectador!');
    window.location.href = 'perfil-espectador.html';
  }
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

// Configurar notificaciones para espectadores
function setupSpectatorNotifications() {
  const state = getState();
  
  // Solo configurar si es espectador
  if (state.user.rol !== 'espectador') return;
  
  // Usar BroadcastChannel si está disponible
  if (typeof BroadcastChannel !== 'undefined') {
    const bc = new BroadcastChannel('streamboost');
    bc.onmessage = function(event) {
      if (event.data.type === 'LEVEL_UP') {
        alert(`🎉 ¡El streamer subió al nivel ${event.data.level}!`);
      }
    };
  } else {
    // Fallback usando localStorage
    window.addEventListener('storage', function(event) {
      if (event.key === 'lastLevelUp') {
        try {
          const data = JSON.parse(event.newValue);
          if (data && data.type === 'LEVEL_UP') {
            alert(`🎉 ¡El streamer subió al nivel ${data.level}!`);
          }
        } catch (e) {
          console.error('Error parsing level up notification:', e);
        }
      }
    });
  }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar canal de comunicación
  initBroadcastChannel();
  
  // Renderizar dashboard del streamer si existe
  renderStreamer();
  
  // Renderizar perfil del espectador si existe
  renderEspectador();
  
  // Configurar notificaciones para espectadores
  setupSpectatorNotifications();
  
  // Configurar formularios si existen
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', manejarLogin);
  }
  
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', manejarRegistro);
  }
  
  // Configurar eventos de conexión/desconexión
  window.addEventListener('online', function() {
    const state = getState();
    if (state.txSession) {
      setRTMPStatus(true);
    }
  });
  
  window.addEventListener('offline', function() {
    setRTMPStatus(false);
  });
  
  // Recuperar sesión si existe (tolerancia a fallos)
  const state = getState();
  if (state.txSession) {
    // Verificar si la sesión no es muy antigua (más de 24 horas)
    const sessionAge = Date.now() - state.txSession.startedAt;
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    if (sessionAge < maxAge) {
      startHeartbeat();
      setRTMPStatus(true);
    } else {
      // Sesión muy antigua, limpiar
      state.txSession = null;
      setState(state);
    }
  }
});