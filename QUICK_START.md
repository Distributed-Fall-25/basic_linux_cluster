# Quick Start Guide - P2P Image Sharing Testing

## 🚀 5-Minute Setup

### Step 1: Firebase Setup (3 minutes)

1. **Go to** [https://console.firebase.google.com](https://console.firebase.google.com)
2. **Click** "Add project"
3. **Enter** a project name (e.g., "cluster-p2p-test")
4. **Disable** Google Analytics → Click "Create"
5. **Go to** "Firestore Database" → Click "Create database"
6. **Select** "Start in test mode" → Choose a region → Enable
7. **Go to** Project Settings (⚙️) → Service Accounts tab
8. **Click** "Generate new private key" → Confirm
9. **Save** the downloaded JSON file as:
   ```bash
   /home/amal-fouda/Desktop/basic_linux_cluster/firebase-config.json
   ```

### Step 2: Build & Run Server (1 minute)

```bash
cd /home/amal-fouda/Desktop/basic_linux_cluster/Elhaykal-service
cargo build --release
cargo run
```

**Wait for:** `[Firebase] Successfully connected to Firebase`

### Step 3: Run Tests (1 minute)

Open a **new terminal**:

```bash
cd /home/amal-fouda/Desktop/basic_linux_cluster

# Install grpcurl if not already installed
sudo apt install grpcurl -y

# Run the automated test
./test_p2p.sh
```

---

## ✅ What the Test Does

The automated test script will:

1. ✅ Register 3 clients: Alice, Bob, Charlie
2. ✅ List all online clients
3. ✅ Update Alice's heartbeat
4. ✅ Create image sharing request (Alice → Bob)
5. ✅ Check Bob's pending requests
6. ✅ Bob accepts Alice's request
7. ✅ Unregister Charlie
8. ✅ Verify Charlie is removed

---

## 📊 Verify in Firebase Console

While tests are running, open Firebase Console:

1. Go to **Firestore Database**
2. You should see two collections:
   - **`clients`** - Contains alice, bob, charlie
   - **`image_requests`** - Contains the sharing request

Click on each document to see the data!

---

## 🐛 Troubleshooting

### "grpcurl: command not found"
```bash
sudo apt update
sudo apt install grpcurl
```

### "Server is not running"
Make sure the server is running in another terminal:
```bash
cd Elhaykal-service
cargo run
```

### "Failed to connect to Firebase"
Check that `firebase-config.json` is in the project root:
```bash
ls -la /home/amal-fouda/Desktop/basic_linux_cluster/firebase-config.json
```

If missing, re-download from Firebase Console → Project Settings → Service Accounts

### "node is not current leader"
Wait 10 seconds for leader election, then retry.

---

## 🎯 Manual Testing

For detailed manual testing with grpcurl commands, see:
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Complete testing instructions
- **[P2P_IMPLEMENTATION_STATUS.md](P2P_IMPLEMENTATION_STATUS.md)** - Implementation details

---

## 📝 Example Manual Commands

### List Online Clients
```bash
grpcurl -plaintext \
  -import-path ./Elhaykal-service/proto \
  -proto peer_discovery.proto \
  -d '{}' \
  localhost:50071 \
  peer_discovery.PeerDiscovery/ListOnlineClients
```

### Create Image Request
```bash
grpcurl -plaintext \
  -import-path ./Elhaykal-service/proto \
  -proto image_sharing.proto \
  -d '{
    "requester_username": "alice",
    "target_username": "bob",
    "job_id": "job_001"
  }' \
  localhost:50072 \
  image_sharing.ImageSharing/RequestPeerImage
```

### Check Pending Requests
```bash
grpcurl -plaintext \
  -import-path ./Elhaykal-service/proto \
  -proto image_sharing.proto \
  -d '{"username": "bob"}' \
  localhost:50072 \
  image_sharing.ImageSharing/GetPendingRequests
```

---

## 🎉 Success Criteria

Your implementation is working if:

- ✅ Server starts without Firebase errors
- ✅ Test script completes without errors
- ✅ Firebase Console shows `clients` collection with 3 users
- ✅ Firebase Console shows `image_requests` collection with requests
- ✅ All gRPC commands return valid responses

---

## 🔜 Next Steps

Once server testing is complete:

1. **Implement Rust Client** with username support
2. **Add CLI Commands** for P2P operations
3. **Test Full Workflow** with real clients and images
4. **Deploy** to your cluster

For implementation details, see [P2P_IMPLEMENTATION_STATUS.md](P2P_IMPLEMENTATION_STATUS.md)

---

## 📚 Documentation Index

- **QUICK_START.md** (this file) - Get started in 5 minutes
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Comprehensive testing guide
- **[P2P_IMPLEMENTATION_STATUS.md](P2P_IMPLEMENTATION_STATUS.md)** - What's implemented
- **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Detailed Firebase setup
- **test_p2p.sh** - Automated test script
