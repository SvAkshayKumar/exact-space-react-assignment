import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);

// Enable CORS
app.use(cors());
app.use(express.json());

// Setup Socket.IO with CORS support
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5001;

// Messages store for current runtime session
let messages = [];

// Track active connected sockets: socket.id -> { userId, username }
const activeSockets = new Map();

function broadcastOnlineUsers() {
  const users = Array.from(activeSockets.values()).filter((u) => u && u.userId);
  const totalCount = activeSockets.size;

  io.emit('users:online', {
    count: totalCount,
    users // Array of { userId, username }
  });
}

// REST health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    onlineCount: activeSockets.size,
    onlineUsers: Array.from(activeSockets.values()),
    timestamp: new Date().toISOString()
  });
});

// Socket.IO Communication
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // When user joins with their unique userId and assigned username
  socket.on('user:join', ({ userId, username }) => {
    activeSockets.set(socket.id, { userId, username });
    console.log(`[Socket.io] User joined: ${username} (ID: ${userId}, Socket: ${socket.id})`);
    broadcastOnlineUsers();
  });

  // Client publishes a new message
  // NOTE: Users only receive messages broadcast from their join instant onwards.
  socket.on('message:send', (messageData) => {
    const newMessage = {
      id: messageData.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      channelId: messageData.channelId || 'introductions',
      userId: messageData.userId, // Unique user ID distinguishing sender even if usernames match
      user: messageData.user,     // Display username (e.g. "Alan")
      text: messageData.text,
      timestamp: messageData.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      likes: 0,
      likedBy: [], // Array of unique userIds who liked
      reactions: {} // emoji -> Array of unique userIds who reacted
    };

    messages.push(newMessage);
    console.log(`[Socket.io] [${newMessage.channelId}] Message from ${newMessage.user} (${newMessage.userId}): "${newMessage.text}"`);

    // Broadcast message to all currently connected clients
    io.emit('message:new', newMessage);
  });

  // Client toggles like on a message (tracked by unique userId)
  socket.on('message:like', ({ messageId, userId, username, channelId }) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      if (!Array.isArray(message.likedBy)) {
        message.likedBy = [];
      }

      const existingIndex = message.likedBy.indexOf(userId);
      if (existingIndex !== -1) {
        // User already liked this message -> remove like (toggle off)
        message.likedBy.splice(existingIndex, 1);
        message.likes = Math.max(0, (message.likes || 1) - 1);
        console.log(`[Socket.io] User ${username} (${userId}) unliked ${messageId} (New count: ${message.likes})`);
      } else {
        // User hasn't liked this message -> add like (toggle on)
        message.likedBy.push(userId);
        message.likes = (message.likes || 0) + 1;
        console.log(`[Socket.io] User ${username} (${userId}) liked ${messageId} (New count: ${message.likes})`);
      }

      // Broadcast updated like state to all clients
      io.emit('message:liked', {
        messageId,
        channelId: channelId || message.channelId,
        likes: message.likes,
        likedBy: message.likedBy
      });
    }
  });

  // Client toggles an emoji reaction on a message (tracked by unique userId)
  socket.on('message:reaction', ({ messageId, userId, username, emoji, channelId }) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      if (!message.reactions || typeof message.reactions !== 'object') {
        message.reactions = {};
      }

      if (!Array.isArray(message.reactions[emoji])) {
        message.reactions[emoji] = [];
      }

      const userIndex = message.reactions[emoji].indexOf(userId);
      if (userIndex !== -1) {
        // User already added this emoji reaction -> remove it (toggle off)
        message.reactions[emoji].splice(userIndex, 1);
        if (message.reactions[emoji].length === 0) {
          delete message.reactions[emoji];
        }
        console.log(`[Socket.io] User ${username} (${userId}) removed reaction "${emoji}" from ${messageId}`);
      } else {
        // User hasn't reacted with this emoji -> add it (toggle on)
        message.reactions[emoji].push(userId);
        console.log(`[Socket.io] User ${username} (${userId}) reacted with "${emoji}" on ${messageId}`);
      }

      // Broadcast updated reactions for this message to all clients
      io.emit('message:reaction', {
        messageId,
        channelId: channelId || message.channelId,
        reactions: message.reactions
      });
    }
  });

  // User typing indicator
  socket.on('user:typing', (data) => {
    socket.broadcast.emit('user:typing', data);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    const leaving = activeSockets.get(socket.id);
    activeSockets.delete(socket.id);
    console.log(`[Socket.io] Client disconnected: ${socket.id} (${leaving?.username || 'unknown'})`);
    broadcastOnlineUsers();
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Chat Socket.io & Express server running on http://localhost:${PORT}`);
});
