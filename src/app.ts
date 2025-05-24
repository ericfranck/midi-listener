import * as PIXI from 'pixi.js';
import { VisualizationManager, RadiatingCircles, Circlesquares } from './visualizations';

declare global {
  interface Window {
    midiVisualizer: MIDIVisualizer;
  }
}

export class MIDIVisualizer {
  private app!: PIXI.Application;
  private visualizationManager!: VisualizationManager;
  private ws!: WebSocket;

  constructor() {
    this.initializePIXI();
    this.initializeWebSocket();
    this.initializeVisualization();
  }

  private initializePIXI(): void {
    const { width, height } = this.getCanvasSize();
    
    // Create the PIXI Application with v7 API
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

    // In v7, we use app.view
    this.app.view.id = 'pixi-canvas';
    container.appendChild(this.app.view);

    // Ensure renderer matches actual canvas size
    this.syncRendererToCanvas();

    window.addEventListener('resize', () => this.handleResize());
  }

  private initializeWebSocket(): void {
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
      } else {
        this.handleMIDI(data);
      }
    };
  }

  private initializeVisualization(): void {
    this.visualizationManager = new VisualizationManager(this.app.stage, this.app);
    this.setVisualization(new RadiatingCircles(), {});
  }

  private handleResize(): void {
    this.syncRendererToCanvas();
    const { width, height } = this.getCanvasSize();
    this.visualizationManager.resize(width, height);
  }

  private syncRendererToCanvas(): void {
    const canvas = document.getElementById('pixi-canvas') as HTMLCanvasElement;
    if (canvas) {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      this.app.renderer.resize(width, height);
    }
  }

  private handleVisualizationChange(visualizationName: string): void {
    switch (visualizationName) {
      case 'radiating-circles':
        this.setVisualization(new RadiatingCircles(), {});
        break;
      case 'circlesquares':
        this.setVisualization(new Circlesquares(), {});
        break;
      default:
        console.warn(`Unknown visualization: ${visualizationName}`);
    }
  }

  private handleMIDI(data: any): void {
    // We already have portName in data from midi-bridge.js
    const { message, portName } = data;
    const [status, data1, data2] = message; // data1 is note, data2 is velocity

    // Optional: Filter for specific IAC Driver buses if needed, or handle all.
    // For now, let's assume RadiatingCircles will know how to map portName.
    // if (!portName?.includes('IAC Driver')) return;

    // Check for Note On message (status 144-159) and velocity > 0
    if ((status & 0xF0) === 144 && data2 > 0) {
      const visualization = this.visualizationManager.getCurrentVisualization();
      if (visualization && typeof visualization.onMidiMessage === 'function') {
        visualization.onMidiMessage(status, data1, data2, portName);
      }
    }
  }

  private setVisualization(visualization: any, config: any): void {
    this.visualizationManager.setVisualization(visualization, config);
  }

  private getCanvasSize(): { width: number; height: number } {
    const container = document.getElementById('pixi-container');
    if (!container) {
      return { width: 800, height: 600 };
    }

    const { width, height } = container.getBoundingClientRect();
    return { width, height };
  }

  public cleanup(): void {
    this.visualizationManager.cleanup();
    this.ws.close();
    this.app.destroy(true, true);
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.midiVisualizer = new MIDIVisualizer();
}); 