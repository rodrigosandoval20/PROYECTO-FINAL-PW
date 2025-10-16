import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../../PROYECTO-FINAL-PW/estilos/registro.css";

const initialForm = {
  nombre: "",
  email: "",
  password: "",
  rol: ""
};

function getUsers() {
  const users = localStorage.getItem("usuariosRegistrados");
  return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
  localStorage.setItem("usuariosRegistrados", JSON.stringify(users));
}

export default function Registro() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    const { nombre, email, password, rol } = form;
    if (!nombre || !email || !password || !rol) {
      setError("Completa todos los campos.");
      return;
    }
    const users = getUsers();
    if (users.some(u => u.email === email.trim().toLowerCase())) {
      setError("Ese correo ya está registrado.");
      return;
    }
    const newUser = {
      nombre,
      email: email.trim().toLowerCase(),
      password,
      rol,
      nivel: 1,
      puntos: 0,
      monedas: 250,
      horasTx: 0,
      regalosComprados: []
    };
    users.push(newUser);
    saveUsers(users);
    setSuccess("✅ Registro exitoso. ¡Ya puedes iniciar sesión!");
    setForm(initialForm);
    setTimeout(() => {
      navigate("/");
    }, 1200);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#232326", display: "flex", flexDirection: "column" }}>
      <header style={{ width: "100%", background: "#18181a", borderBottom: "1px solid #444", padding: "18px 0", textAlign: "center" }}>
        <h1 style={{ color: "#fd1919bb", fontWeight: "bold", fontSize: "2rem", letterSpacing: "1px", margin: 0 }}>StreamBoost</h1>
      </header>
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <section className="form-section" style={{ margin: "auto", background: "#2c2c2c", borderRadius: "12px", boxShadow: "0 0 20px rgba(0,0,0,0.4)", minWidth: 350, maxWidth: 420 }}>
          <h2 style={{ color: "#fd1919bb", textAlign: "center", marginBottom: 25, fontSize: 28, borderBottom: "1px solid #555", paddingBottom: 10 }}>Crear cuenta</h2>
          <form id="registerForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo:</label>
              <input type="text" id="nombre" name="nombre" placeholder="Tu nombre" value={form.nombre} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico:</label>
              <input type="email" id="email" name="email" placeholder="usuario@correo.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña:</label>
              <input type="password" id="password" name="password" placeholder="********" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="rol">Selecciona tu rol:</label>
              <select id="rol" name="rol" value={form.rol} onChange={handleChange} required>
                <option value="">-- Seleccionar --</option>
                <option value="streamer">Streamer</option>
                <option value="espectador">Espectador</option>
              </select>
            </div>
            <button type="submit">Registrarme</button>
          </form>
          {error && <div style={{ color: "#fd1919bb", textAlign: "center", marginBottom: 10 }}>{error}</div>}
          {success && <div style={{ color: "#2ecc40", textAlign: "center", marginBottom: 10 }}>{success}</div>}
          <div className="boton-secundario" style={{ textAlign: "center", marginTop: 15 }}>
            <button type="button" style={{ background: "transparent", border: "1px solid #888", color: "#888", padding: "10px 20px", fontSize: "14px", borderRadius: "5px", marginBottom: 8 }} onClick={() => navigate("/")}>¿Ya tienes cuenta? Inicia sesión</button>
          </div>
          <div className="boton-volver" style={{ textAlign: "center", marginTop: 5 }}>
            <button type="button" style={{ background: "transparent", border: "1px solid #888", color: "#888", padding: "10px 20px", fontSize: "14px", borderRadius: "5px" }} onClick={() => navigate("/")}>← Regresar</button>
          </div>
        </section>
      </div>
      <footer style={{ width: "100%", background: "#18181a", borderTop: "1px solid #444", textAlign: "center", padding: "18px 0", color: "#888", fontSize: "13px" }}>
        © 2025 StreamBoost Inc. Todos los derechos reservados.
      </footer>
    </div>
  );
}
