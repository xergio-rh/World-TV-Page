// Abrir y cerrar el menú de navegación móvil en la página de salud visual
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
      navLinks.classList.toggle('active');
    }
  }
  
  // Abrir y cerrar la barra de búsqueda expandible en móvil
  function toggleSearchBox() {
    const searchBox = document.getElementById('expandableSearch');
    if (searchBox) {
      searchBox.classList.toggle('active');
      if (searchBox.classList.contains('active')) {
        const input = searchBox.querySelector('input');
        if (input) input.focus();
      }
    }
  }
  
  // Abrir y cerrar el panel lateral del carrito
  function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      drawer.classList.toggle('active');
      overlay.classList.toggle('active');
    }
  }
  
  // Abrir y cerrar el modal de checkout (Realiza tu pedido)
  function toggleCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    const overlay = document.getElementById('checkoutModalOverlay');
    if (modal && overlay) {
      modal.classList.toggle('active');
      overlay.classList.toggle('active');
    }
  }
  
  // Lógica del header inteligente (Scroll up / Scroll down)
  let lastScrollTop = 0;
  const headerWrapper = document.getElementById('headerWrapper');
  
  window.addEventListener('scroll', function() {
    if (!headerWrapper) return;
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 150) {
      headerWrapper.classList.add('header-hidden');
    } else {
      headerWrapper.classList.remove('header-hidden');
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }, { passive: true });