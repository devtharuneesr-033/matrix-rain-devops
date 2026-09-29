/**
 * Matrix Rain Effect Engine
 * High-performance HTML5 Canvas digital rain renderer with customizable speed & controls.
 */

// Character Sets definition
const CHARACTER_SETS = {
    katakana: 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789',
    binary: '01',
    ascii: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+-/<>~',
    hex: '0123456789ABCDEF',
    runic: 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚻᚼᚽᚾᚿᛀᛁᛂᛃᛄᛅᛆᛇᛈᛉᛊᛋᛌᛍᛎᛏᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟ'
};

// Color Themes definition
const COLOR_THEMES = {
    matrix: {
        primary: '#00ff66',
        glow: '#ccffdd',
        fade: 'rgba(13, 13, 13, 0.08)',
        cssPrimary: '#00ff66'
    },
    cyberpunk: {
        primary: '#00f0ff',
        glow: '#ff0077',
        fade: 'rgba(10, 5, 20, 0.08)',
        cssPrimary: '#00f0ff'
    },
    redcode: {
        primary: '#ff2a2a',
        glow: '#ffb3b3',
        fade: 'rgba(18, 5, 5, 0.08)',
        cssPrimary: '#ff2a2a'
    },
    gold: {
        primary: '#ffd700',
        glow: '#ffffff',
        fade: 'rgba(20, 16, 5, 0.08)',
        cssPrimary: '#ffd700'
    },
    amber: {
        primary: '#ffb000',
        glow: '#ffeaad',
        fade: 'rgba(20, 12, 0, 0.08)',
        cssPrimary: '#ffb000'
    }
};

// Application State
class MatrixEngine {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Configuration state
        this.fps = options.fps || 30;
        this.density = options.density || 85; // percentage
        this.fontSize = options.fontSize || 16;
        this.charsetKey = options.charsetKey || 'katakana';
        this.themeKey = options.themeKey || 'matrix';
        this.isPaused = false;
        
        // Grid & Render calculations
        this.columns = 0;
        this.drops = [];
        this.speeds = [];
        this.lastFrameTime = performance.now();
        this.animFrameId = null;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = [];
        this.speeds = [];

        for (let i = 0; i < this.columns; i++) {
            // Random initial Y positions (negative values stagger start times)
            this.drops[i] = Math.floor(Math.random() * -50);
            // Random column speed variation (1 to 2x speed factor)
            this.speeds[i] = 1 + Math.random() * 0.8;
        }

        // Update column metric display if DOM element exists
        const colElem = document.getElementById('columnsVal');
        if (colElem) colElem.textContent = this.columns.toString();
    }

    getCharacters() {
        return CHARACTER_SETS[this.charsetKey] || CHARACTER_SETS.katakana;
    }

    getTheme() {
        return COLOR_THEMES[this.themeKey] || COLOR_THEMES.matrix;
    }

    step() {
        const theme = this.getTheme();
        const chars = this.getCharacters();

        // Translucent background fade overlay creating trailing effect
        this.ctx.fillStyle = theme.fade;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.font = `${this.fontSize}px 'Share Tech Mono', monospace`;

        const activeColumnThreshold = (this.density / 100);

        for (let i = 0; i < this.columns; i++) {
            // Skip column rendering based on density slider
            if (i / this.columns > activeColumnThreshold) continue;

            // Pick random character
            const text = chars.charAt(Math.floor(Math.random() * chars.length));
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;

            // Render leading glowing head character
            this.ctx.fillStyle = theme.glow;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = theme.primary;
            this.ctx.fillText(text, x, y);

            // Render trailing body character directly behind head
            if (this.drops[i] > 1) {
                const prevY = (this.drops[i] - 1) * this.fontSize;
                const prevText = chars.charAt(Math.floor(Math.random() * chars.length));
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = theme.primary;
                this.ctx.fillText(prevText, x, prevY);
            }

            // Reset drop position if off bottom of screen
            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }

            // Advance drop position
            this.drops[i] += this.speeds[i];
        }
    }

    start() {
        const loop = (currentTime) => {
            if (this.isPaused) return;

            const delta = currentTime - this.lastFrameTime;
            const interval = 1000 / this.fps;

            if (delta >= interval) {
                this.lastFrameTime = currentTime - (delta % interval);
                this.step();
            }

            this.animFrameId = requestAnimationFrame(loop);
        };

        this.isPaused = false;
        this.lastFrameTime = performance.now();
        this.animFrameId = requestAnimationFrame(loop);
    }

    pause() {
        this.isPaused = true;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
        }
    }

    togglePause() {
        if (this.isPaused) {
            this.start();
        } else {
            this.pause();
        }
        return this.isPaused;
    }

    setFps(newFps) {
        this.fps = Math.max(1, Math.min(60, newFps));
    }

    setDensity(newDensity) {
        this.density = Math.max(10, Math.min(100, newDensity));
    }

    setFontSize(newSize) {
        this.fontSize = Math.max(8, Math.min(48, newSize));
        this.resize();
    }

    setCharset(charsetKey) {
        if (CHARACTER_SETS[charsetKey]) {
            this.charsetKey = charsetKey;
        }
    }

    setTheme(themeKey) {
        if (COLOR_THEMES[themeKey]) {
            this.themeKey = themeKey;
            // Update CSS custom property for UI coherence
            document.documentElement.style.setProperty('--primary-color', COLOR_THEMES[themeKey].cssPrimary);
        }
    }
}

// Attach UI Event Listeners when DOM is loaded
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('matrixCanvas');
        if (!canvas) return;

        const engine = new MatrixEngine(canvas);
        engine.start();

        // Control Panel Toggle
        const controlPanel = document.getElementById('controlPanel');
        const togglePanelBtn = document.getElementById('togglePanelBtn');
        togglePanelBtn.addEventListener('click', () => {
            controlPanel.classList.toggle('collapsed');
            togglePanelBtn.textContent = controlPanel.classList.contains('collapsed') ? '✚' : '─';
        });

        // Speed Slider
        const speedSlider = document.getElementById('speedSlider');
        const speedVal = document.getElementById('speedVal');
        speedSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            speedVal.textContent = `${val} FPS`;
            engine.setFps(val);
        });

        // Density Slider
        const densitySlider = document.getElementById('densitySlider');
        const densityVal = document.getElementById('densityVal');
        densitySlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            densityVal.textContent = `${val}%`;
            engine.setDensity(val);
        });

        // Font Size Slider
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeVal = document.getElementById('fontSizeVal');
        fontSizeSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            fontSizeVal.textContent = `${val}px`;
            engine.setFontSize(val);
        });

        // Character Set Select
        const charsetSelect = document.getElementById('charsetSelect');
        charsetSelect.addEventListener('change', (e) => {
            engine.setCharset(e.target.value);
        });

        // Theme Select
        const themeSelect = document.getElementById('themeSelect');
        themeSelect.addEventListener('change', (e) => {
            engine.setTheme(e.target.value);
        });

        // Pause/Play Button
        const pauseBtn = document.getElementById('pauseBtn');
        const pauseText = document.getElementById('pauseText');
        const pauseIcon = document.getElementById('pauseIcon');
        pauseBtn.addEventListener('click', () => {
            const isPaused = engine.togglePause();
            pauseText.textContent = isPaused ? 'Resume' : 'Pause';
            pauseIcon.textContent = isPaused ? '▶' : '⏸';
        });

        // Reset Button
        const resetBtn = document.getElementById('resetBtn');
        resetBtn.addEventListener('click', () => {
            engine.resize();
        });

        // Fullscreen Toggle
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {});
                }
            }
        });
    });
}

// Export for Node unit testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MatrixEngine, CHARACTER_SETS, COLOR_THEMES };
}
