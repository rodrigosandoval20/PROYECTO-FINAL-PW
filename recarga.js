// =========================
// 🚫 Protección de páginas sin sesión
// =========================
(function verificarSesion() {
  const estado = localStorage.getItem('appState');
  if (!estado) {
    // Si no hay sesión guardada, redirige al login
    window.location.href = 'index.html';
    return;
  }

  try {
    const datos = JSON.parse(estado);
    if (!datos.user || !datos.user.nombre || !datos.user.rol) {
      // Si los datos son inválidos o incompletos, limpiar y redirigir
      localStorage.removeItem('appState');
      window.location.href = 'index.html';
    }
  } catch (error) {
    // Si el JSON está dañado
    localStorage.removeItem('appState');
    window.location.href = 'index.html';
  }
})();

document.getElementById("formRecarga").addEventListener("submit", function (event) {
  event.preventDefault();

  const monto = document.getElementById("monto").value;
  const metodo = document.getElementById("metodo").value;
  const comprobante = document.getElementById("comprobante");
  const detalle = document.getElementById("detalle");

  // Simular "pasarela de pago"
  alert("Procesando pago con " + metodo + "... ✅");

  detalle.innerHTML = `
    <strong>Monto:</strong> ${monto} monedas<br>
    <strong>Método:</strong> ${metodo}<br>
    <strong>Fecha:</strong> ${new Date().toLocaleString()}
  `;

  comprobante.classList.remove("oculto");

  // Generar comprobante descargable
  document.getElementById("descargarBtn").addEventListener("click", function () {
    const contenido = `
      StreamBoost - Comprobante de Recarga
      ---------------------------------------
      Monto: ${monto} monedas
      Método: ${metodo}
      Fecha: ${new Date().toLocaleString()}
      ---------------------------------------
      ¡Gracias por tu recarga!
    `;

    const blob = new Blob([contenido], { type: "text/plain" });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = "Comprobante_StreamBoost.txt";
    enlace.click();
  });
});
