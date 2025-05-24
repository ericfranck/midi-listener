import * as PIXI from 'pixi.js';

export class BackgroundEffect {
  private container: PIXI.Container;
  private background: PIXI.Graphics;
  private color: number;
  private app: PIXI.Application;

  constructor(container: PIXI.Container, app: PIXI.Application, color: string = '#000000') {
    this.container = container;
    this.app = app;
    this.color = this.parseColor(color);
    this.background = new PIXI.Graphics();
    // Add the background at the bottom of the display list
    if (this.container.children.length > 0) {
      this.container.addChildAt(this.background, 0);
    } else {
      this.container.addChild(this.background);
    }
    this.apply();
  }

  setColor(color: string): void {
    this.color = this.parseColor(color);
    this.apply();
  }

  setZIndex(zIndex: number): void {
    if (this.background) {
      this.background.zIndex = zIndex;
    }
  }

  private parseColor(color: string): number {
    if (color.startsWith('#')) {
      return parseInt(color.slice(1), 16);
    }
    return 0x000000;
  }

  private apply(): void {
    const width = this.app.renderer.width;
    const height = this.app.renderer.height;
    this.background.clear();
    this.background.beginFill(this.color);
    this.background.drawRect(0, 0, width, height);
    this.background.endFill();

    // Ensure background stays at the bottom
    if (this.background.parent && this.background.parent.getChildIndex(this.background) !== 0) {
      this.background.parent.setChildIndex(this.background, 0);
    }
  }

  resize(width: number, height: number): void {
    this.apply();
  }

  cleanup(): void {
    if (this.background) {
      this.container.removeChild(this.background);
      this.background.destroy();
    }
  }
} 