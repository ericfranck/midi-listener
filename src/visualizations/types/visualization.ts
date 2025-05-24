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
  onMidiMessage(status: number, data1: number, data2: number, portName?: string): void;
  cleanup(): void;
} 