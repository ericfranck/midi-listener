import * as PIXI from 'pixi.js';
import { BaseVisualization } from './rendering/BaseVisualization';
import { BlendModeEffect } from './effects/BlendModeEffect';
import { BackgroundEffect } from './effects/BackgroundEffect';
import { interpolateColor, hslToHex } from './utils/color';
import { easeOutQuad } from './utils/animation';
export class RadiatingCircles extends BaseVisualization {
    constructor() {
        super(...arguments);
        this.circles = [];
        this.maxCircles = 50;
        this.defaultDuration = 2000;
        this.defaultStrokeWidth = 2;
    }
    setup() {
        this.blendModeEffect = new BlendModeEffect(this.container, this.config.blendMode);
        this.backgroundEffect = new BackgroundEffect(this.container, this.config.backgroundColor);
    }
    render() {
        const currentTime = Date.now();
        // Remove expired circles
        this.circles = this.circles.filter(circle => {
            const age = currentTime - circle.startTime;
            if (age > circle.duration) {
                this.container.removeChild(circle.graphics);
                return false;
            }
            return true;
        });
        // Update existing circles
        this.circles.forEach(circle => {
            const age = currentTime - circle.startTime;
            const progress = age / circle.duration;
            const easedProgress = easeOutQuad(progress);
            const currentRadius = circle.startRadius + (circle.endRadius - circle.startRadius) * easedProgress;
            const currentColor = interpolateColor(circle.startColor, circle.endColor, easedProgress);
            circle.graphics.clear();
            circle.graphics.lineStyle(this.defaultStrokeWidth, currentColor);
            circle.graphics.drawCircle(circle.startX, circle.startY, currentRadius);
        });
    }
    addCircle(note, velocity, x, y) {
        if (this.circles.length >= this.maxCircles) {
            const oldestCircle = this.circles.shift();
            if (oldestCircle) {
                this.container.removeChild(oldestCircle.graphics);
            }
        }
        const startRadius = 10;
        const endRadius = Math.max(100, velocity * 2);
        const startColor = 0xFFFFFF;
        const endColor = hslToHex(note * 2, 100, 50);
        const duration = this.defaultDuration;
        const graphics = new PIXI.Graphics();
        this.container.addChild(graphics);
        this.circles.push({
            graphics,
            startTime: Date.now(),
            duration,
            startRadius,
            endRadius,
            startColor,
            endColor,
            startX: x,
            startY: y
        });
    }
    setBlendMode(blendMode) {
        this.blendModeEffect.setBlendMode(blendMode);
    }
    setBackgroundColor(color) {
        this.backgroundEffect.setColor(color);
    }
    resize(width, height) {
        this.backgroundEffect.resize(width, height);
    }
}
//# sourceMappingURL=RadiatingCircles.js.map