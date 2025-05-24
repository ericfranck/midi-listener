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
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    } as any); // 'as any' to allow autoDensity for v7

    const container = document.getElementById('pixi-container');
    if (!container) {
      throw new Error('PIXI container element not found');
    }

    // In v7, we use app.view
    this.app.view.id = 'pixi-canvas';
    container.appendChild(this.app.view);

    // Ensure renderer matches actual canvas size
    this.syncRendererToCanvas();

    // Add resize handler
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
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        if (data.type === 'visualization_change') {
          this.handleVisualizationChange(data.visualization);
        } else if (data.message) {
          this.handleMIDI(data);
        } else {
          console.warn('Received message without expected format:', data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  private initializeVisualization(): void {
    this.visualizationManager = new VisualizationManager(this.app.stage, this.app);
    this.setVisualization(new RadiatingCircles(), {});
  }

  private handleResize(): void {
    this.syncRendererToCanvas();
    if (this.visualizationManager) {
      const { width, height } = this.getCanvasSize();
      this.visualizationManager.resize(width, height);
    }
  }

  private syncRendererToCanvas(): void {
    const { width, height } = this.getCanvasSize();
    this.app.renderer.resize(width, height);
    // Optionally set style width/height for CSS sizing
    this.app.view.style.width = width + 'px';
    this.app.view.style.height = height + 'px';
    // Debug logging
    console.log('[syncRendererToCanvas] getCanvasSize:', width, height);
    console.log('[syncRendererToCanvas] renderer size:', this.app.renderer.width, this.app.renderer.height);
    console.log('[syncRendererToCanvas] canvas style:', this.app.view.style.width, this.app.view.style.height);
    console.log('[syncRendererToCanvas] devicePixelRatio:', window.devicePixelRatio || 1);
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
    const { message, portName } = data;
    
    // easymidi provides a more structured message format
    if (message && message._type === 'noteon' && message.velocity > 0) {
      const visualization = this.visualizationManager.getCurrentVisualization();
      if (visualization && typeof visualization.onMidiMessage === 'function') {
        // Convert easymidi format to the format expected by visualizations
        const status = 144 + (message.channel || 0);
        visualization.onMidiMessage(status, message.note, message.velocity, portName);
      }
    }
  }

  private setVisualization(visualization: any, config: any): void {
    this.visualizationManager.setVisualization(visualization, config);
  }

  private getCanvasSize(): { width: number; height: number } {
    // Get the container size
    const container = document.getElementById('pixi-container');
    if (!container) {
      return { width: window.innerWidth, height: window.innerHeight };
    }

    // Calculate size maintaining aspect ratio
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const aspectRatio = 16 / 10;

    let width, height;
    if (containerWidth / containerHeight > aspectRatio) {
      // Container is wider than aspect ratio
      height = containerHeight;
      width = height * aspectRatio;
    } else {
      // Container is taller than aspect ratio
      width = containerWidth;
      height = width / aspectRatio;
    }

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