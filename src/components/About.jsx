import React from 'react';
import { Link } from 'react-router-dom';

const teamMembers = [
  { name: 'Gabriel Alejandro Tinoco Ramirez', img: 'gabriel_tinoco.jpg' },
  { name: 'Nicolas Arozena Ramos', img: 'nicolas_arozena.jpg' },
  { name: 'Rodrigo Alonso Chung Espino', img: 'rodrigo_chung.jpg' },
  { name: 'Rodrigo Alessandro Sandoval Benites', img: 'rodrigo_sandoval.jpg' },
  { name: 'Juan Carlos Huarcaya Huamantalla', img: 'juan_carlos_huarcaya.jpg' },
  { name: 'Rodrigo Serrato Brayan Jesus', img: 'rodrigo_brayan.jpg' },
];

export default function About() {
  return (
    <div className="page-wrapper">
      <header className="navbar">
        <h1 className="logo">StreamBoost</h1>
      </header>

      <main className="main-content">
        <section className="nosotros">
          <h2>Nosotros <img src="/logo.png" alt="Logo StreamBoost" className="imagen-nosotros" /></h2>
          <p>
            <strong>StreamBoost</strong> es una plataforma de streaming creada en el año 2025 por un grupo de estudiantes de la Universidad de Lima (ULima) 
            con el objetivo de ofrecer una experiencia de entretenimiento moderna, accesible y personalizada.
          </p>

          <p>
            Nuestro propósito es impulsar el acceso al contenido digital de manera rápida, segura y sin interrupciones,
            integrando innovación tecnológica con una interfaz sencilla y atractiva para los usuarios.
          </p>

          <p>Nosotros somos:</p>
          <ul>
            {teamMembers.map((member) => (
              <li key={member.name}>
                <strong>{member.name}</strong>
                <img src={`/${member.img}`} alt={member.name} />
              </li>
            ))}
          </ul>

          <div className="boton-volver">
            <Link to="/"><button id="btnVolver">← Regresar al inicio</button></Link>
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2025 StreamBoost.</p>
      </footer>
    </div>
  );
}
