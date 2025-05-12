import * as PIXI from 'pixi.js';
export class BlendModeEffect {
    constructor(container, blendMode = PIXI.BLEND_MODES.NORMAL) {
        this.container = container;
        this.blendMode = blendMode;
        this.apply();
    }
    setBlendMode(blendMode) {
        this.blendMode = blendMode;
        this.apply();
    }
    apply() {
        this.container.blendMode = this.blendMode;
    }
}
//# sourceMappingURL=BlendModeEffect.js.map