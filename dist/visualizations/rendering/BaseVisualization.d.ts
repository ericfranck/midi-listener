import * as PIXI from 'pixi.js';
import { Visualization, VisualizationConfig, VisualizationState } from '../types/visualization';
export declare abstract class BaseVisualization implements Visualization {
    protected container: PIXI.Container;
    protected config: VisualizationConfig;
    protected state: VisualizationState;
    constructor();
    initialize(container: PIXI.Container, config: VisualizationConfig): void;
    update(state: VisualizationState): void;
    cleanup(): void;
    protected abstract setup(): void;
    protected abstract render(): void;
}
