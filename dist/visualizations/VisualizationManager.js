export class VisualizationManager {
    constructor(container) {
        this.currentVisualization = null;
        this.container = container;
        this.state = { config: {} };
    }
    setVisualization(visualization, config = {}) {
        if (this.currentVisualization) {
            this.currentVisualization.cleanup();
        }
        this.currentVisualization = visualization;
        this.state = { config };
        this.currentVisualization.initialize(this.container, config);
    }
    getCurrentVisualization() {
        return this.currentVisualization;
    }
    update(state) {
        if (this.currentVisualization) {
            this.state = { ...this.state, ...state };
            this.currentVisualization.update(this.state);
        }
    }
    cleanup() {
        if (this.currentVisualization) {
            this.currentVisualization.cleanup();
            this.currentVisualization = null;
        }
    }
    resize(width, height) {
        if (this.currentVisualization && 'resize' in this.currentVisualization) {
            this.currentVisualization.resize(width, height);
        }
    }
}
//# sourceMappingURL=VisualizationManager.js.map