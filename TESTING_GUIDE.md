# Testing Guide for P2P Image Sharing Implementation

## Prerequisites

Before testing, you need to:

1. **Set up Firebase Project**
2. **Configure the Server**
3. **Install Testing Tools**

---

## Step 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name (e.g., "linux-cluster-p2p")
4. Disable Google Analytics (optional)
5. Click "Create project"

### 1.2 Enable Firestore Database

1. In Firebase Console, navigate to **Firestore Database**
2. Click "Create database"
3. Choose **"Start in test mode"** (for development)
4. Select a region (choose closest to you)
5. Click "Enable"

### 1.3 Set Firestore Security Rules

In Firestore > Rules tab, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for testing (INSECURE - for development only!)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Click "Publish"

### 1.4 Generate Service Account Key

1. Go to **Project Settings** (gear icon) > **Service Accounts**
2. Click "Generate new private key"
3. Click "Generate key" (downloads JSON file)
4. Save the file as `firebase-config.json` in your project root:
   ```bash
   mv ~/Downloads/your-project-xxxxx.json /home/amal-fouda/Desktop/basic_linux_cluster/firebase-config.json
   ```

---

## Step 2: Build and Run the Server

### 2.1 Build the Server

```bash
cd /home/amal-fouda/Desktop/basic_linux_cluster/Elhaykal-service
cargo build --release
```

Expected output: Should compile without errors (warnings are OK)

### 2.2 Run the Server

```bash
cd /home/amal-fouda/Desktop/basic_linux_cluster/Elhaykal-service
cargo run
```

**Expected console output:**
```
[Firebase] Successfully connected to Firebase
[PeerDiscovery] Starting server on 0.0.0.0:50071
[ImageSharing] Starting server on 0.0.0.0:50072
[GRPC] starting job server on 0.0.0.0:50060
[GRPC] starting job sync server on 0.0.0.0:50052
[Discovery] UDP multicast listener started
...
```

If you see `[Firebase] Warning: Failed to initialize Firebase`, check that `firebase-config.json` is in the correct location.

---

## Step 3: Install Testing Tools

We'll use `grpcurl` to test gRPC services.

### 3.1 Install grpcurl

```bash
# Ubuntu/Debian
sudo apt install grpcurl

# Or using Go
go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest
```

### 3.2 Enable gRPC Reflection (Optional)

For easier testing, we could add gRPC reflection to the server. For now, we'll use proto files directly.

---

## Step 4: Manual Testing with grpcurl

Since we don't have reflection enabled, we'll need to point grpcurl to the proto files.

### 4.1 Test PeerDiscovery Service

#### Register a Client

```bash
cd /home/amal-fouda/Desktop/basic_linux_cluster/Elhaykal-service

grpcurl -plaintext \
  -import-path ./proto \
  -proto peer_discovery.proto \
  -d '{
    "username": "alice",
    "ip": "192.168.1.100",
    "port": 50070
  }' \
  localhost:50071 \
  peer_discovery.PeerDiscovery/RegisterClient
```

**Expected response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "client_id": "alice"
}
```

#### Check Firebase

1. Go to Firebase Console > Firestore Database
2. You should see a new collection: `clients`
3. Document `alice` should exist with fields:
   - `username`: "alice"
   - `ip`: "192.168.1.100"
   - `port`: 50070
   - `status`: "online"
   - `last_seen`: (timestamp)

#### Register More Clients

```bash
# Register Bob
grpcurl -plaintext \
  -import-path ./proto \
  -proto peer_discovery.proto \
  -d '{
    "username": "bob",
    "ip": "192.168.1.101",
    "port": 50070
  }' \
  localhost:50071 \
  peer_discovery.PeerDiscovery/RegisterClient

# Register Charlie
grpcurl -plaintext \
  -import-path ./proto \
  -proto peer_discovery.proto \
  -d '{
    "username": "charlie",
    "ip": "192.168.1.102",
    "port": 50070
  }' \
  localhost:50071 \
  peer_discovery.PeerDiscovery/RegisterClient
```

#### List Online Clients

```bash
grpcurl -plaintext \
  -import-path ./proto \
  -proto peer_discovery.proto \
  -d '{}' \
  localhost:50071 \
  peer_discovery.PeerDiscovery/ListOnlineClients
```

**Expected response:**
```json
{
  "clients": [
    {
      "username": "alice",
      "ip": "192.168.1.100",
      "port": 50070
    },
    {
      "username": "bob",
      "ip": "192.168.1.101",
      "port": 50070
    },
    {
      "username": "charlie",
      "ip": "192.168.1.102",
      "port": 50070
    }
  ],
  "total_count": 3
}
```

#### Update Heartbeat

```bash
grpcurl -plaintext \
  -import-path ./proto \
  -proto peer_discovery.proto \
  -d '{
    "username": "alice",
    "ip": "192.168.1.100",
    "port": 50070
  }' \
  localhost:50071 \
  peer_discovery.PeerDiscovery/UpdateHeartbeat
```

#### Unregister a Client

```bash
grpcurl -plaintext \
  -import-path ./proto \
  -proto peer_discovery.proto \
  -d '{
    "username": "charlie",
    "ip": "192.168.1.102",
    "port": 50070
  }' \
  localhost:50071 \
  peer_discovery.PeerDiscovery/UnregisterClient
```

Now listing clients should only show Alice and Bob.

---

## Step 5: Test Image Submission with Username

### 5.1 Submit a Test Image Job

First, we need to create a test image file:

```bash
cd /home/amal-fouda/Desktop/basic_linux_cluster

# Create a small test image (100x100 red square)
convert -size 100x100 xc:red test_image.png

# Convert to base64 for gRPC
base64 test_image.png > test_image_base64.txt
```

Now submit the job with username:

```bash
# Get the base64 data (remove newlines)
IMAGE_DATA=$(base64 test_image.png | tr -d '\n')

grpcurl -plaintext \
  -import-path ./Elhaykal-service/proto \
  -proto job.proto \
  -d "{
    \"job_id\": \"job_001\",
    \"filename\": \"test_image.png\",
    \"image_data\": \"$IMAGE_DATA\",
    \"client_ip\": \"127.0.0.1\",
    \"client_port\": 50070,
    \"username\": \"alice\"
  }" \
  localhost:50060 \
  job.Leader/SubmitImage
```

**Note**: This will fail if no leader is elected yet. Wait a few seconds and try again.

### 5.2 Verify Image Storage

After the job completes, check the database:

```bash
cd /home/amal-fouda/Desktop/basic_linux_cluster/Elhaykal-service

sqlite3 cluster_jobs.db "SELECT job_id, username, filename, status, length(original_image), length(encrypted_image) FROM jobs WHERE job_id='job_001';"
```

**Expected output:**
```
job_001|alice|test_image.png|Done|<original_size>|<encrypted_size>
```

Both `original_image` and `encrypted_image` should have byte sizes > 0.

---

## Step 6: Test Image Sharing Flow

### 6.1 Create an Image Request

Alice wants to see Bob's image:

```bash
grpcurl -plaintext \
  -import-path ./Elhaykal-service/proto \
  -proto image_sharing.proto \
  -d '{
    "requester_username": "alice",
    "target_username": "bob",
    "job_id": "job_002"
  }' \
  localhost:50072 \
  image_sharing.ImageSharing/RequestPeerImage
```

**Expected response:**
```json
{
  "success": true,
  "message": "Request created successfully",
  "request_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Save the request_id for next steps!**

### 6.2 Check Firebase for Request

1. Go to Firebase Console > Firestore Database
2. You should see a new collection: `image_requests`
3. Find the document with the returned request_id
4. Fields should be:
   - `requester`: "alice"
   - `target`: "bob"
   - `job_id`: "job_002"
   - `status`: "pending"
   - `timestamp`: (number)

### 6.3 Get Pending Requests (Bob's perspective)

```bash
grpcurl -plaintext \
  -import-path ./Elhaykal-service/proto \
  -proto image_sharing.proto \
  -d '{
    "username": "bob"
  }' \
  localhost:50072 \
  image_sharing.ImageSharing/GetPendingRequests
```

**Expected response:**
```json
{
  "requests": [
    {
      "request_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "requester_username": "alice",
      "target_username": "bob",
      "job_id": "job_002",
      "timestamp": 1234567890
    }
  ]
}
```

### 6.4 Bob Accepts the Request

```bash
grpcurl -plaintext \
  -import-path ./Elhaykal-service/proto \
  -proto image_sharing.proto \
  -d '{
    "request_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "responder_username": "bob",
    "consent_granted": true
  }' \
  localhost:50072 \
  image_sharing.ImageSharing/RespondToRequest
```

**Check Firebase**: Status should now be "accepted"

### 6.5 Alice Fetches the Image

```bash
grpcurl -plaintext \
  -import-path ./Elhaykal-service/proto \
  -proto image_sharing.proto \
  -d '{
    "request_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "requester_username": "alice"
  }' \
  localhost:50072 \
  image_sharing.ImageSharing/FetchSharedImage
```

**Expected response:**
```json
{
  "success": true,
  "message": "Image retrieved successfully",
  "image_data": "<base64_encoded_original_image>",
  "filename": "test_image.png",
  "is_encrypted": false,
  "consent_status": "accepted"
}
```

**Verify**: `is_encrypted` should be `false` (original image sent)

### 6.6 Test Refused Consent

Create a new request and refuse it:

```bash
# Create request
grpcurl -plaintext \
  -import-path ./Elhaykal-service/proto \
  -proto image_sharing.proto \
  -d '{
    "requester_username": "alice",
    "target_username": "bob",
    "job_id": "job_002"
  }' \
  localhost:50072 \
  image_sharing.ImageSharing/RequestPeerImage

# Bob refuses (use the new request_id)
grpcurl -plaintext \
  -import-path ./Elhaykal-service/proto \
  -proto image_sharing.proto \
  -d '{
    "request_id": "<new_request_id>",
    "responder_username": "bob",
    "consent_granted": false
  }' \
  localhost:50072 \
  image_sharing.ImageSharing/RespondToRequest

# Alice fetches (should get encrypted image)
grpcurl -plaintext \
  -import-path ./Elhaykal-service/proto \
  -proto image_sharing.proto \
  -d '{
    "request_id": "<new_request_id>",
    "requester_username": "alice"
  }' \
  localhost:50072 \
  image_sharing.ImageSharing/FetchSharedImage
```

**Expected**: `is_encrypted` should be `true` (steganography image sent)

---

## Step 7: Test Timeout Behavior

### 7.1 Create Request and Wait

```bash
grpcurl -plaintext \
  -import-path ./Elhaykal-service/proto \
  -proto image_sharing.proto \
  -d '{
    "requester_username": "alice",
    "target_username": "bob",
    "job_id": "job_002"
  }' \
  localhost:50072 \
  image_sharing.ImageSharing/RequestPeerImage
```

### 7.2 Don't Respond for 5+ Minutes

Wait 5 minutes (or temporarily change timeout in firebase.rs to 30 seconds for faster testing).

### 7.3 Check Status

After timeout period, the Firebase cleanup function should mark it as "timeout". Check Firebase Console.

---

## Troubleshooting

### Issue: Firebase connection fails

**Check:**
1. `firebase-config.json` is in the correct location
2. JSON file is valid (no syntax errors)
3. Firestore is enabled in Firebase Console
4. Service account has proper permissions

### Issue: "node is not current leader"

**Solution:**
1. Wait 5-10 seconds for leader election to complete
2. Check server logs for `[Election] I am the new leader`
3. Try submitting job again

### Issue: grpcurl command not found

**Solution:**
```bash
sudo apt update
sudo apt install grpcurl
```

Or use Docker:
```bash
docker run --rm -it -v $(pwd):/proto fullstorydev/grpcurl:latest -plaintext ...
```

### Issue: Can't find proto files

**Solution:**
Make sure you're running grpcurl from the correct directory:
```bash
cd /home/amal-fouda/Desktop/basic_linux_cluster/Elhaykal-service
```

---

## Quick Test Script

Create a test script to automate basic testing:

```bash
#!/bin/bash
# test_p2p.sh

cd /home/amal-fouda/Desktop/basic_linux_cluster/Elhaykal-service

echo "=== Testing Peer Discovery ==="

echo "Registering Alice..."
grpcurl -plaintext -import-path ./proto -proto peer_discovery.proto \
  -d '{"username": "alice", "ip": "192.168.1.100", "port": 50070}' \
  localhost:50071 peer_discovery.PeerDiscovery/RegisterClient

echo "Registering Bob..."
grpcurl -plaintext -import-path ./proto -proto peer_discovery.proto \
  -d '{"username": "bob", "ip": "192.168.1.101", "port": 50070}' \
  localhost:50071 peer_discovery.PeerDiscovery/RegisterClient

echo "Listing online clients..."
grpcurl -plaintext -import-path ./proto -proto peer_discovery.proto \
  -d '{}' \
  localhost:50071 peer_discovery.PeerDiscovery/ListOnlineClients

echo "=== Testing Image Requests ==="

echo "Creating request..."
grpcurl -plaintext -import-path ./proto -proto image_sharing.proto \
  -d '{"requester_username": "alice", "target_username": "bob", "job_id": "job_001"}' \
  localhost:50072 image_sharing.ImageSharing/RequestPeerImage

echo "Done! Check Firebase Console for results."
```

Make it executable and run:
```bash
chmod +x test_p2p.sh
./test_p2p.sh
```

---

## Next Steps After Testing

Once server testing is complete:
1. Implement Rust client with Firebase integration
2. Add CLI commands for P2P operations
3. Test full end-to-end workflow with real clients
4. Add error handling and edge cases
5. Implement Python GUI client (optional)

---

## Monitoring Firebase

While testing, keep Firebase Console open to monitor:
- **Firestore Database** > `clients` collection (online users)
- **Firestore Database** > `image_requests` collection (pending/accepted/refused requests)
- **Usage** tab (to monitor read/write quotas)
