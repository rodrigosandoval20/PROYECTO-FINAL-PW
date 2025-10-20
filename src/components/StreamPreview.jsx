import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

export default function StreamPreview({ onEndStream, onGift }) {
  const navigate = useNavigate();
  // State for metrics and UI
  const [elapsed, setElapsed] = useState(0); // seconds since tab opened
  const [viewers, setViewers] = useState(23);
  const [activity, setActivity] = useState([
    '🔥 Twitch followed you — now',
    '✨ KappaKares subscribed — 10 minutes ago',
    '👤 ParkaSpeak followed — 22 minutes ago',
  ]);
  const [chat, setChat] = useState([
    'maxxt: What a play! 🔥',
    'akaDonny: Hey chat! 👋',
  ]);
  const [giftCount, setGiftCount] = useState(0);
  const inputRef = useRef(null);

  // Tick every second to update elapsed time
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsedLabel = useMemo(() => {
    const h = Math.floor(elapsed / 3600).toString().padStart(1, '0');
    const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(elapsed % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }, [elapsed]);

  // Simulators
  const simulateChat = () => {
    const value = inputRef.current?.value?.trim();
    const msg = value && value.length ? value : `user${Math.floor(Math.random()*100)}: Hello!`;
    setChat((c) => [...c, msg]);
    if (inputRef.current) inputRef.current.value = '';
  };
  const simulateFollow = () => {
    const name = `User${Math.floor(Math.random()*9999)}`;
    setActivity((a) => [
      `👤 ${name} followed — now`,
      ...a,
    ]);
    // small viewer bump
    setViewers((v) => v + Math.ceil(Math.random()*3));
  };
  const simulateGift = () => {
    const points = [1,5,10,20][Math.floor(Math.random()*4)];
    setGiftCount((g) => g + 1);
    setActivity((a) => [
      `🎁 Received a gift (${points} pts) — now`,
      ...a,
    ]);
    onGift?.(points);
  };

  return (
    <div className="page-wrapper">
      {/* Top bar */}
      <header className="sm-topbar">
        <div className="sm-title">Stream Manager</div>
        <div className="sm-metrics">
          {/* Only show elapsed time and viewers */}
          <div className="metric-badge metric-center">{elapsedLabel}</div>
          <div className="metric-badge metric-center">{viewers} viewers</div>
        </div>
      </header>

      {/* Grid content */}
      <main className="sm-grid">
        {/* Left column: activity + chat */}
        <aside className="sm-col fill-col">
          <section className="sm-panel grow">
            <h3 className="sm-panel-title">Stream Activity</h3>
            <ul className="sm-list">
              {activity.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
          <section className="sm-panel grow">
            <h3 className="sm-panel-title">My Chat</h3>
            <div className="sm-chat">
              {chat.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
            <div className="sm-input-row">
              <input ref={inputRef} className="sm-input" placeholder="Send message" />
              <button className="btn btn-primary" onClick={simulateChat}>Chat</button>
            </div>
          </section>
        </aside>

        {/* Center: preview */}
        <section className="sm-center">
          <div className="sm-panel">
            <h3 className="sm-panel-title">Stream Preview</h3>
            <div className="preview-box">
              {/* Red screen placeholder instead of video */}
              <div className="red-screen" />
            </div>
            <div className="sm-status">
              <span className="badge-live">● LIVE</span>
              <span className="badge-good">GOOD</span>
              <span className="badge-gifts">🎁 {giftCount}</span>
            </div>
          </div>
        </section>

        {/* Right: quick actions */}
        <aside className="sm-col">
          <section className="sm-panel">
            <h3 className="sm-panel-title">Quick Actions</h3>
            <div className="qa-grid">
              {[
                'Edit Stream Info', 'Clip That!',
                'Run 30s Ad', 'Raid a Channel',
                'Start Squad Stream', 'Follower-only Chat',
                'Emote-only Chat', '+'
              ].map((label) => (
                <button key={label} className="qa-btn">{label}</button>
              ))}
            </div>
          </section>
        </aside>
      </main>
      {/* Bottom simulation controls */}
      <footer className="sm-bottom-controls">
        <div className="controls-inner">
          <button className="btn btn-primary" onClick={simulateChat}>Simulate Chat</button>
          <button className="btn btn-primary" onClick={simulateFollow}>Simulate Follow</button>
          <button className="btn btn-primary" onClick={simulateGift}>Simulate Gift</button>
          <button
            className="btn btn-danger"
            onClick={() => { onEndStream?.(); navigate('/dashboard'); }}
          >
            End Stream
          </button>
        </div>
      </footer>
    </div>
  );
}
