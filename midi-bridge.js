const midi = require('midi');
const WebSocket = require('ws');
const express = require('express');
const path = require('path');

// Create Express app to serve static files
const app = express();
app.use(express.static('public'));
app.use('/dist', express.static(path.join(__dirname, 'dist')));

// Set up MIDI inputs for all available ports
const inputs = [];
const portCount = new midi.Input().getPortCount();

console.log('Available MIDI ports:');
for (let i = 0; i < portCount; i++) {
    const input = new midi.Input();
    const portName = input.getPortName(i);
    input.openPort(i);
    console.log(`${i}: ${portName}`);
    inputs.push({ input, portName });
}

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('Browser connected');
    clients.add(ws);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            // If it's a visualization control message, broadcast to all clients
            if (data.type === 'visualization_change') {
                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Browser disconnected');
        clients.delete(ws);
    });
});

// Handle MIDI messages for each input
inputs.forEach(({ input, portName }) => {
    input.on('message', (deltaTime, message) => {
        console.log(`[${portName}] MIDI message received:`, message);
        // Broadcast to all connected clients
        const data = JSON.stringify({
            deltaTime,
            message,
            portName,
            timestamp: Date.now()
        });
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });
});

// Start Express server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`WebSocket server running at ws://localhost:8080`);
}); 