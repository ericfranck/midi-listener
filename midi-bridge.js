const easymidi = require('easymidi');
const WebSocket = require('ws');
const express = require('express');
const path = require('path');

// Create Express app to serve static files
const app = express();
app.use(express.static('public'));
app.use('/dist', express.static(path.join(__dirname, 'dist')));

// Set up MIDI inputs for all available ports
const inputs = [];
const portNames = easymidi.getInputs();

console.log('\nAvailable MIDI ports:');
portNames.forEach((portName, i) => {
    try {
        const input = new easymidi.Input(portName);
        console.log(`✓ ${portName}`);
        inputs.push({ input, portName });
    } catch (error) {
        console.error(`✗ ${portName} (Failed to open)`);
    }
});

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('\nBrowser connected');
    clients.add(ws);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'visualization_change') {
                console.log(`Visualization changed to: ${data.visualization}`);
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
    input.on('message', (message) => {
        // Only log note events
        if (message._type === 'noteon' || message._type === 'noteoff') {
            console.log(`[${portName}] ${message._type.toUpperCase()} Note: ${message.note}, Velocity: ${message.velocity}`);
        }
        
        // Broadcast to all connected clients
        const data = JSON.stringify({
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
    console.log(`\nServer running at http://localhost:${PORT}`);
    console.log(`WebSocket server running at ws://localhost:8080\n`);
}); 