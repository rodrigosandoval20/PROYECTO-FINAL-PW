let xp = 0;
let nivel = 1;
const xpMax = 100;

// Obtener los elementos
const xpBar = document.getElementById("xp-bar-grande");
const xpText = document.getElementById("xp-text-grande");
const nivelGrande = document.getElementById("nivel-grande");

// Aumentar XP automáticamente cada segundo
function actualizarXP() {
  xp++;

  if (xp >= xpMax) {
    xp = 0;
    nivel++;
    nivelGrande.textContent = nivel; // actualiza número de nivel
  }

  xpBar.style.width = `${(xp / xpMax) * 100}%`;
  xpText.textContent = `XP: ${xp} / ${xpMax}`;
}

setInterval(actualizarXP, 1000);
