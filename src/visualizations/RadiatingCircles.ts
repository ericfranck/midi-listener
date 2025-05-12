import * as PIXI from 'pixi.js';
import { BaseVisualization } from './rendering/BaseVisualization';
import { BlendModeEffect } from './effects/BlendModeEffect';
import { BackgroundEffect } from './effects/BackgroundEffect';

const LEFT_CIRCLE_COLOR = 0x7594C2;
const RIGHT_CIRCLE_COLOR = 0xB65D81;
const ANIMATION_DURATION = 20000;
const LEFT_CIRCLE_NOTE = 36;
const RIGHT_CIRCLE_NOTE = 40;

interface Circle {
  graphics: PIXI.Graphics;
  startTime: number;
  maxRadius: number;
  strokeWidth: number;
  color: number;
  origin: { x: number; y: number };
}

export class RadiatingCircles extends BaseVisualization {
  private circles: Circle[] = [];
  private blendModeEffect!: BlendModeEffect;
  private backgroundEffect!: BackgroundEffect;
  private leftOrigin = { x: 0, y: 0 };
  private rightOrigin = { x: 0, y: 0 };

  protected setup(): void {
    this.blendModeEffect = new BlendModeEffect(this.container, PIXI.BLEND_MODES.SCREEN);
    this.backgroundEffect = new BackgroundEffect(this.container, this.config.backgroundColor);
    this.updateOrigins();
    window.addEventListener('resize', () => this.updateOrigins());
  }

  private updateOrigins(): void {
    const width = this.app.renderer.width;
    const height = this.app.renderer.height;
    const spacing = width / 3;
    const centerX = width / 2;
    this.leftOrigin = { x: centerX - spacing / 2, y: height / 2 };
    this.rightOrigin = { x: centerX + spacing / 2, y: height / 2 };
  }

  protected render(): void {
    const now = performance.now();
    this.circles = this.circles.filter(circle => {
      const elapsed = now - circle.startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      circle.graphics.clear();
      circle.graphics.lineStyle(circle.strokeWidth, circle.color);
      circle.graphics.drawCircle(0, 0, circle.maxRadius * progress);
      circle.graphics.x = circle.origin.x;
      circle.graphics.y = circle.origin.y;
      if (progress >= 1) {
        this.container.removeChild(circle.graphics);
        return false;
      }
      return true;
    });
  }

  addCircle(note: number, velocity: number, _x: number, _y: number): void {
    // Only respond to notes 36 and 40
    let origin, color;
    if (note === LEFT_CIRCLE_NOTE) {
      origin = this.leftOrigin;
      color = LEFT_CIRCLE_COLOR;
    } else if (note === RIGHT_CIRCLE_NOTE) {
      origin = this.rightOrigin;
      color = RIGHT_CIRCLE_COLOR;
    } else {
      return;
    }
    const width = this.app.renderer.width;
    const height = this.app.renderer.height;
    const strokeWidth = width * 0.01;
    // Calculate max radius as in the original
    const maxRadius = Math.max(
      Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) + strokeWidth,
      Math.sqrt(Math.pow(origin.x, 2) + Math.pow(origin.y, 2)) + strokeWidth,
      Math.sqrt(Math.pow(width - origin.x, 2) + Math.pow(height - origin.y, 2)) + strokeWidth
    );
    const graphics = new PIXI.Graphics();
    graphics.blendMode = PIXI.BLEND_MODES.SCREEN;
    this.container.addChild(graphics);
    this.circles.push({
      graphics,
      startTime: performance.now(),
      maxRadius,
      strokeWidth,
      color,
      origin: { ...origin }
    });
  }

  setBlendMode(blendMode: number): void {
    this.blendModeEffect.setBlendMode(blendMode);
  }

  setBackgroundColor(color: string): void {
    this.backgroundEffect.setColor(color);
  }

  resize(width: number, height: number): void {
    this.backgroundEffect.resize(width, height);
    this.updateOrigins();
  }

  cleanup(): void {
    this.circles.forEach(circle => {
      this.container.removeChild(circle.graphics);
    });
    this.circles = [];
    super.cleanup();
  }
} 