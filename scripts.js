document.querySelectorAll('.model-item').forEach(item => {
  item.addEventListener('click', function() {
    // Quitar la clase 'active' de todas las cajitas de gafas y ponérsela a la seleccionada
    document.querySelectorAll('.model-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    
    // Leer los datos guardados en los atributos data-*
    const imgUrl = this.getAttribute('data-img');
    const title = this.getAttribute('data-title');
    const desc = this.getAttribute('data-desc');
    
    // Actualizar la foto grande de la derecha y los textos explicativos al instante
    document.getElementById('mainVisionImg').src = imgUrl;
    document.getElementById('mainVisionTitle').innerText = title;
    document.getElementById('mainVisionDesc').innerText = desc;
  });
});