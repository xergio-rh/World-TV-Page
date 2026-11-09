import json
import base64

def read_file(p):
    with open(p, 'r') as f:
        return f.read()

def b64(p):
    with open(p, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

# 1. Bold official
with open('scratch/bold_svgs.json') as f:
    bold_raw = json.load(f)[0]['html']

# 2. Visa
visa_raw = read_file('scratch/visa.svg')

# 3. Mastercard
mc_raw = read_file('scratch/mastercard.svg')

# 4. Amex
amex_raw = read_file('scratch/amex_fixed.svg')

# 5. PSE
pse_b64 = b64('scratch/pse_real.png')

# 6. Bancolombia
banco_raw = read_file('scratch/bancolombia.svg')

# 7. Nequi
nequi_raw = read_file('scratch/wvl_nequi.svg')

# 8. DaviPlata
davi_b64 = b64('scratch/daviplata_clean.png')

# 9. Addi
addi_b64 = b64('scratch/addi_logo_cropped.png')

# 10. Sistecredito
siste_raw = read_file('scratch/sistecredito.svg')

# 11. Bre-B
bre_b64 = b64('scratch/bre_b_thumb.png')

# Create clean html
html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body {{
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}}
.trust-card {{
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 20px;
  max-width: 580px;
  width: 100%;
  box-sizing: border-box;
}}
.trust-header {{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #0f172a;
  text-transform: uppercase;
  margin-bottom: 12px;
}}
.trust-header svg {{
  color: #16a34a;
}}
.badge-grid {{
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  align-items: center;
}}
.badge {{
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  height: 32px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  transition: transform 0.15s ease;
  box-sizing: border-box;
}}
.badge:hover {{
  transform: translateY(-1px);
}}
.badge-bold {{
  padding: 0 12px;
}}
.badge-bold svg {{
  height: 18px;
  width: auto;
}}
.badge-visa svg {{
  height: 17px;
  width: auto;
}}
.badge-mc svg {{
  height: 22px;
  width: auto;
}}
.badge-amex svg {{
  height: 22px;
  width: auto;
}}
.badge-pse img {{
  height: 24px;
  width: auto;
  border-radius: 50%;
}}
.badge-bancolombia svg {{
  height: 15px;
  width: auto;
}}
.badge-nequi svg {{
  height: 18px;
  width: auto;
}}
.badge-davi img {{
  height: 20px;
  width: auto;
  border-radius: 3px;
}}
.badge-addi img {{
  height: 16px;
  width: auto;
}}
.badge-siste svg {{
  height: 14px;
  width: auto;
}}
.badge-bre img {{
  height: 18px;
  width: auto;
  border-radius: 3px;
}}
.badge-contra {{
  background: #FFFBEB;
  border-color: #FDE68A;
  color: #92400E;
  font-size: 11px;
  font-weight: 700;
  gap: 5px;
  padding: 0 9px;
}}
.badge-contra svg {{
  stroke: #D97706;
}}
.trust-footer {{
  font-size: 11px;
  line-height: 1.45;
  color: #64748b;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 0;
}}
.break-desktop {{
  flex-basis: 100%;
  height: 0;
}}
</style>
</head>
<body>

<div class="trust-card">
  <div class="trust-header">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
    <span>Pagos 100% Seguros y Garantizados</span>
  </div>

  <div class="badge-grid">
    <!-- Row 1: Bold, Visa, Mastercard, AMEX, PSE, Bancolombia -->
    <div class="badge badge-bold">{bold_raw}</div>
    <div class="badge badge-visa">{visa_raw}</div>
    <div class="badge badge-mc">{mc_raw}</div>
    <div class="badge badge-amex">{amex_raw}</div>
    <div class="badge badge-pse"><img src="data:image/png;base64,{pse_b64}" alt="PSE"></div>
    <div class="badge badge-bancolombia">{banco_raw}</div>

    <div class="break-desktop"></div>

    <!-- Row 2: Nequi, DaviPlata, Addi, Sistecredito, Bre-B, Contraentrega -->
    <div class="badge badge-nequi">{nequi_raw}</div>
    <div class="badge badge-davi"><img src="data:image/png;base64,{davi_b64}" alt="DaviPlata"></div>
    <div class="badge badge-addi"><img src="data:image/png;base64,{addi_b64}" alt="Addi"></div>
    <div class="badge badge-siste">{siste_raw}</div>
    <div class="badge badge-bre"><img src="data:image/png;base64,{bre_b64}" alt="Bre-B"></div>
    <div class="badge badge-contra">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
      <span>Contraentrega</span>
    </div>
  </div>

  <p class="trust-footer">
    Aceptamos tarjetas de crédito, débito, PSE, transferencias QR, Addi, Sistecrédito y pago en efectivo al recibir.
  </p>
</div>

</body>
</html>
"""

with open('scratch/all_authentic_preview.html', 'w') as f:
    f.write(html)
print("Saved scratch/all_authentic_preview.html")
