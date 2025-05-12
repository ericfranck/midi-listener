import * as PIXI from 'pixi.js';
export declare class BlendModeEffect {
    private container;
    private blendMode;
    constructor(container: PIXI.Container, blendMode?: number);
    setBlendMode(blendMode: number): void;
    private apply;
}
