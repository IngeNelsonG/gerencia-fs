(function () {
    const root = document.documentElement;
    const metaTheme = document.getElementById('meta-theme-color');
    const themeToggle = document.getElementById('themeToggle');
    const iconLight = themeToggle?.querySelector('.theme-icon-light');
    const iconDark = themeToggle?.querySelector('.theme-icon-dark');

    // Theme handling
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initialTheme = saved || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);

    themeToggle?.addEventListener('click', () => {
        const next = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
        setTheme(next);
    });

    function setTheme(mode) {
        root.setAttribute('data-bs-theme', mode);
        localStorage.setItem('theme', mode);
        if (metaTheme) metaTheme.setAttribute('content', mode === 'dark' ? '#0b0f14' : '#ffffff');
        if (iconLight && iconDark) {
            iconLight.classList.toggle('d-none', mode !== 'light');
            iconDark.classList.toggle('d-none', mode !== 'dark');
        }
    }

    // Deploy timestamp
    const ts = new Date();
    const deployTS = document.getElementById('deployTS');
    if (deployTS) deployTS.textContent = ts.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

    // Preview progress gentle animation
    const pb = document.getElementById('progressPreview');
    if (pb) {
        let w = 24, dir = 1;
        setInterval(() => {
            w += dir * (Math.random() * 3);
            if (w > 92) dir = -1;
            if (w < 18) dir = 1;
            pb.style.width = `${w.toFixed(1)}%`;
        }, 800);
    }

    // Reveal on scroll
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('revealed');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));

    // Confetti
    const btnDeploy = document.getElementById('btnDeploy');
    btnDeploy?.addEventListener('click', () => {
        fireConfetti();
        setTimeout(() => {
            const off = new bootstrap.Offcanvas('#offcanvasLogs');
            off.show();
            replayTerminal();
        }, 450);
    });

    // Original button fun
    const btnV1 = document.getElementById('btnVersion1');
    btnV1?.addEventListener('click', () => {
        fireConfetti({ spread: 45, scalar: 0.9, particleCount: 120 });
    });

    const btnPulse = document.getElementById('btnPulse');
    btnPulse?.addEventListener('click', () => {
        pulse(document.body);
    });

    function fireConfetti(opts = {}) {
        if (typeof confetti !== 'function') return;
        const base = {
            particleCount: 80,
            spread: 65,
            startVelocity: 45,
            gravity: 1.0,
            ticks: 200,
            origin: { y: 0.18 }
        };
        confetti({ ...base, angle: 60, origin: { x: 0 }, ...opts });
        confetti({ ...base, angle: 120, origin: { x: 1 }, ...opts });
        setTimeout(() => confetti({ particleCount: 40, startVelocity: 35, spread: 50, scalar: 0.8 }), 250);
    }

    function pulse(el) {
        el.animate([
            { transform: 'scale(1)', filter: 'brightness(1)' },
            { transform: 'scale(1.01)', filter: 'brightness(1.05)' },
            { transform: 'scale(1)', filter: 'brightness(1)' }
        ], { duration: 600, easing: 'ease' });
    }

    // Offcanvas terminal typing
    const terminalBody = document.getElementById('terminalBody');
    const btnReplay = document.getElementById('btnReplay');
    const LOGS = [
        '$ git fetch --all --prune',
        '$ git checkout main',
        '$ git pull origin main',
        '$ npm ci',
        '$ npm run build',
        '✔ Lint limpio — 0 errores, 3 advertencias',
        '✔ Test unitarios — 134 pasados (21.3s)',
        '✔ Auditoría seguridad — 0 vulnerabilidades críticas',
        '$ netlify deploy --prod',
        'Subiendo artefactos…',
        'Generando URL única…',
        'Publicación atómica completada',
        '✅ Deploy exitoso: https://tusitio.netlify.app',
    ];

    function replayTerminal() {
        if (!terminalBody) return;
        terminalBody.textContent = '';
        typeLines(LOGS, terminalBody, 0);
    }

    function typeLines(lines, el, i) {
        if (i >= lines.length) {
            const done = document.createElement('div');
            done.innerHTML = '\n\u001b[32mListo.\u001b[0m';
            el.appendChild(done);
            el.scrollTop = el.scrollHeight;
            return;
        }
        typeLine(lines[i], el, () => typeLines(lines, el, i + 1));
    }

    function typeLine(text, el, done) {
        const line = document.createElement('div');
        line.className = 'caret';
        el.appendChild(line);

        let idx = 0;
        const speed = Math.random() * 20 + 15;
        const timer = setInterval(() => {
            line.textContent = text.slice(0, idx++);
            el.scrollTop = el.scrollHeight;
            if (idx > text.length) {
                clearInterval(timer);
                line.classList.remove('caret');
                el.appendChild(document.createTextNode('\n'));
                done?.();
            }
        }, speed);
    }

    // Replay button
    btnReplay?.addEventListener('click', replayTerminal);

    // Open logs when offcanvas opens (first time)
    const offcanvasEl = document.getElementById('offcanvasLogs');
    if (offcanvasEl) {
        offcanvasEl.addEventListener('shown.bs.offcanvas', () => {
            if (!terminalBody?.textContent?.trim()) replayTerminal();
        });
    }

    // Hotkeys: T theme, L logs, D deploy
    window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
        if (e.key.toLowerCase() === 't') {
            themeToggle?.click();
        } else if (e.key.toLowerCase() === 'l') {
            const oc = bootstrap.Offcanvas.getOrCreateInstance('#offcanvasLogs');
            oc.toggle();
        } else if (e.key.toLowerCase() === 'd') {
            btnDeploy?.click();
        }
    });

    // Ripple effect for buttons with data-ripple
    document.addEventListener('pointerdown', (e) => {
        const btn = e.target.closest('.btn[data-ripple]');
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.2;
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${size}px`;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    });

    // Magnetic tilt for elements with data-tilt
    for (const el of document.querySelectorAll('[data-tilt]')) {
        let raf = 0;
        const maxTilt = 6; // grados
        const onMove = (ev) => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const r = el.getBoundingClientRect();
                const px = (ev.clientX - r.left) / r.width - 0.5;
                const py = (ev.clientY - r.top) / r.height - 0.5;
                const rx = (+py * maxTilt).toFixed(2);
                const ry = (-px * maxTilt).toFixed(2);
                el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-1px)`;
            });
        };
        const onLeave = () => {
            cancelAnimationFrame(raf);
            el.style.transform = '';
        };
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        el.addEventListener('touchend', onLeave, { passive: true });
    }
})();