import * as PIXI from 'pixi.js';

export interface VisualizationConfig {
  backgroundColor?: string;
  blendMode?: number;
  [key: string]: any;
}

export interface VisualizationState {
  config: VisualizationConfig;
  [key: string]: any;
}

export interface Visualization {
  initialize(container: PIXI.Container, app: PIXI.Application, config: VisualizationConfig): void;
  update(state: VisualizationState): void;
  cleanup(): void;
  addCircle?(note: number, velocity: number, x: number, y: number): void;
} 