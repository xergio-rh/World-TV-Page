// ==========================================================================
// WORLD TV - MOTOR GLOBAL DE ANIMACIONES E INTERACCIONES (animations.js)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('js-ready');
  // 1. SCROLL REVEAL AUTOMÁTICO CON CASCADA (STAGGER) EN GRIDS
  const revealSelectors = [
    '.section-header',
    '.trust-card',
    '.product-card',
    '.beauty-card',
    '.kit-card',
    '.review-card',
    '.vision-container > div',
    '.outlet-banner',
    '.filters-container',
    '.product-gallery-card',
    '.product-info-card',
    '.divider-banner',
    '.section-title-center',
    '.ingredient-card',
    '.usage-card-wrapper',
    '.badge-item',
    '.footer-col'
  ];

  const elementsToReveal = document.querySelectorAll(revealSelectors.join(', '));

  // Asignar retraso escalonado (stagger) a elementos hermanos dentro de grillas
  const gridContainers = document.querySelectorAll(
    '.trust-section, .products-grid, .kits-grid, .reviews-grid, .ingredients-grid, .badges-grid, .footer-container'
  );

  gridContainers.forEach(grid => {
    Array.from(grid.children).forEach((child, index) => {
      child.style.setProperty('--reveal-delay', `${(index % 5) * 0.09}s`);
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: '100px 0px 100px 0px'
      }
    );

    // Efecto de entrada distinto según el tipo de bloque
    const pickEffect = (el, index) => {
      if (el.matches('.section-header, .section-title-center, .footer-col, .filters-container, .divider-banner')) return 'fx-rise';
      if (el.matches('.trust-card, .badge-item, .ingredient-card')) return 'fx-pop';
      if (el.matches('.review-card')) return 'fx-flip';
      if (el.matches('.outlet-banner, .usage-card-wrapper')) return 'fx-zoom';
      if (el.matches('.product-gallery-card')) return 'fx-left';
      if (el.matches('.product-info-card')) return 'fx-right';
      if (el.matches('.vision-container > div, .kit-card')) {
        const siblings = Array.from(el.parentElement.children);
        return siblings.indexOf(el) % 2 === 0 ? 'fx-left' : 'fx-right';
      }
      return index % 2 === 0 ? 'fx-rise' : 'fx-zoom';
    };

    elementsToReveal.forEach((el, index) => {
      el.classList.add('reveal-item', pickEffect(el, index));
      observer.observe(el);
    });
  } else {
    elementsToReveal.forEach(el => el.classList.add('revealed'));
  }

  // 2. EFECTO RIPPLE (ONDA AL HACER CLIC) EN TODOS LOS BOTONES Y CTAs
  const buttonSelectors = [
    '.btn-primary',
    '.btn-secondary',
    '.btn-dark',
    '.add-btn',
    '.btn-beauty-add',
    '.outlet-btn',
    '.cart-checkout-btn',
    '.btn-add-cart',
    '.btn-checkout-submit',
    '.btn-sticky-buy',
    '.upsell-add',
    '.model-item',
    '.pack-option',
    '.chk-pkg-card'
  ];

  document.querySelectorAll(buttonSelectors.join(', ')).forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.className = 'click-ripple';

      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  // 3. ANIMACIÓN DE FEEDBACK EN BOTONES "AÑADIR"
  document.querySelectorAll('.add-btn, .btn-beauty-add, .upsell-add').forEach(btn => {
    btn.addEventListener('click', function () {
      const cartBtn = document.querySelector('.cart-btn svg');
      if (cartBtn) {
        cartBtn.style.animation = 'none';
        void cartBtn.offsetWidth; // Reflow
        cartBtn.style.animation = 'cartWiggle 0.65s ease';
      }

      // Si el botón no tiene onclick definido para navegar o abrir carrito, damos feedback visual y abrimos carrito
      if (!this.getAttribute('onclick')) {
        const originalText = this.innerText;
        this.innerText = '¡Añadido!';
        setTimeout(() => {
          this.innerText = originalText;
        }, 1200);
        if (typeof toggleCart === 'function' && !this.classList.contains('upsell-add')) {
          toggleCart();
        }
      }
    });
  });

  // 4. ANIMAR CAMBIO DE IMAGEN EN RELAX VISION (HOME)
  document.querySelectorAll('.model-item').forEach(item => {
    item.addEventListener('click', () => {
      const mainVisionImg = document.getElementById('mainVisionImg');
      const mainVisionTitle = document.getElementById('mainVisionTitle');
      const mainVisionDesc = document.getElementById('mainVisionDesc');
      [mainVisionImg, mainVisionTitle, mainVisionDesc].forEach(el => {
        if (el) {
          el.classList.remove('anim-img-switch');
          void el.offsetWidth;
          el.classList.add('anim-img-switch');
        }
      });
    });
  });

  // 5. ANIMAR CAMBIO DE MINIATURAS DE PRODUCTO Y SELECTOR DE PAQUETES
  document.querySelectorAll('.thumb-item').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const mainImg = document.getElementById('mainProductImg');
      if (mainImg) {
        mainImg.classList.remove('anim-img-switch');
        void mainImg.offsetWidth;
        mainImg.classList.add('anim-img-switch');
      }
    });
  });

  document.querySelectorAll('.pack-option').forEach(pack => {
    pack.addEventListener('click', () => {
      const priceEl = document.querySelector('.current-price');
      if (priceEl) {
        priceEl.classList.remove('anim-price-pop');
        void priceEl.offsetWidth;
        priceEl.classList.add('anim-price-pop');
      }
    });
  });

  document.querySelectorAll('.chk-pkg-card').forEach(card => {
    card.addEventListener('click', () => {
      const subEl = document.getElementById('chkSubtotal');
      const totEl = document.getElementById('chkTotal');
      [subEl, totEl].forEach(el => {
        if (el) {
          el.classList.remove('anim-price-pop');
          void el.offsetWidth;
          el.classList.add('anim-price-pop');
        }
      });
    });
  });

  // 6. INTERACTIVIDAD EN SELECTOR DE CANTIDAD (+ / -) CON ANIMACIÓN DE POP
  document.querySelectorAll('.qty-selector, .qty-selector-sticky').forEach(selector => {
    const buttons = selector.querySelectorAll('button');
    const qtySpan = selector.querySelector('span');
    if (buttons.length === 2 && qtySpan) {
      buttons[0].addEventListener('click', () => {
        let val = parseInt(qtySpan.innerText, 10) || 1;
        if (val > 1) {
          qtySpan.innerText = val - 1;
          qtySpan.classList.remove('anim-price-pop');
          void qtySpan.offsetWidth;
          qtySpan.classList.add('anim-price-pop');
        }
      });
      buttons[1].addEventListener('click', () => {
        let val = parseInt(qtySpan.innerText, 10) || 1;
        qtySpan.innerText = val + 1;
        qtySpan.classList.remove('anim-price-pop');
        void qtySpan.offsetWidth;
        qtySpan.classList.add('anim-price-pop');
      });
    }
  });

  // 7. BARRA DE PROGRESO DE LECTURA Y SOMBRA DEL HEADER AL HACER SCROLL
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  const header = document.querySelector('.site-header');
  let ticking = false;
  const onScroll = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();
});
