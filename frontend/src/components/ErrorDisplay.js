/**
 * Error Display Component
 * Shows error messages to the user
 * Separation of concerns: Error state UI
 */

export class ErrorDisplay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="error-container" id="errorContainer" style="display: none;">
        <div class="error-content">
          <div class="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3>Error Occurred</h3>
          <p id="errorMessage"></p>
          <button class="btn btn-primary" id="dismissErrorBtn">Dismiss</button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const dismissBtn = document.getElementById('dismissErrorBtn');
    dismissBtn.addEventListener('click', () => this.hide());
  }

  show(errorMessage, errorType = 'error') {
    const errorContainer = document.getElementById('errorContainer');
    const errorMessageEl = document.getElementById('errorMessage');

    errorMessageEl.textContent = errorMessage;
    errorContainer.style.display = 'flex';

    // Add specific styling based on error type
    errorContainer.className = `error-container error-${errorType}`;
  }

  hide() {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.style.display = 'none';
  }
}
