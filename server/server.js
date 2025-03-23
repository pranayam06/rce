const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB connection setup
const uri = process.env.MONGODB_URI || 'mongodb+srv://pmurugan:<yMnsCfE6acFPX7wn>@cluster0.7mjsm.mongodb.net/?appName=Cluster0'; // Replace with your MongoDB Atlas connection string
const client = new MongoClient(uri);

// Serve static files (frontend)
app.use(express.static('public'));

// WebSocket connection handler
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for edits from clients
    socket.on('edit', async (operation) => {
        try {
            // Broadcast the edit to all other clients
            socket.broadcast.emit('update', operation);

            // Save the edit to MongoDB
            await client.connect();
            const database = client.db('codeEditor');
            const collection = database.collection('edits');
            await collection.insertOne({
                operation,
                timestamp: new Date(),
            });
        } catch (err) {
            console.error('Error saving to MongoDB:', err);
        } finally {
            await client.close();
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});