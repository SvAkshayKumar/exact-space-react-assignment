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

// Messages store for the current active server runtime
let messages = [];

// Track active connected sockets and their usernames
// socket.id -> username
const activeSockets = new Map();

function broadcastOnlineUsers() {
  const activeUsernames = Array.from(new Set(activeSockets.values())).filter(Boolean);
  const totalCount = activeSockets.size;

  io.emit('users:online', {
    count: totalCount,
    users: activeUsernames
  });
}

// REST health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    onlineCount: activeSockets.size,
    onlineUsers: Array.from(new Set(activeSockets.values())).filter(Boolean),
    timestamp: new Date().toISOString()
  });
});

// Socket.IO Communication
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // When user announces their persistent name
  socket.on('user:join', ({ username }) => {
    activeSockets.set(socket.id, username);
    console.log(`[Socket.io] User joined: ${username} (Socket: ${socket.id})`);
    broadcastOnlineUsers();
  });

  // Client publishes a new message
  // NOTE: Users only receive messages broadcast from their join instant onwards.
  socket.on('message:send', (messageData) => {
    const newMessage = {
      id: messageData.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      channelId: messageData.channelId || 'introductions',
      user: messageData.user,
      text: messageData.text,
      timestamp: messageData.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      likes: 0,
      likedBy: [],
      reactions: {} // emoji -> array of usernames who reacted
    };

    messages.push(newMessage);
    console.log(`[Socket.io] [${newMessage.channelId}] Message from ${newMessage.user}: "${newMessage.text}"`);

    // Broadcast message to all currently connected clients
    io.emit('message:new', newMessage);
  });

  // Client toggles like on a message
  // If user already liked it, clicking again removes the like!
  socket.on('message:like', ({ messageId, username, channelId }) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      if (!Array.isArray(message.likedBy)) {
        message.likedBy = [];
      }

      const existingIndex = message.likedBy.indexOf(username);
      if (existingIndex !== -1) {
        // User already liked this message -> remove like (toggle off)
        message.likedBy.splice(existingIndex, 1);
        message.likes = Math.max(0, (message.likes || 1) - 1);
        console.log(`[Socket.io] User ${username} removed like from ${messageId} (New count: ${message.likes})`);
      } else {
        // User hasn't liked this message -> add like (toggle on)
        message.likedBy.push(username);
        message.likes = (message.likes || 0) + 1;
        console.log(`[Socket.io] User ${username} liked ${messageId} (New count: ${message.likes})`);
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

  // Client toggles an emoji reaction on a message
  socket.on('message:reaction', ({ messageId, username, emoji, channelId }) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      if (!message.reactions || typeof message.reactions !== 'object') {
        message.reactions = {};
      }

      if (!Array.isArray(message.reactions[emoji])) {
        message.reactions[emoji] = [];
      }

      const userIndex = message.reactions[emoji].indexOf(username);
      if (userIndex !== -1) {
        // User already added this emoji reaction -> remove it (toggle off)
        message.reactions[emoji].splice(userIndex, 1);
        if (message.reactions[emoji].length === 0) {
          delete message.reactions[emoji];
        }
        console.log(`[Socket.io] User ${username} removed reaction "${emoji}" from message ${messageId}`);
      } else {
        // User hasn't reacted with this emoji -> add it (toggle on)
        message.reactions[emoji].push(username);
        console.log(`[Socket.io] User ${username} reacted with "${emoji}" on message ${messageId}`);
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
    const leavingUser = activeSockets.get(socket.id);
    activeSockets.delete(socket.id);
    console.log(`[Socket.io] Client disconnected: ${socket.id} (${leavingUser || 'unknown'})`);
    broadcastOnlineUsers();
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Chat Socket.io & Express server running on http://localhost:${PORT}`);
});
