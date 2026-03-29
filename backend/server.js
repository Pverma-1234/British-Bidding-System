require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const rfqRoutes = require('./routes/rfqRoutes');
const bidRoutes = require('./routes/bidRoutes');
const authRoutes = require('./routes/authRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// Set Socket.IO on app to use in controllers
app.set('io', io);

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rfq_auction')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rfq', rfqRoutes);
app.use('/api/bid', bidRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.IO Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('join_rfq', (rfqId) => {
        socket.join(rfqId);
        console.log(`User ${socket.id} joined room: ${rfqId}`);
    });

    socket.on('identify', (userId) => {
        socket.join(userId);
        console.log(`User ${socket.id} identified as user: ${userId}`);
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
