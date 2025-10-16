import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import About from './components/About';
import Terms from './components/Terms';
import StreamerDashboard from './components/StreamerDashboard';
import SpectatorDashboard from './components/SpectatorDashboard';
import GiftShop from './components/GiftShop';
import StreamPreview from './components/StreamPreview';
import Recarga from './components/Recarga';
import PerfilEspectador from './components/PerfilEspectador';
import Registro from './components/Registro';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // Stream state (lifted) so Preview can update Dashboard
  const [isLive, setIsLive] = useState(false);
  const [streamStart, setStreamStart] = useState(null); // epoch ms
  const [horasTransmitidas, setHorasTransmitidas] = useState(0); // cumulative hours
  const [totalGifts, setTotalGifts] = useState(0);
  const [receivedPoints, setReceivedPoints] = useState(0);
  // User-specific state
  const [coins, setCoins] = useState(null);
  const [spectatorLevel, setSpectatorLevel] = useState(null);
  const [spectatorXp, setSpectatorXp] = useState(null);
  const [spectatorMaxXp, setSpectatorMaxXp] = useState(null);

  // Simulated authentication check
  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const userData = JSON.parse(loggedInUser);
      setUser(userData);
      setCoins(userData.monedas ?? 0);
      setSpectatorLevel(userData.nivel ?? 1);
      setSpectatorXp(userData.puntos ?? 0);
      setSpectatorMaxXp(100); // You can adjust this if you want to save maxXp per user
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (credentials) => {
    setUser(credentials);
    setCoins(credentials.monedas ?? 0);
    setSpectatorLevel(credentials.nivel ?? 1);
    setSpectatorXp(credentials.puntos ?? 0);
    setSpectatorMaxXp(100);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Stream control handlers
  const handleStartStream = () => {
    setIsLive(true);
    setStreamStart(Date.now());
  };

  const handleStopStream = () => {
    if (isLive && streamStart) {
      const elapsedMs = Date.now() - streamStart;
      const elapsedHours = elapsedMs / (1000 * 60 * 60);
      setHorasTransmitidas((h) => h + elapsedHours);
    }
    setIsLive(false);
    setStreamStart(null);
  };

  const handleGift = (points) => {
    setTotalGifts((g) => g + 1);
    setReceivedPoints((p) => p + (points || 0));
  };

  // Spectator coins handlers
  const handleRecharge = (amount) => {
    const val = Number(amount) || 0;
    setCoins((c) => {
      const newCoins = c + val;
      // Persist to localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        userData.monedas = newCoins;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      return newCoins;
    });
  };
  const handleSpend = (amount) => {
    const val = Number(amount) || 0;
    setCoins((c) => {
      const newCoins = Math.max(0, c - val);
      // Persist to localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        userData.monedas = newCoins;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      return newCoins;
    });
  };

  // Spectator XP/level handlers
  const handleLevelUp = () => {
    setSpectatorLevel((l) => l + 1);
    setSpectatorXp(0);
    setSpectatorMaxXp((m) => Math.floor(m * 1.5)); // increase requirement by 50%
  };
  const handleAddXp = (amount) => {
    setSpectatorXp((x) => Math.min(x + amount, spectatorMaxXp));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={
            !user ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to="/dashboard" />
            )
          } />
          <Route path="/registro" element={<Registro />} />
          
          <Route path="/dashboard" element={
            user ? (
              user.rol === 'streamer' ? (
                <StreamerDashboard
                  onLogout={handleLogout}
                  user={user}
                  isLive={isLive}
                  streamStart={streamStart}
                  horasTransmitidas={horasTransmitidas}
                  totalGifts={totalGifts}
                  receivedPoints={receivedPoints}
                  onStartStream={handleStartStream}
                  onStopStream={handleStopStream}
                />
              ) : (
                <SpectatorDashboard 
                  onLogout={handleLogout} 
                  user={user}
                  coins={coins}
                  level={spectatorLevel}
                  xp={spectatorXp}
                  maxXp={spectatorMaxXp}
                />
              )
            ) : (
              <Navigate to="/" />
            )
          } />

          <Route path="/nosotros" element={<About />} />
          <Route path="/tyc" element={<Terms />} />
          <Route path="/tienda-regalos" element={
            user && user.rol === 'espectador' ? (
              <GiftShop onLogout={handleLogout} coins={coins} onSpend={handleSpend} />
            ) : (
              <Navigate to="/" />
            )
          } />
          <Route path="/recarga" element={
            user && user.rol === 'espectador' ? (
              <Recarga onRecharge={handleRecharge} />
            ) : (
              <Navigate to="/" />
            )
          } />
          <Route path="/perfil" element={
            user && user.rol === 'espectador' ? (
              <PerfilEspectador 
                coins={coins}
                level={spectatorLevel}
                xp={spectatorXp}
                maxXp={spectatorMaxXp}
                onLogout={handleLogout}
                onLevelUp={handleLevelUp}
                onAddXp={handleAddXp}
              />
            ) : (
              <Navigate to="/" />
            )
          } />
          <Route path="/stream-preview" element={
            user && user.rol === 'streamer' ? (
              <StreamPreview onEndStream={handleStopStream} onGift={handleGift} />
            ) : (
              <Navigate to="/" />
            )
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
