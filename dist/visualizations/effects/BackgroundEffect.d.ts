import * as PIXI from 'pixi.js';
export declare class BackgroundEffect {
    private container;
    private background;
    private color;
    constructor(container: PIXI.Container, color?: string);
    setColor(color: string): void;
    private parseColor;
    private apply;
    resize(width: number, height: number): void;
}
