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

// Pre-seeded initial messages as shown in the GIF demo
const initialMessages = [
  {
    id: 'msg-seed-1',
    user: 'PubNub Bot',
    text: 'Welcome to Team Chat. 👋 Send a message now to start interacting with other users in the app. ⬇️',
    timestamp: '12:16',
    likes: 2
  },
  {
    id: 'msg-seed-2',
    user: 'Gregory Goolsby',
    text: 'Hey everyone!',
    timestamp: '17:28',
    likes: 1
  },
  {
    id: 'msg-seed-3',
    user: 'Elin Emmanuel',
    text: 'Oh hi, Gregory! Rolande is around, too...',
    timestamp: '17:30',
    likes: 0
  }
];

let messages = [...initialMessages];
let connectedUsersCount = 0;

// REST endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    connectedUsers: connectedUsersCount,
    messagesCount: messages.length,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/messages', (req, res) => {
  res.json(messages);
});

// Socket.IO Publish & Subscribe Communication
io.on('connection', (socket) => {
  connectedUsersCount++;
  console.log(`[Socket.io] Client connected: ${socket.id} (Total: ${connectedUsersCount})`);

  // Publish active user count to all connected clients
  io.emit('users:count', connectedUsersCount);

  // Publish existing message history to the newly connected subscriber
  socket.emit('message:history', messages);

  // Subscribe to 'message:send' published by a client
  socket.on('message:send', (messageData) => {
    const newMessage = {
      id: messageData.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user: messageData.user,
      text: messageData.text,
      timestamp: messageData.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      likes: 0
    };

    messages.push(newMessage);
    console.log(`[Socket.io] New message published by ${newMessage.user}: "${newMessage.text}"`);

    // Publish (Broadcast) the new message to all subscribed clients
    io.emit('message:new', newMessage);
  });

  // Subscribe to 'message:like' published by a client
  socket.on('message:like', ({ messageId }) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      message.likes = (message.likes || 0) + 1;
      console.log(`[Socket.io] Like published for message ${messageId} (New count: ${message.likes})`);

      // Publish updated likes to all subscribed clients
      io.emit('message:liked', {
        messageId,
        likes: message.likes
      });
    }
  });

  // Subscribe to 'user:typing' indicator
  socket.on('user:typing', (data) => {
    socket.broadcast.emit('user:typing', data);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    connectedUsersCount = Math.max(0, connectedUsersCount - 1);
    console.log(`[Socket.io] Client disconnected: ${socket.id} (Total: ${connectedUsersCount})`);
    io.emit('users:count', connectedUsersCount);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Chat Socket.io & Express server running on http://localhost:${PORT}`);
});
