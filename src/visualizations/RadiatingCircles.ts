import * as PIXI from 'pixi.js';
import { BaseVisualization } from './rendering/BaseVisualization';
import { BackgroundEffect } from './effects/BackgroundEffect';

// Background and blend mode constants
const DEFAULT_BACKGROUND_COLOR = '#DDDDDD';

// Circle colors, blend modes, and positions
const LEFT_CIRCLE_COLOR = 0x7594C2;
const LEFT_CIRCLE_BLEND_MODE = PIXI.BLEND_MODES.NORMAL;
const RIGHT_CIRCLE_COLOR = 0x823a35;
const RIGHT_CIRCLE_BLEND_MODE = PIXI.BLEND_MODES.NORMAL;
const CENTER_CIRCLE_COLOR = 0xbd9504;
const CENTER_CIRCLE_BLEND_MODE = PIXI.BLEND_MODES.SCREEN;

// Circle opacity values
const LEFT_CIRCLE_OPACITY = 1;
const RIGHT_CIRCLE_OPACITY = 1;
const CENTER_CIRCLE_OPACITY = 1;

// Layer ordering (using addChildAt instead of zIndex)
const BACKGROUND_LAYER = 0;
const LEFT_CIRCLES_LAYER = 1;
const RIGHT_CIRCLES_LAYER = 2;
const CENTER_CIRCLE_LAYER = 3;

// Center circle constants
const CENTER_CIRCLE_RADIUS_PCT = 0.25; // 25% of min(width, height)
const CENTER_CIRCLE_SIZE_CHANGE = 0.05; // 5% change per note
const CENTER_CIRCLE_MIN_SCALE = 0.4; // Don't shrink below 50% of base size
const CENTER_CIRCLE_MAX_SCALE = 2.0; // Don't grow beyond 200% of base size

// Expanding circles constants
const EXPANDING_CIRCLE_STROKE_WIDTH_PCT = 0.01; // 2% of min(width, height)
const EXPANDING_CIRCLE_MIN_STROKE_WIDTH = 0; // Minimum stroke width in pixels

// Define Port Names (These might need to be adjusted based on your system's MIDI port names)
const IAC_BUS_1_PORT_NAME = "IAC Driver Bus 1";
const IAC_BUS_2_PORT_NAME = "IAC Driver Bus 2";
const IAC_BUS_3_PORT_NAME = "IAC Driver Bus 3"; // For the third, center circle

const ANIMATION_DURATION = 35000; 

interface Circle {
  graphics: PIXI.Graphics;
  startTime: number;
  maxRadius: number;
  strokeWidth: number;
  color: number;
  origin: { x: number; y: number };
  opacity?: number;
  container: PIXI.Container;
}

export class RadiatingCircles extends BaseVisualization {
  private circles: Circle[] = [];
  private backgroundEffect!: BackgroundEffect;
  private leftOrigin = { x: 0, y: 0 };
  private rightOrigin = { x: 0, y: 0 };
  private centerOrigin = { x: 0, y: 0 };
  private centerCircle!: PIXI.Graphics;
  private currentCenterScale: number = 1.0;
  private leftCirclesContainer!: PIXI.Container;
  private rightCirclesContainer!: PIXI.Container;

  protected setup(): void {
    // Create layers for proper ordering
    this.container.removeChildren();
    this.container.x = 0;
    this.container.y = 0;
    
    const bgColor = this.config.backgroundColor || DEFAULT_BACKGROUND_COLOR;
    this.backgroundEffect = new BackgroundEffect(this.container, this.app, bgColor);
    
    // Create containers for each layer
    this.leftCirclesContainer = new PIXI.Container();
    this.leftCirclesContainer.x = 0;
    this.leftCirclesContainer.y = 0;
    this.rightCirclesContainer = new PIXI.Container();
    this.rightCirclesContainer.x = 0;
    this.rightCirclesContainer.y = 0;
    this.container.addChild(this.leftCirclesContainer);  // Layer 1
    this.container.addChild(this.rightCirclesContainer); // Layer 2
    
    this.updateOrigins();
    this.setupCenterCircle();
  }

  private setupCenterCircle(): void {
    if (this.centerCircle) {
      this.container.removeChild(this.centerCircle);
      this.centerCircle.destroy();
    }

    const width = this.app.screen.width;
    const height = this.app.screen.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * CENTER_CIRCLE_RADIUS_PCT;

    this.centerCircle = new PIXI.Graphics();
    this.centerCircle.beginFill(CENTER_CIRCLE_COLOR, CENTER_CIRCLE_OPACITY);
    this.centerCircle.drawCircle(0, 0, baseRadius * this.currentCenterScale);
    this.centerCircle.endFill();
    this.centerCircle.x = centerX;
    this.centerCircle.y = centerY;
    this.centerCircle.blendMode = CENTER_CIRCLE_BLEND_MODE;
    
    // Add center circle at the top
    this.container.addChild(this.centerCircle);
  }

  private updateOrigins(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    const spacing = width / 3; 
    const canvasCenterX = width / 2;
    const canvasCenterY = height / 2;

    this.leftOrigin = { x: canvasCenterX - spacing / 2, y: canvasCenterY };
    this.rightOrigin = { x: canvasCenterX + spacing / 2, y: canvasCenterY };
    this.centerOrigin = { x: canvasCenterX, y: canvasCenterY };
    
    // Update center circle position if it exists
    if (this.centerCircle) {
      this.centerCircle.x = this.centerOrigin.x;
      this.centerCircle.y = this.centerOrigin.y;
    }
  }

  public onMidiMessage(_status: number, _note: number, _velocity: number, portName?: string): void {
    if (portName === IAC_BUS_3_PORT_NAME) {
      // Calculate growth probability based on current scale
      // At min scale: 100% chance to grow
      // At max scale: 0% chance to grow
      // Linear interpolation between min and max
      const scaleRange = CENTER_CIRCLE_MAX_SCALE - CENTER_CIRCLE_MIN_SCALE;
      const normalizedScale = (this.currentCenterScale - CENTER_CIRCLE_MIN_SCALE) / scaleRange;
      const growthProbability = 1 - normalizedScale; // Probability of growing (0 to 1)
      
      // Determine growth or shrink based on current size
      const shouldGrow = Math.random() < growthProbability;
      const growOrShrink = shouldGrow ? 1 : -1;
      
      this.currentCenterScale += (CENTER_CIRCLE_SIZE_CHANGE * growOrShrink);
      
      // Clamp the scale between min and max values
      this.currentCenterScale = Math.max(
        CENTER_CIRCLE_MIN_SCALE,
        Math.min(CENTER_CIRCLE_MAX_SCALE, this.currentCenterScale)
      );

      // Update the circle size
      const width = this.app.screen.width;
      const height = this.app.screen.height;
      const baseRadius = Math.min(width, height) * CENTER_CIRCLE_RADIUS_PCT;
      this.centerCircle.clear();
      this.centerCircle.beginFill(CENTER_CIRCLE_COLOR, CENTER_CIRCLE_OPACITY);
      this.centerCircle.drawCircle(0, 0, baseRadius * this.currentCenterScale);
      this.centerCircle.endFill();
      return;
    }

    let origin: { x: number; y: number } | undefined;
    let color: number | undefined;
    let blendMode: number | undefined;
    let opacity: number | undefined;
    let targetContainer: PIXI.Container | undefined;

    if (portName === IAC_BUS_1_PORT_NAME) {
      origin = this.leftOrigin;
      color = LEFT_CIRCLE_COLOR;
      blendMode = LEFT_CIRCLE_BLEND_MODE;
      opacity = LEFT_CIRCLE_OPACITY;
      targetContainer = this.leftCirclesContainer;
    } else if (portName === IAC_BUS_2_PORT_NAME) {
      origin = this.rightOrigin;
      color = RIGHT_CIRCLE_COLOR;
      blendMode = RIGHT_CIRCLE_BLEND_MODE;
      opacity = RIGHT_CIRCLE_OPACITY;
      targetContainer = this.rightCirclesContainer;
    } else {
      return;
    }

    if (!origin || color === undefined || blendMode === undefined || opacity === undefined || !targetContainer) {
      return;
    }

    const width = this.app.screen.width;
    const height = this.app.screen.height;
    const strokeWidth = Math.max(
      EXPANDING_CIRCLE_MIN_STROKE_WIDTH, 
      Math.min(width, height) * EXPANDING_CIRCLE_STROKE_WIDTH_PCT
    );

    const corners = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: 0, y: height },
      { x: width, y: height },
    ];
    let maxDistSq = 0;
    for (const corner of corners) {
      const distSq = (corner.x - origin.x) ** 2 + (corner.y - origin.y) ** 2;
      if (distSq > maxDistSq) {
        maxDistSq = distSq;
      }
    }
    const maxRadius = Math.sqrt(maxDistSq) + strokeWidth / 2;

    const graphics = new PIXI.Graphics();
    graphics.blendMode = blendMode;
    
    // Add expanding circle to its dedicated container
    targetContainer.addChild(graphics);

    this.circles.push({
      graphics,
      startTime: performance.now(),
      maxRadius,
      strokeWidth,
      color,
      origin: { ...origin },
      opacity,
      container: targetContainer
    });
  }

  protected render(): void {
    // Only handle expanding circles animation
    const now = performance.now();
    this.circles = this.circles.filter(circle => {
      const elapsed = now - circle.startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      
      circle.graphics.clear();
      circle.graphics.lineStyle(
        circle.strokeWidth,
        circle.color,
        circle.opacity || LEFT_CIRCLE_OPACITY
      );
      circle.graphics.drawCircle(0, 0, circle.maxRadius * progress);
      circle.graphics.x = circle.origin.x;
      circle.graphics.y = circle.origin.y;

      if (progress >= 1) {
        circle.container.removeChild(circle.graphics);
        circle.graphics.destroy();
        return false;
      }
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
    // Update background
    if (this.backgroundEffect) {
      this.backgroundEffect.resize(this.app.screen.width, this.app.screen.height);
    }

    // Update origins and center circle
    this.updateOrigins();
    this.setupCenterCircle();

    // Update existing circles
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    const strokeWidth = Math.max(
      EXPANDING_CIRCLE_MIN_STROKE_WIDTH, 
      Math.min(width, height) * EXPANDING_CIRCLE_STROKE_WIDTH_PCT
    );

    this.circles.forEach(circle => {
      // Recalculate max radius for the new dimensions
      const corners = [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: 0, y: height },
        { x: width, y: height },
      ];
      let maxDistSq = 0;
      for (const corner of corners) {
        const distSq = (corner.x - circle.origin.x) ** 2 + (corner.y - circle.origin.y) ** 2;
        if (distSq > maxDistSq) {
          maxDistSq = distSq;
        }
      }
      circle.maxRadius = Math.sqrt(maxDistSq) + strokeWidth / 2;
      circle.strokeWidth = strokeWidth;

      // Update circle position
      circle.graphics.x = circle.origin.x;
      circle.graphics.y = circle.origin.y;
    });
  }

  cleanup(): void {
    this.circles.forEach(circle => {
      circle.container.removeChild(circle.graphics);
      circle.graphics.destroy();
    });
    this.circles = [];
    if (this.centerCircle) {
      this.container.removeChild(this.centerCircle);
      this.centerCircle.destroy();
    }
    if (this.backgroundEffect) {
      this.backgroundEffect.cleanup();
    }
    if (this.leftCirclesContainer) {
      this.leftCirclesContainer.destroy();
    }
    if (this.rightCirclesContainer) {
      this.rightCirclesContainer.destroy();
    }
    super.cleanup();
  }
} 