const INITIAL_STATE = {
  user: { 
    nombre: "espectador", 
    rol: "espectador", 
    nivel: 1, 
    puntos: 0, 
    monedas: 250, 
    horasTx: 0,
    regalosComprados: [] // Array de IDs de regalos comprados
  },
  niveles: { 
    horasRequeridas: [0,5,15,35,60,100], 
    puntosRequeridos: [0,50,120,250,500] 
  },
  txSession: null, // { startedAt, accHoursBefore, lastHeartbeat }
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

function getState() {
  const stored = localStorage.getItem('appState');
  if (stored) {
    const parsedState = JSON.parse(stored);
    if (!parsedState.user.regalosComprados) {
      parsedState.user.regalosComprados = [];
    }
    if (!parsedState.regalos) {
      parsedState.regalos = INITIAL_STATE.regalos;
    }
    setState(parsedState);
    return parsedState;
  }
  localStorage.setItem('appState', JSON.stringify(INITIAL_STATE));
  return INITIAL_STATE;
}

function setState(state) {
  localStorage.setItem('appState', JSON.stringify(state));
  return state;
}

let heartbeatInterval = null;
let broadcastChannel = null;

function initBroadcastChannel() {
  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel('streamboost');
  }
}

function notifySpectatorsLevelUp(level) {
  const payload = { type: "LEVEL_UP", level };
  
  if (broadcastChannel) {
    broadcastChannel.postMessage(payload);
  } else {
    // Fallback usando localStorage
    localStorage.setItem('lastLevelUp', JSON.stringify(payload));
  }
}

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

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

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

function renderEspectador() {
  const state = getState();
  const espectadorContainer = document.getElementById('container-general') || document.querySelector('.container-general');
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
  
  // Actualizar nivel del usuario
  const userLevelElement = document.getElementById('user-level');
  if (userLevelElement) {
    userLevelElement.textContent = state.user.nivel;
  }
  
  // Actualizar puntos del usuario
  const userPointsElement = document.getElementById('user-points');
  if (userPointsElement) {
    userPointsElement.textContent = state.user.puntos;
  }
  
  // Renderizar regalos comprados
  renderPurchasedGifts();
}

// Renderizar lista de regalos (para la tienda)
function renderGiftsList() {
  const state = getState();
  const giftsListElement = document.getElementById('gifts-list');
  if (!giftsListElement) return;
  
  giftsListElement.innerHTML = '';
  
  state.regalos.forEach(regalo => {
    const giftCard = document.createElement('div');
    giftCard.className = 'gift-card';
    
    const canAfford = state.user.monedas >= regalo.costo;
    
    giftCard.innerHTML = `
      <span class="gift-icon">${regalo.icono}</span>
      <div class="gift-name">${regalo.nombre}</div>
      <div class="gift-cost">💰 ${regalo.costo} monedas</div>
      <div class="gift-points">+${regalo.puntos} puntos</div>
      <button class="buy-button" ${!canAfford ? 'disabled' : ''}>
        ${canAfford ? 'Comprar' : 'Sin fondos'}
      </button>
    `;
    
    // Agregar evento de clic al botón de comprar
    const buyButton = giftCard.querySelector('.buy-button');
    if (canAfford) {
      buyButton.addEventListener('click', (e) => {
        e.stopPropagation();
        buyGift(regalo);
      });
    }
    
    giftsListElement.appendChild(giftCard);
  });
}

// Renderizar regalos comprados (para el perfil)
function renderPurchasedGifts() {
  const state = getState();
  const purchasedGiftsElement = document.getElementById('purchased-gifts-list');
  if (!purchasedGiftsElement) return;
  
  console.log('Estado actual:', state);
  console.log('Regalos comprados:', state.user.regalosComprados);
  
  purchasedGiftsElement.innerHTML = '';
  
  if (state.user.regalosComprados.length === 0) {
    purchasedGiftsElement.innerHTML = `
      <p class="no-gifts-message" style="grid-column: 1 / -1; text-align: center; color: #ccc; font-style: italic;">
        Aún no tienes regalos comprados. ¡Visita la <a href="tienda-regalos.html" style="color: #667eea;">Tienda de Regalos</a>!
      </p>
    `;
    return;
  }
  
  state.user.regalosComprados.forEach(giftId => {
    const regalo = state.regalos.find(g => g.id === giftId);
    if (regalo) {
      const giftCard = document.createElement('div');
      giftCard.className = 'gift-card';
      giftCard.innerHTML = `
        <span class="gift-icon">${regalo.icono}</span>
        <div class="gift-name">${regalo.nombre}</div>
        <div class="gift-points">+${regalo.puntos} puntos ganados</div>
      `;
      
      purchasedGiftsElement.appendChild(giftCard);
    }
  });
}

function renderTiendaRegalos() {
  const state = getState();
  const giftsListElement = document.getElementById('gifts-list');
  if (!giftsListElement) return;
  
  // Actualizar monedas y puntos en el header
  const monedasElement = document.getElementById('monedas');
  const puntosElement = document.getElementById('user-points');
  
  if (monedasElement) {
    monedasElement.textContent = state.user.monedas;
  }
  
  if (puntosElement) {
    puntosElement.textContent = state.user.puntos;
  }
  
  // Renderizar lista de regalos
  renderGiftsList();
}

// Función para comprar regalo
function buyGift(regalo) {
  const state = getState();
  
  console.log('Comprando regalo:', regalo);
  console.log('Estado antes de compra:', state);
  console.log('Monedas actuales:', state.user.monedas);
  console.log('Costo del regalo:', regalo.costo);
  
  if (state.user.monedas >= regalo.costo) {
    // Descontar monedas
    state.user.monedas -= regalo.costo;
    
    // Sumar puntos
    state.user.puntos += regalo.puntos;
    
    // Agregar a regalos comprados
    if (!state.user.regalosComprados.includes(regalo.id)) {
      state.user.regalosComprados.push(regalo.id);
    }
    
    console.log('Estado después de compra:', state);
    console.log('Regalos comprados después:', state.user.regalosComprados);
    
    // Guardar estado
    setState(state);
    
    // Actualizar UI según la página actual
    if (document.getElementById('gifts-list')) {
      // Estamos en la tienda de regalos
      renderGiftsList();
      // Actualizar monedas y puntos en el header
      const monedasElement = document.getElementById('monedas');
      const puntosElement = document.getElementById('user-points');
      if (monedasElement) monedasElement.textContent = state.user.monedas;
      if (puntosElement) puntosElement.textContent = state.user.puntos;
    } else {
      // Estamos en el perfil del espectador
      renderEspectador();
    }
    
    showNotification('¡Regalo Comprado!', `Has enviado ${regalo.icono} ${regalo.nombre} por ${regalo.costo} monedas y ganaste ${regalo.puntos} puntos.`);
  } else {
    showNotification('Sin fondos', `No tienes suficientes monedas. Necesitas ${regalo.costo} monedas.`);
  }
}

// Función para mostrar notificación personalizada
function showNotification(title, message) {
  const modal = document.getElementById('notification-modal');
  const titleElement = document.getElementById('notification-title');
  const messageElement = document.getElementById('notification-message');
  const closeButton = document.getElementById('notification-close');
  
  if (modal && titleElement && messageElement) {
    titleElement.textContent = title;
    messageElement.textContent = message;
    
    modal.classList.add('show');
    
    // Cerrar modal al hacer click en el botón
    if (closeButton) {
      closeButton.onclick = () => {
        modal.classList.remove('show');
      };
    }
    
    // Cerrar modal al hacer click fuera del contenido
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    };
    
    // Cerrar modal con tecla Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.classList.remove('show');
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }
}

function setupSearchFunctionality() {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.querySelector('.search-button');
  const viewStreamsBtn = document.querySelector('.view-streams-btn');
  
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
  
  if (searchButton) {
    searchButton.addEventListener('click', performSearch);
  }
  
  if (viewStreamsBtn) {
    viewStreamsBtn.addEventListener('click', () => {
      showNotification('Próximamente', 'La función "Ver Streams" estará disponible pronto. ¡Mantente atento!');
    });
  }
}

// Función para realizar búsqueda
function performSearch() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    const query = searchInput.value.trim();
    if (query) {
      showNotification('Búsqueda', `Buscando: "${query}". Esta función estará disponible pronto.`);
      searchInput.value = '';
    } else {
      showNotification('Búsqueda vacía', 'Por favor ingresa un término de búsqueda.');
    }
  }
}

function manejarLogin(evento) {
  evento.preventDefault();
  
  const email = document.getElementById('email').value.toLowerCase();
  const password = document.getElementById('password').value;
  
  let user;
  
  // Primero verificar si hay un usuario registrado
  const usuarioRegistrado = localStorage.getItem('usuarioRegistrado');
  if (usuarioRegistrado) {
    const datosUsuario = JSON.parse(usuarioRegistrado);
    // Verificar si el email coincide
    if (datosUsuario.email.toLowerCase() === email) {
      user = datosUsuario;
    } else {
      // Si el email no coincide, usar la lógica original
      if (email.includes('streamer')) {
        user = { 
          nombre: "streamer", 
          rol: "streamer", 
          nivel: 1, 
          puntos: 0, 
          monedas: 250, 
          horasTx: 0,
          regalosComprados: []
        };
      } else {
        user = { 
          nombre: "espectador", 
          rol: "espectador", 
          nivel: 1, 
          puntos: 0, 
          monedas: 250, 
          horasTx: 0,
          regalosComprados: []
        };
      }
    }
  } else {
    // No hay usuario registrado, usar la lógica original
    if (email.includes('streamer')) {
      user = { 
        nombre: "streamer", 
        rol: "streamer", 
        nivel: 1, 
        puntos: 0, 
        monedas: 250, 
        horasTx: 0,
        regalosComprados: []
      };
    } else {
      user = { 
        nombre: "espectador", 
        rol: "espectador", 
        nivel: 1, 
        puntos: 0, 
        monedas: 250, 
        horasTx: 0,
        regalosComprados: []
      };
    }
  }
  
  // Actualizar estado
  const state = getState();
  state.user = user;
  setState(state);
  
  // Redirigir según rol
  if (user.rol === 'streamer') {
    showNotification('¡Bienvenido Streamer!', `Hola ${user.nombre}`);
    setTimeout(() => {
      window.location.href = 'dashboard-streamer.html';
    }, 1000);
  } else {
    showNotification('¡Bienvenido Espectador!', `Hola ${user.nombre}`);
    setTimeout(() => {
      window.location.href = 'perfil-espectador.html';
    }, 1000);
  }
}

function manejarRegistro(evento) {
  evento.preventDefault();
  
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const rol = document.getElementById('rol').value;
  
  // Validar campos
  if (!nombre || !email || !password || !rol) {
    alert('Por favor completa todos los campos');
    return;
  }
  
  // Crear nuevo usuario
  const nuevoUsuario = {
    nombre: nombre,
    email: email,
    rol: rol,
    nivel: 1,
    puntos: 0,
    monedas: 250,
    horasTx: 0,
    regalosComprados: []
  };
  
  // Guardar en localStorage (en una implementación real sería en el servidor)
  localStorage.setItem('usuarioRegistrado', JSON.stringify(nuevoUsuario));
  
  showNotification('Registro exitoso', '¡Cuenta creada! Ya puedes iniciar sesión.');
  
  // Redirigir al login después de un breve delay
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1500);
}

function cerrarSesion() {
  localStorage.removeItem('appState');
  window.location.href = 'index.html';
}

function resetState() {
  localStorage.removeItem('appState');
  console.log('Estado reseteado. Recarga la página.');
}

function setupSpectatorNotifications() {
  const state = getState();
  
  if (state.user.rol !== 'espectador') return;
  
  if (typeof BroadcastChannel !== 'undefined') {
    const bc = new BroadcastChannel('streamboost');
    bc.onmessage = function(event) {
      if (event.data.type === 'LEVEL_UP') {
        showNotification('🎉 ¡Subiste de nivel!', `¡El streamer subió al nivel ${event.data.level}!`);
      }
    };
  } else {
    window.addEventListener('storage', function(event) {
      if (event.key === 'lastLevelUp') {
        try {
          const data = JSON.parse(event.newValue);
          if (data && data.type === 'LEVEL_UP') {
            showNotification('🎉 ¡Subiste de nivel!', `¡El streamer subió al nivel ${data.level}!`);
          }
        } catch (e) {
          console.error('Error parsing level up notification:', e);
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('Página cargada:', window.location.pathname);
  console.log('localStorage actual:', localStorage.getItem('appState'));
  
  initBroadcastChannel();
  
  renderStreamer();
  renderEspectador();
  renderTiendaRegalos();
  setupSpectatorNotifications();
  setupSearchFunctionality();
  
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', manejarLogin);
  }
  
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', manejarRegistro);
  }
  
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