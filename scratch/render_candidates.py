import json
import base64
import os

def read_text(p):
    with open(p, 'r') as f:
        return f.read()

def b64(p):
    with open(p, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

# Bold
with open('scratch/bold_svgs.json') as f:
    bold_svg = json.load(f)[0]['html']

visa_svg = read_text('scratch/visa.svg')
mc_svg = read_text('scratch/mastercard.svg')
amex_svg = read_text('scratch/amex.svg')
banco_svg = read_text('scratch/bancolombia.svg')
nequi_svg = read_text('scratch/nequi.svg')
siste_svg = read_text('scratch/sistecredito.svg')
wvl_davi_svg = read_text('scratch/wvl_daviplata.svg')
wvl_pse_svg = read_text('scratch/wvl_pse.svg')

addi_b64 = b64('scratch/addi_logo_cropped.png')
pse_b64 = b64('scratch/pse_real.png')
davi_b64 = b64('scratch/daviplata_clean.png')
bre_b_b64 = b64('scratch/bre_b_thumb.png')

html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body {{
  background: #f1f5f9;
  font-family: sans-serif;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
}}
.card {{
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  width: 900px;
}}
h2 {{ margin-top: 0; color: #1e293b; font-size: 18px; }}
.grid {{
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}}
.item {{
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  min-width: 80px;
  background: #ffffff;
}}
.item svg {{
  height: 26px;
  width: auto;
  max-width: 100px;
  display: block;
}}
.item img {{
  height: 26px;
  width: auto;
  max-width: 100px;
  object-fit: contain;
  display: block;
}}
.dark-item {{
  background: #111424;
  border-color: #111424;
}}
.dark-item svg {{
  fill: white;
}}
</style>
</head>
<body>

<div class="card">
  <h2>Option A: High Fidelity Vectors & Brand Assets</h2>
  <div class="grid">
    <div class="item" style="background:#0b0d17;">
      {bold_svg}
    </div>
    <div class="item">
      {visa_svg}
    </div>
    <div class="item">
      {mc_svg}
    </div>
    <div class="item">
      {amex_svg}
    </div>
    <div class="item">
      <img src="data:image/png;base64,{pse_b64}" alt="PSE">
    </div>
    <div class="item">
      {banco_svg}
    </div>
    <div class="item" style="background:#200020; border-color:#200020;">
      {nequi_svg}
    </div>
    <div class="item">
      <div style="height:26px; overflow:hidden; display:flex; align-items:center;">
        {wvl_davi_svg}
      </div>
    </div>
    <div class="item">
      <img src="data:image/png;base64,{davi_b64}" alt="DaviPlata Real">
    </div>
    <div class="item">
      <img src="data:image/png;base64,{addi_b64}" alt="Addi">
    </div>
    <div class="item">
      {siste_svg}
    </div>
    <div class="item">
      <img src="data:image/png;base64,{bre_b_b64}" alt="Bre-B">
    </div>
    <div class="item" style="background:#FFF9E6; border-color:#FDE68A; color:#92400E; font-size:12px; font-weight:700; gap:6px;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
      <span>Contraentrega</span>
    </div>
  </div>
</div>

</body>
</html>
"""

with open('scratch/candidates_preview.html', 'w') as f:
    f.write(html)
print("Saved scratch/candidates_preview.html")
