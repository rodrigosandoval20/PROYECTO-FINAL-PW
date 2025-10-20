import React from 'react';

const Header = ({ userBalance, userLevel }) => {
  return (
    <header className="header">
      <div className="logo">
        <h1>StreamPlatform</h1>
      </div>
      <nav>
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><a href="/nosotros">Nosotros</a></li>
          <li><a href="/tyc">TyC</a></li>
        </ul>
      </nav>
      <div className="user-info">
        <span className="balance">Monedas: {userBalance}</span>
        <span className="level">Nivel: {userLevel}</span>
      </div>
    </header>
  );
};

export default Header;