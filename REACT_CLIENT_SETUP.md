# React Client Setup Guide

## Complete Setup Instructions for the Web UI

### Overview

The React client provides a beautiful web interface for:
- Uploading images for processing
- Discovering online peers
- Requesting and sharing images with consent
- Real-time updates via Firebase

---

## Step 1: Install Node.js

### Ubuntu/Debian

```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x
```

---

## Step 2: Install Dependencies

```bash
cd /home/amal-fouda/Desktop/basic_linux_cluster/react-client
npm install
```

This will install:
- React 18
- Firebase SDK
- UUID generator
- Axios (HTTP client)

---

## Step 3: Firebase Project Setup

### 3.1 Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Enter project name: "cluster-p2p-web"
4. Disable Google Analytics (optional)
5. Click "Create project"

### 3.2 Enable Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode"
4. Select your region
5. Click "Enable"

### 3.3 Register Web App

1. In Firebase Console, click the Web icon (</>) to add a web app
2. Enter app nickname: "React Client"
3. **DO NOT** check "Firebase Hosting" for now
4. Click "Register app"
5. Copy the configuration object (you'll need this next)

---

## Step 4: Configure Environment Variables

### 4.1 Create .env File

```bash
cd /home/amal-fouda/Desktop/basic_linux_cluster/react-client
cp .env.template .env
```

### 4.2 Fill in Firebase Config

Open `.env` and replace with your Firebase config values:

```env
# From Firebase Console → Project Settings → General → Your apps
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123

# Server URLs (keep as-is for local development)
REACT_APP_SERVER_URL=http://localhost:50060
REACT_APP_PEER_DISCOVERY_URL=http://localhost:50071
REACT_APP_IMAGE_SHARING_URL=http://localhost:50072
```

### 4.3 Set Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{username} {
      allow read, write: if true;
    }

    match /image_requests/{requestId} {
      allow read, write: if true;
    }
  }
}
```

Click "Publish"

---

## Step 5: Add REST Endpoints to Server (IMPORTANT!)

The React client uses REST API, but your server uses gRPC. You need to add REST endpoints.

### Option A: Add to Existing API Module

Edit `Elhaykal-service/src/api.rs` and add these endpoints:

```rust
use warp::Filter;

// Add these routes
async fn handle_submit_image(body: SubmitImageRequest) -> Result<impl Reply, Rejection> {
    // Call gRPC service internally
}

async fn handle_list_clients() -> Result<impl Reply, Rejection> {
    // Call Firebase or gRPC service
}

async fn handle_create_request(body: ImageRequestBody) -> Result<impl Reply, Rejection> {
    // Call Firebase
}

// In your routes setup:
let submit = warp::path!("api" / "submit")
    .and(warp::post())
    .and(warp::body::json())
    .and_then(handle_submit_image);

let clients = warp::path!("api" / "clients")
    .and(warp::get())
    .and_then(handle_list_clients);

// ... more routes
```

### Option B: Use CORS Proxy (Quick Solution)

For quick testing, use a CORS proxy:

```bash
npm install -g local-cors-proxy

# Run proxy
lcp --proxyUrl http://localhost:50060
```

Then update `.env`:
```env
REACT_APP_SERVER_URL=http://localhost:8010/proxy
```

---

## Step 6: Start the React App

```bash
cd /home/amal-fouda/Desktop/basic_linux_cluster/react-client
npm start
```

The app will open at: http://localhost:3000

---

## Step 7: Test the Application

### 7.1 Login

1. Open http://localhost:3000
2. Enter a username (e.g., "alice")
3. Click "Join Network"

**Verify**: Check Firebase Console → Firestore → `clients` collection
- Should see a document with your username
- `status` should be "online"

### 7.2 Upload Image

1. Click "Upload Image" tab
2. Select an image file
3. Click "Upload & Process"

**Note**: This will fail until you add REST endpoints (Step 5)

### 7.3 Test with Multiple Users

1. Open http://localhost:3000 in multiple browser tabs/windows
2. Login with different usernames in each
3. Go to "Online Peers" tab
4. You should see other users listed in real-time

### 7.4 Test Image Sharing

1. In Browser 1 (Alice):
   - Upload an image
   - Note the job ID

2. In Browser 2 (Bob):
   - Go to "Online Peers"
   - Select Alice
   - Enter the job ID
   - Click "Send Request"

3. In Browser 1 (Alice):
   - Go to "Requests" tab
   - Should see Bob's request
   - Click "Accept" or "Refuse"

4. In Browser 2 (Bob):
   - Should receive the image (original or encrypted)

---

## Troubleshooting

### Issue: "Failed to connect to Firebase"

**Solution**:
1. Check `.env` file has correct Firebase config
2. Verify Firestore is enabled in Firebase Console
3. Check browser console for detailed error
4. Try clearing browser cache

### Issue: "Network request failed"

**Solution**:
1. Ensure cluster server is running
2. Check server URLs in `.env`
3. Verify CORS settings
4. Add REST endpoints to server (Step 5)

### Issue: "Peers not showing up"

**Solution**:
1. Check Firestore security rules
2. Verify Firebase connection
3. Check browser console for errors
4. Refresh the page

### Issue: npm install fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## Architecture Overview

```
┌─────────────────┐
│   React App     │
│  (Browser)      │
└────────┬────────┘
         │
         ├─────────► Firebase Firestore
         │           (Real-time data)
         │
         └─────────► Cluster Server
                     (REST API needed)
                     │
                     ├── Upload images
                     ├── Request images
                     └── Fetch results
```

---

## Features

### ✅ Implemented

- User registration and login
- Firebase real-time listeners
- Peer discovery
- Image upload UI
- Request/response UI
- Consent management UI
- Image gallery
- Responsive design
- Heartbeat system

### ⚠️ Requires Server REST Endpoints

- Actual image upload
- Image fetching
- Job status tracking

### 🔜 Future Enhancements

- User authentication
- Image caching
- Push notifications
- Dark mode
- Mobile responsive improvements

---

## Development Tips

### Hot Reload

Changes to React files automatically reload the browser.

### Debug Mode

Open browser DevTools (F12):
- **Console**: See logs and errors
- **Network**: Monitor API calls
- **Application**: View Firebase data

### Firebase Debugging

In browser console:
```javascript
// Check Firestore connection
firebase.firestore().collection('clients').get()
  .then(snap => console.log('Clients:', snap.docs.map(d => d.data())))
```

---

## Production Deployment

### Build for Production

```bash
npm run build
```

Creates optimized build in `build/` directory.

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy
```

Your app will be live at: `https://your-project.firebaseapp.com`

---

## Security Best Practices

1. **Use Environment Variables**
   - Never commit `.env` to git
   - Use different configs for dev/prod

2. **Tighten Firestore Rules**
   - Add user authentication
   - Restrict write access
   - Validate data

3. **Enable HTTPS**
   - Use Firebase Hosting or similar
   - Enforce secure connections

4. **Sanitize Inputs**
   - Validate file types
   - Limit file sizes
   - Check usernames

---

## Next Steps

1. ✅ Complete this setup
2. Add REST endpoints to server (see Step 5)
3. Test full workflow with multiple users
4. Deploy to production
5. Add authentication
6. Implement remaining features

---

## Support

For issues:
1. Check browser console for errors
2. Check Firebase Console for data
3. Verify server is running
4. Review [TESTING_GUIDE.md](TESTING_GUIDE.md)

**Ready to start?** Run `npm start` and open http://localhost:3000! 🚀
