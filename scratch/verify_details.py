import json
import base64

def read_file(p):
    with open(p, 'r') as f:
        return f.read()

def b64(p):
    with open(p, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

# Bold SVG
with open('scratch/bold_svgs.json') as f:
    bold_raw = json.load(f)[0]['html']

visa_raw = read_file('scratch/visa.svg')
mc_raw = read_file('scratch/mastercard.svg')
amex_raw = read_file('scratch/amex_fixed.svg')
banco_raw = read_file('scratch/bancolombia.svg')
nequi_raw = read_file('scratch/wvl_nequi.svg')
siste_raw = read_file('scratch/sistecredito.svg')

pse_b64 = b64('scratch/pse_real.png')
davi_b64 = b64('scratch/daviplata_clean.png')
addi_b64 = b64('scratch/addi_logo_cropped.png')
bre_b64 = b64('scratch/bre_b_thumb.png')

html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body {{
  background: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
}}
.preview-container {{
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}}
.desktop-view {{
  width: 540px;
}}
.mobile-view {{
  width: 330px;
}}
.title {{
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
  text-align: center;
}}
.p-pay-trust-header {{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 12px;
}}
.p-pay-badges-grid {{
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 auto;
}}
.pay-logo-badge {{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 7px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  box-sizing: border-box;
  flex-shrink: 0;
}}
.pay-logo-badge svg {{
  display: block;
  height: 18px;
  width: auto;
}}
.pay-logo-badge img {{
  display: block;
  height: 20px;
  width: auto;
  object-fit: contain;
}}
.badge-bold svg {{
  height: 16px;
}}
.badge-visa svg {{
  height: 15px;
}}
.badge-mc svg {{
  height: 22px;
}}
.badge-amex {{
  background: #006FCF;
  border-color: #006FCF;
  padding: 0 6px;
}}
.badge-amex svg {{
  height: 20px;
}}
.badge-pse {{
  padding: 0 5px;
}}
.badge-pse img {{
  height: 24px;
  border-radius: 50%;
}}
.badge-banco svg {{
  height: 14px;
}}
.badge-nequi svg {{
  height: 16px;
}}
.badge-davi {{
  padding: 0 4px;
}}
.badge-davi img {{
  height: 22px;
  border-radius: 4px;
}}
.badge-addi {{
  padding: 0 8px;
}}
.badge-addi img {{
  height: 16px;
}}
.badge-siste svg {{
  height: 13px;
}}
.badge-bre {{
  background: #3B0764;
  border-color: #3B0764;
  padding: 0 6px;
}}
.badge-bre img {{
  height: 18px;
  border-radius: 3px;
}}
.badge-contra {{
  background: #FEF3C7;
  border-color: #FCD34D;
  color: #92400E;
  font-size: 10px;
  font-weight: 800;
  gap: 5px;
  padding: 0 8px;
}}
.badge-contra svg {{
  height: 15px;
  stroke: #D97706;
}}
.p-pay-break-desktop {{
  flex-basis: 100%;
  height: 0;
}}
.p-pay-break-mobile {{
  display: none;
}}
.mobile-view .p-pay-break-desktop {{
  display: none;
}}
.mobile-view .p-pay-break-mobile {{
  display: block;
  flex-basis: 100%;
  height: 0;
}}
.mobile-view .pay-logo-badge {{
  height: 25px;
  padding: 0 5px;
}}
.mobile-view .pay-logo-badge svg {{
  height: 15px;
}}
.mobile-view .pay-logo-badge img {{
  height: 17px;
}}
.mobile-view .badge-pse img {{
  height: 21px;
}}
.mobile-view .badge-mc svg {{
  height: 19px;
}}
.mobile-view .badge-amex svg {{
  height: 17px;
}}
.mobile-view .badge-davi img {{
  height: 19px;
}}
.mobile-view .badge-contra {{
  font-size: 9.5px;
  padding: 0 6px;
}}
.p-pay-trust-subtext {{
  font-size: 11px;
  color: #64748b;
  text-align: center;
  margin: 10px 0 0;
  line-height: 1.4;
}}
.mobile-view .p-pay-trust-subtext {{
  font-size: 10px;
}}
</style>
</head>
<body>

<div class="title">DESKTOP PREVIEW (6 + 6 Simetría Perfecta)</div>
<div class="preview-container desktop-view">
  <div class="p-pay-trust-header">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
    <span>PAGOS 100% SEGUROS Y GARANTIZADOS</span>
  </div>

  <div class="p-pay-badges-grid">
    <div class="pay-logo-badge badge-bold" title="Bold">{bold_raw}</div>
    <div class="pay-logo-badge badge-visa" title="Visa">{visa_raw}</div>
    <div class="pay-logo-badge badge-mc" title="Mastercard">{mc_raw}</div>
    <div class="pay-logo-badge badge-amex" title="American Express">{amex_raw}</div>
    <div class="pay-logo-badge badge-pse" title="PSE"><img src="data:image/png;base64,{pse_b64}" alt="PSE"></div>
    <div class="pay-logo-badge badge-banco" title="Bancolombia">{banco_raw}</div>

    <div class="p-pay-break-desktop"></div>

    <div class="pay-logo-badge badge-nequi" title="Nequi">{nequi_raw}</div>
    <div class="pay-logo-badge badge-davi" title="DaviPlata"><img src="data:image/png;base64,{davi_b64}" alt="DaviPlata"></div>
    <div class="pay-logo-badge badge-addi" title="Addi"><img src="data:image/png;base64,{addi_b64}" alt="Addi"></div>
    <div class="pay-logo-badge badge-siste" title="Sistecrédito">{siste_raw}</div>
    <div class="pay-logo-badge badge-bre" title="Bre-B"><img src="data:image/png;base64,{bre_b64}" alt="Bre-B"></div>
    <div class="pay-logo-badge badge-contra" title="Pago Contraentrega">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
      <span>Contraentrega</span>
    </div>
  </div>

  <p class="p-pay-trust-subtext">Aceptamos tarjetas de crédito, débito, PSE, transferencias QR, Addi, Sistecrédito y pago en efectivo al recibir.</p>
</div>

<div class="title">MOBILE PREVIEW (4 + 4 + 4 Simetría Perfecta)</div>
<div class="preview-container mobile-view">
  <div class="p-pay-trust-header">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
    <span>PAGOS 100% SEGUROS Y GARANTIZADOS</span>
  </div>

  <div class="p-pay-badges-grid">
    <!-- Row 1: Bold, Visa, Mastercard, AMEX -->
    <div class="pay-logo-badge badge-bold" title="Bold">{bold_raw}</div>
    <div class="pay-logo-badge badge-visa" title="Visa">{visa_raw}</div>
    <div class="pay-logo-badge badge-mc" title="Mastercard">{mc_raw}</div>
    <div class="pay-logo-badge badge-amex" title="American Express">{amex_raw}</div>

    <div class="p-pay-break-mobile"></div>

    <!-- Row 2: PSE, Bancolombia, Nequi, DaviPlata -->
    <div class="pay-logo-badge badge-pse" title="PSE"><img src="data:image/png;base64,{pse_b64}" alt="PSE"></div>
    <div class="pay-logo-badge badge-banco" title="Bancolombia">{banco_raw}</div>
    <div class="pay-logo-badge badge-nequi" title="Nequi">{nequi_raw}</div>
    <div class="pay-logo-badge badge-davi" title="DaviPlata"><img src="data:image/png;base64,{davi_b64}" alt="DaviPlata"></div>

    <div class="p-pay-break-mobile"></div>

    <!-- Row 3: Addi, Sistecrédito, Bre-B, Contraentrega -->
    <div class="pay-logo-badge badge-addi" title="Addi"><img src="data:image/png;base64,{addi_b64}" alt="Addi"></div>
    <div class="pay-logo-badge badge-siste" title="Sistecrédito">{siste_raw}</div>
    <div class="pay-logo-badge badge-bre" title="Bre-B"><img src="data:image/png;base64,{bre_b64}" alt="Bre-B"></div>
    <div class="pay-logo-badge badge-contra" title="Pago Contraentrega">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
      <span>Contraentrega</span>
    </div>
  </div>

  <p class="p-pay-trust-subtext">Aceptamos tarjetas de crédito, débito, PSE, transferencias QR, Addi, Sistecrédito y pago en efectivo al recibir.</p>
</div>

</body>
</html>
"""

with open('scratch/verify_details.html', 'w') as f:
    f.write(html)
print("Saved scratch/verify_details.html")
