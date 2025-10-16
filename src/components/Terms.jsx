import React from 'react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="page-wrapper">
      <header className="navbar">
        <h1 className="logo">StreamBoost</h1>
      </header>

      <main className="main-content">
        <section className="tyc">
          <h2>Términos y Condiciones</h2>

          <p>
            Al utilizar la plataforma <strong>StreamBoost</strong>, aceptas cumplir con las políticas y normas
            descritas en este documento. El uso indebido de la aplicación, el envío de contenido inapropiado o la
            manipulación de puntos o monedas podrá resultar en la suspensión de la cuenta.
          </p>

          <p>
            Los datos personales ingresados se manejarán de acuerdo con las leyes de protección de datos vigentes. 
            El usuario es responsable de la veracidad de la información que proporcione y del uso adecuado de sus credenciales.
          </p>

          <p>
            StreamBoost se reserva el derecho de modificar estos términos en cualquier momento. Te recomendamos revisar 
            esta sección periódicamente para mantenerte informado.
          </p>

          <div className="boton-volver">
            <Link to="/"><button id="btnVolver">← Regresar al inicio</button></Link>
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2025 StreamBoost. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
