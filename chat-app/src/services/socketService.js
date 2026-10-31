import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentUsername = null;
    this.connectionListeners = new Set();
  }

  connect(username) {
    if (username) {
      this.currentUsername = username;
    }

    if (this.socket) {
      if (this.socket.connected && username) {
        this.socket.emit('user:join', { username });
      }
      return;
    }

    this.socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      timeout: 5000
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      if (this.currentUsername) {
        this.socket.emit('user:join', { username: this.currentUsername });
      }
      this._notifyConnectionChange(true);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this._notifyConnectionChange(false);
    });

    this.socket.on('connect_error', () => {
      this.isConnected = false;
      this._notifyConnectionChange(false);
    });
  }

  join(username) {
    this.currentUsername = username;
    if (this.socket && this.isConnected) {
      this.socket.emit('user:join', { username });
    }
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

  publishMessage(message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('message:send', message);
    }
  }

  publishLike(messageId, username, channelId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('message:like', { messageId, username, channelId });
    }
  }

  publishReaction(messageId, username, emoji, channelId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('message:reaction', { messageId, username, emoji, channelId });
    }
  }

  publishTyping(user, isTyping, channelId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('user:typing', { user, isTyping, channelId });
    }
  }

  // --- Subscribe operations (Server -> Client) ---

  subscribeToNewMessages(callback) {
    if (!this.socket) return () => {};
    this.socket.on('message:new', callback);
    return () => this.socket.off('message:new', callback);
  }

  subscribeToLikes(callback) {
    if (!this.socket) return () => {};
    this.socket.on('message:liked', callback);
    return () => this.socket.off('message:liked', callback);
  }

  subscribeToReactions(callback) {
    if (!this.socket) return () => {};
    this.socket.on('message:reaction', callback);
    return () => this.socket.off('message:reaction', callback);
  }

  subscribeToOnlineUsers(callback) {
    if (!this.socket) return () => {};
    this.socket.on('users:online', callback);
    return () => this.socket.off('users:online', callback);
  }

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
