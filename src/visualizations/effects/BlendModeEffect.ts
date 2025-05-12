import * as PIXI from 'pixi.js';

export class BlendModeEffect {
  private container: PIXI.Container;
  private blendMode: number;

  constructor(container: PIXI.Container, blendMode: number = PIXI.BLEND_MODES.NORMAL) {
    this.container = container;
    this.blendMode = blendMode;
    this.applyBlendMode();
  }

  private applyBlendMode(): void {
    this.container.blendMode = this.blendMode;
  }

  setBlendMode(blendMode: number): void {
    this.blendMode = blendMode;
    this.applyBlendMode();
  }
} 