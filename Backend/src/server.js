require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const PORT = process.env.PORT || 4000;

// Create HTTP server with Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Make io instance accessible throughout the app
app.set('io', io);

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('✓ User connected:', socket.id);

  // Join user to their personal room
  socket.on('join-user-room', (userId) => {
    const room = `user-${userId}`;
    socket.join(room);
    console.log(`  └─ User ${userId} joined room: ${room}`);
  });

  // Real-time attendance update
  socket.on('attendance-updated', (data) => {
    console.log('📤 Broadcasting attendance update:', data);
    io.to(`user-${data.userId}`).emit('attendance-refresh', data);
    io.emit('admin-attendance-update', data);
  });

  // Dashboard sync
  socket.on('sync-dashboard', (data) => {
    console.log('📤 Syncing dashboard for user:', data.userId);
    io.to(`user-${data.userId}`).emit('dashboard-update', data);
  });

  // Task update
  socket.on('task-updated', (data) => {
    console.log('📤 Broadcasting task update');
    io.emit('task-refresh', data);
  });

  // Ping/keep alive
  socket.on('ping', () => {
    socket.emit('pong');
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('✗ User disconnected:', socket.id);
  });
});

async function start() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI not set');
    await mongoose.connect(uri, { dbName: 'trackwise' });
    console.log('✓ Connected to MongoDB');

    server.listen(PORT, () => {
      console.log(`\n🚀 Server with Socket.IO listening on port ${PORT}`);
      console.log(`   Dashboard: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
