// gRPC Service Layer
// Since browsers don't support native gRPC, we'll use a REST gateway approach
// The server should expose REST endpoints or we use grpc-web

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:50060';
const PEER_DISCOVERY_URL = process.env.REACT_APP_PEER_DISCOVERY_URL || 'http://localhost:50071';
const IMAGE_SHARING_URL = process.env.REACT_APP_IMAGE_SHARING_URL || 'http://localhost:50072';

class GrpcService {
  // Job submission
  async submitImage(jobId, filename, imageData, username) {
    // For now, we'll create a simple HTTP endpoint wrapper
    // In production, use grpc-web or REST gateway
    const response = await fetch(`${SERVER_URL}/api/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: jobId,
        filename,
        image_data: imageData, // base64 encoded
        client_ip: '127.0.0.1',
        client_port: 50070,
        username,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Peer Discovery
  async registerClient(username, ip, port) {
    const response = await fetch(`${PEER_DISCOVERY_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        ip,
        port,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async listOnlineClients() {
    const response = await fetch(`${PEER_DISCOVERY_URL}/api/clients`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async updateHeartbeat(username, ip, port) {
    const response = await fetch(`${PEER_DISCOVERY_URL}/api/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        ip,
        port,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Image Sharing
  async requestPeerImage(requesterUsername, targetUsername, jobId) {
    const response = await fetch(`${IMAGE_SHARING_URL}/api/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requester_username: requesterUsername,
        target_username: targetUsername,
        job_id: jobId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async respondToRequest(requestId, responderUsername, consentGranted) {
    const response = await fetch(`${IMAGE_SHARING_URL}/api/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request_id: requestId,
        responder_username: responderUsername,
        consent_granted: consentGranted,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async fetchSharedImage(requestId, requesterUsername) {
    const response = await fetch(`${IMAGE_SHARING_URL}/api/fetch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request_id: requestId,
        requester_username: requesterUsername,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getPendingRequests(username) {
    const response = await fetch(`${IMAGE_SHARING_URL}/api/pending/${username}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export default new GrpcService();
