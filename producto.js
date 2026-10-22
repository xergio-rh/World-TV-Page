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

// Mostrar u ocultar la barra flotante inferior al hacer scroll
window.addEventListener('scroll', function() {
  const stickyBar = document.getElementById('stickyBuyBar');
  if (!stickyBar) return;
  
  if (window.scrollY > 450) {
    stickyBar.classList.add('visible');
  } else {
    stickyBar.classList.remove('visible');
  }
});

// Lógica del header inteligente con la barra roja (Scroll up / Scroll down)
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