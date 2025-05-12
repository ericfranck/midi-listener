import * as PIXI from 'pixi.js';

export class BackgroundEffect {
  private container: PIXI.Container;
  private background: PIXI.Graphics;
  private color: number;

  constructor(container: PIXI.Container, color: string = '#000000') {
    this.container = container;
    this.color = this.parseColor(color);
    this.background = new PIXI.Graphics();
    this.container.addChildAt(this.background, 0);
    this.apply();
  }

  setColor(color: string): void {
    this.color = this.parseColor(color);
    this.apply();
  }

  private parseColor(color: string): number {
    if (color.startsWith('#')) {
      return parseInt(color.slice(1), 16);
    }
    return 0x000000;
  }

  private apply(): void {
    this.background.clear();
    this.background.beginFill(this.color);
    this.background.drawRect(0, 0, this.container.width, this.container.height);
    this.background.endFill();
  }

  resize(width: number, height: number): void {
    this.apply();
  }
} 