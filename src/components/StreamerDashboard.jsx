import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StreamerDashboard = ({ onLogout, user, onStartStream, onStopStream, isLive, streamStart, horasTransmitidas, totalGifts, receivedPoints }) => {
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [rtmpStatus, setRtmpStatus] = useState('desconectado');
  const [progress, setProgress] = useState(0);
  const [hoursToNext, setHoursToNext] = useState(5.0);
  const [currentLevel, setCurrentLevel] = useState(user?.nivel ?? 1);
  const navigate = useNavigate();

  const startTransmission = () => {
    setIsTransmitting(true);
    setRtmpStatus('conectado');
    onStartStream?.();
    navigate('/stream-preview');
  };

  const stopTransmission = () => {
  setIsTransmitting(false);
  setRtmpStatus('desconectado');
  onStopStream?.();
  };

  const updateProgress = (hours) => {
    const hoursForNextLevel = currentLevel * 5; // 5 hours per level
    const newProgress = (hours / hoursForNextLevel) * 100;
    setProgress(Math.min(newProgress, 100));
    setHoursToNext(Math.max(0, hoursForNextLevel - hours));
  };

  // derive live elapsed seconds
  const liveElapsedHours = useMemo(() => {
    if (!isLive || !streamStart) return 0;
    const diffMs = Date.now() - streamStart;
    return Math.max(0, diffMs / (1000 * 60 * 60));
  }, [isLive, streamStart]);

  const totalHours = (horasTransmitidas || 0) + liveElapsedHours;

  useEffect(() => {
    // refresh progress while live
    updateProgress(totalHours);
    if (!isLive) return;
    const t = setInterval(() => {
      updateProgress((horasTransmitidas || 0) + ((Date.now() - (streamStart || 0)) / (1000 * 60 * 60)));
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive, streamStart, horasTransmitidas]);

  useEffect(() => {
    setIsTransmitting(!!isLive);
    setRtmpStatus(isLive ? 'conectado' : 'desconectado');
  }, [isLive]);

  return (
    <div className="page-wrapper">
      <header className="navbar">
        <div className="navbar-brand">
          <h1>StreamBoost</h1>
        </div>
        <div className="navbar-actions">
          <span style={{marginRight: '16px'}}>Hola, {user?.nombre || user?.username || 'streamer'}</span>
          <span style={{marginRight: '16px'}}>Nivel: {user?.nivel ?? 1}</span>
          <button onClick={onLogout} className="btn btn-outline">Cerrar sesión</button>
        </div>
      </header>

      <main className="container" id="ds-streamer">
        <div className="card">
          <h2>Dashboard del Streamer</h2>
          
          {/* Estado RTMP */}
          <div className="metric">
            <span id="rtmp-status" className={`rtmp-${rtmpStatus === 'conectado' ? 'connected' : 'disconnected'}`}>
              RTMP: {rtmpStatus}
            </span>
          </div>
          
          {/* Botones de control */}
          <div className="control-buttons">
            <button
              type="button"
              id="btnStart"
              className="btn btn-primary"
              onClick={startTransmission}
              disabled={isTransmitting}
            >
              Iniciar transmisión
            </button>
            <button 
              type="button"
              id="btnStop" 
              className="btn btn-danger" 
              onClick={stopTransmission}
              disabled={!isTransmitting}
            >
              Finalizar transmisión
            </button>
          </div>
          
          {/* Métricas */}
          <div className="metric">
            Horas transmitidas: <span id="horas-transmitidas">{totalHours.toFixed(2)}</span> h
          </div>
          
          {/* Progreso hacia siguiente nivel */}
          <div className="progress-container">
            <div className="progress-label">Progreso hacia siguiente nivel:</div>
            <div className="progress">
              <div 
                id="hoursProgress" 
                className="progress-bar" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div id="hoursToNext" className="progress-text">
              Faltan {hoursToNext.toFixed(1)} h para el nivel {currentLevel + 1}
            </div>
          </div>
          
          <p className="text-secondary">Última actualización: ahora</p>

          {/* Regalos recibidos */}
          <section className="gifts-panel">
            <h3 className="gifts-title">🎁 Regalos Recibidos</h3>
            <p className="gifts-subtitle">Regalos enviados por tus espectadores durante las transmisiones</p>

            <div className="gift-stats">
              <div className="stat">
                <div className="stat-number">{totalGifts}</div>
                <div className="stat-label">Total de regalos</div>
              </div>
              <div className="stat">
                <div className="stat-number">{receivedPoints}</div>
                <div className="stat-label">Puntos recibidos</div>
              </div>
            </div>

            {totalGifts === 0 ? (
              <div className="empty-box">Aún no has recibido regalos de tus espectadores</div>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
};

export default StreamerDashboard;