def update_view(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove iva-pill if present
    content = content.replace('<span class="iva-pill">IVA incluido</span>', '')
    
    badge_html = '''<!-- INSIGNIA ELEGANTE DE DISPONIBILIDAD Y DESPACHO RÁPIDO (JUSTO DEBAJO DEL PRECIO) -->
      <div class="stock-dispatch-badge" style="margin-top: 10px; margin-bottom: 14px;">
        <span class="stock-dot"></span>
        <span class="stock-text"><strong>Disponible para despacho hoy</strong> &bull; Entrega en 24-48h a toda Colombia</span>
      </div>'''

    target = '<!-- SELECTOR DE PAQUETES -->'
    if badge_html not in content and target in content:
        content = content.replace(target, badge_html + '\n\n      ' + target, 1)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {path}")

for p in [
    'shopify-theme/snippets/view-producto-colasteel.liquid',
    'snippets/view-producto-colasteel.liquid',
    'shopify-theme/snippets/view-producto-melena.liquid',
    'snippets/view-producto-melena.liquid',
    'producto.html'
]:
    update_view(p)
