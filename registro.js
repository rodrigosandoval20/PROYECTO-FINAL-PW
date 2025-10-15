function showRegister() {
  document.getElementById("login").style.display = "none";
  document.getElementById("register").style.display = "block";
}

function showLogin() {
  document.getElementById("register").style.display = "none";
  document.getElementById("login").style.display = "block";
}

// ✅ Registrar usuario
function register() {
  const user = document.getElementById("regUser").value.trim();
  const pass = document.getElementById("regPass").value.trim();

  if (user === "" || pass === "") {
    alert("Por favor, completa todos los campos.");
    return;
  }

  // Obtener lista actual de usuarios
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Verificar si ya existe
  const exists = users.find(u => u.user === user);
  if (exists) {
    alert("El usuario ya existe.");
    return;
  }

  // Agregar nuevo usuario
  users.push({ user, pass });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Usuario registrado con éxito.");
  showLogin();
}

// 🔐 Iniciar sesión
function login() {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();

  let users = JSON.parse(localStorage.getItem("users")) || [];

  const validUser = users.find(u => u.user === user && u.pass === pass);

  if (validUser) {
    alert(`Bienvenido ${user}!`);
    // Aquí podrías redirigir a otra página:
    // window.location.href = "inicio.html";
  } else {
    alert("Usuario o contraseña incorrectos.");
  }
}
