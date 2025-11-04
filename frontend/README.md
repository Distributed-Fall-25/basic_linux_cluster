# Elhaykal Image Encryption Client

A modern, user-friendly web frontend for the Elhaykal Image Encryption Service. This application allows users to encrypt images using steganography by sending them to the Rust backend service.

## Features

- **Drag & Drop Upload**: Easy image selection with drag-and-drop or click-to-browse
- **Image Preview**: See your selected image before encryption
- **Real-time Status**: Backend health monitoring
- **Error Handling**: Comprehensive error messages and validation
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Secure Processing**: Images are processed server-side using advanced steganography
- **Download Result**: Easily download your encrypted image

## Project Structure

```
frontend/
├── src/
│   ├── config/
│   │   └── api.config.js          # API configuration and endpoints
│   ├── services/
│   │   └── api.service.js         # HTTP client and API calls
│   ├── components/
│   │   ├── ImageUploader.js       # File upload and preview component
│   │   ├── ResultDisplay.js       # Encrypted image display
│   │   ├── LoadingSpinner.js      # Loading state component
│   │   └── ErrorDisplay.js        # Error message component
│   ├── styles/
│   │   └── main.css               # Application styles
│   ├── app.js                     # Main application controller
│   ├── index.js                   # Entry point
│   └── index.html                 # HTML template
├── dist/                          # Build output (generated)
├── package.json                   # Dependencies and scripts
├── webpack.config.js              # Webpack configuration
└── README.md                      # This file
```

## Architecture & Separation of Concerns

### 1. **Configuration Layer** (`config/`)
   - Centralized API endpoints and settings
   - Easy to modify backend URL and parameters

### 2. **Service Layer** (`services/`)
   - Handles all HTTP communication
   - Abstracts API calls from UI components
   - Provides error handling and validation

### 3. **Component Layer** (`components/`)
   - Reusable UI components
   - Each component has a single responsibility:
     - **ImageUploader**: File selection and preview
     - **ResultDisplay**: Show encrypted image and download
     - **LoadingSpinner**: Loading state visualization
     - **ErrorDisplay**: User-friendly error messages

### 4. **Application Layer** (`app.js`)
   - Orchestrates all components
   - Manages application state
   - Coordinates component interactions

### 5. **Presentation Layer** (`styles/`)
   - Modern, responsive CSS
   - CSS variables for easy theming
   - Mobile-first design approach

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **Rust Backend** running on `http://localhost:8080`

## Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Usage

### Development Mode

Run the application in development mode with hot reload:

```bash
npm run dev
```

This will:
- Start the webpack dev server
- Open the application in your default browser
- Watch for file changes and reload automatically
- Server runs on `http://localhost:3000`

### Production Build

Build the application for production:

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

### Start (Development Server)

```bash
npm start
```

Starts the development server and opens the browser automatically.

## Backend Configuration

By default, the frontend expects the Rust backend to be running on `http://localhost:8080`.

To change this, edit the configuration in `src/config/api.config.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://your-backend-url:port',
  // ... other settings
};
```

## API Endpoints Used

The frontend communicates with these backend endpoints:

- **GET** `/health` - Check backend status
- **POST** `/encrypt` - Upload and encrypt an image

## How It Works

1. **Upload**: User selects or drags an image into the upload area
2. **Preview**: The image is previewed locally before sending
3. **Encrypt**: User clicks "Encrypt Image" button
4. **Processing**: Image is sent to the Rust backend via REST API
5. **Result**: Encrypted image is received and displayed
6. **Download**: User can download the encrypted image

## Supported Image Formats

- JPEG/JPG
- PNG
- GIF
- WebP

**Maximum file size**: 50MB

## Error Handling

The application handles various error scenarios:

- **Network Errors**: Backend not reachable
- **Server Errors**: Backend processing failures
- **Client Errors**: Invalid file format, file too large
- **Validation Errors**: Missing file, invalid input

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Backend Offline Error

**Problem**: "Cannot connect to server" message appears

**Solution**:
1. Ensure the Rust backend is running:
   ```bash
   cd ../Elhaykal-service
   cargo run
   ```
2. Check the backend is listening on port 8080
3. Verify the API_CONFIG.BASE_URL in `src/config/api.config.js`

### CORS Errors

**Problem**: Browser console shows CORS errors

**Solution**: The Rust backend includes CORS middleware. Ensure it's properly configured in `src/api.rs`.

### Build Errors

**Problem**: npm build fails

**Solution**:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Ensure Node.js version is 16+

## Development Tips

- **Hot Reload**: Changes to JS/CSS files trigger automatic reload
- **Console Logging**: Check browser console for detailed error messages
- **Network Tab**: Use browser DevTools Network tab to inspect API calls
- **Component Testing**: Each component can be tested independently

## Future Enhancements

- [ ] Batch image encryption
- [ ] Progress bar for large files
- [ ] Image format conversion options
- [ ] Encryption strength settings
- [ ] History of encrypted images
- [ ] User authentication

## License

MIT

## Support

For issues or questions, please check:
1. Backend server is running
2. API configuration is correct
3. Browser console for error messages
