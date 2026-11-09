import json
import base64

def b64(p):
    with open(p, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

# Bold SVG - official vector from bold.co
with open('scratch/bold_svgs.json') as f:
    bold_svg = json.load(f)[0]['html']

# Visa SVG - official vector
with open('scratch/visa.svg') as f:
    visa_svg = f.read()

# Mastercard SVG - official vector
with open('scratch/mastercard.svg') as f:
    mc_svg = f.read()

# American Express SVG - official vector with viewBox
with open('scratch/amex_fixed.svg') as f:
    amex_svg = f.read()

# Bancolombia SVG - official vector
with open('scratch/bancolombia.svg') as f:
    banco_svg = f.read()

# Nequi SVG - official vector
with open('scratch/wvl_nequi.svg') as f:
    nequi_svg = f.read()

# Sistecredito SVG - official vector
with open('scratch/sistecredito.svg') as f:
    siste_svg = f.read()

# Base64 images
pse_b64 = b64('scratch/pse_real.png')
davi_b64 = b64('scratch/daviplata_clean.png')
addi_b64 = b64('scratch/addi_logo_cropped.png')
bre_b64 = b64('scratch/bre_b_thumb.png')

print("All 12 assets loaded successfully.")
