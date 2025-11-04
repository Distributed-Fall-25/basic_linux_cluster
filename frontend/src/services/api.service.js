/**
 * API Service
 * Handles all HTTP requests to the backend
 * Separation of concerns: Network communication layer
 */

import axios from 'axios';
import { API_CONFIG } from '../config/api.config.js';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Check backend health status
   * @returns {Promise<Object>} Health status response
   */
  async checkHealth() {
    try {
      const response = await this.client.get(API_CONFIG.ENDPOINTS.HEALTH);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: this._handleError(error)
      };
    }
  }

  /**
   * Encrypt an image using the backend service
   * @param {File} imageFile - The image file to encrypt
   * @returns {Promise<Object>} Encrypted image blob and metadata
   */
  async encryptImage(imageFile) {
    try {
      // Validate file before sending
      this._validateImageFile(imageFile);

      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await this.client.post(
        API_CONFIG.ENDPOINTS.ENCRYPT,
        imageFile,
        {
          headers: {
            'Content-Type': imageFile.type
          },
          responseType: 'blob'
        }
      );

      return {
        success: true,
        data: response.data,
        originalFileName: imageFile.name
      };
    } catch (error) {
      return {
        success: false,
        error: this._handleError(error)
      };
    }
  }

  /**
   * Validate image file before upload
   * @private
   */
  _validateImageFile(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > API_CONFIG.MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds maximum allowed size of ${API_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
      );
    }

    if (!API_CONFIG.ACCEPTED_FORMATS.includes(file.type)) {
      throw new Error(
        `Invalid file format. Accepted formats: ${API_CONFIG.ACCEPTED_FORMATS.join(', ')}`
      );
    }
  }

  /**
   * Handle API errors consistently
   * @private
   */
  _handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'Server error occurred',
        status: error.response.status,
        type: 'server_error'
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        message: 'Cannot connect to server. Please check if the backend is running.',
        type: 'network_error'
      };
    } else {
      // Error in request setup
      return {
        message: error.message || 'An unexpected error occurred',
        type: 'client_error'
      };
    }
  }
}

// Export singleton instance
export default new ApiService();
