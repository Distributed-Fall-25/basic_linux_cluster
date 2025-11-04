/**
 * API Configuration
 * Central configuration for API endpoints and settings
 */

export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  ENDPOINTS: {
    HEALTH: '/health',
    ENCRYPT: '/encrypt'
  },
  TIMEOUT: 60000, // 60 seconds for image processing
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ACCEPTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
};

export default API_CONFIG;
