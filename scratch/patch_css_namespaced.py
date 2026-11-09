def patch_file(p):
    with open(p, 'r') as f:
        text = f.read()

    start_str = '/* Barra de Métodos de Pago Oficiales en la Ficha de Producto */'
    end_str = '/* Panel de Métodos de Pago en Línea (Tarjeta / PSE / Nequi) */'
    
    start = text.find(start_str)
    end = text.find(end_str)
    
    if start == -1 or end == -1:
        print(f"Markers not found in {p}")
        return

    new_css = """/* Barra de Métodos de Pago Oficiales en la Ficha de Producto */
.product-payment-trust-bar {
  margin: 16px 0 20px;
  padding: 14px 16px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.p-pay-trust-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #1E293B;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.p-pay-trust-header svg {
  color: #16A34A;
  flex-shrink: 0;
}

.p-pay-badges-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 520px;
  margin: 0 auto;
}

.pay-logo-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 7px;
  background: #FFFFFF !important;
  border: 1px solid #E2E8F0 !important;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
  flex-shrink: 0;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.pay-logo-badge:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
}

.pay-logo-badge svg {
  display: block !important;
  height: 18px !important;
  width: auto !important;
  max-width: 85px !important;
  position: static !important;
  transform: none !important;
}

.pay-logo-badge img {
  display: block;
  height: 20px;
  width: auto;
  max-width: 85px;
  object-fit: contain;
}

/* Reglas por marca */
.pay-logo-badge.p-badge-bold svg {
  height: 16px !important;
}

.pay-logo-badge.p-badge-visa {
  background: #FFFFFF !important;
  border-color: #E2E8F0 !important;
  padding: 0 8px;
}
.pay-logo-badge.p-badge-visa svg {
  height: 15px !important;
}

.pay-logo-badge.p-badge-mc {
  background: #FFFFFF !important;
  border-color: #E2E8F0 !important;
  padding: 0 6px;
}
.pay-logo-badge.p-badge-mc svg {
  height: 22px !important;
}

.pay-logo-badge.p-badge-amex {
  background: #006FCF !important;
  border-color: #006FCF !important;
  padding: 0 6px;
}
.pay-logo-badge.p-badge-amex svg {
  height: 20px !important;
}

.pay-logo-badge.p-badge-pse {
  padding: 0 5px;
}
.pay-logo-badge.p-badge-pse img {
  height: 24px;
  border-radius: 50%;
}

.pay-logo-badge.p-badge-banco svg {
  height: 14px !important;
}

.pay-logo-badge.p-badge-nequi svg {
  height: 16px !important;
}

.pay-logo-badge.p-badge-davi {
  background: #ED1C24 !important;
  border-color: #ED1C24 !important;
  padding: 0 4px;
}
.pay-logo-badge.p-badge-davi img {
  height: 22px;
  border-radius: 4px;
}

.pay-logo-badge.p-badge-addi {
  padding: 0 8px;
}
.pay-logo-badge.p-badge-addi img {
  height: 16px;
}

.pay-logo-badge.p-badge-siste svg {
  height: 13px !important;
}

.pay-logo-badge.p-badge-bre {
  background: #3B0764 !important;
  border-color: #3B0764 !important;
  padding: 0 6px;
}
.pay-logo-badge.p-badge-bre img {
  height: 18px;
  border-radius: 3px;
}

.pay-logo-badge.p-badge-contra {
  background: #FEF3C7 !important;
  border-color: #FCD34D !important;
  color: #92400E;
  font-size: 10px;
  font-weight: 800;
  gap: 5px;
  padding: 0 8px;
}
.pay-logo-badge.p-badge-contra svg {
  height: 15px !important;
  stroke: #D97706;
}

.p-pay-trust-subtext {
  font-size: 11px;
  color: #64748B;
  margin: 10px 0 0;
  line-height: 1.4;
}

.p-pay-break-desktop {
  flex-basis: 100%;
  height: 0;
  margin: 0;
}

.p-pay-break-mobile {
  display: none;
}

@media (max-width: 768px) {
  .product-payment-trust-bar {
    margin: 14px 0 18px;
    padding: 12px 6px;
  }
  .p-pay-trust-header {
    font-size: 10.5px;
    margin-bottom: 10px;
  }
  .p-pay-badges-grid {
    gap: 5px;
    max-width: 330px;
  }
  .pay-logo-badge {
    height: 25px;
    padding: 0 5px;
  }
  .pay-logo-badge svg {
    height: 14px !important;
  }
  .pay-logo-badge img {
    height: 16px;
  }
  .pay-logo-badge.p-badge-bold svg {
    height: 13px !important;
  }
  .pay-logo-badge.p-badge-visa {
    padding: 0 6px;
  }
  .pay-logo-badge.p-badge-visa svg {
    height: 12px !important;
  }
  .pay-logo-badge.p-badge-mc {
    padding: 0 4px;
  }
  .pay-logo-badge.p-badge-mc svg {
    height: 18px !important;
  }
  .pay-logo-badge.p-badge-amex {
    padding: 0 4px;
  }
  .pay-logo-badge.p-badge-amex svg {
    height: 15px !important;
  }
  .pay-logo-badge.p-badge-pse {
    padding: 0 4px;
  }
  .pay-logo-badge.p-badge-pse img {
    height: 19px;
  }
  .pay-logo-badge.p-badge-banco svg {
    height: 11px !important;
  }
  .pay-logo-badge.p-badge-nequi svg {
    height: 13px !important;
  }
  .pay-logo-badge.p-badge-davi {
    padding: 0 3px;
  }
  .pay-logo-badge.p-badge-davi img {
    height: 18px;
  }
  .pay-logo-badge.p-badge-addi {
    padding: 0 5px;
  }
  .pay-logo-badge.p-badge-addi img {
    height: 13px;
  }
  .pay-logo-badge.p-badge-siste svg {
    height: 11px !important;
  }
  .pay-logo-badge.p-badge-bre {
    padding: 0 4px;
  }
  .pay-logo-badge.p-badge-bre img {
    height: 15px;
  }
  .pay-logo-badge.p-badge-contra {
    font-size: 8.5px;
    padding: 0 5px;
    gap: 3px;
  }
  .pay-logo-badge.p-badge-contra svg {
    height: 12px !important;
  }
  .p-pay-trust-subtext {
    font-size: 9.5px;
    margin: 8px 0 0;
  }
  .p-pay-break-desktop {
    display: none;
  }
  .p-pay-break-mobile {
    display: block;
    flex-basis: 100%;
    height: 0;
    margin: 0;
  }
}

"""
    text = text[:start] + new_css + text[end:]
    with open(p, 'w') as f:
        f.write(text)
    print(f"Successfully patched {p} with namespaced classes")

patch_file('shopify-theme/assets/animations.css')
patch_file('assets/animations.css')
