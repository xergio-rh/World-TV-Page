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
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body {{
  background: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}}
/* Mobile Card at 360px and 320px */
.phone-card {{
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  box-sizing: border-box;
}}
.p-pay-trust-header {{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 10px;
}}
.p-pay-badges-grid {{
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 5px;
  margin: 0 auto;
}}
.pay-logo-badge {{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 25px;
  padding: 0 5px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  box-sizing: border-box;
  flex-shrink: 0;
}}
.pay-logo-badge svg {{
  display: block;
  height: 14px;
  width: auto;
}}
.pay-logo-badge img {{
  display: block;
  height: 16px;
  width: auto;
  object-fit: contain;
}}
.badge-bold svg {{ height: 13px; }}
.badge-visa svg {{ height: 12px; }}
.badge-mc svg {{ height: 18px; }}
.badge-amex {{ background: #006FCF; border-color: #006FCF; padding: 0 4px; }}
.badge-amex svg {{ height: 15px; }}
.badge-pse {{ padding: 0 4px; }}
.badge-pse img {{ height: 19px; border-radius: 50%; }}
.badge-banco svg {{ height: 11px; }}
.badge-nequi svg {{ height: 13px; }}
.badge-davi {{ padding: 0 3px; }}
.badge-davi img {{ height: 18px; border-radius: 3px; }}
.badge-addi {{ padding: 0 5px; }}
.badge-addi img {{ height: 13px; }}
.badge-siste svg {{ height: 11px; }}
.badge-bre {{ background: #3B0764; border-color: #3B0764; padding: 0 4px; }}
.badge-bre img {{ height: 15px; border-radius: 2px; }}
.badge-contra {{
  background: #FEF3C7;
  border-color: #FCD34D;
  color: #92400E;
  font-size: 8.5px;
  font-weight: 800;
  gap: 3px;
  padding: 0 5px;
}}
.badge-contra svg {{
  height: 12px;
  width: 12px;
  stroke: #D97706;
}}
.p-pay-break-mobile {{
  flex-basis: 100%;
  height: 0;
}}
.p-pay-trust-subtext {{
  font-size: 9.5px;
  color: #64748b;
  text-align: center;
  margin: 8px 0 0;
  line-height: 1.35;
}}
</style>
</head>
<body>

<h3>Phone width: 340px (e.g. iPhone 13/14 mini / standard mobile product container)</h3>
<div style="width: 340px;">
  <div class="phone-card">
    <div class="p-pay-trust-header">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
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

      <div class="p-pay-break-mobile"></div>

      <div class="pay-logo-badge badge-pse" title="PSE"><img src="data:image/png;base64,{pse_b64}" alt="PSE"></div>
      <div class="pay-logo-badge badge-banco" title="Bancolombia">{banco_raw}</div>
      <div class="pay-logo-badge badge-nequi" title="Nequi">{nequi_raw}</div>
      <div class="pay-logo-badge badge-davi" title="DaviPlata"><img src="data:image/png;base64,{davi_b64}" alt="DaviPlata"></div>

      <div class="p-pay-break-mobile"></div>

      <div class="pay-logo-badge badge-addi" title="Addi"><img src="data:image/png;base64,{addi_b64}" alt="Addi"></div>
      <div class="pay-logo-badge badge-siste" title="Sistecrédito">{siste_raw}</div>
      <div class="pay-logo-badge badge-bre" title="Bre-B"><img src="data:image/png;base64,{bre_b64}" alt="Bre-B"></div>
      <div class="pay-logo-badge badge-contra" title="Pago Contraentrega">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
</div>

</body>
</html>
"""

with open('scratch/test_mobile_tuning.html', 'w') as f:
    f.write(html)
print("Saved scratch/test_mobile_tuning.html")
