import React, { useState, useEffect } from 'react';
import './App.css';
import LoginComponent from './components/LoginComponent';
import ImageUpload from './components/ImageUpload';
import ImageGallery from './components/ImageGallery';
import PeerList from './components/PeerList';
import PendingRequests from './components/PendingRequests';
import firebaseService from './services/firebaseService';

function App() {
  const [username, setUsername] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    // Load username from localStorage
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
      // Re-register on app load
      firebaseService.registerClient(savedUsername, '127.0.0.1', 50070);

      // Set up heartbeat
      const heartbeatInterval = setInterval(() => {
        firebaseService.updateHeartbeat(savedUsername);
      }, 30000); // Every 30 seconds

      return () => {
        clearInterval(heartbeatInterval);
        firebaseService.unregisterClient(savedUsername);
      };
    }
  }, [username]);

  const handleLogin = (user) => {
    setUsername(user);
    localStorage.setItem('username', user);
    // Register with Firebase
    firebaseService.registerClient(user, '127.0.0.1', 50070);
  };

  const handleLogout = () => {
    if (username) {
      firebaseService.unregisterClient(username);
      localStorage.removeItem('username');
      setUsername(null);
    }
  };

  if (!username) {
    return <LoginComponent onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌐 Cluster P2P Image Sharing</h1>
        <div className="user-info">
          <span>👤 {username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'upload' ? 'active' : ''}
          onClick={() => setActiveTab('upload')}
        >
          📤 Upload Image
        </button>
        <button
          className={activeTab === 'gallery' ? 'active' : ''}
          onClick={() => setActiveTab('gallery')}
        >
          🖼️ My Images
        </button>
        <button
          className={activeTab === 'peers' ? 'active' : ''}
          onClick={() => setActiveTab('peers')}
        >
          👥 Online Peers
        </button>
        <button
          className={activeTab === 'requests' ? 'active' : ''}
          onClick={() => setActiveTab('requests')}
        >
          📨 Requests
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'upload' && <ImageUpload username={username} />}
        {activeTab === 'gallery' && <ImageGallery username={username} />}
        {activeTab === 'peers' && <PeerList username={username} />}
        {activeTab === 'requests' && <PendingRequests username={username} />}
      </main>

      <footer className="App-footer">
        <p>Distributed Image Processing Cluster - P2P Image Sharing with Consent</p>
      </footer>
    </div>
  );
}

export default App;
