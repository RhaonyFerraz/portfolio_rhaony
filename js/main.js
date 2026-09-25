/**
 * ============================================================================
 * Main Application Logic & Interactivity
 * Rhaony Portfolio
 * ============================================================================
 */

(function () {
    'use strict';


    // Navbar removida — página de rolagem simples



    // 3. C Playground Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            }

            // Se abriu a aba de código/memória, atualiza o dump de bytes
            if (targetId === 'tab-code') {
                renderMemoryDump();
            }
        });
    });

    // 4. Sliders & Live Value Display in C Playground
    const statsSlider = document.getElementById('stats-slider');
    const statsVal = document.getElementById('stats-size-val');

    if (statsSlider && statsVal) {
        statsSlider.addEventListener('input', (e) => {
            statsVal.textContent = Number(e.target.value).toLocaleString('pt-BR') + ' registros';
        });
    }

    const regSlider = document.getElementById('reg-slider');
    const regVal = document.getElementById('reg-size-val');

    if (regSlider && regVal) {
        regSlider.addEventListener('input', (e) => {
            regVal.textContent = Number(e.target.value).toLocaleString('pt-BR') + ' pontos';
        });
    }

    const mcSlider = document.getElementById('mc-slider');
    const mcVal = document.getElementById('mc-size-val');

    if (mcSlider && mcVal) {
        mcSlider.addEventListener('input', (e) => {
            mcVal.textContent = Number(e.target.value).toLocaleString('pt-BR') + ' iterações';
        });
    }

    // 5. Execuções de Benchmark em C (WASM)
    const btnRunStats = document.getElementById('btn-run-stats');
    if (btnRunStats) {
        btnRunStats.addEventListener('click', () => {
            if (!window.CEngine) return;
            const size = parseInt(statsSlider ? statsSlider.value : 100000, 10);
            
            btnRunStats.innerHTML = '<span>Processando no C Core...</span>';
            setTimeout(() => {
                const res = window.CEngine.runStatisticalBenchmark(size);

                document.getElementById('stats-time').textContent = `${res.elapsedUs} μs (${res.elapsedMs} ms)`;
                document.getElementById('stats-throughput').textContent = `${res.throughput.toLocaleString('pt-BR')} registros / seg`;
                document.getElementById('stats-mean').textContent = res.mean;
                document.getElementById('stats-std').textContent = res.stdDev;

                btnRunStats.innerHTML = '<span>▶ Executar c_calculate_mean & variance</span>';
            }, 50);
        });
    }

    const btnRunReg = document.getElementById('btn-run-reg');
    if (btnRunReg) {
        btnRunReg.addEventListener('click', () => {
            if (!window.CEngine) return;
            const points = parseInt(regSlider ? regSlider.value : 50000, 10);

            btnRunReg.innerHTML = '<span>Ajustando OLS em C...</span>';
            setTimeout(() => {
                const res = window.CEngine.runRegressionBenchmark(points);

                document.getElementById('reg-time').textContent = `${res.elapsedUs} μs (${res.elapsedMs} ms)`;
                document.getElementById('reg-eq').textContent = res.formula;
                document.getElementById('reg-r2').textContent = `${res.r2} (99.8% de ajuste)`;

                btnRunReg.innerHTML = '<span>▶ Executar c_linear_regression (OLS)</span>';
            }, 50);
        });
    }

    const btnRunMc = document.getElementById('btn-run-mc');
    if (btnRunMc) {
        btnRunMc.addEventListener('click', () => {
            if (!window.CEngine) return;
            const iters = parseInt(mcSlider ? mcSlider.value : 250000, 10);

            btnRunMc.innerHTML = '<span>Simulando no C Core...</span>';
            setTimeout(() => {
                const res = window.CEngine.runMonteCarloBenchmark(iters);

                document.getElementById('mc-time').textContent = `${res.elapsedUs} μs (${res.elapsedMs} ms)`;
                document.getElementById('mc-pi').textContent = res.piEstimate;
                document.getElementById('mc-error').textContent = `${res.errorPercent}%`;

                btnRunMc.innerHTML = '<span>Executar c_monte_carlo_pi</span>';
            }, 50);
        });
    }

    // 6. Memory Inspector
    function renderMemoryDump() {
        const dumpBox = document.getElementById('memory-dump-box');
        if (!dumpBox || !window.CEngine) return;

        const rows = window.CEngine.readMemoryHex(0, 128);
        dumpBox.innerHTML = '';

        rows.forEach(row => {
            const line = document.createElement('div');
            line.className = 'memory-line';
            line.innerHTML = `
                <span class="mem-addr">${row.address}</span>
                <span class="mem-hex">${row.hex}</span>
                <span class="mem-ascii">${escapeHtml(row.ascii)}</span>
            `;
            dumpBox.appendChild(line);
        });
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    const btnRefreshMem = document.getElementById('btn-refresh-mem');
    if (btnRefreshMem) {
        btnRefreshMem.addEventListener('click', renderMemoryDump);
    }

    // 7. Project Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');

            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 8. Copy Email & Toast Notification
    const btnCopyEmail = document.getElementById('btn-copy-email');
    const toast = document.getElementById('toast-msg');

    if (btnCopyEmail && toast) {
        btnCopyEmail.addEventListener('click', () => {
            const email = 'rhaonyferraz@hotmail.com';
            navigator.clipboard.writeText(email).then(() => {
                showToast(`E-mail ${email} copiado com sucesso!`);
            }).catch(() => {
                showToast(`E-mail: ${email}`);
            });
        });
    }

    function showToast(message) {
        if (!toast) return;
        const toastText = document.getElementById('toast-text');
        if (toastText) toastText.textContent = message;

        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    }

    // 8.1 Exportação de PDF Robusta (Desktop e Mobile)
    const btnPdfExport = document.getElementById('btn-pdf-export');
    if (btnPdfExport) {
        const triggerPrint = (e) => {
            if (e) e.preventDefault();
            try {
                window.print();
            } catch (err) {
                console.warn('Erro ao acionar window.print():', err);
                showToast('Dica: Use a opção Compartilhar/Imprimir do navegador para salvar em PDF.');
            }
        };

        btnPdfExport.addEventListener('click', triggerPrint);
    }

    // =========================================================================
    // 9. Nestlé Interview - Presentation Engine (20 Minutos)
    // =========================================================================
    let currentSlide = 1;
    const totalSlides = 2;
    const presTabBtns = document.querySelectorAll('.pres-tab-btn');
    const presSlides = document.querySelectorAll('.pres-slide');
    const btnPrevSlide = document.getElementById('btn-prev-slide');
    const btnNextSlide = document.getElementById('btn-next-slide');
    const btnFullscreen = document.getElementById('btn-fullscreen-deck');
    const presSection = document.getElementById('apresentacao');

    if (presTabBtns.length > 0 || btnPrevSlide || btnNextSlide) {
        function goToSlide(slideNum) {
            if (slideNum < 1) slideNum = 1;
            if (slideNum > totalSlides) slideNum = totalSlides;
            currentSlide = slideNum;

            presTabBtns.forEach(btn => {
                const num = parseInt(btn.getAttribute('data-slide'), 10);
                if (num === currentSlide) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            presSlides.forEach(slide => {
                if (slide.id === `slide-${currentSlide}`) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            if (btnPrevSlide) btnPrevSlide.disabled = (currentSlide === 1);
            if (btnNextSlide) {
                btnNextSlide.innerHTML = currentSlide === totalSlides 
                    ? '<span>Fim da Apresentação</span>' 
                    : '<span>Próximo Slide</span>';
            }
        }

        presTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const slideNum = parseInt(btn.getAttribute('data-slide'), 10);
                goToSlide(slideNum);
            });
        });

        if (btnPrevSlide) {
            btnPrevSlide.addEventListener('click', () => goToSlide(currentSlide - 1));
        }

        if (btnNextSlide) {
            btnNextSlide.addEventListener('click', () => {
                if (currentSlide < totalSlides) {
                    goToSlide(currentSlide + 1);
                } else {
                    const contatoSec = document.getElementById('contato');
                    if (contatoSec) contatoSec.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Teclas de navegação
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                if (currentSlide < totalSlides) {
                    e.preventDefault();
                    goToSlide(currentSlide + 1);
                }
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                if (currentSlide > 1) {
                    e.preventDefault();
                    goToSlide(currentSlide - 1);
                }
            }
        });
    }

    // Modo Tela Cheia
    if (btnFullscreen && presSection) {
        btnFullscreen.addEventListener('click', () => {
            presSection.classList.toggle('is-fullscreen');
            const isFull = presSection.classList.contains('is-fullscreen');
            btnFullscreen.innerHTML = isFull 
                ? '<span>Sair da Tela Cheia</span>' 
                : '<span>Tela Cheia</span>';
            
            if (isFull) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    // Cronômetro Oficial dos 20 Minutos
    const TOTAL_SECONDS = 20 * 60; // 1200 segundos
    let remainingSeconds = TOTAL_SECONDS;
    let timerInterval = null;
    let isTimerRunning = false;

    const presTimerDisplay = document.getElementById('pres-timer');
    const presTimeFill = document.getElementById('pres-time-fill');
    const btnTimerStart = document.getElementById('btn-timer-start');
    const btnTimerReset = document.getElementById('btn-timer-reset');

    function updateTimerUI() {
        if (!presTimerDisplay) return;
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        presTimerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (presTimeFill) {
            const percentage = (remainingSeconds / TOTAL_SECONDS) * 100;
            presTimeFill.style.width = `${percentage}%`;
        }

        // Alertas visuais de ritmo de tempo
        presTimerDisplay.classList.remove('warning', 'danger');
        if (remainingSeconds <= 120) {
            presTimerDisplay.classList.add('danger');
        } else if (remainingSeconds <= 300) {
            presTimerDisplay.classList.add('warning');
        }
    }

    function startTimer() {
        if (isTimerRunning) return;
        isTimerRunning = true;
        if (btnTimerStart) btnTimerStart.textContent = 'Pausar';

        timerInterval = setInterval(() => {
            if (remainingSeconds > 0) {
                remainingSeconds--;
                updateTimerUI();
            } else {
                pauseTimer();
                showToast('Tempo limite de 20 minutos atingido!');
            }
        }, 1000);
    }

    function pauseTimer() {
        isTimerRunning = false;
        clearInterval(timerInterval);
        if (btnTimerStart) btnTimerStart.textContent = 'Continuar';
    }

    function resetTimer() {
        pauseTimer();
        remainingSeconds = TOTAL_SECONDS;
        updateTimerUI();
        if (btnTimerStart) btnTimerStart.textContent = 'Iniciar';
    }

    if (btnTimerStart) {
        btnTimerStart.addEventListener('click', () => {
            if (isTimerRunning) {
                pauseTimer();
            } else {
                startTimer();
            }
        });
    }

    if (btnTimerReset) {
        btnTimerReset.addEventListener('click', resetTimer);
    }

    // Executar primeiro benchmark automaticamente ao carregar para já preencher os valores
    window.addEventListener('DOMContentLoaded', () => {
        updateTimerUI();
        goToSlide(1);

        setTimeout(() => {
            if (btnRunStats) btnRunStats.click();
            if (btnRunReg) btnRunReg.click();
            if (btnRunMc) btnRunMc.click();
            renderMemoryDump();
        }, 300);
    });

})();

