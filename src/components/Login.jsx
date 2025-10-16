import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function getUsers() {
    const users = localStorage.getItem("usuariosRegistrados");
    return users ? JSON.parse(users) : [];
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = username.trim().toLowerCase();
    const pass = password.trim();
    const users = getUsers();
    const user = users.find(u => u.email === value && u.password === pass);
    if (!user) {
      setError("Credenciales incorrectas o usuario no registrado.");
      return;
    }
    localStorage.setItem('user', JSON.stringify(user));
    onLogin?.(user);
    navigate('/dashboard');
  };

  return (
    <div className="login-center">
      <div className="contenedor">
      <div className="marca-universidad">
        <img src="/logo.png" alt="StreamBoost" className="imagen-logo" />
        <h1 className="titulo-universidad">STREAMBOOST</h1>
      </div>

  <form id="loginForm" className="formulario-login" onSubmit={handleSubmit}>
        <div className="grupo-formulario">
          <label htmlFor="email">Usuario</label>
          <input
            type="text"
            id="email"
            placeholder="streamer o espectador"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="grupo-formulario">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="boton-login">Iniciar sesión</button>
        {error && <div style={{ color: "#fd1919bb", textAlign: "right", marginTop: 10 }}>{error}</div>}
        <div style={{ textAlign: "right", marginTop: "10px" }}>
          <Link to="/registro" style={{ color: "#ccc", textDecoration: "underline", fontSize: "15px" }}>¿No estás registrado?</Link>
        </div>
      </form>

      <nav className="navegacion-principal">
        <ul className="enlaces-navegacion">
          <li><Link to="/nosotros">Nosotros</Link></li>
          <li><Link to="/tyc">Términos y Condiciones</Link></li>
        </ul>
      </nav>

      <footer className="pie-pagina">
        <p>© 2025 StreamBoost Inc. Todos los derechos reservados.</p>
      </footer>
      </div>
    </div>
  );
};

export default Login;
