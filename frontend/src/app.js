/**
 * Main Application Controller
 * Coordinates all components and handles application logic
 * Separation of concerns: Application orchestration layer
 */

import apiService from './services/api.service.js';
import { ImageUploader } from './components/ImageUploader.js';
import { ResultDisplay } from './components/ResultDisplay.js';
import { LoadingSpinner } from './components/LoadingSpinner.js';
import { ErrorDisplay } from './components/ErrorDisplay.js';

export class App {
  constructor() {
    this.imageUploader = null;
    this.resultDisplay = null;
    this.loadingSpinner = null;
    this.errorDisplay = null;
    this.selectedFile = null;
  }

  async init() {
    // Initialize all components
    this.imageUploader = new ImageUploader('uploaderContainer');
    this.resultDisplay = new ResultDisplay('resultContainer');
    this.loadingSpinner = new LoadingSpinner('loadingContainer');
    this.errorDisplay = new ErrorDisplay('errorContainer');

    // Set up callbacks
    this.imageUploader.setFileSelectedCallback((file) => {
      this.selectedFile = file;
      this.enableEncryptButton();
    });

    this.resultDisplay.setNewEncryptionCallback(() => {
      this.resetApplication();
    });

    // Attach encrypt button listener
    this.attachEncryptButtonListener();

    // Check backend health
    await this.checkBackendHealth();
  }

  attachEncryptButtonListener() {
    const encryptBtn = document.getElementById('encryptBtn');
    encryptBtn.addEventListener('click', () => {
      this.handleEncryptImage();
    });
  }

  enableEncryptButton() {
    const encryptBtn = document.getElementById('encryptBtn');
    encryptBtn.disabled = false;
  }

  disableEncryptButton() {
    const encryptBtn = document.getElementById('encryptBtn');
    encryptBtn.disabled = true;
  }

  async checkBackendHealth() {
    const healthIndicator = document.getElementById('healthIndicator');
    const healthStatus = document.getElementById('healthStatus');

    const result = await apiService.checkHealth();

    if (result.success) {
      healthIndicator.className = 'health-indicator online';
      healthStatus.textContent = 'Backend Online';
    } else {
      healthIndicator.className = 'health-indicator offline';
      healthStatus.textContent = 'Backend Offline';
      this.errorDisplay.show(
        'Cannot connect to backend server. Please ensure the Rust server is running on port 8080.',
        'network_error'
      );
    }
  }

  async handleEncryptImage() {
    if (!this.selectedFile) {
      this.errorDisplay.show('Please select an image first.');
      return;
    }

    try {
      // Show loading state
      this.loadingSpinner.show();
      this.disableEncryptButton();
      this.errorDisplay.hide();

      // Call API to encrypt
      const result = await apiService.encryptImage(this.selectedFile);

      this.loadingSpinner.hide();

      if (result.success) {
        // Show result
        this.resultDisplay.show(result.data, result.originalFileName);
        this.hideUploader();
      } else {
        // Show error
        this.enableEncryptButton();
        this.errorDisplay.show(
          result.error.message || 'Failed to encrypt image. Please try again.',
          result.error.type
        );
      }
    } catch (error) {
      this.loadingSpinner.hide();
      this.enableEncryptButton();
      this.errorDisplay.show(
        'An unexpected error occurred. Please try again.',
        'client_error'
      );
      console.error('Encryption error:', error);
    }
  }

  hideUploader() {
    const uploaderContainer = document.getElementById('uploaderContainer');
    const actionButtons = document.getElementById('actionButtons');
    uploaderContainer.style.display = 'none';
    actionButtons.style.display = 'none';
  }

  showUploader() {
    const uploaderContainer = document.getElementById('uploaderContainer');
    const actionButtons = document.getElementById('actionButtons');
    uploaderContainer.style.display = 'block';
    actionButtons.style.display = 'block';
  }

  resetApplication() {
    this.selectedFile = null;
    this.imageUploader.clearSelection();
    this.resultDisplay.hide();
    this.showUploader();
    this.disableEncryptButton();
    this.errorDisplay.hide();
  }
}
