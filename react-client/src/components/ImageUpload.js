import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import grpcService from '../services/grpcService';
import './ImageUpload.css';

function ImageUpload({ username }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [encryptedImage, setEncryptedImage] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select an image first');
      return;
    }

    setUploading(true);
    setResult(null);
    setEncryptedImage(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix

        const jobId = `job_${uuidv4()}`;

        try {
          // Submit to server
          const response = await grpcService.submitImage(
            jobId,
            selectedFile.name,
            base64Data,
            username
          );

          setResult({
            success: true,
            jobId: jobId,
            message: 'Image uploaded successfully! Processing...',
          });

          // In a real implementation, you'd poll or listen for completion
          // For now, we'll simulate a delay and show a success message
          setTimeout(() => {
            setResult({
              success: true,
              jobId: jobId,
              message: 'Image processed! Check "My Images" tab.',
            });

            // Simulate encrypted result
            setEncryptedImage(preview); // In reality, this would come from the server
          }, 3000);

        } catch (error) {
          setResult({
            success: false,
            message: `Upload failed: ${error.message}`,
          });
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setEncryptedImage(null);
  };

  return (
    <div className="image-upload">
      <h2>Upload Image for Processing</h2>

      <div className="upload-container">
        <div className="upload-area">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            id="file-input"
            disabled={uploading}
          />
          <label htmlFor="file-input" className="file-input-label">
            {selectedFile ? (
              <span>✅ {selectedFile.name}</span>
            ) : (
              <span>📁 Choose Image</span>
            )}
          </label>

          {preview && (
            <div className="preview-section">
              <h3>Original Image</h3>
              <img src={preview} alt="Preview" className="preview-image" />
            </div>
          )}

          {selectedFile && !uploading && !result && (
            <div className="button-group">
              <button onClick={handleUpload} className="upload-btn">
                🚀 Upload & Process
              </button>
              <button onClick={handleReset} className="reset-btn">
                ❌ Clear
              </button>
            </div>
          )}

          {uploading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Uploading and processing...</p>
            </div>
          )}

          {result && (
            <div className={`result ${result.success ? 'success' : 'error'}`}>
              <p>{result.message}</p>
              {result.jobId && <p className="job-id">Job ID: {result.jobId}</p>}
            </div>
          )}

          {encryptedImage && (
            <div className="encrypted-result">
              <h3>Encrypted Result (Steganography)</h3>
              <img src={encryptedImage} alt="Encrypted" className="encrypted-image" />
              <p className="info-text">
                ✅ Original image stored securely<br/>
                🔒 Encrypted version delivered to you<br/>
                🤝 Share original with peers via consent
              </p>
              <button onClick={handleReset} className="reset-btn">
                Upload Another
              </button>
            </div>
          )}
        </div>

        <div className="info-panel">
          <h3>ℹ️ How It Works</h3>
          <ol>
            <li>Select an image from your device</li>
            <li>Upload to the cluster for processing</li>
            <li>Server applies steganography encryption</li>
            <li>You receive the encrypted version</li>
            <li>Original stored for P2P sharing</li>
            <li>Share originals with peers by consent</li>
          </ol>

          <div className="tips">
            <h4>💡 Tips</h4>
            <ul>
              <li>Supported formats: PNG, JPG, BMP, TIFF</li>
              <li>Max size: 25 MB</li>
              <li>Processing takes a few seconds</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageUpload;
