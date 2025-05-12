export function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
export function easeOutQuad(t) {
    return t * (2 - t);
}
export function easeInQuad(t) {
    return t * t;
}
export function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
//# sourceMappingURL=animation.js.map