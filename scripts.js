// Lógica para cambiar las gafas en la colección Relax Vision del Home
document.querySelectorAll('.model-item').forEach(item => {
  item.addEventListener('click', function() {
    document.querySelectorAll('.model-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
   
    const imgUrl = this.getAttribute('data-img');
    const title = this.getAttribute('data-title');
    const desc = this.getAttribute('data-desc');
   
    const mainVisionImg = document.getElementById('mainVisionImg');
    const mainVisionTitle = document.getElementById('mainVisionTitle');
    const mainVisionDesc = document.getElementById('mainVisionDesc');

    if (mainVisionImg) mainVisionImg.src = imgUrl;
    if (mainVisionTitle) mainVisionTitle.innerText = title;
    if (mainVisionDesc) mainVisionDesc.innerText = desc;
  });
});

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