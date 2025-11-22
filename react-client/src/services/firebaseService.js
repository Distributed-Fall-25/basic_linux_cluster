import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

class FirebaseService {
  // Register client in Firebase
  async registerClient(username, ip, port) {
    const clientRef = doc(db, 'clients', username);
    await setDoc(clientRef, {
      username,
      ip,
      port,
      status: 'online',
      last_seen: serverTimestamp(),
      registered_at: serverTimestamp(),
    });
  }

  // Update heartbeat
  async updateHeartbeat(username) {
    const clientRef = doc(db, 'clients', username);
    await updateDoc(clientRef, {
      last_seen: serverTimestamp(),
      status: 'online',
    });
  }

  // Unregister client
  async unregisterClient(username) {
    const clientRef = doc(db, 'clients', username);
    await updateDoc(clientRef, {
      status: 'offline',
      last_seen: serverTimestamp(),
    });
  }

  // Get online clients
  async getOnlineClients() {
    const clientsRef = collection(db, 'clients');
    const q = query(clientsRef, where('status', '==', 'online'));
    const querySnapshot = await getDocs(q);

    const clients = [];
    querySnapshot.forEach((doc) => {
      clients.push({ id: doc.id, ...doc.data() });
    });

    return clients;
  }

  // Listen to online clients in real-time
  onOnlineClientsChange(callback) {
    const clientsRef = collection(db, 'clients');
    const q = query(clientsRef, where('status', '==', 'online'));

    return onSnapshot(q, (querySnapshot) => {
      const clients = [];
      querySnapshot.forEach((doc) => {
        clients.push({ id: doc.id, ...doc.data() });
      });
      callback(clients);
    });
  }

  // Create image request
  async createImageRequest(requestId, requester, target, jobId) {
    const requestRef = doc(db, 'image_requests', requestId);
    await setDoc(requestRef, {
      request_id: requestId,
      requester,
      target,
      job_id: jobId,
      status: 'pending',
      timestamp: Date.now(),
      response_timestamp: null,
    });
  }

  // Update request status
  async updateRequestStatus(requestId, status) {
    const requestRef = doc(db, 'image_requests', requestId);
    await updateDoc(requestRef, {
      status,
      response_timestamp: Date.now(),
    });
  }

  // Get pending requests for a user
  async getPendingRequests(username) {
    const requestsRef = collection(db, 'image_requests');
    const q = query(
      requestsRef,
      where('target', '==', username),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);

    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    return requests;
  }

  // Listen to pending requests for a user
  onPendingRequestsChange(username, callback) {
    const requestsRef = collection(db, 'image_requests');
    const q = query(
      requestsRef,
      where('target', '==', username),
      where('status', '==', 'pending')
    );

    return onSnapshot(q, (querySnapshot) => {
      const requests = [];
      querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      callback(requests);
    });
  }

  // Get request by ID
  async getRequest(requestId) {
    const requestRef = doc(db, 'image_requests', requestId);
    const docSnap = await getDoc(requestRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  }

  // Listen to a specific request
  onRequestChange(requestId, callback) {
    const requestRef = doc(db, 'image_requests', requestId);

    return onSnapshot(requestRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  }
}

export default new FirebaseService();
