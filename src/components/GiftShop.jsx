import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const gifts = [
  { id: 1, name: '❤️ Corazón', cost: 10, points: 5 },
  { id: 2, name: '🎉 Confeti', cost: 25, points: 15 },
  { id: 3, name: '🌟 Estrella', cost: 50, points: 30 },
  { id: 4, name: '👑 Corona', cost: 100, points: 60 },
  { id: 5, name: '🚀 Cohete', cost: 200, points: 120 },
  { id: 6, name: '💎 Diamante', cost: 500, points: 300 },
];

export default function GiftShop({ onLogout, coins = 0, onSpend }) {
  const [monedas, setMonedas] = useState(coins);
  const [points, setPoints] = useState(0);
  const [notification, setNotification] = useState({ show: false, title: '', message: '' });

  const buyGift = (gift) => {
    if (monedas >= gift.cost) {
      setMonedas(monedas - gift.cost);
      onSpend?.(gift.cost);
      setPoints(points + gift.points);
      showNotification('¡Regalo Comprado!', `Has comprado ${gift.name} y ganado ${gift.points} puntos`);
    } else {
      showNotification('Monedas Insuficientes', `Necesitas ${gift.cost - monedas} monedas más`);
    }
  };

  const showNotification = (title, message) => {
    setNotification({ show: true, title, message });
  };

  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <div className="navbar-brand">
          <h1>StreamBoost</h1>
        </div>

        <div className="navbar-right">
          <span className="monedas">Monedas: <span id="monedas">{monedas}</span></span>
          <span className="points">Puntos: <span id="user-points">{points}</span></span>
          <Link to="/dashboard" className="perfil-button">Perfil</Link>
          <button className="logout-button" onClick={onLogout}>Cerrar sesión</button>
        </div>
      </header>

      <main className="container-general">
        <div className="welcome-section">
          <h2>🎁 Tienda de Regalos</h2>
          <p className="text-secondary">Compra regalos para apoyar a tus streamers favoritos y gana puntos</p>
        </div>

        {/* Lista de regalos disponibles */}
        <div className="gifts-section">
          <h3>Regalos Disponibles</h3>
          <div className="gifts-grid" id="gifts-list">
            {gifts.map((gift) => (
              <div key={gift.id} style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '1.5rem',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                  {gift.name.split(' ')[0]}
                </div>
                <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>
                  {gift.name.substring(gift.name.indexOf(' ') + 1)}
                </h4>
                <p style={{ color: '#ccc', marginBottom: '0.5rem' }}>
                  💰 {gift.cost} monedas
                </p>
                <p style={{ color: '#aaf', marginBottom: '1rem' }}>
                  ⭐ +{gift.points} puntos
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => buyGift(gift)}
                  style={{ width: '100%' }}
                >
                  Comprar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Botón para regresar */}
        <div className="back-section" style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/dashboard" className="btn-back">← Regresar al Perfil</Link>
        </div>
      </main>
      
      {/* Modal de notificación personalizado */}
      {notification.show && (
        <div className="notification-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="notification-content" style={{
            background: '#fff',
            borderRadius: '15px',
            padding: '2rem',
            maxWidth: '400px',
            textAlign: 'center',
            color: '#333',
          }}>
            <div className="notification-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {notification.title.includes('Comprado') ? '✅' : '⚠️'}
            </div>
            <h3 id="notification-title">{notification.title}</h3>
            <p id="notification-message">{notification.message}</p>
            <button 
              id="notification-close" 
              className="notification-close"
              onClick={closeNotification}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
