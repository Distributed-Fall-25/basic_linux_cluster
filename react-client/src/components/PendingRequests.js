import React, { useState, useEffect } from 'react';
import firebaseService from '../services/firebaseService';
import grpcService from '../services/grpcService';
import './PendingRequests.css';

function PendingRequests({ username }) {
  const [requests, setRequests] = useState([]);
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    // Listen to pending requests in real-time
    const unsubscribe = firebaseService.onPendingRequestsChange(username, (pendingRequests) => {
      setRequests(pendingRequests);
    });

    return () => unsubscribe();
  }, [username]);

  const handleResponse = async (request, accepted) => {
    setResponding(request.request_id);

    try {
      // Update in Firebase
      await firebaseService.updateRequestStatus(
        request.request_id,
        accepted ? 'accepted' : 'refused'
      );

      // Also notify via gRPC (optional)
      try {
        await grpcService.respondToRequest(request.request_id, username, accepted);
      } catch (error) {
        console.warn('gRPC response failed, but Firebase updated:', error);
      }

      // Remove from local state (Firebase listener will update)
      setRequests((prev) => prev.filter((r) => r.request_id !== request.request_id));

    } catch (error) {
      alert(`Failed to respond: ${error.message}`);
    } finally {
      setResponding(null);
    }
  };

  return (
    <div className="pending-requests">
      <h2>📨 Pending Image Requests ({requests.length})</h2>

      {requests.length === 0 ? (
        <div className="no-requests">
          <div className="empty-state">
            <p className="large-icon">📭</p>
            <p>No pending requests</p>
            <p className="hint">When someone requests to view your images, they'll appear here</p>
          </div>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <div key={request.request_id} className="request-card">
              <div className="request-header">
                <div className="requester-info">
                  <div className="avatar">
                    {request.requester.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{request.requester}</h3>
                    <p className="request-time">
                      {new Date(request.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="request-status">
                  <span className="status-badge pending">Pending</span>
                </div>
              </div>

              <div className="request-body">
                <p className="request-text">
                  <strong>{request.requester}</strong> wants to view your image:
                </p>
                <p className="job-id">Job ID: <code>{request.job_id}</code></p>

                <div className="consent-info">
                  <div className="consent-option">
                    <span className="icon">✅</span>
                    <div>
                      <strong>If you Accept:</strong>
                      <p>They will receive your <strong>original image</strong></p>
                    </div>
                  </div>
                  <div className="consent-option">
                    <span className="icon">❌</span>
                    <div>
                      <strong>If you Refuse:</strong>
                      <p>They will receive the <strong>encrypted version</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="request-actions">
                <button
                  onClick={() => handleResponse(request, true)}
                  disabled={responding === request.request_id}
                  className="accept-btn"
                >
                  {responding === request.request_id ? '⏳ Processing...' : '✅ Accept'}
                </button>
                <button
                  onClick={() => handleResponse(request, false)}
                  disabled={responding === request.request_id}
                  className="refuse-btn"
                >
                  {responding === request.request_id ? '⏳ Processing...' : '❌ Refuse'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="info-panel">
        <h3>ℹ️ About Image Requests</h3>
        <ul>
          <li><strong>Real-time:</strong> Requests appear instantly via Firebase</li>
          <li><strong>Your choice:</strong> You control who sees your original images</li>
          <li><strong>Encrypted fallback:</strong> Refusing sends the steganography version</li>
          <li><strong>Timeout:</strong> Requests expire after 5 minutes if not responded to</li>
        </ul>
      </div>
    </div>
  );
}

export default PendingRequests;
