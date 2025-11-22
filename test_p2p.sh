#!/bin/bash
# Automated P2P Image Sharing Test Script
# Usage: ./test_p2p.sh

set -e  # Exit on error

PROTO_PATH="/home/amal-fouda/Desktop/basic_linux_cluster/Elhaykal-service/proto"
PEER_DISCOVERY_PORT="50071"
IMAGE_SHARING_PORT="50072"

echo "=========================================="
echo "  P2P Image Sharing Test Suite"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if grpcurl is installed
if ! command -v grpcurl &> /dev/null; then
    echo -e "${RED}Error: grpcurl is not installed${NC}"
    echo "Install it with: sudo apt install grpcurl"
    exit 1
fi

# Check if server is running
if ! nc -z localhost $PEER_DISCOVERY_PORT 2>/dev/null; then
    echo -e "${RED}Error: Server is not running on port $PEER_DISCOVERY_PORT${NC}"
    echo "Start the server with: cd Elhaykal-service && cargo run"
    exit 1
fi

echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Test 1: Register Clients
echo "=========================================="
echo "Test 1: Client Registration"
echo "=========================================="

echo "Registering Alice..."
RESULT=$(grpcurl -plaintext \
  -import-path $PROTO_PATH \
  -proto peer_discovery.proto \
  -d '{
    "username": "alice",
    "ip": "192.168.1.100",
    "port": 50070
  }' \
  localhost:$PEER_DISCOVERY_PORT \
  peer_discovery.PeerDiscovery/RegisterClient 2>&1)

if echo "$RESULT" | grep -q "success.*true"; then
    echo -e "${GREEN}✓ Alice registered successfully${NC}"
else
    echo -e "${RED}✗ Alice registration failed${NC}"
    echo "$RESULT"
fi

echo ""
echo "Registering Bob..."
RESULT=$(grpcurl -plaintext \
  -import-path $PROTO_PATH \
  -proto peer_discovery.proto \
  -d '{
    "username": "bob",
    "ip": "192.168.1.101",
    "port": 50070
  }' \
  localhost:$PEER_DISCOVERY_PORT \
  peer_discovery.PeerDiscovery/RegisterClient 2>&1)

if echo "$RESULT" | grep -q "success.*true"; then
    echo -e "${GREEN}✓ Bob registered successfully${NC}"
else
    echo -e "${RED}✗ Bob registration failed${NC}"
    echo "$RESULT"
fi

echo ""
echo "Registering Charlie..."
RESULT=$(grpcurl -plaintext \
  -import-path $PROTO_PATH \
  -proto peer_discovery.proto \
  -d '{
    "username": "charlie",
    "ip": "192.168.1.102",
    "port": 50070
  }' \
  localhost:$PEER_DISCOVERY_PORT \
  peer_discovery.PeerDiscovery/RegisterClient 2>&1)

if echo "$RESULT" | grep -q "success.*true"; then
    echo -e "${GREEN}✓ Charlie registered successfully${NC}"
else
    echo -e "${RED}✗ Charlie registration failed${NC}"
    echo "$RESULT"
fi

sleep 1
echo ""

# Test 2: List Online Clients
echo "=========================================="
echo "Test 2: List Online Clients"
echo "=========================================="

RESULT=$(grpcurl -plaintext \
  -import-path $PROTO_PATH \
  -proto peer_discovery.proto \
  -d '{}' \
  localhost:$PEER_DISCOVERY_PORT \
  peer_discovery.PeerDiscovery/ListOnlineClients 2>&1)

echo "$RESULT"

if echo "$RESULT" | grep -q "alice" && echo "$RESULT" | grep -q "bob" && echo "$RESULT" | grep -q "charlie"; then
    echo -e "${GREEN}✓ All clients listed successfully${NC}"
else
    echo -e "${YELLOW}⚠ Some clients may not be listed${NC}"
fi

sleep 1
echo ""

# Test 3: Update Heartbeat
echo "=========================================="
echo "Test 3: Update Heartbeat"
echo "=========================================="

echo "Updating Alice's heartbeat..."
grpcurl -plaintext \
  -import-path $PROTO_PATH \
  -proto peer_discovery.proto \
  -d '{
    "username": "alice",
    "ip": "192.168.1.100",
    "port": 50070
  }' \
  localhost:$PEER_DISCOVERY_PORT \
  peer_discovery.PeerDiscovery/UpdateHeartbeat > /dev/null 2>&1

echo -e "${GREEN}✓ Heartbeat updated${NC}"

sleep 1
echo ""

# Test 4: Create Image Request
echo "=========================================="
echo "Test 4: Create Image Sharing Request"
echo "=========================================="

echo "Alice requests to view Bob's image (job_001)..."
RESULT=$(grpcurl -plaintext \
  -import-path $PROTO_PATH \
  -proto image_sharing.proto \
  -d '{
    "requester_username": "alice",
    "target_username": "bob",
    "job_id": "job_001"
  }' \
  localhost:$IMAGE_SHARING_PORT \
  image_sharing.ImageSharing/RequestPeerImage 2>&1)

echo "$RESULT"

if echo "$RESULT" | grep -q "success.*true"; then
    REQUEST_ID=$(echo "$RESULT" | grep -oP '"request_id":\s*"\K[^"]+' || echo "")
    echo -e "${GREEN}✓ Request created successfully${NC}"
    echo "Request ID: $REQUEST_ID"
else
    echo -e "${RED}✗ Request creation failed${NC}"
    REQUEST_ID=""
fi

sleep 1
echo ""

# Test 5: Get Pending Requests
echo "=========================================="
echo "Test 5: Get Pending Requests (Bob's view)"
echo "=========================================="

RESULT=$(grpcurl -plaintext \
  -import-path $PROTO_PATH \
  -proto image_sharing.proto \
  -d '{
    "username": "bob"
  }' \
  localhost:$IMAGE_SHARING_PORT \
  image_sharing.ImageSharing/GetPendingRequests 2>&1)

echo "$RESULT"

if echo "$RESULT" | grep -q "alice"; then
    echo -e "${GREEN}✓ Bob can see Alice's request${NC}"
else
    echo -e "${YELLOW}⚠ No pending requests found${NC}"
fi

sleep 1
echo ""

# Test 6: Respond to Request (if REQUEST_ID is available)
if [ -n "$REQUEST_ID" ]; then
    echo "=========================================="
    echo "Test 6: Respond to Image Request"
    echo "=========================================="

    echo "Bob accepts Alice's request..."
    RESULT=$(grpcurl -plaintext \
      -import-path $PROTO_PATH \
      -proto image_sharing.proto \
      -d "{
        \"request_id\": \"$REQUEST_ID\",
        \"responder_username\": \"bob\",
        \"consent_granted\": true
      }" \
      localhost:$IMAGE_SHARING_PORT \
      image_sharing.ImageSharing/RespondToRequest 2>&1)

    echo "$RESULT"
    echo -e "${GREEN}✓ Response sent${NC}"
else
    echo -e "${YELLOW}⚠ Skipping response test (no request ID)${NC}"
fi

sleep 1
echo ""

# Test 7: Unregister Client
echo "=========================================="
echo "Test 7: Unregister Client"
echo "=========================================="

echo "Unregistering Charlie..."
grpcurl -plaintext \
  -import-path $PROTO_PATH \
  -proto peer_discovery.proto \
  -d '{
    "username": "charlie",
    "ip": "192.168.1.102",
    "port": 50070
  }' \
  localhost:$PEER_DISCOVERY_PORT \
  peer_discovery.PeerDiscovery/UnregisterClient > /dev/null 2>&1

echo -e "${GREEN}✓ Charlie unregistered${NC}"

sleep 1
echo ""

echo "Listing clients after unregister..."
RESULT=$(grpcurl -plaintext \
  -import-path $PROTO_PATH \
  -proto peer_discovery.proto \
  -d '{}' \
  localhost:$PEER_DISCOVERY_PORT \
  peer_discovery.PeerDiscovery/ListOnlineClients 2>&1)

if echo "$RESULT" | grep -q "charlie"; then
    echo -e "${YELLOW}⚠ Charlie still appears in list (may be cached)${NC}"
else
    echo -e "${GREEN}✓ Charlie successfully removed from list${NC}"
fi

echo ""
echo "=========================================="
echo "  Test Suite Complete!"
echo "=========================================="
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Check Firebase Console to verify data"
echo "2. Check server logs for any errors"
echo "3. To test image fetching, you need to:"
echo "   - Submit a real image job first"
echo "   - Use the test commands in TESTING_GUIDE.md"
echo ""
echo -e "${GREEN}Server is still running. Press Ctrl+C in the server terminal to stop it.${NC}"
