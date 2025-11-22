# How to Test P2P Image Sharing Implementation

## Overview

The server-side P2P image sharing infrastructure is **fully implemented and ready for testing**. Here's how to test it before implementing the client.

---

## 🎯 Testing Approach

Since the Rust client isn't updated yet, we'll test the server using:
1. **grpcurl** - Command-line gRPC client
2. **Firebase Console** - Visual verification of data
3. **Automated test script** - Quick validation

---

## 📋 Pre-Testing Checklist

- [ ] Firebase project created
- [ ] Firestore Database enabled
- [ ] Service account key downloaded as `firebase-config.json`
- [ ] `grpcurl` installed (`sudo apt install grpcurl`)
- [ ] Server builds without errors (`cargo build`)

---

## 🚀 Quick Test (5 minutes)

### 1. Start the Server
```bash
cd /home/amal-fouda/Desktop/basic_linux_cluster/Elhaykal-service
cargo run
```

**Look for:**
```
[Firebase] Successfully connected to Firebase
[PeerDiscovery] Starting server on 0.0.0.0:50071
[ImageSharing] Starting server on 0.0.0.0:50072
```

### 2. Run Automated Tests (in new terminal)
```bash
cd /home/amal-fouda/Desktop/basic_linux_cluster
./test_p2p.sh
```

**Expected output:**
```
✓ Alice registered successfully
✓ Bob registered successfully
✓ Charlie registered successfully
✓ All clients listed successfully
✓ Request created successfully
✓ Bob can see Alice's request
✓ Response sent
✓ Charlie successfully removed from list
```

### 3. Verify in Firebase Console

Open: https://console.firebase.google.com

**Check Firestore Database:**

**Collection: `clients`**
```
Document: alice
  - username: "alice"
  - ip: "192.168.1.100"
  - port: 50070
  - status: "online"
  - last_seen: <timestamp>

Document: bob
  - username: "bob"
  - ip: "192.168.1.101"
  - port: 50070
  - status: "online"
  - last_seen: <timestamp>

Document: charlie (should be offline)
  - status: "offline"
```

**Collection: `image_requests`**
```
Document: <uuid>
  - requester: "alice"
  - target: "bob"
  - job_id: "job_001"
  - status: "accepted"
  - timestamp: <number>
  - response_timestamp: <number>
```

---

## 🔬 Detailed Testing

For comprehensive manual testing with specific scenarios, follow:

### [QUICK_START.md](QUICK_START.md)
- 5-minute setup guide
- Basic validation

### [TESTING_GUIDE.md](TESTING_GUIDE.md)
- Complete testing procedures
- All gRPC commands
- Troubleshooting guide
- Timeout testing
- Edge cases

---

## 🧪 Test Scenarios Covered

### ✅ Peer Discovery Service (Port 50071)

| Test | Command | Expected Result |
|------|---------|-----------------|
| Register Client | `RegisterClient` | Client added to Firebase |
| List Clients | `ListOnlineClients` | Returns all online clients |
| Heartbeat | `UpdateHeartbeat` | Updates last_seen timestamp |
| Unregister | `UnregisterClient` | Sets status to "offline" |

### ✅ Image Sharing Service (Port 50072)

| Test | Command | Expected Result |
|------|---------|-----------------|
| Create Request | `RequestPeerImage` | Request created in Firebase |
| Get Pending | `GetPendingRequests` | Returns pending requests for user |
| Accept Request | `RespondToRequest` (true) | Status → "accepted" |
| Refuse Request | `RespondToRequest` (false) | Status → "refused" |
| Fetch (Accepted) | `FetchSharedImage` | Returns original image |
| Fetch (Refused) | `FetchSharedImage` | Returns encrypted image |
| Timeout | Wait 5 min | Status → "timeout" |

### ✅ Database Integration

| Test | Verification | Expected Result |
|------|--------------|-----------------|
| Store Images | Check SQLite | Both original & encrypted stored |
| Username Tracking | Query by username | Jobs associated with users |
| Job Retrieval | `get_job_by_id` | Returns JobWithImages |

---

## 📊 What You Can Test NOW

### Without Real Images:
- ✅ Client registration/discovery
- ✅ Image request creation
- ✅ Consent workflow (accept/refuse)
- ✅ Firebase data synchronization
- ✅ Heartbeat mechanism
- ✅ Client online/offline tracking

### Requires Image Submission:
- ⚠️ Fetching actual original images
- ⚠️ Fetching encrypted images
- ⚠️ Comparing original vs encrypted

**To test image fetching:**
1. Build and run existing Rust/Python client
2. Submit a job with a username
3. Wait for processing to complete
4. Use grpcurl to request and fetch the image
5. Decode base64 to verify image data

---

## 🎨 Example: Test Full Image Flow

### Step 1: Submit Image Job (using existing client)

```bash
cd /home/amal-fouda/Desktop/basic_linux_cluster/Elhaykal-client

# First, update client to include username
# For now, you can manually add username field in job submission

# Or use Python client and manually add username to JobRequest
```

### Step 2: Create Sharing Request

```bash
grpcurl -plaintext \
  -import-path ./Elhaykal-service/proto \
  -proto image_sharing.proto \
  -d '{
    "requester_username": "alice",
    "target_username": "bob",
    "job_id": "job_12345"
  }' \
  localhost:50072 \
  image_sharing.ImageSharing/RequestPeerImage
```

### Step 3: Accept Request

```bash
# Copy request_id from previous response
grpcurl -plaintext \
  -import-path ./Elhaykal-service/proto \
  -proto image_sharing.proto \
  -d '{
    "request_id": "<request_id_here>",
    "responder_username": "bob",
    "consent_granted": true
  }' \
  localhost:50072 \
  image_sharing.ImageSharing/RespondToRequest
```

### Step 4: Fetch Image

```bash
grpcurl -plaintext \
  -import-path ./Elhaykal-service/proto \
  -proto image_sharing.proto \
  -d '{
    "request_id": "<request_id_here>",
    "requester_username": "alice"
  }' \
  localhost:50072 \
  image_sharing.ImageSharing/FetchSharedImage > response.json

# Extract and decode image
cat response.json | jq -r '.image_data' | base64 -d > shared_image.png
```

---

## 📈 Testing Progress Tracker

```
Server Implementation:
[████████████████████] 100% Complete

Testing Coverage:
[████████████████░░░░]  80% (missing real image tests)

Client Implementation:
[░░░░░░░░░░░░░░░░░░░░]   0% Not started

Integration Testing:
[░░░░░░░░░░░░░░░░░░░░]   0% Waiting for client
```

---

## 🔍 Monitoring & Debugging

### Server Logs
Watch server console for:
- `[PeerDiscovery]` - Client registration events
- `[ImageSharing]` - Request/response events
- `[JobQueue]` - Image storage confirmations
- `[Firebase]` - Connection status

### Firebase Console
Monitor in real-time:
- **Firestore** → See data updates live
- **Usage** → Check read/write quotas

### Database Queries
```bash
cd /home/amal-fouda/Desktop/basic_linux_cluster/Elhaykal-service

# Check stored images
sqlite3 cluster_jobs.db "
  SELECT
    job_id,
    username,
    filename,
    status,
    length(original_image) as orig_size,
    length(encrypted_image) as enc_size
  FROM jobs
  WHERE username IS NOT NULL;
"
```

---

## ✅ Success Criteria

Your implementation passes if:

1. ✅ Server starts with Firebase connection
2. ✅ Test script runs without errors
3. ✅ Firebase shows correct client data
4. ✅ Requests are created and tracked
5. ✅ Consent workflow works (accept/refuse)
6. ✅ Database stores username and both images
7. ✅ grpcurl commands return expected responses

---

## 🐛 Common Issues & Solutions

### Firebase connection fails
**Solution:** Check `firebase-config.json` path and JSON validity

### "No such collection"
**Solution:** Normal on first run. Collection created on first write.

### "Request not found"
**Solution:** Check that request_id is correct (copy from create response)

### Empty client list
**Solution:** Clients expire after 60s. Re-register or reduce timeout.

### "Job manager not available"
**Solution:** Wait a few seconds for job manager to initialize

---

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Complete testing procedures
- **[P2P_IMPLEMENTATION_STATUS.md](P2P_IMPLEMENTATION_STATUS.md)** - What's implemented
- **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Firebase configuration
- **test_p2p.sh** - Automated test script

---

## 🎯 Next: Client Implementation

After server testing is validated:

1. Update Rust client to support usernames
2. Add Firebase listener for incoming requests
3. Implement CLI commands for P2P operations
4. Test full end-to-end workflow

See [P2P_IMPLEMENTATION_STATUS.md](P2P_IMPLEMENTATION_STATUS.md) for client implementation plan.

---

## 💡 Tips

- Keep Firebase Console open while testing to see real-time updates
- Use `jq` to pretty-print JSON responses: `grpcurl ... | jq`
- Save request_ids for later use: `REQUEST_ID=$(grpcurl ... | jq -r '.request_id')`
- Test edge cases: duplicate usernames, missing jobs, expired requests

---

**Ready to test?** Start with [QUICK_START.md](QUICK_START.md)! 🚀
