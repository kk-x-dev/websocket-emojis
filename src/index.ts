import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path'
import { fileURLToPath } from 'url';
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Create the HTTP server using Express
const httpServer = createServer(app);

// Initialize Socket.IO on top of the HTTP server
const io = new Server(httpServer, {
    cors: {
        origin: '*', // For development purposes, allow connections from any origin
    }
});

// A simple HTTP route to test that the server is running
app.get('/', (req, res) => {
  // 1. Try to find it in the same directory (Works in Production/dist)
  let htmlPath = path.join(__dirname, 'index.html');
  
  // 2. Fallback if running via dev mode (Works in Local Dev/src)
  if (!fs.existsSync(htmlPath)) {
    htmlPath = path.join(__dirname, '..', 'src', 'index.html');
  }
  
  res.sendFile(htmlPath);
});

// Listen for incoming WebSocket connections
io.on('connection', (socket) => {
    console.log(`⚡ A user connected: ${socket.id}`);


    socket.on('chat_message', (msg) => {
        console.log(`Message received from ${socket.id}: ${msg}`);

        // Broadcast an object instead of a raw string
        io.emit('chat_message', {
            text: msg,
            senderId: socket.id // Include who sent it
        });
    });

    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});

// Start the server
httpServer.listen(PORT, () => {
    console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});
