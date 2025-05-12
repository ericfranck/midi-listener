import * as PIXI from 'pixi.js';
import { Visualization, VisualizationConfig, VisualizationState } from './types/visualization';
export declare class VisualizationManager {
    private container;
    private currentVisualization;
    private state;
    constructor(container: PIXI.Container);
    setVisualization(visualization: Visualization, config?: VisualizationConfig): void;
    getCurrentVisualization(): Visualization | null;
    update(state: Partial<VisualizationState>): void;
    cleanup(): void;
    resize(width: number, height: number): void;
}
