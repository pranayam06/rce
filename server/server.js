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

// Store the current document state
let documentState = '';

// WebSocket connection handler
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send the current document state to the new user
    socket.emit('document', documentState);

    // Listen for edits from clients
    socket.on('edit', async (operation) => {
        try {
            // Apply the operation to the document state
            documentState = applyOperation(documentState, operation);

            // Broadcast the updated document state to all clients
            io.emit('update', { operation, documentState });

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

// Function to apply an operation to the document state
function applyOperation(document, operation) {
    const { text, from, to } = operation;
    const before = document.slice(0, from);
    const after = document.slice(to);
    return before + text + after;
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
