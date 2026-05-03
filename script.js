(function() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeBtn = document.getElementById('closeMenuBtn');
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    const currentYearSpan = document.getElementById('currentYear');

    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    function updateNavbarScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', updateNavbarScroll, { passive: true });
    updateNavbarScroll();

    function openMobileMenu() {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (window.innerWidth <= 768) {
            hamburger.style.display = 'none';
            closeBtn.style.display = 'block';
        }
    }
    function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
        if (window.innerWidth <= 768) {
            hamburger.style.display = 'flex';
            closeBtn.style.display = 'none';
        }
    }

    hamburger.addEventListener('click', openMobileMenu);
    closeBtn.addEventListener('click', closeMobileMenu);
    mobileMenuLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMobileMenu();
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.pageYOffset - navbar.offsetHeight - 10;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // Active nav link
    const allNavLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu a[href^="#"]');
    const sectionIds = Array.from(allNavLinks).map(link => link.getAttribute('href').substring(1)).filter(id => id);
    function updateActiveNavLink() {
        const scrollY = window.scrollY + navbar.offsetHeight + 60;
        let current = null;
        sectionIds.forEach(id => {
            const section = document.getElementById(id);
            if (section && scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) current = id;
        });
        allNavLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === current) {
                link.style.color = 'var(--accent-glow)';
                link.style.background = 'rgba(255,255,255,0.08)';
            } else {
                link.style.color = '';
                link.style.background = '';
            }
        });
    }
    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    updateActiveNavLink();

    // Reveal on scroll
    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
        }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });
        revealElements.forEach(el => observer.observe(el));
    } else {
        function handleReveal() {
            const wh = window.innerHeight;
            revealElements.forEach(el => { if (el.getBoundingClientRect().top < wh - 80) el.classList.add('visible'); });
        }
        window.addEventListener('scroll', handleReveal, { passive: true });
        handleReveal();
    }

    // ========== MAPA LEAFLET ==========
    // Coordenadas aproximadas Ruta 9 Km 145, Córdoba
    const lat = -31.05;
    const lng = -64.15;
    const map = L.map('map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.marker([lat, lng]).addTo(map)
        .bindPopup('<strong>Parador Roca</strong><br>Ruta Nacional 9, Km 145')
        .openPopup();

    // Ajustar tamaño del mapa al mostrarse (por si estaba en una pestaña oculta)
    const ubicacionSection = document.getElementById('ubicacion');
    if (ubicacionSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    map.invalidateSize();
                }
            });
        });
        observer.observe(ubicacionSection);
    }

    // Menú responsive inicial
    function resetMenuDisplay() {
        if (window.innerWidth > 768) {
            closeBtn.style.display = 'none';
            hamburger.style.display = 'none';
        } else {
            if (!mobileMenu.classList.contains('open')) {
                hamburger.style.display = 'flex';
                closeBtn.style.display = 'none';
            }
        }
    }
    window.addEventListener('resize', resetMenuDisplay);
    resetMenuDisplay();
    closeMobileMenu(); // Asegurar cerrado al cargar
})();