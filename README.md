# MIDI Visualizer

A real-time, modular MIDI visualization tool built with TypeScript and PIXI.js. This project uses a Node.js bridge to receive MIDI input and relay it to a modern, web-based visualization that works even when the browser isn't focused.

## Features

- **Real-time MIDI visualization** in the browser
- **Modular visualizations**: Easily add or switch between different visual effects
- **Radiating Circles** and **Circlesquares** visualizations included
- **Responsive, aspect-ratio-correct canvas** (always round, never stretched)
- **Works even when browser is not focused**
- **Modern TypeScript codebase** for maintainability and extensibility
- **Hot-reload development workflow** (automatic rebundling with esbuild)

## Prerequisites

- Node.js (v14 or higher)
- A MIDI controller or virtual MIDI port
- macOS: IAC Driver (built-in)
- Windows: LoopMIDI (https://www.tobias-erichsen.de/software/loopmidi.html)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set up your virtual MIDI port:**
   - **macOS**: Open Audio MIDI Setup > MIDI Studio > IAC Driver
   - **Windows**: Install and configure LoopMIDI
3. **Start the development server (auto-reloads on changes):**
   ```bash
   npm run dev
   ```
4. **Open your browser to** [http://localhost:3000/visualizer.html](http://localhost:3000/visualizer.html)

## Usage

- The server will list available MIDI ports when it starts. Note the port number of your virtual MIDI port.
- If needed, modify the port number in `midi-bridge.js` (change `input.openPort(0)` to match your virtual MIDI port).
- Send MIDI data to your virtual MIDI port from your DAW or MIDI controller.
- Watch the visualization in your browser!
- **Switch visualizations** by sending a `visualization_change` message via WebSocket, or by modifying the default in the code.

### Visualization Details

- **Radiating Circles**: Notes 36 (C2) and 40 (E2) trigger radiating circles from left and right origins.
- **Circlesquares**: Note 36 triggers random circles, note 40 triggers random rotating squares.

## Development

- **Source code:** All TypeScript source is in the `src/` directory.
- **Visualizations:** Add new visualizations in `src/visualizations/` by extending `BaseVisualization`.
- **Build system:** Uses [esbuild](https://esbuild.github.io/) for fast bundling. The `dev` script runs both the server and esbuild in watch mode.
- **No manual bundling needed:** All changes are automatically picked up and bundled to `public/app.bundle.js`.

## Project Structure

```
/ (root)
├── src/                  # TypeScript source code
│   └── visualizations/   # Visualization modules
├── public/               # Static assets and HTML
│   └── app.bundle.js     # Bundled JS (auto-generated)
├── midi-bridge.js        # Node.js MIDI-to-WebSocket bridge
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

- **No MIDI input?**
  - Check your virtual MIDI port configuration
  - Ensure the correct MIDI port is selected in `midi-bridge.js`
  - Make sure your DAW/controller is sending MIDI to the virtual port
- **Visualization not updating?**
  - Ensure the browser tab is open and the WebSocket connection is established
  - Check the browser console for errors
- **Circles look stretched?**
  - The canvas and renderer now always match aspect ratio and pixel size. If you see issues, try resizing the window or check your browser zoom settings.

## License

MIT License. See [LICENSE](LICENSE) for details. 