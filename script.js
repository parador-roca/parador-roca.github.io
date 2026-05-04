(function() {
    'use strict';

    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeBtn = document.getElementById('closeMenuBtn');
    const mobileNavLinks = mobileMenu.querySelectorAll('.mobile-nav-links a');
    const currentYearSpan = document.getElementById('currentYear');

    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    // Navbar scroll effect
    function updateNavbarScroll() {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', updateNavbarScroll, { passive: true });
    updateNavbarScroll();

    // Mobile menu toggle
    function openMobileMenu() {
        mobileMenu.classList.add('open');
        mobileMenu.setAttribute('aria-hidden', 'false');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        hamburger.focus();
    }

    hamburger.addEventListener('click', openMobileMenu);
    closeBtn.addEventListener('click', closeMobileMenu);

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    mobileMenu.addEventListener('click', function(e) {
        if (e.target === mobileMenu || e.target.classList.contains('mobile-menu-backdrop')) {
            closeMobileMenu();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMobileMenu();
        }
    });

    // Smooth scroll for anchor links (improved for mobile)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 16;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                if (mobileMenu.classList.contains('open')) {
                    closeMobileMenu();
                }
            }
        });
    });

    // Active nav link highlight based on scroll position
    const allNavLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-nav-links a[href^="#"]');
    const sectionIds = Array.from(allNavLinks).map(link => link.getAttribute('href').substring(1)).filter(id => id && document.getElementById(id));

    function updateActiveNavLink() {
        const scrollY = window.scrollY + navbar.offsetHeight + 100;
        let currentSection = null;

        sectionIds.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                if (scrollY >= sectionTop && scrollY < sectionBottom) {
                    currentSection = id;
                }
            }
        });

        allNavLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === currentSection) {
                link.style.color = 'var(--primary)';
                link.style.background = 'rgba(183,90,58,0.08)';
            } else {
                link.style.color = '';
                link.style.background = '';
            }
        });
    }
    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    updateActiveNavLink();

    // Reveal animations on scroll
    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -40px 0px', threshold: 0.08 });
        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        function handleRevealFallback() {
            const windowHeight = window.innerHeight;
            revealElements.forEach(el => {
                if (el.getBoundingClientRect().top < windowHeight - 70) {
                    el.classList.add('visible');
                }
            });
        }
        window.addEventListener('scroll', handleRevealFallback, { passive: true });
        handleRevealFallback();
    }

    // Reset menu state on resize to avoid stuck overlay
    function handleResize() {
        if (window.innerWidth > 768) {
            if (mobileMenu.classList.contains('open')) {
                closeMobileMenu();
            }
        }
    }
    window.addEventListener('resize', handleResize);

    // Ensure menu is hidden on initial load (especially for mobile)
    closeMobileMenu();
})();