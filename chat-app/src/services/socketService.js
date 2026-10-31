import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionListeners = new Set();
  }

  connect() {
    if (this.socket) return;

    this.socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 5000
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log(`[SocketService] Connected to server at ${SOCKET_SERVER_URL}`);
      this._notifyConnectionChange(true);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.warn(`[SocketService] Disconnected: ${reason}`);
      this._notifyConnectionChange(false);
    });

    this.socket.on('connect_error', (err) => {
      this.isConnected = false;
      console.warn(`[SocketService] Connection error:`, err.message);
      this._notifyConnectionChange(false);
    });
  }

  _notifyConnectionChange(status) {
    this.connectionListeners.forEach((cb) => {
      try {
        cb(status);
      } catch (e) {
        console.error(e);
      }
    });
  }

  onConnectionChange(callback) {
    this.connectionListeners.add(callback);
    callback(this.isConnected);
    return () => this.connectionListeners.delete(callback);
  }

  // --- Publish operations (Client -> Server) ---

  /**
   * Publish a new chat message to the server
   */
  publishMessage(message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('message:send', message);
    }
  }

  /**
   * Publish a like on a message to the server
   */
  publishLike(messageId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('message:like', { messageId });
    }
  }

  /**
   * Publish user typing indicator
   */
  publishTyping(user, isTyping) {
    if (this.socket && this.isConnected) {
      this.socket.emit('user:typing', { user, isTyping });
    }
  }

  // --- Subscribe operations (Server -> Client) ---

  /**
   * Subscribe to new incoming messages broadcast from server
   */
  subscribeToNewMessages(callback) {
    if (!this.socket) return () => {};
    this.socket.on('message:new', callback);
    return () => this.socket.off('message:new', callback);
  }

  /**
   * Subscribe to initial message history from server
   */
  subscribeToHistory(callback) {
    if (!this.socket) return () => {};
    this.socket.on('message:history', callback);
    return () => this.socket.off('message:history', callback);
  }

  /**
   * Subscribe to like updates broadcast from server
   */
  subscribeToLikes(callback) {
    if (!this.socket) return () => {};
    this.socket.on('message:liked', callback);
    return () => this.socket.off('message:liked', callback);
  }

  /**
   * Subscribe to user count updates
   */
  subscribeToUserCount(callback) {
    if (!this.socket) return () => {};
    this.socket.on('users:count', callback);
    return () => this.socket.off('users:count', callback);
  }

  /**
   * Subscribe to typing indicators
   */
  subscribeToTyping(callback) {
    if (!this.socket) return () => {};
    this.socket.on('user:typing', callback);
    return () => this.socket.off('user:typing', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export const socketService = new SocketService();
