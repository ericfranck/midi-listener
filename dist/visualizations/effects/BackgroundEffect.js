import * as PIXI from 'pixi.js';
export class BackgroundEffect {
    constructor(container, color = '#000000') {
        this.container = container;
        this.color = this.parseColor(color);
        this.background = new PIXI.Graphics();
        this.container.addChildAt(this.background, 0);
        this.apply();
    }
    setColor(color) {
        this.color = this.parseColor(color);
        this.apply();
    }
    parseColor(color) {
        if (color.startsWith('#')) {
            return parseInt(color.slice(1), 16);
        }
        return 0x000000;
    }
    apply() {
        this.background.clear();
        this.background.beginFill(this.color);
        this.background.drawRect(0, 0, this.container.width, this.container.height);
        this.background.endFill();
    }
    resize(width, height) {
        this.apply();
    }
}
//# sourceMappingURL=BackgroundEffect.js.map