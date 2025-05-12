declare global {
    interface Window {
        midiVisualizer: MIDIVisualizer;
    }
}
export declare class MIDIVisualizer {
    private app;
    private visualizationManager;
    private ws;
    constructor();
    private initializePIXI;
    private initializeWebSocket;
    private initializeVisualization;
    private handleResize;
    private handleVisualizationChange;
    private handleMIDI;
    private setVisualization;
    private getCanvasSize;
    cleanup(): void;
}
