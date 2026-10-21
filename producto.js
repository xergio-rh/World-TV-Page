// Cambiar la foto principal al hacer clic en las miniaturas de la izquierda
function changeImage(element, imageUrl) {
  // Quitar la clase active de todas las miniaturas y ponerla en la seleccionada
  document.querySelectorAll('.thumb-item').forEach(el => el.classList.remove('active'));
  element.classList.add('active');

  // Inyectar la nueva ruta en la imagen grande
  document.getElementById('mainProductImg').src = imageUrl;
}

// Seleccionar paquetes (Lleva 1, Lleva 2, Lleva 3)
function selectPackage(element, oldPrice, currentPrice) {
  // Quitar la clase active a todos los paquetes
  document.querySelectorAll('.pack-option').forEach(el => el.classList.remove('active'));
  element.classList.add('active');

  // Actualizar los precios principales de la tarjeta según el paquete elegido
  document.querySelector('.old-price').innerText = oldPrice;
  document.querySelector('.current-price').innerHTML = currentPrice + ' <small>COP</small>';
}