import React, { useState } from 'react';
import './ImageGallery.css';

function ImageGallery({ username }) {
  // In a real implementation, you'd fetch this from the server/database
  const [images] = useState([
    // Mock data - replace with actual API calls
    {
      job_id: 'job_001',
      filename: 'example1.png',
      status: 'Done',
      created_at: Date.now() - 3600000,
      has_original: true,
      has_encrypted: true,
    },
    {
      job_id: 'job_002',
      filename: 'example2.jpg',
      status: 'Done',
      created_at: Date.now() - 7200000,
      has_original: true,
      has_encrypted: true,
    },
  ]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('encrypted'); // 'original' or 'encrypted'

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setViewMode('encrypted');
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const copyJobId = (jobId) => {
    navigator.clipboard.writeText(jobId);
    alert(`Job ID copied: ${jobId}`);
  };

  return (
    <div className="image-gallery">
      <h2>🖼️ My Images</h2>

      {images.length === 0 ? (
        <div className="no-images">
          <p className="large-icon">📸</p>
          <p>No images yet</p>
          <p className="hint">Upload an image to get started</p>
        </div>
      ) : (
        <>
          <div className="gallery-grid">
            {images.map((image) => (
              <div
                key={image.job_id}
                className="gallery-item"
                onClick={() => handleImageClick(image)}
              >
                <div className="image-placeholder">
                  <span className="placeholder-icon">🖼️</span>
                </div>
                <div className="image-info">
                  <h4>{image.filename}</h4>
                  <p className="job-id-small">
                    {image.job_id}
                    <button
                      className="copy-btn-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyJobId(image.job_id);
                      }}
                    >
                      📋
                    </button>
                  </p>
                  <p className="timestamp">
                    {new Date(image.created_at).toLocaleString()}
                  </p>
                  <span className={`status-badge ${image.status.toLowerCase()}`}>
                    {image.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="info-section">
            <h3>💡 Sharing Your Images</h3>
            <p>To share an image with a peer:</p>
            <ol>
              <li>Copy the Job ID (click 📋)</li>
              <li>Share it with your peer (chat, message, etc.)</li>
              <li>They can request it from the "Online Peers" tab</li>
              <li>You'll get a notification in the "Requests" tab</li>
              <li>Accept to share the original, or refuse to share the encrypted version</li>
            </ol>
          </div>
        </>
      )}

      {selectedImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedImage.filename}</h3>
              <button className="close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="view-toggle">
                <button
                  className={viewMode === 'encrypted' ? 'active' : ''}
                  onClick={() => setViewMode('encrypted')}
                >
                  🔒 Encrypted View
                </button>
                <button
                  className={viewMode === 'original' ? 'active' : ''}
                  onClick={() => setViewMode('original')}
                >
                  🖼️ Original View
                </button>
              </div>

              <div className="image-display">
                {viewMode === 'encrypted' ? (
                  <div className="image-container">
                    <div className="image-placeholder large">
                      <span>🔒 Encrypted Image</span>
                      <p>Steganography applied</p>
                    </div>
                  </div>
                ) : (
                  <div className="image-container">
                    <div className="image-placeholder large">
                      <span>🖼️ Original Image</span>
                      <p>Only you can see this</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="image-details">
                <div className="detail-row">
                  <strong>Job ID:</strong>
                  <span>
                    {selectedImage.job_id}
                    <button
                      className="copy-btn"
                      onClick={() => copyJobId(selectedImage.job_id)}
                    >
                      📋 Copy
                    </button>
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Status:</strong>
                  <span className={`status-badge ${selectedImage.status.toLowerCase()}`}>
                    {selectedImage.status}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Created:</strong>
                  <span>{new Date(selectedImage.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="sharing-info">
                <p className="info-text">
                  <strong>Sharing:</strong> Give your Job ID to peers so they can request this image.
                  You'll be notified and can choose to share the original or encrypted version.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
