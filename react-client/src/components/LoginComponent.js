import React, { useState } from 'react';
import './LoginComponent.css';

function LoginComponent({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setError('');
    onLogin(username.toLowerCase());
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🌐 Cluster P2P</h1>
        <h2>Image Sharing System</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Choose a Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username..."
              autoFocus
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn">
            Join Network
          </button>
        </form>

        <div className="info">
          <p>📌 Your username will be visible to other peers</p>
          <p>🔒 You control who can view your original images</p>
        </div>
      </div>
    </div>
  );
}

export default LoginComponent;
