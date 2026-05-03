(function() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    const currentYearSpan = document.getElementById('currentYear');

    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    function updateNavbarScroll() {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', updateNavbarScroll, { passive: true });
    updateNavbarScroll();

    function openMobileMenu() {
        mobileMenu.classList.add('open');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    function toggleMobileMenu() {
        mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
    }

    hamburger.addEventListener('click', toggleMobileMenu);
    mobileMenuLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMobileMenu();
            hamburger.focus();
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navHeight = navbar.offsetHeight;
                const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 10;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    const allNavLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu a[href^="#"]');
    const sectionIds = Array.from(allNavLinks).map(link => link.getAttribute('href').substring(1)).filter(id => id);

    function updateActiveNavLink() {
        const scrollY = window.scrollY + navbar.offsetHeight + 60;
        let current = null;
        sectionIds.forEach(id => {
            const section = document.getElementById(id);
            if (section && scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
                current = id;
            }
        });
        allNavLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === current) {
                link.style.color = 'var(--accent-glow)';
                if (!link.classList.contains('nav-cta') && !link.classList.contains('mobile-cta')) {
                    link.style.background = 'rgba(255,255,255,0.08)';
                }
            } else {
                link.style.color = '';
                if (!link.classList.contains('nav-cta') && !link.classList.contains('mobile-cta')) {
                    link.style.background = '';
                }
            }
        });
    }
    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    updateActiveNavLink();

    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });
        revealElements.forEach(el => observer.observe(el));
    } else {
        function handleReveal() {
            const windowHeight = window.innerHeight;
            revealElements.forEach(el => {
                if (el.getBoundingClientRect().top < windowHeight - 80) {
                    el.classList.add('visible');
                }
            });
        }
        window.addEventListener('scroll', handleReveal, { passive: true });
        handleReveal();
    }

    closeMobileMenu();
})();