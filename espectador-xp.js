// ==== CONFIGURACIÓN INICIAL ====
let xpActual = 0;
let xpMax = 100;
let nivel = 1;
let monedas = 0;

// ==== OBTENER ELEMENTOS DEL HTML ====
const xpBar = document.getElementById("xp-bar");
const xpText = document.getElementById("xp-text");
const nivelText = document.getElementById("nivel");
const monedasText = document.getElementById("monedas");

// ==== FUNCIÓN PARA ACTUALIZAR LA INTERFAZ ====
function actualizarInterfaz() {
  xpText.textContent = `XP: ${xpActual} / ${xpMax}`;
  nivelText.textContent = nivel;
  monedasText.textContent = monedas;

  const porcentaje = (xpActual / xpMax) * 100;
  xpBar.style.width = `${porcentaje}%`;
}

// ==== FUNCIÓN PARA GANAR XP ====
function ganarXP() {
  xpActual += 1;

  // Si llega o supera el máximo, sube de nivel
  if (xpActual >= xpMax) {
    xpActual = 0;
    nivel++;
    monedas += 50; // puedes ajustar o quitar esta recompensa
  }

  actualizarInterfaz();
}

// ==== INICIO AUTOMÁTICO ====
actualizarInterfaz();

// Cada 1 segundo gana 1 XP
setInterval(ganarXP, 1000);
