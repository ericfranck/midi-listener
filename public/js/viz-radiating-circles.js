// viz-radiating-circles.js
const LEFT_CIRCLE_COLOR = 0x7594C2;  
const RIGHT_CIRCLE_COLOR = 0xB65D81; 
const ANIMATION_DURATION = 20000;     

// MIDI note configuration
const LEFT_CIRCLE_NOTE = 36;  // Default: C2
const RIGHT_CIRCLE_NOTE = 40; // Default: E2

// Blend mode configuration
const CIRCLE_BLEND_MODE = PIXI.BLEND_MODES.SCREEN;  // Options: NORMAL, ADD, MULTIPLY, SCREEN, etc.

const vizRadiatingCircles = {
    backgroundColor: 0x0B1019,
    
    init(app) {
        this.app = app;
        this.circles = [];
        app.stage.removeChildren();
        
        // Calculate origin points
        this.updateOriginPoints(app);
        
        // Listen for resize events
        window.addEventListener('resize', () => {
            this.updateOriginPoints(app);
        });
    },

    updateOriginPoints(app) {
        const canvasWidth = app.renderer.width;
        const canvasHeight = app.renderer.height;
        
        // Calculate points 1/3 of canvas width apart
        const spacing = canvasWidth / 3;
        const centerX = canvasWidth / 2;
        
        this.leftOrigin = {
            x: centerX - spacing / 2,
            y: canvasHeight / 2
        };
        
        this.rightOrigin = {
            x: centerX + spacing / 2,
            y: canvasHeight / 2
        };
    },

    handleMIDI(data, app) {
        const [status, note, velocity] = data.message;
        if (!(data.portName && data.portName.includes('IAC Driver'))) return;

        if ((status & 0xF0) === 144 && velocity > 0) {
            // Determine which origin point to use based on note
            const origin = note === LEFT_CIRCLE_NOTE ? this.leftOrigin : 
                          note === RIGHT_CIRCLE_NOTE ? this.rightOrigin : null;
            
            // Skip if note doesn't match either trigger note
            if (!origin) return;
            
            const color = note === LEFT_CIRCLE_NOTE ? LEFT_CIRCLE_COLOR : RIGHT_CIRCLE_COLOR;
            
            // Calculate stroke width (3% of canvas width)
            const strokeWidth = app.renderer.width * 0.01;
            
            // Create circle
            const circle = new PIXI.Graphics();
            circle.blendMode = CIRCLE_BLEND_MODE;
            circle.lineStyle(strokeWidth, color);
            circle.drawCircle(0, 0, 0);
            circle.x = origin.x;
            circle.y = origin.y;
            
            // Add to stage and tracking array
            app.stage.addChild(circle);
            this.circles.push(circle);
            
            // Calculate growth parameters
            const startTime = performance.now();
            const maxRadius = Math.max(
                Math.sqrt(Math.pow(app.renderer.width, 2) + Math.pow(app.renderer.height, 2)) + strokeWidth,
                Math.sqrt(Math.pow(origin.x, 2) + Math.pow(origin.y, 2)) + strokeWidth,
                Math.sqrt(Math.pow(app.renderer.width - origin.x, 2) + Math.pow(app.renderer.height - origin.y, 2)) + strokeWidth
            );
            
            // Animate the circle
            app.ticker.add(function animateCircle(delta) {
                if (!circle.parent) {
                    app.ticker.remove(animateCircle);
                    return;
                }
                
                const elapsed = performance.now() - startTime;
                const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
                
                // Update circle radius
                circle.clear();
                circle.lineStyle(strokeWidth, color);
                circle.drawCircle(0, 0, maxRadius * progress);
                
                // Remove circle when animation is complete
                if (progress >= 1) {
                    app.stage.removeChild(circle);
                    const index = this.circles.indexOf(circle);
                    if (index > -1) {
                        this.circles.splice(index, 1);
                    }
                }
            }.bind(this));
        }
    },

    cleanup() {
        if (this.app) {
            this.app.stage.removeChildren();
            this.circles = [];
        }
    }
};

window.vizRadiatingCircles = vizRadiatingCircles; 