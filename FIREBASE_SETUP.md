# Firebase Setup Guide

## Prerequisites
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database in your Firebase project
3. Generate a service account key

## Steps

### 1. Create Firebase Project
- Go to Firebase Console
- Click "Add project"
- Enter project name
- Enable/disable Google Analytics as needed

### 2. Enable Firestore
- In Firebase Console, navigate to "Firestore Database"
- Click "Create database"
- Choose "Start in production mode" or "test mode"
- Select a region

### 3. Generate Service Account Key
- Go to Project Settings > Service Accounts
- Click "Generate new private key"
- Save the JSON file securely

### 4. Configure This Project
- Copy `firebase-config.json.template` to `firebase-config.json`
- Replace values with your Firebase project details
- Add `firebase-config.json` to `.gitignore` (already done)

### 5. Firestore Database Structure

The application uses the following Firestore collections:

```
/clients/{username}
  - ip: string
  - port: number
  - status: "online" | "offline"
  - last_seen: timestamp
  - registered_at: timestamp

/image_requests/{request_id}
  - requester: string (username)
  - target: string (username)
  - job_id: string
  - status: "pending" | "accepted" | "refused" | "timeout"
  - timestamp: number
  - response_timestamp: number (optional)
```

### 6. Firestore Security Rules

Set these rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to clients collection
    match /clients/{username} {
      allow read: if true;
      allow write: if true;
    }

    // Allow read/write to image_requests collection
    match /image_requests/{requestId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

**Note:** These are permissive rules for development. Tighten them for production.

### 7. Environment Variable (Optional)
Instead of using a config file, you can set:
```bash
export FIREBASE_CONFIG_PATH=/path/to/firebase-config.json
```

## Testing Connection
After setup, the server will automatically connect to Firebase on startup and log the connection status.
