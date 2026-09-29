/**
 * @jest-environment jsdom
 */

const { MatrixEngine, CHARACTER_SETS, COLOR_THEMES } = require('../src/script.js');

describe('Matrix Engine Core Tests', () => {
    let canvas;
    let mockCtx;

    beforeEach(() => {
        // Setup mock canvas and 2D context
        canvas = document.createElement('canvas');
        mockCtx = {
            fillStyle: '',
            font: '',
            shadowBlur: 0,
            shadowColor: '',
            fillRect: jest.fn(),
            fillText: jest.fn(),
        };
        canvas.getContext = jest.fn().mockReturnValue(mockCtx);

        // Mock window dimensions
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });
    });

    test('should initialize with default parameters', () => {
        const engine = new MatrixEngine(canvas);
        expect(engine.fps).toBe(30);
        expect(engine.density).toBe(85);
        expect(engine.fontSize).toBe(16);
        expect(engine.charsetKey).toBe('katakana');
        expect(engine.themeKey).toBe('matrix');
        expect(engine.isPaused).toBe(false);
    });

    test('should calculate columns correctly based on width and font size', () => {
        const engine = new MatrixEngine(canvas, { fontSize: 16 });
        // 1024 / 16 = 64 columns
        expect(engine.columns).toBe(64);
        expect(engine.drops.length).toBe(64);
    });

    test('should update FPS within valid bounds [1, 60]', () => {
        const engine = new MatrixEngine(canvas);
        engine.setFps(45);
        expect(engine.fps).toBe(45);
        engine.setFps(100);
        expect(engine.fps).toBe(60);
        engine.setFps(-10);
        expect(engine.fps).toBe(1);
    });

    test('should update density within valid bounds [10, 100]', () => {
        const engine = new MatrixEngine(canvas);
        engine.setDensity(50);
        expect(engine.density).toBe(50);
        engine.setDensity(150);
        expect(engine.density).toBe(100);
    });

    test('should switch character sets correctly', () => {
        const engine = new MatrixEngine(canvas);
        engine.setCharset('binary');
        expect(engine.getCharacters()).toBe(CHARACTER_SETS.binary);

        engine.setCharset('hex');
        expect(engine.getCharacters()).toBe(CHARACTER_SETS.hex);
    });

    test('should switch color themes correctly', () => {
        const engine = new MatrixEngine(canvas);
        engine.setTheme('cyberpunk');
        expect(engine.getTheme()).toEqual(COLOR_THEMES.cyberpunk);
    });

    test('should toggle pause and resume states', () => {
        const engine = new MatrixEngine(canvas);
        expect(engine.isPaused).toBe(false);
        const pausedState = engine.togglePause();
        expect(pausedState).toBe(true);
        expect(engine.isPaused).toBe(true);
    });

    test('should execute step rendering without throwing errors', () => {
        const engine = new MatrixEngine(canvas);
        expect(() => engine.step()).not.toThrow();
        expect(mockCtx.fillRect).toHaveBeenCalled();
        expect(mockCtx.fillText).toHaveBeenCalled();
    });
});
