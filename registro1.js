// PARTE DE REGISTRO

// Verificamos si existe el formulario de registro en la página
const formularioRegistro = document.getElementById("registerForm");

if (formularioRegistro) {
  formularioRegistro.addEventListener("submit", function (event) {
    event.preventDefault();

    const nombre_Usuario = document.getElementById("nombre").value.trim().toLowerCase();
    const email_Usuario = document.getElementById("email").value.trim();
    const password_Usuario = document.getElementById("password").value;
    const rol_Usuario = document.getElementById("rol").value;

    // Validar campos
    if (!nombre_Usuario || !email_Usuario || !password_Usuario || !rol_Usuario) {
      alert("Por favor completa todos los campos.");
      return;
    }

    // Verificar si ya existe un usuario con ese nombre
    if (localStorage.getItem(nombre_Usuario)) {
      alert("El nombre de usuario ya está registrado.");
      return;
    }

    // Crear objeto de usuario
    const usuario = {
      nombre: nombre_Usuario,
      email: email_Usuario,
      password: password_Usuario,
      rol: rol_Usuario
    };

    // Guardar usando el nombre como clave
    localStorage.setItem(nombre_Usuario, JSON.stringify(usuario));

    alert("Registro exitoso. Ahora puedes iniciar sesión.");
    formularioRegistro.reset();
    window.location.href = "index.html";
  });
}


// PARTE DE LOGIN

// Verificamos si existe el formulario de login en la página
const formularioLogin = document.getElementById("loginForm");

if (formularioLogin) {
  formularioLogin.addEventListener("submit", function (event) {
    event.preventDefault();

    const nombreLogin = document.getElementById("email").value.trim().toLowerCase();
    const passwordLogin = document.getElementById("password").value;

    // Buscar usuario guardado
    const datosGuardados = localStorage.getItem(nombreLogin);

    if (!datosGuardados) {
      alert("Usuario no encontrado. Regístrate primero.");
      return;
    }

    const usuario = JSON.parse(datosGuardados);

    // Verificar contraseña
    if (usuario.password !== passwordLogin) {
      alert("Contraseña incorrecta.");
      return;
    }

    alert(`Bienvenido ${usuario.nombre} (${usuario.rol})`);

    // Redirigir según rol
    if (usuario.rol === "streamer") {
      window.location.href = "dashboard-streamer.html";
    } else {
      window.location.href = "perfil-espectador.html";
    }
  });
}
