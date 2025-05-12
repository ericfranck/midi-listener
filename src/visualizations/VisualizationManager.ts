import * as PIXI from 'pixi.js';
import { Visualization, VisualizationConfig, VisualizationState } from './types/visualization';

export class VisualizationManager {
  private container: PIXI.Container;
  private currentVisualization: Visualization | null = null;
  private state: VisualizationState;
  private app: PIXI.Application;

  constructor(container: PIXI.Container, app: PIXI.Application) {
    this.container = container;
    this.app = app;
    this.state = { config: {} };

    // Animation loop: call update on every frame
    this.app.ticker.add(() => {
      if (this.currentVisualization) {
        this.currentVisualization.update(this.state);
      }
    });
  }

  setVisualization(visualization: Visualization, config: VisualizationConfig = {}): void {
    if (this.currentVisualization) {
      this.currentVisualization.cleanup();
    }
    this.currentVisualization = visualization;
    this.state = { config };
    this.currentVisualization.initialize(this.container, this.app, config);
  }

  getCurrentVisualization(): Visualization | null {
    return this.currentVisualization;
  }

  update(state: Partial<VisualizationState>): void {
    if (this.currentVisualization) {
      this.state = { ...this.state, ...state };
      this.currentVisualization.update(this.state);
    }
  }

  cleanup(): void {
    if (this.currentVisualization) {
      this.currentVisualization.cleanup();
      this.currentVisualization = null;
    }
  }

  resize(width: number, height: number): void {
    if (this.currentVisualization && 'resize' in this.currentVisualization) {
      (this.currentVisualization as any).resize(width, height);
    }
  }
} 