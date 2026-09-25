/**
 * ============================================================================
 * Interactive Particle Canvas driven by C WebAssembly Core
 * ============================================================================
 */

(function () {
    'use strict';

    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Ajuste de DPI da tela (Retina displays)
    const dpr = window.devicePixelRatio || 1;

    // Configurações das partículas
    const PARTICLE_COUNT = Math.min(100, Math.floor((width * height) / 14000));
    const CONNECT_DISTANCE = 135;
    const CONNECT_DIST_SQ = CONNECT_DISTANCE * CONNECT_DISTANCE;

    // Estado do mouse
    const mouse = {
        x: -9999,
        y: -9999,
        active: false
    };

    // Redimensionamento responsivo do Canvas
    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        if (window.CEngine) {
            window.CEngine.initParticles(PARTICLE_COUNT, width, height);
        }
    }

    window.addEventListener('resize', resizeCanvas);

    // Eventos de interação com o mouse/touch
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
        mouse.active = false;
        mouse.x = -9999;
        mouse.y = -9999;
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
            mouse.active = true;
        }
    }, { passive: true });

    window.addEventListener('touchend', () => {
        mouse.active = false;
    });

    // Inicializa o sistema de partículas através do motor C/WASM
    if (window.CEngine) {
        window.CEngine.initParticles(PARTICLE_COUNT, width, height);
    }

    // Monitor de FPS para o indicador do Header
    let lastTime = performance.now();
    let frameCount = 0;
    let currentFps = 60;
    const fpsBadge = document.getElementById('fps-counter');

    function renderLoop(now) {
        requestAnimationFrame(renderLoop);

        // Atualização de FPS
        frameCount++;
        if (now - lastTime >= 1000) {
            currentFps = Math.round((frameCount * 1000) / (now - lastTime));
            frameCount = 0;
            lastTime = now;
            if (fpsBadge) {
                fpsBadge.textContent = `${currentFps} FPS`;
            }
        }

        // Limpeza com leve fading para suavidade
        ctx.clearRect(0, 0, width, height);

        if (!window.CEngine) return;

        // Passo de física calculado no motor C/WASM
        window.CEngine.updateParticles(PARTICLE_COUNT, width, height, mouse.x, mouse.y, mouse.active);

        const buf = window.CEngine.buffer;

        // Desenhar conexões neuronais/dados entre nós próximos
        ctx.lineWidth = 0.8;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const baseI = i * 8;
            const xi = buf[baseI + 0];
            const yi = buf[baseI + 1];

            for (let j = i + 1; j < PARTICLE_COUNT; j++) {
                const baseJ = j * 8;
                const xj = buf[baseJ + 0];
                const yj = buf[baseJ + 1];

                const dx = xi - xj;
                const dy = yi - yj;
                const distSq = dx * dx + dy * dy;

                if (distSq < CONNECT_DIST_SQ) {
                    const alpha = (1 - distSq / CONNECT_DIST_SQ) * 0.22;
                    ctx.strokeStyle = `rgba(0, 245, 212, ${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(xi, yi);
                    ctx.lineTo(xj, yj);
                    ctx.stroke();
                }
            }
        }

        // Desenhar partículas
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const base = i * 8;
            const x = buf[base + 0];
            const y = buf[base + 1];
            const radius = buf[base + 4];
            const alpha = buf[base + 6];

            // Halo suave
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.2);
            gradient.addColorStop(0, `rgba(0, 245, 212, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(59, 130, 246, ${alpha * 0.4})`);
            gradient.addColorStop(1, 'rgba(10, 15, 30, 0)');

            ctx.beginPath();
            ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Ponto central sólido
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha + 0.3)})`;
            ctx.fill();
        }
    }

    // Iniciar loop de renderização
    requestAnimationFrame(renderLoop);

})();
