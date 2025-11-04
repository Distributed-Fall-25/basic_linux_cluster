/**
 * Application Entry Point
 * Initializes the application when DOM is ready
 */

import { App } from './app.js';
import './styles/main.css';

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
