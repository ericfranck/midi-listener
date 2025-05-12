// visualizer-common.js

// === Color & Size & Randomness Variables (defaults, can be overridden by visualizations) ===
const DEFAULT_BG_COLOR = 0xED6A5A;

// Pixi.js setup
const { width, height } = getCanvasSize();
const app = new PIXI.Application({
    width,
    height,
    backgroundColor: DEFAULT_BG_COLOR,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
});
app.view.id = 'pixi-canvas';
document.getElementById('pixi-container').appendChild(app.view);

function getCanvasSize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    let width = w, height = w * 10 / 16;
    if (height > h) {
        height = h;
        width = h * 16 / 10;
    }
    return { width, height };
}

function resizeCanvas() {
    const { width, height } = getCanvasSize();
    app.renderer.resize(width, height);
    app.view.style.width = width + 'px';
    app.view.style.height = height + 'px';
    if (window.currentVisualization && window.currentVisualization.onResize) {
        window.currentVisualization.onResize(width, height);
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Utility: color adjustment
function adjustColor(color, factor) {
    let r = (color >> 16) & 0xFF;
    let g = (color >> 8) & 0xFF;
    let b = color & 0xFF;
    if (factor > 1) {
        r += (255 - r) * (factor - 1);
        g += (255 - g) * (factor - 1);
        b += (255 - b) * (factor - 1);
    } else {
        r *= factor;
        g *= factor;
        b *= factor;
    }
    return (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b);
}
window.adjustColor = adjustColor;

// Visualization registration/switching
function setVisualization(viz) {
    if (window.currentVisualization && window.currentVisualization.cleanup) {
        window.currentVisualization.cleanup();
    }
    window.currentVisualization = viz;
    
    // Set background color if specified
    if (viz.backgroundColor !== undefined) {
        app.renderer.backgroundColor = viz.backgroundColor;
    } else {
        app.renderer.backgroundColor = DEFAULT_BG_COLOR;
    }
    
    if (viz.init) viz.init(app);
}
window.setVisualization = setVisualization;

// MIDI/WebSocket connection
const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Only pass MIDI messages to the visualization
    if (!data.type && window.currentVisualization && window.currentVisualization.handleMIDI) {
        window.currentVisualization.handleMIDI(data, app);
    }
}; 