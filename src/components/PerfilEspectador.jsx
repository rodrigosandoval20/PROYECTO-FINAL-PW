import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../perfil.css';

export default function PerfilEspectador({ coins = 0, level = 1, xp = 0, maxXp = 100, onLogout, onLevelUp, onAddXp }) {
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const username = user.username || 'Espectador';

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <div className="navbar-brand">
          <h1>StreamBoost</h1>
        </div>
        <div className="navbar-right">
          <div className="xp-header">
            <span id="nivel-text">Nivel <span id="nivel">{level}</span></span>
          </div>
          <span className="monedas">Monedas: <span id="monedas">{coins}</span></span>
          <button className="perfil-button" onClick={() => navigate('/dashboard')}>Atrás</button>
          <button className="logout-button" onClick={onLogout}>Cerrar sesión</button>
        </div>
      </header>

      <main className="perfil-container">
        <div className="perfil-card">
          <h2>Perfil del Espectador</h2>
          <p className="username">Hola, {username}</p>
          
          <div className="nivel-section">
            <h3>Nivel {level}</h3>
            <div className="xp-bar-large">
              <div 
                className="xp-bar-fill" 
                style={{ width: `${(xp / maxXp) * 100}%` }}
              ></div>
            </div>
            <p className="xp-text">XP: {xp} / {maxXp}</p>
            
            {/* Simulation buttons */}
            <div className="simulation-controls" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => onAddXp?.(10)}
                style={{ padding: '10px 20px', borderRadius: '8px' }}
              >
                +10 XP
              </button>
              <button 
                className="btn btn-primary" 
                onClick={onLevelUp}
                style={{ padding: '10px 20px', borderRadius: '8px' }}
              >
                Level Up
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
