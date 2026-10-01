import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path'
import { fileURLToPath } from 'url';


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
    res.sendFile(path.join(__dirname, 'index.html'));
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
