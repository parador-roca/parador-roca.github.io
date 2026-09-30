(function () {
    'use strict';

    /* =========================================================
       Galería + Lightbox de Parador Roca
       =========================================================
       Al cargar la página, este script:
       1. Verifica cada imagen y muestra en consola cuáles cargan.
       2. Si una imagen falla, marca su <figure> con la clase
          .gallery-item-error (visible como cartel rojo).
       3. Inicializa el lightbox (navegación, teclado, swipe).
       ========================================================= */

    /* =========================================================
       Utilidades
       ========================================================= */
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

    /* =========================================================
       Referencias del DOM
       ========================================================= */
    const galleryGrid      = document.getElementById('galleryGrid');
    const lightbox         = document.getElementById('lightbox');
    const lightboxImage    = document.getElementById('lightboxImage');
    const lightboxWrapper  = document.getElementById('lightboxImageWrapper');
    const lightboxCaption  = document.getElementById('lightboxCaption');
    const lightboxCurrent  = document.getElementById('lightboxCurrent');
    const lightboxTotal    = document.getElementById('lightboxTotal');
    const lightboxCloseBtn = document.getElementById('lightboxClose');
    const lightboxPrevBtn  = document.getElementById('lightboxPrev');
    const lightboxNextBtn  = document.getElementById('lightboxNext');
    const lightboxDotsEl   = document.getElementById('lightboxDots');

    if (!galleryGrid || !lightbox) return;

    /* =========================================================
       Parseo de data-images
       ========================================================= */
    function parseImagesAttr(str) {
        if (!str) return [];
        return str.split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }

    /* =========================================================
       Manejo de errores en las portadas
       =========================================================
       Si una portada falla al cargar, marca la figura con la
       clase .gallery-item-error y loguea la URL fallida para
       que el usuario sepa exactamente qué ruta no encuentra.
       ========================================================= */
    function markImageError(img) {
        const item = img.closest('.gallery-item');
        if (!item) return;
        item.classList.add('gallery-item-error');
        console.error(
            '%c❌ IMAGEN NO ENCONTRADA',
            'color: #dc2626; font-weight: bold; font-size: 14px;',
            '\n   Ruta intentada: ' + img.src +
            '\n   Verificá que el archivo exista EXACTAMENTE en esa ruta.' +
            '\n   (Ojo con mayúsculas, extensión y nombre del archivo).'
        );
    }

    function checkAllGalleryImages() {
        const imgs = galleryGrid.querySelectorAll('.gallery-item img');
        if (!imgs.length) {
            console.warn('[Galería] No se encontraron imágenes en el HTML.');
            return;
        }
        console.log(
            '%c📸 VERIFICACIÓN DE GALERÍA',
            'color: #b75a3a; font-weight: bold; font-size: 14px;'
        );
        imgs.forEach((img, i) => {
            const item = img.closest('.gallery-item');
            const cat = item ? item.getAttribute('data-category') : '?';
            const status = (img.complete && img.naturalWidth > 0) ? '✅ CARGADA' : '❌ NO CARGA';
            console.log(`   ${i + 1}. [${cat}] ${status}\n      → ${img.src}`);
        });
    }

    // Asignar handlers a cada img
    galleryGrid.querySelectorAll('.gallery-item img').forEach(img => {
        // Si ya falló antes de que corriera el JS (raro pero posible)
        if (img.complete && img.naturalWidth === 0) {
            markImageError(img);
            return;
        }
        img.addEventListener('error', () => markImageError(img), { once: true });
    });

    // Verificación final cuando todo terminó de cargar
    window.addEventListener('load', () => {
        setTimeout(checkAllGalleryImages, 800);
    });

    /* =========================================================
       Estado del lightbox
       ========================================================= */
    let lbImages = [];
    let lbIndex = 0;
    let lbCaptionText = '';
    let lbLastGalleryItem = null;

    function renderLightboxDots() {
        if (!lightboxDotsEl) return;
        lightboxDotsEl.innerHTML = '';
        if (lbImages.length <= 1 || lbImages.length > 15) {
            lightboxDotsEl.style.display = 'none';
            return;
        }
        lightboxDotsEl.style.display = 'flex';
        const frag = document.createDocumentFragment();
        lbImages.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'lightbox-dot' + (i === lbIndex ? ' active' : '');
            dot.setAttribute('aria-label', 'Ir a imagen ' + (i + 1));
            dot.addEventListener('click', () => goToImage(i));
            frag.appendChild(dot);
        });
        lightboxDotsEl.appendChild(frag);
    }

    function updateLightboxNav() {
        const single = lbImages.length <= 1;
        if (lightboxPrevBtn) lightboxPrevBtn.disabled = single;
        if (lightboxNextBtn) lightboxNextBtn.disabled = single;
    }

    function loadLightboxImage(url) {
        if (!lightboxImage || !lightboxWrapper) return;
        lightboxWrapper.classList.add('loading');
        lightboxImage.classList.remove('loaded');

        const pre = new Image();
        pre.onload = () => {
            lightboxImage.src = url;
            lightboxImage.alt = lbCaptionText || 'Imagen de la galería';
            window.requestAnimationFrame(() => {
                lightboxWrapper.classList.remove('loading');
                lightboxImage.classList.add('loaded');
            });
        };
        pre.onerror = () => {
            lightboxWrapper.classList.remove('loading');
            console.error('❌ No se pudo cargar en el lightbox:', url);
        };
        pre.src = url;
    }

    function goToImage(i) {
        if (!lbImages.length) return;
        lbIndex = ((i % lbImages.length) + lbImages.length) % lbImages.length;
        if (lightboxCurrent) lightboxCurrent.textContent = String(lbIndex + 1);
        if (lightboxTotal) lightboxTotal.textContent = String(lbImages.length);
        loadLightboxImage(lbImages[lbIndex]);
        if (lightboxDotsEl && lightboxDotsEl.style.display !== 'none') {
            const dots = lightboxDotsEl.querySelectorAll('.lightbox-dot');
            dots.forEach((d, idx) => d.classList.toggle('active', idx === lbIndex));
        }
    }

    function openLightbox(images, caption, startIndex) {
        if (!images || !images.length) return;
        lbImages = images.slice();
        lbIndex = Math.max(0, Math.min(startIndex || 0, images.length - 1));
        lbCaptionText = caption || '';
        if (lightboxCaption) lightboxCaption.textContent = lbCaptionText;
        if (lightboxCurrent) lightboxCurrent.textContent = String(lbIndex + 1);
        if (lightboxTotal) lightboxTotal.textContent = String(lbImages.length);
        updateLightboxNav();
        renderLightboxDots();
        loadLightboxImage(lbImages[lbIndex]);

        setInert(lightbox, false);
        void lightbox.offsetWidth;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');

        window.requestAnimationFrame(() => {
            if (lightboxCloseBtn) lightboxCloseBtn.focus();
        });
    }

    function closeLightbox() {
        if (!lightbox.classList.contains('open')) return;
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        setInert(lightbox, true);
        lbImages = [];
        lbIndex = 0;
        if (lbLastGalleryItem) {
            lbLastGalleryItem.focus();
            lbLastGalleryItem = null;
        }
    }

    /* =========================================================
       Eventos de la galería
       ========================================================= */
    galleryGrid.addEventListener('click', e => {
        const item = e.target.closest('.gallery-item');
        if (!item) return;
        if (item.classList.contains('gallery-item-error')) return;

        const caption = item.getAttribute('data-caption') || '';
        const images = parseImagesAttr(item.getAttribute('data-images'));
        if (!images.length) return;

        lbLastGalleryItem = item;
        openLightbox(images, caption, 0);
    });

    galleryGrid.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const item = e.target.closest('.gallery-item');
        if (!item) return;
        if (item.classList.contains('gallery-item-error')) return;
        e.preventDefault();
        item.click();
    });

    /* =========================================================
       Controles del lightbox
       ========================================================= */
    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
    if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', () => goToImage(lbIndex - 1));
    if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', () => goToImage(lbIndex + 1));

    lightbox.querySelectorAll('[data-lightbox-close]').forEach(el => {
        el.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); goToImage(lbIndex - 1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); goToImage(lbIndex + 1); }
    });

    /* =========================================================
       Swipe táctil
       ========================================================= */
    let tStartX = 0, tStartY = 0, tMoved = false;
    lightbox.addEventListener('touchstart', e => {
        if (e.touches.length !== 1) return;
        tStartX = e.touches[0].clientX;
        tStartY = e.touches[0].clientY;
        tMoved = false;
    }, { passive: true });

    lightbox.addEventListener('touchmove', e => {
        if (e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - tStartX;
        const dy = e.touches[0].clientY - tStartY;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) tMoved = true;
    }, { passive: true });

    lightbox.addEventListener('touchend', e => {
        if (!tMoved) return;
        const dx = e.changedTouches[0].clientX - tStartX;
        const dy = e.changedTouches[0].clientY - tStartY;
        if (Math.abs(dx) < 50) return;
        if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
        if (dx > 0) goToImage(lbIndex - 1);
        else goToImage(lbIndex + 1);
    }, { passive: true });

    /* =========================================================
       Estado inicial
       ========================================================= */
    setInert(lightbox, true);

})();