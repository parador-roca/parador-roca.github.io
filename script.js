(function() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeBtn = document.getElementById('closeMenuBtn');
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    const currentYearSpan = document.getElementById('currentYear');

    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

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
        document.body.style.overflow = 'hidden';
        if (window.innerWidth <= 768) {
            hamburger.style.display = 'none';
            closeBtn.style.display = 'flex';
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
    mobileMenuLinks.forEach(function(link) {
        return link.addEventListener('click', closeMobileMenu);
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMobileMenu();
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                var top = target.getBoundingClientRect().top + window.pageYOffset - navbar.offsetHeight - 10;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // Active nav link
    var allNavLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu a[href^="#"]');
    var sectionIds = Array.from(allNavLinks).map(function(link) {
        return link.getAttribute('href').substring(1);
    }).filter(function(id) { return id; });

    function updateActiveNavLink() {
        var scrollY = window.scrollY + navbar.offsetHeight + 80;
        var current = null;
        sectionIds.forEach(function(id) {
            var section = document.getElementById(id);
            if (section && scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
                current = id;
            }
        });
        allNavLinks.forEach(function(link) {
            var href = link.getAttribute('href').substring(1);
            if (href === current) {
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

    // Reveal on scroll
    var revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -50px 0px', threshold: 0.08 });
        revealElements.forEach(function(el) { revealObserver.observe(el); });
    } else {
        function handleReveal() {
            var wh = window.innerHeight;
            revealElements.forEach(function(el) {
                if (el.getBoundingClientRect().top < wh - 80) el.classList.add('visible');
            });
        }
        window.addEventListener('scroll', handleReveal, { passive: true });
        handleReveal();
    }

    // ========== MAPA LEAFLET ==========
    var lat = -31.05;
    var lng = -64.15;
    var map = L.map('map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.marker([lat, lng]).addTo(map)
        .bindPopup('<strong>Parador Roca</strong><br>Ruta Nacional 9, Km 145')
        .openPopup();

    var ubicacionSection = document.getElementById('ubicacion');
    if (ubicacionSection) {
        var mapObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    map.invalidateSize();
                }
            });
        });
        mapObserver.observe(ubicacionSection);
    }

    // Menú responsive inicial
    function resetMenuDisplay() {
        if (window.innerWidth > 768) {
            closeBtn.style.display = 'none';
            hamburger.style.display = 'none';
            if (mobileMenu.classList.contains('open')) {
                closeMobileMenu();
            }
        } else {
            if (!mobileMenu.classList.contains('open')) {
                hamburger.style.display = 'flex';
                closeBtn.style.display = 'none';
            }
        }
    }
    window.addEventListener('resize', resetMenuDisplay);
    resetMenuDisplay();
    closeMobileMenu();
})();