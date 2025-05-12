export declare function hexToRgb(hex: number): {
    r: number;
    g: number;
    b: number;
};
export declare function rgbToHex(r: number, g: number, b: number): number;
export declare function interpolateColor(startColor: number, endColor: number, factor: number): number;
export declare function hslToHex(h: number, s: number, l: number): number;
