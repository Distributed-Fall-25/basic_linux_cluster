/**
 * Result Display Component
 * Shows encrypted image result and download options
 * Separation of concerns: Output display and actions
 */

export class ResultDisplay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.encryptedImageUrl = null;
    this.originalFileName = '';
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="result-wrapper" id="resultWrapper" style="display: none;">
        <div class="result-header">
          <h2>Encrypted Image</h2>
          <div class="success-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Encryption Successful</span>
          </div>
        </div>

        <div class="result-content">
          <div class="result-image-container">
            <img id="resultImage" alt="Encrypted result" />
          </div>

          <div class="result-actions">
            <button class="btn btn-primary" id="downloadBtn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download Encrypted Image
            </button>
            <button class="btn btn-secondary" id="newEncryptionBtn">
              Encrypt Another Image
            </button>
          </div>

          <div class="result-info">
            <p><strong>Note:</strong> The encrypted image contains your original image hidden using steganography.</p>
          </div>
        </div>
      </div>
    `;
  }

  show(imageBlob, originalFileName) {
    this.originalFileName = originalFileName;

    // Revoke old URL if exists
    if (this.encryptedImageUrl) {
      URL.revokeObjectURL(this.encryptedImageUrl);
    }

    // Create new URL for the blob
    this.encryptedImageUrl = URL.createObjectURL(imageBlob);

    const resultWrapper = document.getElementById('resultWrapper');
    const resultImage = document.getElementById('resultImage');

    resultImage.src = this.encryptedImageUrl;
    resultWrapper.style.display = 'block';

    this.attachEventListeners();
  }

  hide() {
    const resultWrapper = document.getElementById('resultWrapper');
    resultWrapper.style.display = 'none';

    if (this.encryptedImageUrl) {
      URL.revokeObjectURL(this.encryptedImageUrl);
      this.encryptedImageUrl = null;
    }
  }

  attachEventListeners() {
    const downloadBtn = document.getElementById('downloadBtn');
    const newEncryptionBtn = document.getElementById('newEncryptionBtn');

    downloadBtn.onclick = () => this.downloadImage();
    newEncryptionBtn.onclick = () => this.onNewEncryption();
  }

  downloadImage() {
    if (!this.encryptedImageUrl) return;

    const link = document.createElement('a');
    link.href = this.encryptedImageUrl;

    // Create filename from original
    const baseName = this.originalFileName.replace(/\.[^/.]+$/, '');
    link.download = `${baseName}_encrypted.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  setNewEncryptionCallback(callback) {
    this.onNewEncryption = callback;
  }
}
