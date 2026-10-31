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
      user: messageData.user,
      text: messageData.text,
      timestamp: messageData.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      likes: 0,
      likedBy: []
    };

    messages.push(newMessage);
    console.log(`[Socket.io] Message from ${newMessage.user}: "${newMessage.text}"`);

    // Broadcast message to all currently connected clients
    io.emit('message:new', newMessage);
  });

  // Client toggles like on a message
  // If user already liked it, clicking again removes the like!
  socket.on('message:like', ({ messageId, username }) => {
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
        likes: message.likes,
        likedBy: message.likedBy
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
