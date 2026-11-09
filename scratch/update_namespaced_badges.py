import json
import base64

def read_file(p):
    with open(p, 'r') as f:
        return f.read()

def b64(p):
    with open(p, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

with open('scratch/bold_svgs.json') as f:
    bold_raw = json.load(f)[0]['html']

visa_raw = read_file('scratch/visa.svg').strip()
mc_raw = read_file('scratch/mastercard.svg').strip()
amex_raw = read_file('scratch/amex_fixed.svg').strip()
banco_raw = read_file('scratch/bancolombia.svg').strip()
nequi_raw = read_file('scratch/wvl_nequi.svg').strip()
siste_raw = read_file('scratch/sistecredito.svg').strip()

pse_b64 = b64('scratch/pse_real.png')
davi_b64 = b64('scratch/daviplata_clean.png')
addi_b64 = b64('scratch/addi_logo_cropped.png')
bre_b64 = b64('scratch/bre_b_thumb.png')

snippet = f"""<!-- BLOQUE DE MEDIOS DE PAGO OFICIALES Y SEGUROS (DEBAJO DE AGREGAR AL CARRITO) -->
<div class="product-payment-trust-bar">
  <div class="p-pay-trust-header">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
    <span>PAGOS 100% SEGUROS Y GARANTIZADOS</span>
  </div>

  <div class="p-pay-badges-grid">
    <!-- 1. BOLD (Oficial) -->
    <div class="pay-logo-badge p-badge-bold" title="Bold - Datáfono y Pagos Online Seguros">
      {bold_raw}
    </div>

    <!-- 2. VISA (Oficial) -->
    <div class="pay-logo-badge p-badge-visa" title="Visa">
      {visa_raw}
    </div>

    <!-- 3. MASTERCARD (Oficial) -->
    <div class="pay-logo-badge p-badge-mc" title="Mastercard">
      {mc_raw}
    </div>

    <!-- 4. AMERICAN EXPRESS (Oficial) -->
    <div class="pay-logo-badge p-badge-amex" title="American Express">
      {amex_raw}
    </div>

    <!-- Salto en móvil (4 primeros) -->
    <div class="p-pay-break-mobile"></div>

    <!-- 5. PSE (Oficial ACH Colombia) -->
    <div class="pay-logo-badge p-badge-pse" title="PSE - Pagos Seguros en Línea (Todos los bancos de Colombia)">
      <img src="data:image/png;base64,{pse_b64}" alt="PSE" loading="lazy">
    </div>

    <!-- 6. BANCOLOMBIA (Oficial) -->
    <div class="pay-logo-badge p-badge-banco" title="Bancolombia">
      {banco_raw}
    </div>

    <!-- Salto en desktop (6 primeros) -->
    <div class="p-pay-break-desktop"></div>

    <!-- 7. NEQUI (Oficial) -->
    <div class="pay-logo-badge p-badge-nequi" title="Nequi">
      {nequi_raw}
    </div>

    <!-- 8. DAVIPLATA (Oficial) -->
    <div class="pay-logo-badge p-badge-davi" title="DaviPlata">
      <img src="data:image/png;base64,{davi_b64}" alt="DaviPlata" loading="lazy">
    </div>

    <!-- Salto en móvil (segundos 4) -->
    <div class="p-pay-break-mobile"></div>

    <!-- 9. ADDI (Oficial) -->
    <div class="pay-logo-badge p-badge-addi" title="Addi - Compra a cuotas sin tarjeta de crédito">
      <img src="data:image/png;base64,{addi_b64}" alt="Addi" loading="lazy">
    </div>

    <!-- 10. SISTECRÉDITO (Oficial) -->
    <div class="pay-logo-badge p-badge-siste" title="Sistecrédito - Crédito fácil e inmediato">
      {siste_raw}
    </div>

    <!-- 11. BRE-B (Oficial Banco de la República) -->
    <div class="pay-logo-badge p-badge-bre" title="Bre-B - Pagos Interbancarios Inmediatos">
      <img src="data:image/png;base64,{bre_b64}" alt="Bre-B" loading="lazy">
    </div>

    <!-- 12. PAGO CONTRAENTREGA (Oficial) -->
    <div class="pay-logo-badge p-badge-contra" title="Pago Contraentrega - Paga en efectivo al recibir en casa">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
      <span>Contraentrega</span>
    </div>
  </div>

  <p class="p-pay-trust-subtext">Aceptamos tarjetas de crédito, débito, PSE, transferencias QR, Addi, Sistecrédito y pago en efectivo al recibir.</p>
</div>
"""

with open('shopify-theme/snippets/product-payment-badges.liquid', 'w') as f:
    f.write(snippet)
with open('snippets/product-payment-badges.liquid', 'w') as f:
    f.write(snippet)

# Also update producto.html
with open('producto.html', 'r') as f:
    p_text = f.read()

start_marker = '<!-- BLOQUE DE MEDIOS DE PAGO OFICIALES Y SEGUROS (DEBAJO DE AGREGAR AL CARRITO) -->'
idx_start = p_text.find(start_marker)
subtext_idx = p_text.find('Aceptamos tarjetas de crédito', idx_start)
idx_end = p_text.find('</div>', subtext_idx) + len('</div>')

p_text = p_text[:idx_start] + snippet.strip() + p_text[idx_end:]
with open('producto.html', 'w') as f:
    f.write(p_text)

print("Updated snippets and producto.html with namespaced badge classes!")
