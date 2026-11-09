import re

def update_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove iva-pill
    target_iva = '<span class="iva-pill" style="background:#DCFCE7; color:#15803D; font-weight:700; border:1px solid #86EFAC;">✓ PRECIO FINAL • IVA INCLUIDO</span>'
    content = content.replace(target_iva, '')

    # 2. Replace fixed-price-guarantee with stock-dispatch-badge
    guarantee_pattern = re.compile(
        r'<div class="fixed-price-guarantee"[^>]*>.*?</div>',
        re.DOTALL
    )
    new_badge = '''<!-- INSIGNIA ELEGANTE DE DISPONIBILIDAD Y DESPACHO RÁPIDO (JUSTO DEBAJO DEL PRECIO) -->
      <div class="stock-dispatch-badge" style="margin-top: 10px; margin-bottom: 14px;">
        <span class="stock-dot"></span>
        <span class="stock-text"><strong>Disponible para despacho hoy</strong> &bull; Entrega en 24-48h a toda Colombia</span>
      </div>'''

    content = guarantee_pattern.sub(new_badge, content)

    # 3. Remove the old stock-dispatch-badge inside shopifyProductForm
    old_badge_pattern = re.compile(
        r'<!-- INSIGNIA ELEGANTE DE DISPONIBILIDAD Y DESPACHO RÁPIDO -->\s*<div class="stock-dispatch-badge">.*?</div>',
        re.DOTALL
    )
    content = old_badge_pattern.sub('', content)

    # 4. Tighten action-buttons margin-top to 12px
    content = content.replace(
        '<div class="action-buttons" style="margin-top: 18px;">',
        '<div class="action-buttons" style="margin-top: 12px;">'
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {path}")

update_file('shopify-theme/sections/main-product.liquid')
update_file('sections/main-product.liquid')
