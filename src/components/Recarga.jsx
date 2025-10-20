import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../recarga.css';

export default function Recarga({ onRecharge }) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [detalle, setDetalle] = useState('');
  const montoRef = useRef(null);
  const metodoRef = useRef(null);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const monto = Number(montoRef.current?.value || 0);
    const metodo = metodoRef.current?.value || 'tarjeta';
    alert(`Procesando pago con ${metodo}... ✅`);
    const fecha = new Date().toLocaleString();
    setDetalle(`Monto: ${monto} monedas\nMétodo: ${metodo}\nFecha: ${fecha}`);
    setShowReceipt(true);
    onRecharge?.(monto);
  };

  const descargar = () => {
    const fecha = new Date().toLocaleString();
    const contenido = `StreamBoost - Comprobante de Recarga\n---------------------------------------\nMonto: ${montoRef.current?.value} monedas\nMétodo: ${metodoRef.current?.value}\nFecha: ${fecha}\n---------------------------------------\n¡Gracias por tu recarga!`;
    const blob = new Blob([contenido], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Comprobante_StreamBoost.txt';
    a.click();
  };

  return (
    <div className="recarga-page">
      <header className="navbar">
        <h1>Recargar Monedas 🪙</h1>
        <button className="btn-volver" onClick={() => navigate('/dashboard')}>Atrás</button>
      </header>
      <main className="container">
        <form onSubmit={submit} className="form-recarga">
          <label htmlFor="monto">Selecciona el monto:</label>
          <select id="monto" ref={montoRef} defaultValue="100">
            <option value="100">100 monedas - S/ 5.00</option>
            <option value="500">500 monedas - S/ 20.00</option>
            <option value="1000">1000 monedas - S/ 35.00</option>
          </select>

          <label htmlFor="metodo">Método de pago:</label>
          <select id="metodo" ref={metodoRef} defaultValue="tarjeta">
            <option value="tarjeta">Tarjeta</option>
            <option value="yape">Yape</option>
            <option value="plin">Plin</option>
          </select>

          <button type="submit" className="btn-recargar">Pagar y Recargar</button>
        </form>

        {showReceipt && (
          <div className="comprobante">
            <h3>✅ Recarga Exitosa</h3>
            <p>Gracias por tu compra.</p>
            <p style={{ whiteSpace:'pre-line' }}>{detalle}</p>
            <button className="btn-descargar" onClick={descargar}>Descargar comprobante</button>
          </div>
        )}
      </main>
    </div>
  );
}
