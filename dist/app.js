import * as PIXI from 'pixi.js';
import { VisualizationManager, RadiatingCircles } from './visualizations';
export class MIDIVisualizer {
    constructor() {
        this.initializePIXI();
        this.initializeWebSocket();
        this.initializeVisualization();
    }
    initializePIXI() {
        const { width, height } = this.getCanvasSize();
        this.app = new PIXI.Application({
            width,
            height,
            backgroundColor: 0x0B1019,
            antialias: true,
            resolution: window.devicePixelRatio || 1
        });
        const container = document.getElementById('pixi-container');
        if (!container) {
            throw new Error('PIXI container element not found');
        }
        this.app.view.id = 'pixi-canvas';
        container.appendChild(this.app.view);
        window.addEventListener('resize', () => this.handleResize());
    }
    initializeWebSocket() {
        this.ws = new WebSocket('ws://localhost:8080');
        this.ws.onopen = () => {
            console.log('WebSocket connected');
        };
        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
        };
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'visualization_change') {
                this.handleVisualizationChange(data.visualization);
            }
            else {
                this.handleMIDI(data);
            }
        };
    }
    initializeVisualization() {
        this.visualizationManager = new VisualizationManager(this.app.stage);
        this.setVisualization(new RadiatingCircles(), {
            backgroundColor: '#0B1019',
            blendMode: PIXI.BLEND_MODES.SCREEN
        });
    }
    handleResize() {
        const { width, height } = this.getCanvasSize();
        this.app.renderer.resize(width, height);
        this.visualizationManager.resize(width, height);
    }
    handleVisualizationChange(visualizationName) {
        switch (visualizationName) {
            case 'radiating-circles':
                this.setVisualization(new RadiatingCircles(), {
                    backgroundColor: '#0B1019',
                    blendMode: PIXI.BLEND_MODES.SCREEN
                });
                break;
            // Add more visualizations here as they are implemented
            default:
                console.warn(`Unknown visualization: ${visualizationName}`);
        }
    }
    handleMIDI(data) {
        if (!data.portName?.includes('IAC Driver'))
            return;
        const [status, note, velocity] = data.message;
        if ((status & 0xF0) === 144 && velocity > 0) {
            const visualization = this.visualizationManager.getCurrentVisualization();
            if (visualization instanceof RadiatingCircles) {
                const { width, height } = this.app.renderer;
                const x = width / 2 + (note === 36 ? -width / 6 : width / 6);
                const y = height / 2;
                visualization.addCircle(note, velocity, x, y);
            }
        }
    }
    setVisualization(visualization, config) {
        this.visualizationManager.setVisualization(visualization, config);
    }
    getCanvasSize() {
        const container = document.getElementById('pixi-container');
        if (!container) {
            return { width: 800, height: 600 };
        }
        const { width, height } = container.getBoundingClientRect();
        return { width, height };
    }
    cleanup() {
        this.visualizationManager.cleanup();
        this.ws.close();
        this.app.destroy(true, true);
    }
}
// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.midiVisualizer = new MIDIVisualizer();
});
//# sourceMappingURL=app.js.map