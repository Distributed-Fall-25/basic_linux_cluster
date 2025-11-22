# P2P Image Sharing Implementation Status

## ✅ Completed - Server Side

### 1. Protocol Buffers Definition
- **Location**: `Elhaykal-service/proto/`
- **Files Created**:
  - `peer_discovery.proto` - Client registration and discovery service
  - `image_sharing.proto` - Image sharing with consent management
  - Updated `job.proto` - Added username field to JobRequest and WorkerJob

### 2. Firebase Integration
- **Location**: `Elhaykal-service/src/firebase.rs`
- **Features**:
  - Client registry management (register, unregister, heartbeat)
  - Online client tracking (60-second timeout)
  - Image request creation and tracking
  - Consent status management (pending, accepted, refused, timeout)
  - Automatic cleanup of old requests (5-minute timeout)

### 3. Database Schema Updates
- **Location**: `Elhaykal-service/src/jobqueue.rs`
- **Changes**:
  - Added `username`, `filename`, `original_image`, `encrypted_image` columns to jobs table
  - New `JobWithImages` struct for storing complete job information
  - Methods: `store_job_images()`, `get_job_by_id()`, `get_jobs_by_username()`

### 4. gRPC Services
- **Location**: `Elhaykal-service/src/peer_services.rs`
- **Services Implemented**:

#### PeerDiscovery Service (Port 50071)
  - `ListOnlineClients` - Get all online clients from Firebase
  - `RegisterClient` - Register client with username
  - `UnregisterClient` - Mark client offline
  - `UpdateHeartbeat` - Keep client marked as online

#### ImageSharing Service (Port 50072)
  - `RequestPeerImage` - Create image sharing request in Firebase
  - `RespondToRequest` - Accept/refuse image sharing request
  - `FetchSharedImage` - Retrieve image based on consent (original or encrypted)
  - `GetPendingRequests` - Get all pending requests for a user

### 5. Image Storage Workflow
- **Location**: `Elhaykal-service/src/grpc.rs`
- **Changes**:
  - Workers now store both original and encrypted (steganography) images in database
  - Images are stored after processing completes
  - Encrypted image sent to client, original kept for P2P sharing

### 6. Dependencies Added
- `firestore = "0.42"`
- `reqwest = "0.12"` (with json features)
- `uuid = "1.0"` (with v4, serde features)

---

## 🚧 TODO - Client Side (Rust Client)

### Client Architecture
The client needs to:
1. Register with Firebase on startup
2. Listen for incoming image sharing requests
3. Provide CLI commands for P2P operations
4. Store username in local configuration file

### Implementation Tasks

#### 1. Client Configuration Management
- **Create**: `Elhaykal-client/client-config.json`
  - Store username, client ID, Firebase connection info
  - Auto-generate on first run

#### 2. Firebase Client Module
- **Create**: `Elhaykal-client/src/firebase_client.rs`
  - Lightweight Firebase REST API client (no heavy dependencies)
  - Listen for image requests targeting this user
  - Polling or long-polling for new requests

#### 3. Username Registration Flow
- **Modify**: `Elhaykal-client/src/main.rs`
  - Prompt for username on first run
  - Register with server via `PeerDiscovery.RegisterClient` RPC
  - Send heartbeat every 30 seconds
  - Unregister on shutdown

#### 4. CLI Commands to Add

```
COMMANDS:
  list-peers                    List all online clients
  request-image <username> <job_id>  Request to view another user's image
  show-requests                 Show pending image requests for you
  respond <request_id> <accept|refuse>  Respond to an image request
  fetch-image <request_id>      Fetch the shared image after consent
```

#### 5. Image Request Listener
- Background task that polls Firebase every 5 seconds
- Shows notifications for new requests
- Prompts user for accept/refuse decision

---

## Flow Diagrams

### Normal Job Submission (Existing)
```
Client --[SubmitImage]--> Leader
  └─ username: "alice"
  └─ image_data: [bytes]

Leader --[ExecuteJob]--> Worker

Worker:
  1. Process image (steganography encryption)
  2. Store original + encrypted in database
  3. Send encrypted image back to client
  4. Notify leader of completion
```

### P2P Image Sharing Flow (New)
```
1. CLIENT A REQUESTS IMAGE FROM CLIENT B
   ClientA --> Server[ImageSharing.RequestPeerImage]
   Server --> Firebase (create request, status=pending)
   Firebase --> ClientB (polling detects new request)

2. CLIENT B RESPONDS
   ClientB prompts: "Alice wants to view your image job_123. Accept? (y/n)"
   User input: y
   ClientB --> Server[ImageSharing.RespondToRequest]
   Server --> Firebase (update status=accepted)

3. CLIENT A FETCHES IMAGE
   ClientA --> Server[ImageSharing.FetchSharedImage]
   Server:
     - Checks Firebase (status=accepted)
     - Retrieves job from database
     - Returns ORIGINAL image (not encrypted)
   ClientA receives and displays image

4. IF CLIENT B REFUSES
   Same flow, but:
   Server:
     - Checks Firebase (status=refused)
     - Retrieves job from database
     - Returns ENCRYPTED (steganography) image
   ClientA receives encrypted version
```

---

## Configuration Files

### Server: firebase-config.json
```json
{
  "project_id": "your-project-id",
  "database_url": "https://your-project.firebaseio.com",
  ...
}
```

### Client: client-config.json (to be created)
```json
{
  "username": "alice",
  "server_host": "localhost",
  "peer_discovery_port": 50071,
  "image_sharing_port": 50072,
  "heartbeat_interval_secs": 30
}
```

---

## Testing Checklist

### Server Tests
- [x] Server builds without errors
- [ ] Firebase connection (requires valid config file)
- [ ] Client registration
- [ ] Image request creation
- [ ] Consent workflow
- [ ] Image retrieval with accepted consent
- [ ] Image retrieval with refused consent (encrypted)
- [ ] Request timeout (5 minutes)
- [ ] Client heartbeat expiry (60 seconds)

### Client Tests (Not Yet Implemented)
- [ ] Client builds without errors
- [ ] Username prompt and registration
- [ ] List online peers
- [ ] Create image request
- [ ] Receive and respond to requests
- [ ] Fetch shared images
- [ ] Heartbeat sending
- [ ] Graceful unregister on exit

---

## Ports Used

| Service | Port | Protocol |
|---------|------|----------|
| Job Service (Leader/Worker) | 50060 | gRPC |
| Election | 50051 | gRPC |
| Job Sync | 50052 | gRPC |
| Client Callback | 50070 | gRPC |
| **Peer Discovery** | **50071** | **gRPC** |
| **Image Sharing** | **50072** | **gRPC** |
| REST API | 8080 | HTTP |
| UDP Multicast Discovery | 9191 | UDP |
| UDP Leader Broadcast | 10002 | UDP |

---

## Next Steps

1. Implement client configuration management
2. Create Firebase client module (lightweight)
3. Add CLI commands for P2P operations
4. Implement request listener background task
5. Test full end-to-end workflow
6. Add error handling and edge cases
7. Write integration tests

---

## Notes

- **Security**: Current implementation uses insecure gRPC channels. For production, add TLS.
- **Authentication**: No user authentication implemented. Firebase rules are permissive.
- **Scalability**: Firebase limits apply (read/write quotas)
- **Privacy**: Original images stored indefinitely. Consider adding retention policies.
- **GUI**: Python GUI client implementation deferred (focus on Rust CLI first)
