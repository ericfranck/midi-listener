import * as PIXI from 'pixi.js';
import { BaseVisualization } from './rendering/BaseVisualization';
import { BackgroundEffect } from './effects/BackgroundEffect';

// Background and blend mode constants
const DEFAULT_BACKGROUND_COLOR = '#ED6A5A';

// Shape colors and sizes
const CIRCLE_BASE_COLOR = 0xED6A5A;
const SQUARE_BASE_COLOR = 0x22333B;
const CIRCLE_BASE_SIZE_PCT = 0.25;
const SQUARE_BASE_SIZE_PCT = 0.35;
const SQUARE_STROKE_WIDTH_PCT = 0.01;
const SIZE_RANDOMNESS = 0.5;
const COLOR_RANDOMNESS = 0.25;
const SQUARE_BASE_ROTATION_PERIOD = 128;
const SQUARE_ROTATION_RANDOMNESS = 0.5;
const CIRCLE_NOTE = 36;
const SQUARE_NOTE = 40;

function adjustColor(hex: number, factor: number): number {
  // Simple HSL lightness adjustment
  let r = (hex >> 16) & 0xff;
  let g = (hex >> 8) & 0xff;
  let b = hex & 0xff;
  r = Math.min(255, Math.max(0, Math.round(r * factor)));
  g = Math.min(255, Math.max(0, Math.round(g * factor)));
  b = Math.min(255, Math.max(0, Math.round(b * factor)));
  return (r << 16) + (g << 8) + b;
}

interface RotatingSquare {
  graphics: PIXI.Graphics;
  rotationSpeed: number;
  direction: number;
}

export class Circlesquares extends BaseVisualization {
  private firstCircleDrawn = false;
  private firstSquareDrawn = false;
  private rotatingSquares: RotatingSquare[] = [];
  private backgroundEffect!: BackgroundEffect;

  protected setup(): void {
    this.firstCircleDrawn = false;
    this.firstSquareDrawn = false;
    this.rotatingSquares = [];
    this.container.removeChildren();
    this.backgroundEffect = new BackgroundEffect(this.container, this.app, this.config.backgroundColor || DEFAULT_BACKGROUND_COLOR);
  }

  addCircle(note: number, velocity: number, _x: number, _y: number): void {
    const w = this.app.renderer.width;
    const h = this.app.renderer.height;
    if (note === CIRCLE_NOTE) {
      const baseRadius = Math.min(w, h) * CIRCLE_BASE_SIZE_PCT;
      const radius = baseRadius * (1 - SIZE_RANDOMNESS + Math.random() * 2 * SIZE_RANDOMNESS);
      const colorFactor = 1 - COLOR_RANDOMNESS + Math.random() * 2 * COLOR_RANDOMNESS;
      const color = adjustColor(CIRCLE_BASE_COLOR, colorFactor);
      const circle = new PIXI.Graphics();
      circle.beginFill(color);
      circle.drawCircle(0, 0, radius);
      circle.endFill();
      let x, y;
      if (!this.firstCircleDrawn) {
        x = radius + Math.random() * (w - 2 * radius);
        y = radius + Math.random() * (h - 2 * radius);
        this.firstCircleDrawn = true;
      } else {
        x = -radius/2 + Math.random() * (w + radius);
        y = -radius/2 + Math.random() * (h + radius);
      }
      circle.x = x;
      circle.y = y;
      this.container.addChild(circle);
    }
    if (note === SQUARE_NOTE) {
      const baseSize = Math.min(w, h) * SQUARE_BASE_SIZE_PCT;
      const size = baseSize * (1 - SIZE_RANDOMNESS + Math.random() * 2 * SIZE_RANDOMNESS);
      const colorFactor = 1 - COLOR_RANDOMNESS + Math.random() * 2 * COLOR_RANDOMNESS;
      const color = adjustColor(SQUARE_BASE_COLOR, colorFactor);
      const square = new PIXI.Graphics();
      const strokeWidth = Math.min(w, h) * SQUARE_STROKE_WIDTH_PCT;
      square.lineStyle(strokeWidth, color);
      square.drawRect(-size/2, -size/2, size, size);
      let x, y;
      if (!this.firstSquareDrawn) {
        x = size/2 + Math.random() * (w - size);
        y = size/2 + Math.random() * (h - size);
        this.firstSquareDrawn = true;
      } else {
        x = -size/2 + Math.random() * (w + size);
        y = -size/2 + Math.random() * (h + size);
      }
      square.x = x;
      square.y = y;
      this.container.addChild(square);
      // Animate rotation
      const baseRotationSpeed = (2 * Math.PI) / SQUARE_BASE_ROTATION_PERIOD;
      const rotationSpeed = baseRotationSpeed * (1 - SQUARE_ROTATION_RANDOMNESS + Math.random() * 2 * SQUARE_ROTATION_RANDOMNESS);
      const direction = Math.random() < 0.5 ? 1 : -1;
      this.rotatingSquares.push({ graphics: square, rotationSpeed, direction });
    }
  }

  protected render(): void {
    // Animate rotating squares
    const deltaMS = this.app.ticker.elapsedMS;
    this.rotatingSquares = this.rotatingSquares.filter(sq => {
      if (!sq.graphics.parent) return false;
      sq.graphics.rotation += sq.direction * sq.rotationSpeed * (deltaMS / 1000);
      return true;
    });
  }

  setBackgroundColor(color: string): void {
    if (this.backgroundEffect) {
      this.backgroundEffect.setColor(color);
    }
    this.config.backgroundColor = color;
  }

  resize(_width: number, _height: number): void {
    if (this.backgroundEffect) {
      this.backgroundEffect.resize(this.app.renderer.width, this.app.renderer.height);
    }
  }

  public onMidiMessage(status: number, note: number, velocity: number, _portName?: string): void {
    // Only handle Note On messages (status 144-159) with velocity > 0
    if ((status & 0xF0) === 144 && velocity > 0) {
      this.addCircle(note, velocity, 0, 0);
    }
  }

  cleanup(): void {
    this.container.removeChildren();
    this.rotatingSquares = [];
    this.firstCircleDrawn = false;
    this.firstSquareDrawn = false;
    if (this.backgroundEffect) {
      this.backgroundEffect.cleanup();
    }
    super.cleanup();
  }
} 