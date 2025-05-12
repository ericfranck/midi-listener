// viz-circlesquares.js

// === Visualization-specific Config ===
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

let firstCircleDrawn = false;
let firstSquareDrawn = false;

const vizCircleSquares = {
    // Set background color to match the original design
    backgroundColor: 0xED6A5A,
    
    init(app) {
        firstCircleDrawn = false;
        firstSquareDrawn = false;
        // Optionally clear stage
        app.stage.removeChildren();
    },
    handleMIDI(data, app) {
        const [status, note, velocity] = data.message;
        if (!(data.portName && data.portName.includes('IAC Driver'))) return;
        // Circle
        if ((status & 0xF0) === 144 && velocity > 0 && note === CIRCLE_NOTE) {
            const baseRadius = Math.min(app.renderer.width, app.renderer.height) * CIRCLE_BASE_SIZE_PCT;
            const radius = baseRadius * (1 - SIZE_RANDOMNESS + Math.random() * 2 * SIZE_RANDOMNESS);
            const colorFactor = 1 - COLOR_RANDOMNESS + Math.random() * 2 * COLOR_RANDOMNESS;
            const color = window.adjustColor(CIRCLE_BASE_COLOR, colorFactor);
            const circle = new PIXI.Graphics();
            circle.beginFill(color);
            circle.drawCircle(0, 0, radius);
            circle.endFill();
            let x, y;
            if (!firstCircleDrawn) {
                x = radius + Math.random() * (app.renderer.width - 2 * radius);
                y = radius + Math.random() * (app.renderer.height - 2 * radius);
                firstCircleDrawn = true;
            } else {
                x = -radius/2 + Math.random() * (app.renderer.width + radius);
                y = -radius/2 + Math.random() * (app.renderer.height + radius);
            }
            circle.x = x;
            circle.y = y;
            app.stage.addChild(circle);
        }
        // Square
        if ((status & 0xF0) === 144 && velocity > 0 && note === SQUARE_NOTE) {
            const baseSize = Math.min(app.renderer.width, app.renderer.height) * SQUARE_BASE_SIZE_PCT;
            const size = baseSize * (1 - SIZE_RANDOMNESS + Math.random() * 2 * SIZE_RANDOMNESS);
            const colorFactor = 1 - COLOR_RANDOMNESS + Math.random() * 2 * COLOR_RANDOMNESS;
            const color = window.adjustColor(SQUARE_BASE_COLOR, colorFactor);
            const square = new PIXI.Graphics();
            const strokeWidth = Math.min(app.renderer.width, app.renderer.height) * SQUARE_STROKE_WIDTH_PCT;
            square.lineStyle(strokeWidth, color);
            square.drawRect(-size/2, -size/2, size, size);
            let x, y;
            if (!firstSquareDrawn) {
                x = size/2 + Math.random() * (app.renderer.width - size);
                y = size/2 + Math.random() * (app.renderer.height - size);
                firstSquareDrawn = true;
            } else {
                x = -size/2 + Math.random() * (app.renderer.width + size);
                y = -size/2 + Math.random() * (app.renderer.height + size);
            }
            square.x = x;
            square.y = y;
            app.stage.addChild(square);
            // Animate rotation
            const baseRotationSpeed = (2 * Math.PI) / SQUARE_BASE_ROTATION_PERIOD;
            const rotationSpeed = baseRotationSpeed * (1 - SQUARE_ROTATION_RANDOMNESS + Math.random() * 2 * SQUARE_ROTATION_RANDOMNESS);
            const direction = Math.random() < 0.5 ? 1 : -1;
            app.ticker.add(function rotateSquare(delta) {
                square.rotation += direction * rotationSpeed * (app.ticker.deltaMS / 1000);
                if (!square.parent) {
                    app.ticker.remove(rotateSquare);
                }
            });
        }
    },
    cleanup() {
        // Optionally clear stage or remove listeners
        if (window.currentVisualization && window.currentVisualization.app) {
            window.currentVisualization.app.stage.removeChildren();
        }
    }
};
window.vizCircleSquares = vizCircleSquares; 