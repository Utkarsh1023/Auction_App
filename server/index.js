const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require('socket.io');
const http = require('http');
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auction');
app.use('/api/auth', authRoutes);
app.use('/api/auction', auctionRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"]
  }
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined room ${userId}`);
  });



  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

server.listen(5000, () => console.log("Server running on 5000"));
