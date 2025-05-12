# MIDI Visualizer

A real-time MIDI visualization tool that works even when the browser isn't focused. This project uses a Node.js bridge to receive MIDI input and relay it to a web-based visualization.

## Prerequisites

- Node.js (v14 or higher)
- A MIDI controller or virtual MIDI port
- macOS: IAC Driver (built-in)
- Windows: LoopMIDI (https://www.tobias-erichsen.de/software/loopmidi.html)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your virtual MIDI port:
   - **macOS**: Open Audio MIDI Setup > MIDI Studio > IAC Driver
   - **Windows**: Install and configure LoopMIDI

3. Start the server:
```bash
npm start
```

4. Open your browser to http://localhost:3000

## Usage

1. The server will list available MIDI ports when it starts. Note the port number of your virtual MIDI port.
2. If needed, modify the port number in `midi-bridge.js` (change `input.openPort(0)` to match your virtual MIDI port).
3. Send MIDI data to your virtual MIDI port from your DAW or MIDI controller.
4. Watch the visualization in your browser!

## Features

- Real-time MIDI visualization
- Works even when browser is not focused
- Modern, responsive UI
- Raw MIDI data display
- Visual feedback for MIDI notes

## Troubleshooting

- If you don't see any MIDI input, check that:
  - Your virtual MIDI port is properly configured
  - The correct MIDI port is selected in the bridge
  - Your DAW or controller is sending MIDI to the virtual port
- If the visualization isn't updating, ensure the browser tab is open and the WebSocket connection is established (check the status indicator) 