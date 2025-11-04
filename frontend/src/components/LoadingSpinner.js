/**
 * Loading Spinner Component
 * Shows loading state during encryption
 * Separation of concerns: Loading state UI
 */

export class LoadingSpinner {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="loading-overlay" id="loadingOverlay" style="display: none;">
        <div class="loading-content">
          <div class="spinner"></div>
          <h3>Encrypting Your Image...</h3>
          <p>This may take a moment. Please wait.</p>
        </div>
      </div>
    `;
  }

  show() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = 'flex';
  }

  hide() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = 'none';
  }
}
