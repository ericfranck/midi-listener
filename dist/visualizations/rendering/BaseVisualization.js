import * as PIXI from 'pixi.js';
export class BaseVisualization {
    constructor() {
        this.container = new PIXI.Container();
        this.config = {};
        this.state = { config: this.config };
    }
    initialize(container, config) {
        this.container = container;
        this.config = config;
        this.state = { config: this.config };
        this.setup();
    }
    update(state) {
        this.state = state;
        this.render();
    }
    cleanup() {
        this.container.removeChildren();
    }
}
//# sourceMappingURL=BaseVisualization.js.map