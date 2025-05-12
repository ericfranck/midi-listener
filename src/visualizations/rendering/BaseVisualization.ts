import * as PIXI from 'pixi.js';
import { Visualization, VisualizationConfig, VisualizationState } from '../types/visualization';

export abstract class BaseVisualization implements Visualization {
  protected container: PIXI.Container;
  protected config: VisualizationConfig;
  protected state: VisualizationState;
  protected app!: PIXI.Application;

  constructor() {
    this.container = new PIXI.Container();
    this.config = {};
    this.state = { config: this.config };
  }

  initialize(container: PIXI.Container, app: PIXI.Application, config: VisualizationConfig = {}): void {
    this.container = container;
    this.app = app;
    this.config = config;
    this.state = { config: this.config };
    this.setup();
  }

  update(state: VisualizationState): void {
    this.state = state;
    this.render();
  }

  cleanup(): void {
    this.container.removeChildren();
  }

  protected abstract setup(): void;
  protected abstract render(): void;
} 