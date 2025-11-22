import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebaseService from '../services/firebaseService';
import grpcService from '../services/grpcService';
import './PeerList.css';

function PeerList({ username }) {
  const [peers, setPeers] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [jobId, setJobId] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Listen to online clients in real-time
    const unsubscribe = firebaseService.onOnlineClientsChange((clients) => {
      // Filter out current user
      const otherClients = clients.filter((c) => c.username !== username);
      setPeers(otherClients);
    });

    return () => unsubscribe();
  }, [username]);

  const handleRequestImage = async () => {
    if (!selectedPeer) {
      alert('Please select a peer');
      return;
    }

    if (!jobId.trim()) {
      alert('Please enter a job ID');
      return;
    }

    setRequesting(true);
    setMessage(null);

    try {
      const requestId = uuidv4();

      // Create request in Firebase
      await firebaseService.createImageRequest(
        requestId,
        username,
        selectedPeer.username,
        jobId.trim()
      );

      // Also notify via gRPC (optional)
      try {
        await grpcService.requestPeerImage(username, selectedPeer.username, jobId.trim());
      } catch (error) {
        console.warn('gRPC request failed, but Firebase request created:', error);
      }

      setMessage({
        type: 'success',
        text: `Request sent to ${selectedPeer.username}! Waiting for response...`,
      });

      setJobId('');

      // Listen for response
      const unsubscribe = firebaseService.onRequestChange(requestId, async (request) => {
        if (request && request.status !== 'pending') {
          if (request.status === 'accepted') {
            setMessage({
              type: 'success',
              text: `✅ ${selectedPeer.username} accepted! Fetching image...`,
            });

            // Fetch the image
            try {
              const result = await grpcService.fetchSharedImage(requestId, username);
              if (result.success) {
                setMessage({
                  type: 'success',
                  text: `✅ Original image received from ${selectedPeer.username}!`,
                  imageData: result.image_data,
                  filename: result.filename,
                });
              }
            } catch (error) {
              setMessage({
                type: 'error',
                text: `Failed to fetch image: ${error.message}`,
              });
            }
          } else if (request.status === 'refused') {
            setMessage({
              type: 'warning',
              text: `❌ ${selectedPeer.username} refused your request. You'll receive the encrypted version.`,
            });

            // Fetch encrypted image
            try {
              const result = await grpcService.fetchSharedImage(requestId, username);
              if (result.success && result.is_encrypted) {
                setMessage({
                  type: 'warning',
                  text: `🔒 Encrypted image received from ${selectedPeer.username}`,
                  imageData: result.image_data,
                  filename: result.filename,
                });
              }
            } catch (error) {
              console.error('Failed to fetch encrypted image:', error);
            }
          } else if (request.status === 'timeout') {
            setMessage({
              type: 'error',
              text: `⏱️ Request timed out. ${selectedPeer.username} didn't respond.`,
            });
          }

          unsubscribe();
        }
      });

    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to send request: ${error.message}`,
      });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="peer-list">
      <h2>👥 Online Peers ({peers.length})</h2>

      <div className="peers-container">
        <div className="peers-grid">
          {peers.length === 0 ? (
            <div className="no-peers">
              <p>No other peers online</p>
              <p className="hint">Waiting for other users to join...</p>
            </div>
          ) : (
            peers.map((peer) => (
              <div
                key={peer.username}
                className={`peer-card ${selectedPeer?.username === peer.username ? 'selected' : ''}`}
                onClick={() => setSelectedPeer(peer)}
              >
                <div className="peer-avatar">
                  {peer.username.charAt(0).toUpperCase()}
                </div>
                <div className="peer-info">
                  <h3>{peer.username}</h3>
                  <p className="peer-status">🟢 Online</p>
                  <p className="peer-ip">{peer.ip}:{peer.port}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedPeer && (
          <div className="request-panel">
            <h3>Request Image from {selectedPeer.username}</h3>

            <div className="form-group">
              <label htmlFor="job-id">Job ID</label>
              <input
                id="job-id"
                type="text"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                placeholder="Enter job ID (e.g., job_001)"
                disabled={requesting}
              />
              <p className="hint">Ask {selectedPeer.username} for their job ID</p>
            </div>

            <button
              onClick={handleRequestImage}
              disabled={requesting || !jobId.trim()}
              className="request-btn"
            >
              {requesting ? '⏳ Sending...' : '📨 Send Request'}
            </button>

            {message && (
              <div className={`message ${message.type}`}>
                <p>{message.text}</p>
                {message.imageData && (
                  <div className="shared-image">
                    <img
                      src={`data:image/png;base64,${message.imageData}`}
                      alt={message.filename}
                    />
                    <p className="filename">{message.filename}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="info-section">
        <h3>ℹ️ How to Request Images</h3>
        <ol>
          <li>Select a peer from the list</li>
          <li>Enter the job ID of the image you want to see</li>
          <li>Send the request</li>
          <li>Wait for the peer to accept or refuse</li>
          <li>If accepted, you'll receive the original image</li>
          <li>If refused, you'll receive the encrypted version</li>
        </ol>
      </div>
    </div>
  );
}

export default PeerList;
