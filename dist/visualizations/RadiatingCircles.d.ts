import { BaseVisualization } from './rendering/BaseVisualization';
export declare class RadiatingCircles extends BaseVisualization {
    private circles;
    private blendModeEffect;
    private backgroundEffect;
    private readonly maxCircles;
    private readonly defaultDuration;
    private readonly defaultStrokeWidth;
    protected setup(): void;
    protected render(): void;
    addCircle(note: number, velocity: number, x: number, y: number): void;
    setBlendMode(blendMode: number): void;
    setBackgroundColor(color: string): void;
    resize(width: number, height: number): void;
}
