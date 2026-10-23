// Cambiar la foto principal al hacer clic en las miniaturas de la izquierda
function changeImage(element, imageUrl) {
  document.querySelectorAll('.thumb-item').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
  
  const mainImg = document.getElementById('mainProductImg');
  if (mainImg) mainImg.src = imageUrl;
}

// Seleccionar paquetes (Lleva 1, Lleva 2, Lleva 3)
function selectPackage(element, oldPrice, currentPrice) {
  document.querySelectorAll('.pack-option').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
  
  const oldPriceElem = document.querySelector('.old-price');
  const currentPriceElem = document.querySelector('.current-price');

  if (oldPriceElem) oldPriceElem.innerText = '$' + oldPrice;
  if (currentPriceElem) currentPriceElem.innerHTML = '$' + currentPrice + ' <small>COP</small>';
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

// Seleccionar paquetes dentro del modal de checkout y actualizar totales
function selectCheckoutPackage(element, priceValue) {
  document.querySelectorAll('.chk-pkg-card').forEach(card => {
    card.classList.remove('active');
  });
  element.classList.add('active');
  
  const subtotalElem = document.getElementById('chkSubtotal');
  const totalElem = document.getElementById('chkTotal');
  if (subtotalElem) subtotalElem.innerText = priceValue;
  if (totalElem) totalElem.innerText = priceValue;
}

// --- CONTROL DE SCROLL: HEADER INTELIGENTE Y BARRA FLOTANTE ---
let lastScrollTop = 0;
const headerWrapper = document.getElementById('headerWrapper');
const stickyBuyBar = document.getElementById('stickyBuyBar');

window.addEventListener('scroll', function() {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // 1. Lógica del Header Inteligente (Se oculta al bajar, aparece al subir)
  if (headerWrapper) {
    if (scrollTop > lastScrollTop && scrollTop > 150) {
      headerWrapper.classList.add('header-hidden');
    } else {
      headerWrapper.classList.remove('header-hidden');
    }
  }

  // 2. Lógica de la barra inferior de compra (Aparece tras hacer scroll y desaparece al llegar al footer o arriba)
  if (stickyBuyBar) {
    if (scrollTop > 450 && scrollTop < 2400) {
      stickyBuyBar.classList.add('visible');
    } else {
      stickyBuyBar.classList.remove('visible');
    }
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, { passive: true });