# React Client for P2P Image Sharing Cluster

A beautiful, modern web interface for the distributed image processing cluster with peer-to-peer image sharing capabilities.

## Features

- 🎨 **Modern UI** - Clean, responsive design with gradient themes
- 📤 **Image Upload** - Upload images for steganography processing
- 👥 **Peer Discovery** - See online users in real-time
- 📨 **Image Requests** - Request to view other users' images
- ✅ **Consent Management** - Accept or refuse image sharing requests
- 🖼️ **Image Gallery** - View your processed images
- 🔒 **Privacy First** - Original images only shared with consent
- 🔥 **Firebase Integration** - Real-time updates via Firestore

## Prerequisites

- Node.js 14+ and npm
- Firebase project (see setup below)
- Cluster server running

## Quick Start

### 1. Install Dependencies

```bash
cd react-client
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Copy `.env.template` to `.env`:

```bash
cp .env.template .env
```

4. Fill in your Firebase credentials in `.env`

### 3. Get Firebase Config

In Firebase Console:
- Go to Project Settings → General
- Scroll to "Your apps" → Web app
- Copy the config values to `.env`

### 4. Start the Development Server

```bash
npm start
```

The app will open at http://localhost:3000

## Firebase Setup

### Required Collections

The app uses two Firestore collections:

#### `clients` Collection
```javascript
{
  username: "alice",
  ip: "127.0.0.1",
  port: 50070,
  status: "online",
  last_seen: timestamp,
  registered_at: timestamp
}
```

#### `image_requests` Collection
```javascript
{
  request_id: "uuid-here",
  requester: "alice",
  target: "bob",
  job_id: "job_001",
  status: "pending", // or "accepted", "refused", "timeout"
  timestamp: 1234567890,
  response_timestamp: 1234567899
}
```

### Firestore Security Rules

Set these rules in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{username} {
      allow read: if true;
      allow write: if true;
    }

    match /image_requests/{requestId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

⚠️ **Note**: These are permissive rules for development. Tighten them for production!

## Usage

### 1. Login

- Enter a username (3+ characters, alphanumeric + underscores)
- You'll be automatically registered in Firebase

### 2. Upload Images

- Go to "Upload Image" tab
- Select an image (PNG, JPG, BMP, TIFF)
- Click "Upload & Process"
- Server will apply steganography and return encrypted version
- Original stored for P2P sharing

### 3. View Peers

- Go to "Online Peers" tab
- See all connected users in real-time
- Select a peer and enter their job ID
- Send request to view their image

### 4. Respond to Requests

- Go to "Requests" tab
- See incoming requests in real-time
- Accept → Share original image
- Refuse → Share encrypted version

### 5. View Your Images

- Go to "My Images" tab
- See all your processed images
- Copy job IDs to share with peers
- Toggle between original and encrypted views

## Important Notes

### REST Gateway Required

**The React app expects REST endpoints, but the server uses gRPC!**

You have two options:

#### Option A: Add REST Endpoints to Server (Recommended)

Add these endpoints to your Rust server (`api.rs`):

```rust
// POST /api/submit - Submit image job
// GET /api/clients - List online clients
// POST /api/request - Create image request
// POST /api/respond - Respond to request
// POST /api/fetch - Fetch shared image
// GET /api/pending/:username - Get pending requests
```

#### Option B: Use grpc-web

1. Install grpc-web proxy
2. Configure envoy proxy
3. Update React to use grpc-web library

**For now, the app is structured for Option A (REST endpoints).**

## Project Structure

```
react-client/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── LoginComponent.js/css
│   │   ├── ImageUpload.js/css
│   │   ├── PeerList.js/css
│   │   ├── PendingRequests.js/css
│   │   └── ImageGallery.js/css
│   ├── services/
│   │   ├── firebaseService.js
│   │   └── grpcService.js
│   ├── firebaseConfig.js
│   ├── App.js/css
│   ├── index.js/css
│   └── .env
├── package.json
└── README.md
```

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Features in Detail

### Real-Time Updates

- Uses Firebase Firestore onSnapshot listeners
- Peer list updates instantly
- Requests appear in real-time
- No polling needed

### Consent Workflow

1. Alice uploads image → Gets encrypted version
2. Bob requests Alice's image
3. Alice gets notification
4. Alice accepts → Bob receives original
5. Alice refuses → Bob receives encrypted

### Heartbeat System

- Client sends heartbeat every 30 seconds
- Server marks offline after 60 seconds
- Automatic cleanup of stale connections

## Troubleshooting

### Firebase Connection Failed

- Check `.env` file has correct credentials
- Verify Firestore is enabled in Firebase Console
- Check browser console for detailed errors

### Server Connection Failed

- Ensure cluster server is running
- Check server URLs in `.env`
- Verify CORS settings if needed

### Requests Not Appearing

- Check Firestore security rules
- Verify both users are online
- Check browser console for errors

## Production Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Environment Variables

Update `.env` for production:
- Use production Firebase project
- Update server URLs to production endpoints
- Consider adding authentication

## Security Considerations

- Implement proper Firebase authentication
- Tighten Firestore security rules
- Add input validation
- Sanitize user inputs
- Use HTTPS in production
- Implement rate limiting

## Future Enhancements

- [ ] Add user authentication
- [ ] Implement image caching
- [ ] Add chat functionality
- [ ] Support video/file sharing
- [ ] Add notification system
- [ ] Implement search/filter
- [ ] Add dark mode
- [ ] Mobile app version

## License

Part of the Distributed Image Processing Cluster project

## Support

For issues and questions, refer to the main project documentation.
