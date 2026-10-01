(function () {
    'use strict';

    /* =========================================================
       Restaurar scroll guardado (volver desde menu/menu.html)
       ========================================================= */
    (function restoreScroll() {
        if (typeof window.__paradorRestoreY !== 'number') return;
        const y = window.__paradorRestoreY;
        const html = document.documentElement;

        html.style.scrollBehavior = 'auto';

        window.scrollTo(0, y);
        requestAnimationFrame(() => window.scrollTo(0, y));

        window.addEventListener('load', () => {
            window.scrollTo(0, y);
            html.style.removeProperty('scroll-behavior');
        }, { once: true });

        delete window.__paradorRestoreY;
    })();

    /* =========================================================
       Guardar scroll periódicamente para volver al mismo lugar
       ========================================================= */
    (function saveScroll() {
        const KEY = 'paradorIndexScrollY';
        let timer = null;

        function save() {
            try {
                sessionStorage.setItem(KEY, String(window.scrollY));
            } catch (e) { /* ignore */ }
            timer = null;
        }

        window.addEventListener('scroll', () => {
            if (timer) return;
            timer = setTimeout(save, 250);
        }, { passive: true });

        window.addEventListener('pagehide', save);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') save();
        });
    })();

    /* =========================================================
       Referencias del DOM
       ========================================================= */
    const navbar          = document.getElementById('navbar');
    const hamburger       = document.getElementById('hamburger');
    const mobileMenu      = document.getElementById('mobileMenu');
    const closeBtn        = document.getElementById('closeMenuBtn');
    const mobileNavLinks  = mobileMenu ? mobileMenu.querySelectorAll('.mobile-nav-links a') : [];
    const currentYearSpan = document.getElementById('currentYear');
    const backToTop       = document.getElementById('backToTop');
    const faqGrid         = document.getElementById('faqGrid');

    /* =========================================================
       Utilidades
       ========================================================= */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsInert = 'inert' in HTMLElement.prototype;

    function setInert(el, inert) {
        if (!el) return;
        if (supportsInert) {
            if (inert) el.setAttribute('inert', '');
            else el.removeAttribute('inert');
        } else {
            el.setAttribute('aria-hidden', inert ? 'true' : 'false');
        }
    }

    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    /* =========================================================
       1. Scroll handlers
       ========================================================= */
    const allNavLinks = document.querySelectorAll(
        '.nav-links a[href^="#"], .mobile-nav-links a[href^="#"]'
    );
    const sectionIds = Array.from(allNavLinks)
        .map(link => link.getAttribute('href').substring(1))
        .filter((id, idx, arr) => id && arr.indexOf(id) === idx && document.getElementById(id));

    function updateNavbarScroll() {
        if (window.scrollY > 60) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    }

    function updateActiveNavLink() {
        if (!navbar) return;
        const scrollY = window.scrollY + navbar.offsetHeight + 100;
        let current = null;
        for (let i = 0; i < sectionIds.length; i++) {
            const section = document.getElementById(sectionIds[i]);
            if (!section) continue;
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            if (scrollY >= top && scrollY < bottom) current = sectionIds[i];
        }
        allNavLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            link.classList.toggle('active', href === current);
        });
    }

    function updateBackToTop() {
        if (!backToTop) return;
        backToTop.classList.toggle('visible', window.scrollY > 600);
    }

    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
            updateNavbarScroll();
            updateActiveNavLink();
            updateBackToTop();
            ticking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateNavbarScroll();
    updateActiveNavLink();
    updateBackToTop();

    /* =========================================================
       2. Botón volver arriba
       ========================================================= */
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }

    /* =========================================================
       3. Mobile menu (focus trap + inert)
       ========================================================= */
    let lastFocusedBeforeMenu = null;

    function getMenuFocusables() {
        if (!mobileMenu) return [];
        return Array.from(mobileMenu.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter(el => el.offsetParent !== null || el === closeBtn);
    }

    function openMobileMenu() {
        if (!mobileMenu || mobileMenu.classList.contains('open')) return;
        lastFocusedBeforeMenu = document.activeElement;
        setInert(mobileMenu, false);
        void mobileMenu.offsetWidth;
        mobileMenu.classList.add('open');
        mobileMenu.setAttribute('aria-hidden', 'false');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.classList.add('no-scroll');
        window.requestAnimationFrame(() => { if (closeBtn) closeBtn.focus(); });
    }

    function closeMobileMenu(restoreFocus) {
        if (!mobileMenu || !mobileMenu.classList.contains('open')) return;
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
        setInert(mobileMenu, true);
        if (restoreFocus && lastFocusedBeforeMenu && typeof lastFocusedBeforeMenu.focus === 'function') {
            lastFocusedBeforeMenu.focus();
        }
        lastFocusedBeforeMenu = null;
    }

    function handleMenuKeydown(e) {
        if (!mobileMenu || !mobileMenu.classList.contains('open')) return;
        if (e.key === 'Tab') {
            const focusables = getMenuFocusables();
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closeMobileMenu(true);
        }
    }

    if (hamburger) hamburger.addEventListener('click', openMobileMenu);
    if (closeBtn) closeBtn.addEventListener('click', () => closeMobileMenu(true));
    document.addEventListener('keydown', handleMenuKeydown);
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => closeMobileMenu(false));
    });
    if (mobileMenu) {
        mobileMenu.addEventListener('click', e => {
            if (e.target === mobileMenu || e.target.classList.contains('mobile-menu-backdrop')) {
                closeMobileMenu(true);
            }
        });
    }

    /* =========================================================
       4. Smooth scroll (solo para anclas #, no para menu/menu.html)
       ========================================================= */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const offset = navbar ? navbar.offsetHeight + 16 : 16;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    });

    /* =========================================================
       5. Reveal on scroll
       ========================================================= */
    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -40px 0px', threshold: 0.08 });
        revealElements.forEach(el => observer.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('visible'));
    }

    /* =========================================================
       6. FAQ (acordeón, solo uno abierto)
       Animación con max-height medida por JS — sin bugs en Safari/iOS
       ========================================================= */
    if (faqGrid) {
        const faqItems = Array.from(faqGrid.querySelectorAll('.faq-item'));

        // Inicializar: todas cerradas con max-height 0 explícito
        faqItems.forEach(item => {
            const answer = item.querySelector('.faq-answer');
            if (answer) answer.style.maxHeight = '0px';
        });

        function openItem(item) {
            const answer = item.querySelector('.faq-answer');
            const btn = item.querySelector('.faq-question');
            if (!answer || !btn) return;

            item.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
            // Asignamos la altura real del contenido (sin cortes)
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }

        function closeItem(item) {
            const answer = item.querySelector('.faq-answer');
            const btn = item.querySelector('.faq-question');
            if (!answer || !btn) return;

            // Fijamos la altura actual para poder animar a 0 sin saltos
            answer.style.maxHeight = answer.scrollHeight + 'px';
            // Forzamos reflow para que el navegador registre el valor inicial
            void answer.offsetHeight;
            answer.style.maxHeight = '0px';

            item.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        }

        faqItems.forEach(item => {
            const btn = item.querySelector('.faq-question');
            if (!btn) return;

            btn.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');

                // Cerrar todos los demás
                faqItems.forEach(other => {
                    if (other !== item && other.classList.contains('open')) {
                        closeItem(other);
                    }
                });

                if (isOpen) {
                    closeItem(item);
                } else {
                    openItem(item);
                }
            });
        });

        // Al redimensionar, recalculamos la altura del item abierto
        let faqResizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(faqResizeTimer);
            faqResizeTimer = setTimeout(() => {
                const openAnswer = faqGrid.querySelector('.faq-item.open .faq-answer');
                if (openAnswer) {
                    const prevTransition = openAnswer.style.transition;
                    openAnswer.style.transition = 'none';
                    openAnswer.style.maxHeight = openAnswer.scrollHeight + 'px';
                    void openAnswer.offsetHeight;
                    openAnswer.style.transition = prevTransition;
                }
            }, 150);
        }, { passive: true });
    }

    /* =========================================================
       7. Resize: cerrar menú móvil si pasamos a desktop
       ========================================================= */
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 1080 && mobileMenu && mobileMenu.classList.contains('open')) {
                closeMobileMenu(false);
            }
        }, 150);
    }, { passive: true });

    /* =========================================================
       8. Estado inicial
       ========================================================= */
    setInert(mobileMenu, true);

})();