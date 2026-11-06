// ============================================================================
// SISTEMA GLOBAL DE CARRITO, PAQUETES Y KITS - WORLD TV COLOMBIA (WTVCart)
// Funciona tanto en Shopify (Liquid + AJAX Cart API) como en páginas HTML
// ============================================================================
(function() {
  if (window.WTVCart) return;

  var STORAGE_KEY = 'wtv_cart_v1';
  var stickyQty = 1;

  function formatMoney(amount) {
    var num = Math.round(Number(amount) || 0);
    return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function parsePrice(val) {
    if (typeof val === 'number') return Math.round(val);
    if (!val) return 0;
    // Eliminar decimales tipo ,00 antes de extraer dígitos
    var clean = String(val).replace(/,\d{1,2}\b/g, '').replace(/[^\d]/g, '');
    return parseInt(clean, 10) || 0;
  }

  function slugify(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function getItems() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveItems(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  }

  function showToast(msg) {
    var toast = document.getElementById('wtvCartToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'wtvCartToast';
      toast.className = 'wtv-cart-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>' + msg + '</span>';
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() {
      toast.classList.remove('show');
    }, 2400);
  }

  function ensureHeaderBadge() {
    var cartBtns = document.querySelectorAll('.cart-btn');
    cartBtns.forEach(function(btn) {
      btn.style.position = 'relative';
      if (!btn.querySelector('.cart-count-badge')) {
        var badge = document.createElement('span');
        badge.className = 'cart-count-badge';
        badge.style.display = 'none';
        badge.textContent = '0';
        btn.appendChild(badge);
      }
    });
  }

  function ensureDynamicCartDOM() {
    var cartBody = document.querySelector('#cartDrawer .cart-body');
    if (cartBody && !document.getElementById('cartItemsList')) {
      // Eliminar tarjetas estáticas de muestra y crear contenedor dinámico
      var staticCards = cartBody.querySelectorAll('.cart-item-card');
      staticCards.forEach(function(c) { c.remove(); });
      var listDiv = document.createElement('div');
      listDiv.id = 'cartItemsList';
      cartBody.insertBefore(listDiv, cartBody.firstChild);
    }

    var cartHeaderH3 = document.querySelector('#cartDrawer .cart-header h3');
    if (cartHeaderH3 && !document.getElementById('cartDrawerCount')) {
      var countSpan = document.createElement('span');
      countSpan.id = 'cartDrawerCount';
      countSpan.style.cssText = 'font-size:13px; color:var(--brand-red); font-family:var(--font-sans); font-weight:800; margin-left:4px;';
      countSpan.textContent = '(0)';
      cartHeaderH3.appendChild(countSpan);
    }

    // Asegurar IDs en el footer del carrito si es HTML estático
    var summaryRows = document.querySelectorAll('#cartDrawer .cart-footer .cart-summary-row');
    if (summaryRows.length >= 2) {
      var firstStrong = summaryRows[0].querySelector('strong');
      if (firstStrong && !firstStrong.id) firstStrong.id = 'cartSubtotalValue';
      var lastRow = summaryRows[summaryRows.length - 1];
      var lastStrong = lastRow.querySelector('strong');
      if (lastStrong && !lastStrong.id) lastStrong.id = 'cartTotalValue';
    }

    // Asegurar los DOS botones de pago en el footer del carrito (Pagar Ahora + Pago Contraentrega)
    var cartFooter = document.querySelector('#cartDrawer .cart-footer');
    var singleCartBtn = cartFooter ? cartFooter.querySelector(':scope > .cart-checkout-btn') : null;
    if (cartFooter && singleCartBtn && !cartFooter.querySelector('.cart-dual-pay-buttons')) {
      var dualDiv = document.createElement('div');
      dualDiv.className = 'cart-dual-pay-buttons';
      dualDiv.innerHTML =
        '<button type="button" class="cart-checkout-btn btn-pay-now-main" style="width:100%; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;" onclick="WTVCart.proceedToCheckoutModal(event, \'online\');">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>' +
          '<span>COMPRAR AHORA</span>' +
        '</button>' +
        '<button type="button" class="cart-checkout-btn btn-cod-main" style="width:100%; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;" onclick="WTVCart.proceedToCheckoutModal(event, \'cod\');">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V9c0-.6.4-1 1-1h2m14 10h2c.6 0 1-.4 1-1v-4c0-.5-.2-1-.5-1.4l-3-4c-.3-.4-.8-.6-1.3-.6H15v6m-10 4h10m-10 0a2 2 0 1 0 4 0m6 0a2 2 0 1 0 4 0M7 8h8v6H7V8z"></path></svg>' +
          '<span>PAGO CONTRAENTREGA</span>' +
        '</button>';
      cartFooter.replaceChild(dualDiv, singleCartBtn);
    }

    // Asegurar selector de las dos modalidades de pago y campos de tarjeta/PSE en páginas HTML estáticas
    var chkFormCol = document.querySelector('#checkoutModal .checkout-form-col');
    if (chkFormCol && !document.getElementById('paymentModeSelector')) {
      var modeSel = document.createElement('div');
      modeSel.className = 'payment-mode-selector';
      modeSel.id = 'paymentModeSelector';
      modeSel.innerHTML =
        '<button type="button" class="pay-mode-tab active" id="tabPayCod" onclick="WTVCart.setPaymentMode(\'cod\')">' +
          '<div class="pay-mode-radio"></div>' +
          '<div class="pay-mode-info"><strong>Pago Contraentrega</strong><span>Solo tus datos • Pagas al recibir en casa</span></div>' +
        '</button>' +
        '<button type="button" class="pay-mode-tab" id="tabPayOnline" onclick="WTVCart.setPaymentMode(\'online\')">' +
          '<div class="pay-mode-radio"></div>' +
          '<div class="pay-mode-info"><strong>Pagar Ahora al Instante</strong><span>Tarjeta Crédito/Débito, PSE, Nequi</span></div>' +
        '</button>';
      chkFormCol.insertBefore(modeSel, chkFormCol.firstChild);
    }

    var chkForm = document.getElementById('wtvCheckoutForm') || document.querySelector('#checkoutModal .checkout-form');
    if (chkForm && !document.getElementById('onlinePaymentMethodsBox')) {
      var onlineBox = document.createElement('div');
      onlineBox.id = 'onlinePaymentMethodsBox';
      onlineBox.className = 'online-payment-box';
      onlineBox.style.display = 'none';
      onlineBox.innerHTML = "<div class=\"checkout-pay-header-row\">\n            <h3 class=\"checkout-pay-title\">Pago</h3>\n            <p class=\"checkout-pay-subtitle\">Todas las transacciones son seguras y est\u00e1n encriptadas.</p>\n          </div>\n\n                    <div class=\"pay-methods-accordion\" id=\"wtvPaymentAccordion\">\n            <!-- 1. TARJETA DE CR\u00c9DITO -->\n            <div class=\"pay-acc-item active\" id=\"payAccItem_card\" data-method=\"card\">\n              <div class=\"pay-acc-header\" onclick=\"WTVCart.selectPaymentAccordion('card')\">\n                <div class=\"pay-acc-title-wrap\">\n                  <span class=\"pay-acc-radio\"></span>\n                  <span class=\"pay-acc-label\">Tarjeta de cr\u00e9dito</span>\n                </div>\n                <div class=\"pay-acc-badges\">\n                  <svg width=\"38\" height=\"24\" viewBox=\"0 0 38 24\" fill=\"none\" class=\"pay-badge-card\"><rect width=\"38\" height=\"24\" rx=\"4\" fill=\"#002EB8\"/><path d=\"M15.2 16.5l2.4-9.8h2.6l-2.4 9.8h-2.6zm11.2-9.6c-.5-.2-1.3-.4-2.3-.4-2.5 0-4.3 1.3-4.3 3.3 0 1.4 1.3 2.2 2.3 2.7 1 .5 1.4.8 1.4 1.2 0 .7-.8 1-1.6 1-1 0-1.5-.2-2.3-.5l-.3-.2-.4 2.2c.6.3 1.7.5 2.9.5 2.7 0 4.5-1.3 4.5-3.4 0-1.2-.7-2-2.2-2.8-.9-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.5-.9.8 0 1.5.2 2 .4l.2.1.4-2.2zm7.5 0h-2c-.6 0-1 .2-1.3.8l-3.7 8.8h2.6l.5-1.4h3.2l.3 1.4h2.3l-1.9-9.6zm-3.1 6.2l1.3-3.6.8 3.6h-2.1zm-19.5-6.2l-2.4 6.7-.3-1.3c-.5-1.6-1.9-3.3-3.5-4.1l2.3 8.5h2.6l3.9-9.8h-2.6z\" fill=\"#FFFFFF\"/></svg>\n                  <svg width=\"38\" height=\"24\" viewBox=\"0 0 38 24\" fill=\"none\" class=\"pay-badge-card\"><rect width=\"38\" height=\"24\" rx=\"4\" fill=\"#222222\"/><circle cx=\"14.5\" cy=\"12\" r=\"6\" fill=\"#EB001B\"/><circle cx=\"23.5\" cy=\"12\" r=\"6\" fill=\"#F79E1B\"/><path d=\"M19 7.6a5.96 5.96 0 0 1 2.5 4.4 5.96 5.96 0 0 1-2.5 4.4 5.96 5.96 0 0 1-2.5-4.4c0-1.8.8-3.4 2.5-4.4z\" fill=\"#FF5F00\"/></svg>\n                  <svg width=\"38\" height=\"24\" viewBox=\"0 0 38 24\" fill=\"none\" class=\"pay-badge-card\"><rect width=\"38\" height=\"24\" rx=\"4\" fill=\"#0077D7\"/><path d=\"M9.5 7.5L6 16.5h2.8l.6-1.6h3.4l.6 1.6h3.1L13 7.5H9.5zm.9 6.2l1.1-3 1.1 3h-2.2zm7.1 2.8h2.6v-4.8l2 4.8h1.8l2-4.8v4.8h2.6V7.5h-3.4l-2 5-2-5h-3.6v9zm11-9h5.8v2.1h-3.4v1.4h3.1v2.1h-3.1v1.4h3.5v2h-5.9V7.5z\" fill=\"#FFFFFF\"/></svg>\n                  <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" class=\"pay-badge-card card-mini\"><rect x=\"0.5\" y=\"0.5\" width=\"23\" height=\"23\" rx=\"4\" fill=\"#FFFFFF\" stroke=\"#D1D5DB\"/><text x=\"12\" y=\"16\" font-family=\"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif\" font-size=\"12\" font-weight=\"700\" fill=\"#0066CC\" text-anchor=\"middle\">+3</text></svg>\n                </div>\n              </div>\n              <div class=\"pay-acc-content\" id=\"payAccContent_card\">\n                <div class=\"form-group\" style=\"margin-bottom: 10px;\">\n                  <label>N\u00famero de tarjeta</label>\n                  <div class=\"input-with-icon-right\">\n                    <input type=\"text\" id=\"chkCardNumber\" placeholder=\"N\u00famero de tarjeta\" maxlength=\"19\" autocomplete=\"cc-number\">\n                    <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#9CA3AF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\" ry=\"2\"></rect><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"></path></svg>\n                  </div>\n                </div>\n                <div class=\"form-row\" style=\"margin-bottom: 10px;\">\n                  <div class=\"form-group\">\n                    <label>Fecha de vencimiento (MM / AA)</label>\n                    <input type=\"text\" id=\"chkCardExp\" placeholder=\"MM / AA\" maxlength=\"5\" autocomplete=\"cc-exp\">\n                  </div>\n                  <div class=\"form-group\">\n                    <label style=\"display:flex; align-items:center; justify-content:space-between;\">\n                      <span>C\u00f3digo de seguridad</span>\n                      <span class=\"cvv-help-icon\" title=\"3 d\u00edgitos al reverso o 4 al frente\">?</span>\n                    </label>\n                    <input type=\"password\" id=\"chkCardCvv\" placeholder=\"CVV\" maxlength=\"4\" autocomplete=\"cc-csc\">\n                  </div>\n                </div>\n                <div class=\"form-group\" style=\"margin-bottom: 10px;\">\n                  <label>Nombre del titular</label>\n                  <input type=\"text\" id=\"chkCardHolder\" placeholder=\"Nombre tal como aparece en la tarjeta\" autocomplete=\"cc-name\">\n                </div>\n                <div class=\"form-group\" style=\"margin-bottom: 10px;\">\n                  <label>Cuotas</label>\n                  <select id=\"chkCardInstallments\">\n                    <option value=\"1\">1 cuota (D\u00e9bito / Cr\u00e9dito)</option>\n                    <option value=\"2\">2 cuotas</option>\n                    <option value=\"3\">3 cuotas</option>\n                    <option value=\"6\">6 cuotas</option>\n                    <option value=\"12\">12 cuotas</option>\n                  </select>\n                </div>\n                <label class=\"pay-checkbox-label\">\n                  <input type=\"checkbox\" id=\"chkSameBilling\" checked>\n                  <span>Usar la direcci\u00f3n de env\u00edo como direcci\u00f3n de facturaci\u00f3n</span>\n                </label>\n              </div>\n            </div>\n\n            <!-- 2. PAGA A CR\u00c9DITO O D\u00c9BITO CON PSE -->\n            <div class=\"pay-acc-item\" id=\"payAccItem_pse_addi\" data-method=\"pse_addi\">\n              <div class=\"pay-acc-header\" onclick=\"WTVCart.selectPaymentAccordion('pse_addi')\">\n                <div class=\"pay-acc-title-wrap\">\n                  <span class=\"pay-acc-radio\"></span>\n                  <span class=\"pay-acc-label\">Paga a Cr\u00e9dito o D\u00e9bito con PSE</span>\n                </div>\n                <div class=\"pay-acc-badges\">\n                  <svg width=\"38\" height=\"24\" viewBox=\"0 0 38 24\" fill=\"none\" class=\"pay-badge-card\"><rect x=\"0.5\" y=\"0.5\" width=\"37\" height=\"23\" rx=\"4\" fill=\"#FFFFFF\" stroke=\"#D1D5DB\"/><text x=\"19\" y=\"16\" font-family=\"'Nunito', 'Segoe UI', -apple-system, sans-serif\" font-size=\"13\" font-weight=\"900\" fill=\"#2842F5\" text-anchor=\"middle\" letter-spacing=\"-0.3\">Addi</text></svg>\n                  <svg width=\"38\" height=\"24\" viewBox=\"0 0 38 24\" fill=\"none\" class=\"pay-badge-card\"><rect x=\"0.5\" y=\"0.5\" width=\"37\" height=\"23\" rx=\"4\" fill=\"#FFFFFF\" stroke=\"#D1D5DB\"/><g transform=\"translate(5, 5) scale(0.68)\"><circle cx=\"8\" cy=\"8\" r=\"1.5\" fill=\"#FDB913\"/><circle cx=\"12\" cy=\"8\" r=\"1.5\" fill=\"#F58220\"/><circle cx=\"10\" cy=\"11\" r=\"1.3\" fill=\"#F37023\"/><circle cx=\"10\" cy=\"5\" r=\"1.3\" fill=\"#FDB913\"/><circle cx=\"6\" cy=\"11\" r=\"1.2\" fill=\"#F58220\"/><circle cx=\"6\" cy=\"5\" r=\"1.2\" fill=\"#FDB913\"/><circle cx=\"4\" cy=\"8\" r=\"1.2\" fill=\"#FDB913\"/><circle cx=\"14\" cy=\"8\" r=\"1.5\" fill=\"#ED1C24\"/><circle cx=\"13\" cy=\"11\" r=\"1.3\" fill=\"#ED1C24\"/><circle cx=\"13\" cy=\"5\" r=\"1.3\" fill=\"#F58220\"/></g><text x=\"26\" y=\"16\" font-family=\"'Trebuchet MS', Arial, sans-serif\" font-style=\"italic\" font-size=\"12\" font-weight=\"700\" fill=\"#0082C9\">pse</text></svg>\n                </div>\n              </div>\n              <div class=\"pay-acc-content\" id=\"payAccContent_pse_addi\" style=\"display:none;\">\n                <p class=\"pay-acc-info-text\">Paga en cuotas sin inter\u00e9s con Addi o d\u00e9bito en tiempo real desde tu cuenta bancaria v\u00eda PSE.</p>\n                <div class=\"form-group\" style=\"margin-bottom: 10px;\">\n                  <label>Entidad o Banco (PSE / Nequi / Daviplata / Addi) *</label>\n                  <select id=\"chkPseBank\">\n                    <option value=\"Bancolombia\">Bancolombia (App / Bot\u00f3n)</option>\n                    <option value=\"Nequi\">Nequi (Pago inmediato)</option>\n                    <option value=\"Daviplata\">Daviplata</option>\n                    <option value=\"Addi\">Addi (Cuotas 0% inter\u00e9s)</option>\n                    <option value=\"Davivienda\">Banco Davivienda</option>\n                    <option value=\"Banco de Bogot\u00e1\">Banco de Bogot\u00e1</option>\n                    <option value=\"BBVA Colombia\">BBVA Colombia</option>\n                    <option value=\"Nu Colombia\">Nu Colombia</option>\n                    <option value=\"Scotiabank Colpatria\">Scotiabank Colpatria</option>\n                    <option value=\"Banco de Occidente\">Banco de Occidente</option>\n                    <option value=\"Lulo Bank\">Lulo Bank</option>\n                  </select>\n                </div>\n                <div class=\"form-group\">\n                  <label>N\u00famero de C\u00e9dula / Documento del Titular *</label>\n                  <input type=\"text\" id=\"chkPseDocNumber\" placeholder=\"Ej: 1020304050\">\n                </div>\n              </div>\n            </div>\n\n            <!-- 3. SISTECREDITO -->\n            <div class=\"pay-acc-item\" id=\"payAccItem_sistecredito\" data-method=\"sistecredito\">\n              <div class=\"pay-acc-header\" onclick=\"WTVCart.selectPaymentAccordion('sistecredito')\">\n                <div class=\"pay-acc-title-wrap\">\n                  <span class=\"pay-acc-radio\"></span>\n                  <span class=\"pay-acc-label\">Sistecredito</span>\n                </div>\n                <div class=\"pay-acc-badges\">\n                  <svg width=\"52\" height=\"24\" viewBox=\"0 0 52 24\" fill=\"none\" class=\"pay-badge-card card-wide\"><rect x=\"0.5\" y=\"0.5\" width=\"51\" height=\"23\" rx=\"4\" fill=\"#FFFFFF\" stroke=\"#D1D5DB\"/><text x=\"26\" y=\"15.5\" font-family=\"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif\" font-size=\"9\" font-weight=\"800\" text-anchor=\"middle\" letter-spacing=\"-0.2\"><tspan fill=\"#002B7F\">siste</tspan><tspan fill=\"#00A859\">cr\u00e9dito</tspan></text></svg>\n                </div>\n              </div>\n              <div class=\"pay-acc-content\" id=\"payAccContent_sistecredito\" style=\"display:none;\">\n                <p class=\"pay-acc-info-text\">Paga a cuotas sin tarjeta de cr\u00e9dito utilizando tu cupo disponible en Sistecr\u00e9dito. Aprobaci\u00f3n inmediata.</p>\n                <div class=\"form-row\">\n                  <div class=\"form-group\">\n                    <label>C\u00e9dula de Ciudadan\u00eda *</label>\n                    <input type=\"text\" id=\"chkSisteDoc\" placeholder=\"N\u00famero de c\u00e9dula\">\n                  </div>\n                  <div class=\"form-group\">\n                    <label>Celular registrado en Sistecr\u00e9dito *</label>\n                    <input type=\"tel\" id=\"chkSistePhone\" placeholder=\"Ej: 300 123 4567\">\n                  </div>\n                </div>\n              </div>\n            </div>\n\n            <!-- 4. PAGA CON BOLD: TARJETA, PSE, BRE-B Y BILLETERAS -->\n            <div class=\"pay-acc-item\" id=\"payAccItem_bold\" data-method=\"bold\">\n              <div class=\"pay-acc-header\" onclick=\"WTVCart.selectPaymentAccordion('bold')\">\n                <div class=\"pay-acc-title-wrap\">\n                  <span class=\"pay-acc-radio\"></span>\n                  <span class=\"pay-acc-label\">Paga con Bold: tarjeta, PSE, Bre-B y billeteras</span>\n                </div>\n                <div class=\"pay-acc-badges\">\n                  <svg width=\"38\" height=\"24\" viewBox=\"0 0 38 24\" fill=\"none\" class=\"pay-badge-card\"><rect width=\"38\" height=\"24\" rx=\"4\" fill=\"#002EB8\"/><path d=\"M15.2 16.5l2.4-9.8h2.6l-2.4 9.8h-2.6zm11.2-9.6c-.5-.2-1.3-.4-2.3-.4-2.5 0-4.3 1.3-4.3 3.3 0 1.4 1.3 2.2 2.3 2.7 1 .5 1.4.8 1.4 1.2 0 .7-.8 1-1.6 1-1 0-1.5-.2-2.3-.5l-.3-.2-.4 2.2c.6.3 1.7.5 2.9.5 2.7 0 4.5-1.3 4.5-3.4 0-1.2-.7-2-2.2-2.8-.9-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.5-.9.8 0 1.5.2 2 .4l.2.1.4-2.2zm7.5 0h-2c-.6 0-1 .2-1.3.8l-3.7 8.8h2.6l.5-1.4h3.2l.3 1.4h2.3l-1.9-9.6zm-3.1 6.2l1.3-3.6.8 3.6h-2.1zm-19.5-6.2l-2.4 6.7-.3-1.3c-.5-1.6-1.9-3.3-3.5-4.1l2.3 8.5h2.6l3.9-9.8h-2.6z\" fill=\"#FFFFFF\"/></svg>\n                  <svg width=\"38\" height=\"24\" viewBox=\"0 0 38 24\" fill=\"none\" class=\"pay-badge-card\"><rect width=\"38\" height=\"24\" rx=\"4\" fill=\"#222222\"/><circle cx=\"14.5\" cy=\"12\" r=\"6\" fill=\"#EB001B\"/><circle cx=\"23.5\" cy=\"12\" r=\"6\" fill=\"#F79E1B\"/><path d=\"M19 7.6a5.96 5.96 0 0 1 2.5 4.4 5.96 5.96 0 0 1-2.5 4.4 5.96 5.96 0 0 1-2.5-4.4c0-1.8.8-3.4 2.5-4.4z\" fill=\"#FF5F00\"/></svg>\n                  <svg width=\"38\" height=\"24\" viewBox=\"0 0 38 24\" fill=\"none\" class=\"pay-badge-card\"><rect x=\"0.5\" y=\"0.5\" width=\"37\" height=\"23\" rx=\"4\" fill=\"#FFFFFF\" stroke=\"#D1D5DB\"/><text x=\"19\" y=\"16\" font-family=\"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif\" font-size=\"11\" font-weight=\"900\" fill=\"#3B0764\" text-anchor=\"middle\" letter-spacing=\"-0.3\">Bre\u00b7B</text></svg>\n                  <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" class=\"pay-badge-card card-mini\"><rect x=\"0.5\" y=\"0.5\" width=\"23\" height=\"23\" rx=\"4\" fill=\"#FFFFFF\" stroke=\"#D1D5DB\"/><text x=\"12\" y=\"16\" font-family=\"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif\" font-size=\"12\" font-weight=\"700\" fill=\"#0066CC\" text-anchor=\"middle\">+7</text></svg>\n                </div>\n              </div>\n              <div class=\"pay-acc-content\" id=\"payAccContent_bold\" style=\"display:none;\">\n                <div class=\"bold-highlight-box\">\n                  <div class=\"bold-logo-tag\">\n                    <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"#00C389\"><circle cx=\"12\" cy=\"12\" r=\"10\"/></svg>\n                    <strong>Pasarela Oficial Bold \u2022 Pagos 100% Seguros</strong>\n                  </div>\n                  <p class=\"pay-acc-info-text\">Paga al instante con tarjeta cr\u00e9dito/d\u00e9bito, PSE, Nequi, Daviplata o el nuevo bot\u00f3n r\u00e1pido Bre-B.</p>\n                  <div class=\"bold-methods-pills\">\n                    <button type=\"button\" class=\"bold-pill active\" onclick=\"WTVCart.setBoldSubOption(this, 'Tarjeta')\">Tarjetas</button>\n                    <button type=\"button\" class=\"bold-pill\" onclick=\"WTVCart.setBoldSubOption(this, 'PSE')\">PSE</button>\n                    <button type=\"button\" class=\"bold-pill\" onclick=\"WTVCart.setBoldSubOption(this, 'Nequi')\">Nequi / Daviplata</button>\n                    <button type=\"button\" class=\"bold-pill\" onclick=\"WTVCart.setBoldSubOption(this, 'Bre-B')\">Bre-B</button>\n                  </div>\n                </div>\n              </div>\n            </div>\n\n            <!-- 5. PAGO CONTRA ENTREGA (SIN LOGOS EN LA CABECERA) -->\n            <div class=\"pay-acc-item\" id=\"payAccItem_cod\" data-method=\"cod\">\n              <div class=\"pay-acc-header\" onclick=\"WTVCart.selectPaymentAccordion('cod')\">\n                <div class=\"pay-acc-title-wrap\">\n                  <span class=\"pay-acc-radio\"></span>\n                  <span class=\"pay-acc-label\">Pago Contra entrega</span>\n                </div>\n              </div>\n              <div class=\"pay-acc-content\" id=\"payAccContent_cod\" style=\"display:none;\">\n                <p class=\"pay-acc-info-text\">No pagas nada por adelantado. Te enviamos el pedido a tu direcci\u00f3n y pagas en efectivo o transferencia cuando el transportador te entregue en casa.</p>\n              </div>\n            </div>\n\n            <!-- 6. TRANSFERENCIA BANCOLOMBIA (SIN LOGOS EN LA CABECERA) -->\n            <div class=\"pay-acc-item\" id=\"payAccItem_bancolombia\" data-method=\"bancolombia\">\n              <div class=\"pay-acc-header\" onclick=\"WTVCart.selectPaymentAccordion('bancolombia')\">\n                <div class=\"pay-acc-title-wrap\">\n                  <span class=\"pay-acc-radio\"></span>\n                  <span class=\"pay-acc-label\">TRANSFERENCIA BANCOLOMBIA</span>\n                </div>\n              </div>\n              <div class=\"pay-acc-content\" id=\"payAccContent_bancolombia\" style=\"display:none;\">\n                <div class=\"bank-transfer-details\">\n                  <p class=\"pay-acc-info-text\">Transfiere directamente desde tu App Bancolombia a nuestra cuenta oficial sin cargos adicionales:</p>\n                  <div class=\"bank-details-box\">\n                    <div><strong>Banco:</strong> Bancolombia</div>\n                    <div><strong>Tipo de Cuenta:</strong> Ahorros</div>\n                    <div><strong>Titular:</strong> World TV Colombia S.A.S.</div>\n                    <div class=\"bank-note\">Al confirmar, te asignaremos tu n\u00famero de pedido y podr\u00e1s enviar el comprobante directamente a nuestro WhatsApp oficial de despachos.</div>\n                  </div>\n                </div>\n              </div>\n            </div>\n\n            <!-- 7. QR TODOS LOS BANCOS - BILLETERAS DIGITALES (SIN LOGOS EN LA CABECERA) -->\n            <div class=\"pay-acc-item\" id=\"payAccItem_qr\" data-method=\"qr\">\n              <div class=\"pay-acc-header\" onclick=\"WTVCart.selectPaymentAccordion('qr')\">\n                <div class=\"pay-acc-title-wrap\">\n                  <span class=\"pay-acc-radio\"></span>\n                  <span class=\"pay-acc-label\">QR TODOS LOS BANCOS - BILLLETERAS DIGITALES</span>\n                </div>\n              </div>\n              <div class=\"pay-acc-content\" id=\"payAccContent_qr\" style=\"display:none;\">\n                <p class=\"pay-acc-info-text\">Escanea y paga con el c\u00f3digo QR interoperable desde tu app preferida: Bancolombia, Nequi, Daviplata, Scotiabank Colpatria, BBVA, Banco de Bogot\u00e1, Dale, Movii o cualquier billetera digital.</p>\n              </div>\n            </div>\n          </div>";
      chkForm.appendChild(onlineBox);
    }

    // Asegurar contenedor de resumen de productos y vista de confirmación en el modal de checkout
    var chkModal = document.getElementById('checkoutModal');
    var chkBody = document.querySelector('#checkoutModal .checkout-modal-body');
    if (chkBody && !chkBody.id) chkBody.id = 'codFormBodyView';
    if (chkModal && !document.getElementById('codSuccessView')) {
      var sucDiv = document.createElement('div');
      sucDiv.id = 'codSuccessView';
      sucDiv.className = 'cod-success-view';
      sucDiv.style.display = 'none';
      chkModal.appendChild(sucDiv);
    }

    var chkSubmitBtn = document.querySelector('#checkoutModal .btn-checkout-submit');
    if (chkSubmitBtn) {
      if (!chkSubmitBtn.id) chkSubmitBtn.id = 'chkMainSubmitBtn';
      chkSubmitBtn.setAttribute('onclick', 'WTVCart.submitCheckoutForm(event)');
    }

    // Asegurar que ninguna tarjeta de producto tenga etiqueta superior de contraentrega
    document.querySelectorAll('.card-cod-badge').forEach(function(badge) {
      badge.remove();
    });

    var chkSummaryCol = document.querySelector('#checkoutModal .checkout-summary-col');
    if (chkSummaryCol && !document.getElementById('chkItemsSummaryList')) {
      var sumList = document.createElement('div');
      sumList.id = 'chkItemsSummaryList';
      sumList.style.cssText = 'max-height:165px; overflow-y:auto; margin-bottom:12px; padding-right:4px;';
      chkSummaryCol.insertBefore(sumList, chkSummaryCol.firstChild);
    }

    var chkPkgsGrid = document.querySelector('#checkoutModal .checkout-pkgs-grid');
    if (chkPkgsGrid && !chkPkgsGrid.id) {
      chkPkgsGrid.id = 'chkPackagesGrid';
    }
  }

  function syncShopifyAdd(variantId, qty, extraVariantId) {
    // No enviar POST en segundo plano a /cart/add.js durante la selección para evitar
    // errores 401 en el proxy local de `shopify theme dev`. La sincronización con Shopify
    // se realiza de forma limpia mediante el Cart Permalink (/cart/VARIANT:QTY) al ir a pagar.
  }

  function renderCart() {
    ensureHeaderBadge();
    ensureDynamicCartDOM();

    var items = getItems();
    var totalCount = 0;
    var subtotal = 0;
    var totalSavings = 0;

    items.forEach(function(item) {
      var q = Number(item.qty) || 1;
      var p = Number(item.price) || 0;
      var oldP = Number(item.oldPrice) || 0;
      totalCount += q;
      subtotal += p * q;
      if (oldP > p) {
        totalSavings += (oldP - p) * q;
      }
    });

    // 1. Actualizar todos los badges del icono del carrito en el header
    document.querySelectorAll('.cart-count-badge').forEach(function(badge) {
      badge.textContent = String(totalCount);
      badge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
    });

    var drawerCount = document.getElementById('cartDrawerCount');
    if (drawerCount) {
      drawerCount.textContent = '(' + totalCount + ')';
    }

    var clearBtn = document.getElementById('cartClearBtn');
    if (clearBtn) {
      clearBtn.style.display = items.length > 0 ? 'inline-block' : 'none';
    }

    // 2. Renderizar lista de productos en #cartItemsList
    var listEl = document.getElementById('cartItemsList');
    if (listEl) {
      if (items.length === 0) {
        listEl.innerHTML =
          '<div class="cart-empty-state">' +
            '<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>' +
            '<h4>Tu carrito está vacío</h4>' +
            '<p>Agrega tus productos o kits favoritos y se irán sumando aquí.</p>' +
          '</div>';
      } else {
        var html = '';
        items.forEach(function(item) {
          var lineTotal = (Number(item.price) || 0) * (Number(item.qty) || 1);
          var hasDiscount = item.oldPrice && Number(item.oldPrice) > Number(item.price);
          var safeId = String(item.id).replace(/'/g, "\\'");
          html +=
            '<div class="cart-item-card" data-cart-item-id="' + item.id + '">' +
              '<img src="' + (item.image || '') + '" alt="' + String(item.title || '').replace(/"/g, '&quot;') + '" width="70" height="70">' +
              '<div class="cart-item-details">' +
                '<div class="cart-item-title-row">' +
                  '<h4>' + item.title + '</h4>' +
                  '<button type="button" class="item-remove" title="Eliminar producto" onclick="WTVCart.removeItem(\'' + safeId + '\')">&times;</button>' +
                '</div>' +
                (item.packTitle ? '<span class="cart-item-pack-badge">' + item.packTitle + '</span>' : '') +
                '<div class="cart-item-price-row">' +
                  (hasDiscount ? '<span class="cart-item-old">' + formatMoney(item.oldPrice) + '</span>' : '') +
                  '<span class="cart-item-current">' + formatMoney(item.price) + ' c/u</span>' +
                '</div>' +
                '<div class="cart-item-qty-row">' +
                  '<div class="qty-selector">' +
                    '<button type="button" onclick="WTVCart.changeQty(\'' + safeId + '\', -1)" aria-label="Disminuir cantidad">−</button>' +
                    '<span>' + item.qty + '</span>' +
                    '<button type="button" onclick="WTVCart.changeQty(\'' + safeId + '\', 1)" aria-label="Aumentar cantidad">+</button>' +
                  '</div>' +
                  '<span class="cart-item-total">' + formatMoney(lineTotal) + '</span>' +
                '</div>' +
              '</div>' +
            '</div>';
        });
        listEl.innerHTML = html;
      }
    }

    // 3. Actualizar Subtotal, Ahorro y Total del carrito
    var subEl = document.getElementById('cartSubtotalValue');
    var totEl = document.getElementById('cartTotalValue');
    var savRow = document.getElementById('cartSavingsRow');
    var savVal = document.getElementById('cartSavingsValue');

    if (subEl) subEl.textContent = formatMoney(subtotal);
    if (totEl) totEl.textContent = formatMoney(subtotal);
    if (savRow && savVal) {
      if (totalSavings > 0) {
        savRow.style.display = 'flex';
        savVal.textContent = '-' + formatMoney(totalSavings);
      } else {
        savRow.style.display = 'none';
      }
    }

    // 4. Actualizar también el Modal de Checkout (#checkoutModal)
    renderCheckoutModal(items, subtotal);
  }

  function renderCheckoutModal(items, subtotal) {
    var chkSub = document.getElementById('chkSubtotal');
    var chkTot = document.getElementById('chkTotal');
    if (chkSub) chkSub.textContent = formatMoney(subtotal);
    if (chkTot) chkTot.textContent = formatMoney(subtotal);

    var chkList = document.getElementById('chkItemsSummaryList');
    if (chkList) {
      if (items.length === 0) {
        chkList.innerHTML = '<p style="font-size:12px; color:#777; text-align:center; padding:8px 0;">No hay productos seleccionados todavía.</p>';
      } else {
        var listHtml = '';
        items.forEach(function(item) {
          var linePrice = (Number(item.price) || 0) * (Number(item.qty) || 1);
          listHtml +=
            '<div class="chk-mini-item">' +
              '<img src="' + (item.image || '') + '" alt="" width="42" height="42">' +
              '<div class="chk-mini-item-info">' +
                '<h5>' + item.title + '</h5>' +
                '<span>' + (item.packTitle || 'Unidad') + ' × ' + item.qty + '</span>' +
              '</div>' +
              '<div class="chk-mini-item-price">' + formatMoney(linePrice) + '</div>' +
            '</div>';
        });
        chkList.innerHTML = listHtml;
      }
    }

    var chkWrapper = document.getElementById("chkPackagesWrapper"); if (chkWrapper) chkWrapper.remove();
  }

  function popBadge() {
    document.querySelectorAll('.cart-count-badge').forEach(function(b) {
      b.classList.remove('pop');
      void b.offsetWidth;
      b.classList.add('pop');
      setTimeout(function() { b.classList.remove('pop'); }, 300);
    });
  }

  function openCartDrawer() {
    var drawer = document.getElementById('cartDrawer');
    var overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      drawer.classList.add('active');
      overlay.classList.add('active');
    }
  }

  function closeCartDrawer() {
    var drawer = document.getElementById('cartDrawer');
    var overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
    }
  }

  function openCheckoutModal() {
    ensureDynamicCartDOM();
    var formView = document.getElementById('codFormBodyView') || document.querySelector('#checkoutModal .checkout-modal-body');
    var sucView = document.getElementById('codSuccessView');
    if (formView) formView.style.display = '';
    if (sucView) sucView.style.display = 'none';

    var modal = document.getElementById('checkoutModal');
    var overlay = document.getElementById('checkoutModalOverlay');
    if (modal && overlay) {
      modal.classList.add('active');
      overlay.classList.add('active');
    }
  }

  function extractPagePackages() {
    var pkgEls = document.querySelectorAll('.packages-grid .pack-option');
    var packages = [];
    pkgEls.forEach(function(el) {
      var titleEl = el.querySelector('.pack-title');
      var strongEl = el.querySelector('.pack-prices strong');
      var delEl = el.querySelector('.pack-prices del');
      var imgEl = el.querySelector('img');
      var pTitle = el.getAttribute('data-pack-title') || (titleEl ? titleEl.textContent.trim() : 'Unidad');
      var pPrice = el.getAttribute('data-price') ? Number(el.getAttribute('data-price')) : parsePrice(strongEl ? strongEl.textContent : '0');
      var pOld = el.getAttribute('data-old-price') ? Number(el.getAttribute('data-old-price')) : parsePrice(delEl ? delEl.textContent : '0');
      var pImg = el.getAttribute('data-img') || (imgEl ? imgEl.src : '');
      var pVarId = el.getAttribute('data-variant-id') || '';
      packages.push({
        variantId: pVarId,
        packTitle: pTitle,
        price: pPrice,
        oldPrice: pOld,
        image: pImg
      });
    });
    return packages;
  }

  window.WTVCart = {
    formatMoney: formatMoney,
    parsePrice: parsePrice,
    getItems: getItems,

    addItem: function(itemData, openDrawer) {
      if (!itemData || !itemData.title) return;
      var items = getItems();
      var packTitle = itemData.packTitle || 'Una Unidad';
      var baseKey = itemData.productKey || slugify(itemData.title);
      var itemId = itemData.id || (baseKey + '__' + slugify(packTitle));
      var qtyToAdd = Number(itemData.qty) || 1;
      var price = parsePrice(itemData.price);
      var oldPrice = parsePrice(itemData.oldPrice);

      var found = null;
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === itemId || (items[i].title === itemData.title && items[i].packTitle === packTitle)) {
          found = items[i];
          break;
        }
      }

      if (found) {
        found.qty = (Number(found.qty) || 1) + qtyToAdd;
        if (price > 0) found.price = price;
        if (oldPrice > 0) found.oldPrice = oldPrice;
        if (itemData.image) found.image = itemData.image;
        if (itemData.packages && itemData.packages.length) found.packages = itemData.packages;
      } else {
        items.push({
          id: itemId,
          productKey: baseKey,
          variantId: itemData.variantId || null,
          extraVariantId: itemData.extraVariantId || null,
          title: itemData.title,
          packTitle: packTitle,
          price: price,
          oldPrice: oldPrice,
          image: itemData.image || '',
          qty: qtyToAdd,
          packages: itemData.packages || null
        });
      }

      saveItems(items);
      syncShopifyAdd(itemData.variantId, qtyToAdd, itemData.extraVariantId);
      renderCart();
      popBadge();
      showToast('Agregado: ' + itemData.title + ' (' + packTitle + ')');

      if (openDrawer !== false) {
        openCartDrawer();
      }
    },

    changeQty: function(itemId, delta) {
      var items = getItems();
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === itemId) {
          items[i].qty = (Number(items[i].qty) || 1) + Number(delta);
          if (items[i].qty <= 0) {
            items.splice(i, 1);
          }
          break;
        }
      }
      saveItems(items);
      renderCart();
    },

    removeItem: function(itemId) {
      var items = getItems().filter(function(item) {
        return item.id !== itemId;
      });
      saveItems(items);
      renderCart();
      showToast('Producto eliminado del carrito');
    },

    clearCart: function() {
      saveItems([]);
      renderCart();
    },

    switchItemPackage: function(itemId, pkgIndex) {
      var items = getItems();
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === itemId && items[i].packages && items[i].packages[pkgIndex]) {
          var chosen = items[i].packages[pkgIndex];
          items[i].packTitle = chosen.packTitle;
          items[i].price = parsePrice(chosen.price);
          items[i].oldPrice = parsePrice(chosen.oldPrice);
          if (chosen.image) items[i].image = chosen.image;
          if (chosen.variantId) items[i].variantId = chosen.variantId;
          items[i].id = (items[i].productKey || slugify(items[i].title)) + '__' + slugify(chosen.packTitle);
          break;
        }
      }
      saveItems(items);
      renderCart();
    },

    highlightKitCard: function(cardId) {
      document.querySelectorAll('.kit-card').forEach(function(card) {
        card.classList.remove('kit-selected');
        var oldRibbon = card.querySelector('.kit-selected-ribbon');
        if (oldRibbon) oldRibbon.remove();
      });
      var target = document.getElementById(cardId);
      if (target) {
        target.classList.add('kit-selected');
        var ribbon = document.createElement('span');
        ribbon.className = 'kit-selected-ribbon';
        ribbon.textContent = 'KIT SELECCIONADO';
        target.appendChild(ribbon);
      }
    },

    currentPaymentMode: 'cod',
    currentAccordionMethod: 'card',
    currentBoldSubOption: 'Tarjeta',
    currentOnlineSubMethod: 'card',

    setPaymentMode: function(mode) {
      ensureDynamicCartDOM();
      this.currentPaymentMode = (mode === 'online') ? 'online' : 'cod';

      var tabCod = document.getElementById('tabPayCod');
      var tabOnline = document.getElementById('tabPayOnline');
      if (tabCod) tabCod.classList.toggle('active', this.currentPaymentMode === 'cod');
      if (tabOnline) tabOnline.classList.toggle('active', this.currentPaymentMode === 'online');

      var onlineBox = document.getElementById('onlinePaymentMethodsBox');
      if (onlineBox) {
        onlineBox.style.display = (this.currentPaymentMode === 'online') ? 'block' : 'none';
      }

      if (this.currentPaymentMode === 'online') {
        if (this.currentAccordionMethod === 'cod') {
          this.selectPaymentAccordion('bold');
        } else {
          this.selectPaymentAccordion(this.currentAccordionMethod || 'card');
        }
      } else {
        this.selectPaymentAccordion('cod');
      }
    },

    selectPaymentAccordion: function(methodKey) {
      this.currentAccordionMethod = methodKey || 'card';
      var allItems = document.querySelectorAll('.pay-acc-item');
      allItems.forEach(function(item) {
        var m = item.getAttribute('data-method');
        var content = document.getElementById('payAccContent_' + m);
        if (m === methodKey) {
          item.classList.add('active');
          if (content) content.style.display = 'block';
        } else {
          item.classList.remove('active');
          if (content) content.style.display = 'none';
        }
      });

      var submitBtn = document.getElementById('chkMainSubmitBtn') || document.querySelector('#checkoutModal .btn-checkout-submit');
      var totalLabel = document.getElementById('chkTotalLabel');
      var tabCod = document.getElementById('tabPayCod');
      var tabOnline = document.getElementById('tabPayOnline');

      if (methodKey === 'cod') {
        this.currentPaymentMode = 'cod';
        if (tabCod) tabCod.classList.add('active');
        if (tabOnline) tabOnline.classList.remove('active');
        if (submitBtn) submitBtn.textContent = 'CONFIRMAR PEDIDO CONTRAENTREGA';
        if (totalLabel) totalLabel.textContent = 'Total a pagar al recibir';
      } else {
        this.currentPaymentMode = 'online';
        if (tabCod) tabCod.classList.remove('active');
        if (tabOnline) tabOnline.classList.add('active');
        if (totalLabel) totalLabel.textContent = 'Total a pagar ahora';

        var btnTexts = {
          card: 'PAGAR CON TARJETA DE CRÉDITO',
          pse_addi: 'PAGAR CON PSE / ADDI',
          sistecredito: 'PAGAR CON SISTECRÉDITO',
          bold: 'PAGAR CON BOLD (PASARELA SEGURA)',
          bancolombia: 'CONFIRMAR Y TRANSFERIR POR BANCOLOMBIA',
          qr: 'PAGAR CON CÓDIGO QR'
        };
        if (submitBtn) {
          submitBtn.textContent = btnTexts[methodKey] || 'PAGAR AHORA AL INSTANTE';
        }
      }
    },

    setBoldSubOption: function(btnEl, optionName) {
      this.currentBoldSubOption = optionName || 'Tarjeta';
      var container = btnEl ? btnEl.closest('.bold-methods-pills') : document.querySelector('.bold-methods-pills');
      if (container) {
        container.querySelectorAll('.bold-pill').forEach(function(p) { p.classList.remove('active'); });
      }
      if (btnEl) btnEl.classList.add('active');
    },

    selectOnlineSubMethod: function(sub) {
      if (sub === 'pse') {
        this.selectPaymentAccordion('pse_addi');
      } else {
        this.selectPaymentAccordion('card');
      }
    },

    selectAndAddKit: function(cardId, kitData, openCheckout, mode) {
      if (cardId) {
        this.highlightKitCard(cardId);
      }
      this.addItem(kitData, !openCheckout);
      if (openCheckout) {
        closeCartDrawer();
        openCheckoutModal();
        this.setPaymentMode(mode || 'cod');
      }
    },

    getStickyQty: function() {
      return stickyQty;
    },

    changeStickyQty: function(delta) {
      stickyQty = Math.max(1, stickyQty + Number(delta));
      var el = document.getElementById('stickyQtyVal');
      if (el) el.textContent = String(stickyQty);
      var staticStickySpan = document.querySelector('.qty-selector-sticky span');
      if (staticStickySpan) staticStickySpan.textContent = String(stickyQty);
    },

    addSelectedProductFromPage: function(goToCheckoutModal, customQty, mode) {
      var titleEl = document.querySelector('.product-title-main');
      var hiddenTitle = document.getElementById('selectedProductTitle');
      var title = (hiddenTitle && hiddenTitle.value) || (titleEl ? titleEl.textContent.trim() : 'Producto World TV');

      var activePack = document.querySelector('.packages-grid .pack-option.active');
      var packTitle = 'Una Unidad';
      var price = 0;
      var oldPrice = 0;
      var variantId = '';
      var img = '';

      if (activePack) {
        var tEl = activePack.querySelector('.pack-title');
        var sEl = activePack.querySelector('.pack-prices strong');
        var dEl = activePack.querySelector('.pack-prices del');
        var iEl = activePack.querySelector('img');

        packTitle = activePack.getAttribute('data-pack-title') || (tEl ? tEl.textContent.trim() : 'Una Unidad');
        price = activePack.getAttribute('data-price') ? Number(activePack.getAttribute('data-price')) : parsePrice(sEl ? sEl.textContent : '0');
        oldPrice = activePack.getAttribute('data-old-price') ? Number(activePack.getAttribute('data-old-price')) : parsePrice(dEl ? dEl.textContent : '0');
        variantId = activePack.getAttribute('data-variant-id') || '';
        img = activePack.getAttribute('data-img') || (iEl ? iEl.src : '');
      } else {
        var curPriceEl = document.querySelector('.current-price');
        var oldPriceEl = document.querySelector('.old-price');
        price = parsePrice(curPriceEl ? curPriceEl.textContent : '0');
        oldPrice = parsePrice(oldPriceEl ? oldPriceEl.textContent : '0');
      }

      var hiddenVar = document.getElementById('selectedVariantId');
      if (!variantId && hiddenVar) variantId = hiddenVar.value;

      var mainImg = document.getElementById('mainProductImg');
      if (!img && mainImg) img = mainImg.src;

      var allPackages = extractPagePackages();
      var prodHandleEl = document.getElementById('selectedProductHandle');
      var prodKey = (prodHandleEl && prodHandleEl.value) || slugify(title);

      this.addItem({
        id: prodKey + '__' + slugify(packTitle),
        productKey: prodKey,
        variantId: variantId,
        title: title,
        packTitle: packTitle,
        price: price,
        oldPrice: oldPrice,
        image: img,
        qty: customQty || 1,
        packages: allPackages
      }, !goToCheckoutModal);

      if (goToCheckoutModal) {
        closeCartDrawer();
        openCheckoutModal();
        this.setPaymentMode(mode || 'cod');
      }
    },

    proceedToCheckoutModal: function(e, mode) {
      if (e) e.preventDefault();
      var items = getItems();
      if (items.length === 0) {
        showToast('Agrega al menos un producto al carrito primero');
        return false;
      }
      closeCartDrawer();
      openCheckoutModal();
      this.setPaymentMode(mode || 'cod');
      return false;
    },

    submitCheckoutForm: function(e) {
      if (e) e.preventDefault();
      var items = getItems();
      if (items.length === 0) {
        showToast('Agrega primero un producto o kit al carrito');
        return false;
      }

      var form = document.getElementById('wtvCheckoutForm') || document.querySelector('#checkoutModal .checkout-form');
      if (form) {
        var emailInp = form.querySelector('input[type="email"]');
        if (emailInp) emailInp.removeAttribute('required');
        if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
          return false;
        }
      }

      var isOnline = (this.currentPaymentMode === 'online');
      var methodKey = this.currentAccordionMethod || (isOnline ? 'card' : 'cod');
      var paymentSummaryLabel = 'Pago Contraentrega (Al recibir en casa)';
      var paymentExtraNotes = '';

      if (methodKey === 'card') {
        var cardNumEl = document.getElementById('chkCardNumber');
        var cardExpEl = document.getElementById('chkCardExp');
        var cardCvvEl = document.getElementById('chkCardCvv');
        var cardNum = cardNumEl ? cardNumEl.value.replace(/\s+/g, '') : '';
        var cardExp = cardExpEl ? cardExpEl.value.trim() : '';
        var cardCvv = cardCvvEl ? cardCvvEl.value.trim() : '';
        if (cardNum.length < 12 || !cardExp || cardCvv.length < 3) {
          showToast('Completa los datos de tu tarjeta (número, vencimiento y CVV)');
          if (cardNumEl && cardNum.length < 12) cardNumEl.focus();
          return false;
        }
        var last4 = cardNum.slice(-4);
        paymentSummaryLabel = 'Tarjeta de crédito terminada en •••• ' + last4 + ' (Pagado en línea)';
        paymentExtraNotes = 'Transacción procesada y asegurada con cifrado bancario de 256 bits.';
      } else if (methodKey === 'pse_addi') {
        var bankEl = document.getElementById('chkPseBank') || document.getElementById('chkBankEntity');
        var docEl = document.getElementById('chkPseDocNumber') || document.getElementById('chkPseDoc');
        var bName = bankEl ? bankEl.value : 'PSE';
        var docVal = docEl ? docEl.value.trim() : '';
        if (!docVal) {
          showToast('Ingresa tu número de documento para procesar el pago por ' + bName);
          if (docEl) docEl.focus();
          return false;
        }
        paymentSummaryLabel = 'Paga con PSE / Addi (' + bName + ' — Doc: ' + docVal + ')';
        paymentExtraNotes = 'Débito procesado exitosamente vía PSE / Addi.';
      } else if (methodKey === 'sistecredito') {
        var sisteDocEl = document.getElementById('chkSisteDoc');
        var sDoc = sisteDocEl ? sisteDocEl.value.trim() : '';
        if (!sDoc) {
          showToast('Ingresa tu número de cédula para consultar tu cupo Sistecrédito');
          if (sisteDocEl) sisteDocEl.focus();
          return false;
        }
        paymentSummaryLabel = 'Sistecrédito a Cuotas (Cédula: ' + sDoc + ')';
        paymentExtraNotes = 'Cupo Sistecrédito verificado y reservado para tus cuotas.';
      } else if (methodKey === 'bold') {
        var boldSub = this.currentBoldSubOption || 'Tarjeta / PSE / Billeteras';
        paymentSummaryLabel = 'Paga con Bold: tarjeta, PSE, Bre-B y billeteras (' + boldSub + ')';
        paymentExtraNotes = 'Pago procesado a través de la pasarela oficial Bold.';
      } else if (methodKey === 'bancolombia') {
        paymentSummaryLabel = 'Transferencia Bancolombia (Cuenta Ahorros Oficial)';
        paymentExtraNotes = 'Tu pedido está reservado. Envía tu comprobante de transferencia al WhatsApp oficial de despachos.';
      } else if (methodKey === 'qr') {
        paymentSummaryLabel = 'QR Todos los Bancos - Billeteras Digitales';
        paymentExtraNotes = 'Pago confirmado vía Código QR Interoperable (Bancolombia / Nequi / Daviplata / Redeban).';
      } else {
        paymentSummaryLabel = 'Pago Contraentrega (Al recibir en casa)';
        paymentExtraNotes = 'No tienes que pagar nada por adelantado. Pagas al transportador cuando llegue a tu puerta.';
      }

      // Extraer datos ingresados por el cliente
      var inputs = form ? form.querySelectorAll('input, select') : [];
      var firstName = (document.getElementById('chkFirstName') && document.getElementById('chkFirstName').value) || (inputs[0] ? inputs[0].value : '');
      var lastName = (document.getElementById('chkLastName') && document.getElementById('chkLastName').value) || (inputs[1] ? inputs[1].value : '');
      var phone = (document.getElementById('chkPhone') && document.getElementById('chkPhone').value) || (inputs[2] ? inputs[2].value : '');
      var province = (document.getElementById('chkProvince') && document.getElementById('chkProvince').value) || (inputs[3] ? inputs[3].value : '');
      var city = (document.getElementById('chkCity') && document.getElementById('chkCity').value) || (inputs[4] ? inputs[4].value : '');
      var address1 = (document.getElementById('chkAddress1') && document.getElementById('chkAddress1').value) || (inputs[5] ? inputs[5].value : '');
      var address2 = (document.getElementById('chkAddress2') && document.getElementById('chkAddress2').value) || (inputs[6] ? inputs[6].value : '');

      var subtotal = 0;
      items.forEach(function(it) {
        var line = (Number(it.price) || 0) * (Number(it.qty) || 1);
        subtotal += line;
      });

      var orderCode = 'WTV-' + Math.floor(10000 + Math.random() * 90000);

      ensureDynamicCartDOM();
      var formView = document.getElementById('codFormBodyView') || document.querySelector('#checkoutModal .checkout-modal-body');
      var sucView = document.getElementById('codSuccessView');

      if (sucView && formView) {
        formView.style.display = 'none';
        sucView.style.display = 'block';
        sucView.innerHTML =
          '<div class="cod-success-card">' +
            '<div class="cod-success-icon">' +
              '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#15803D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' +
            '</div>' +
            '<span class="cod-order-badge">ORDEN #' + orderCode + ' • ' + (isOnline ? 'PAGO EN LÍNEA APROBADO' : 'PAGO CONTRAENTREGA') + '</span>' +
            '<h3>' + (isOnline ? '¡Tu pago y pedido han sido confirmados!' : '¡Tu pedido contraentrega ha sido confirmado!') + '</h3>' +
            '<p class="cod-success-lead">Hola <strong>' + firstName + ' ' + lastName + '</strong>, ' +
              (isOnline
                ? 'tu pago por <strong>' + formatMoney(subtotal) + ' COP</strong> fue procesado exitosamente. Tu pedido ya pasó a despacho prioritario.'
                : 'ya registramos tu pedido. <strong>No tienes que pagar nada ahora:</strong> pagas únicamente cuando el transportador te entregue en tu dirección.') +
            '</p>' +
            '<div class="cod-summary-grid">' +
              '<div class="cod-summary-block">' +
                '<h5>DATOS DE ENTREGA Y PAGO</h5>' +
                '<p><strong>Cliente:</strong> ' + firstName + ' ' + lastName + '</p>' +
                '<p><strong>Teléfono:</strong> ' + phone + '</p>' +
                '<p><strong>Destino:</strong> ' + city + ', ' + province + '</p>' +
                '<p><strong>Dirección:</strong> ' + address1 + (address2 ? ' (' + address2 + ')' : '') + '</p>' +
                '<p><strong>Método:</strong> ' + paymentSummaryLabel + '</p>' + (paymentExtraNotes ? ('<p style="font-size:11.5px; color:#475569; background:#F8FAFC; border:1px solid #E2E8F0; padding:6px 8px; border-radius:6px; margin-top:6px;">' + paymentExtraNotes + '</p>') : '') +
              '</div>' +
              '<div class="cod-summary-block">' +
                '<h5>RESUMEN DEL PEDIDO</h5>' +
                '<ul class="cod-items-ul">' +
                  items.map(function(it) {
                    return '<li><span>' + it.qty + '× ' + it.title + ' <small>(' + (it.packTitle || 'Unidad') + ')</small></span><strong>' + formatMoney((Number(it.price) || 0) * (Number(it.qty) || 1)) + '</strong></li>';
                  }).join('') +
                '</ul>' +
                '<div class="cod-total-pay-row">' +
                  '<span>' + (isOnline ? 'Total Pagado:' : 'Total a pagar al recibir:') + '</span>' +
                  '<strong>' + formatMoney(subtotal) + ' COP</strong>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="cod-success-actions">' +
              '<button type="button" class="btn-checkout-submit" onclick="WTVCart.finishCodOrder()">FINALIZAR Y SEGUIR COMPRANDO</button>' +
            '</div>' +
          '</div>';
      }

      showToast(isOnline ? ('¡Pago aprobado! Orden #' + orderCode) : ('¡Pedido Contraentrega #' + orderCode + ' confirmado!'));
      return false;
    },

    finishCodOrder: function() {
      saveItems([]);
      renderCart();
      var modal = document.getElementById('checkoutModal');
      var overlay = document.getElementById('checkoutModalOverlay');
      if (modal) modal.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      var formView = document.getElementById('codFormBodyView') || document.querySelector('#checkoutModal .checkout-modal-body');
      var sucView = document.getElementById('codSuccessView');
      if (formView) formView.style.display = '';
      if (sucView) sucView.style.display = 'none';
    },

    // Comprar el modelo de gafas seleccionado en la sección Relax Vision del Home
    addSelectedVisionModel: function() {
      var activeModel = document.querySelector('.models-box .model-item.active') || document.querySelector('.models-box .model-item');
      var title = activeModel ? (activeModel.getAttribute('data-title') || 'Relax Vision Premium') : 'Relax Vision Premium';
      var price = activeModel && activeModel.getAttribute('data-price') ? Number(activeModel.getAttribute('data-price')) : 217651;
      var img = activeModel ? (activeModel.getAttribute('data-img') || '') : '';
      if (!img) {
        var mainVisionImg = document.getElementById('mainVisionImg');
        if (mainVisionImg) img = mainVisionImg.src;
      }
      this.addItem({
        id: 'vision-' + slugify(title),
        title: title + ' - Gafas Filtro Azul y UV400',
        packTitle: '1 Unidad + Estuche Protector',
        price: price,
        oldPrice: price + 35000,
        image: img,
        qty: 1
      }, true);
    },

    // Catálogo completo para el buscador predictivo en vivo (Precios Reales con IVA 19% Incluido)
    catalogData: [
      { id: 'cloruro-1', title: 'Colasteel Cloruro de Magnesio 500 ml', category: 'Nutrición', price: 101031, oldPrice: 127500, url: '/products/cloruro-500-gr-formula-unica', keywords: 'cloruro magnesio colasteel articulaciones colageno' },
      { id: 'melena-1', title: 'Melena de León en Polvo SI100 - Capuchino', category: 'Nutrición', price: 94900, oldPrice: 127500, url: '/products/melena-de-leon-en-polvo-formula-unica-sabor-a-capuchino', keywords: 'melena leon hongo memoria enfoque capuchino' },
      { id: 'resveratrol-1', title: 'Resveratrol 500 ml – Fórmula Única', category: 'Nutrición', price: 101500, oldPrice: 125000, url: '/products/resveratrol-500-ml-formula-unica', keywords: 'resveratrol antioxidante antiedad energia' },
      { id: 'inositol-1', title: 'Inositol en Polvo con Biotina y Vitamina B12', category: 'Nutrición', price: 94900, oldPrice: 118000, url: '/products/inositol-en-polvo-con-biotina-acido-folico-y-vitamina-b12', keywords: 'inositol orebitol biotina metabolismo ansiedad' },
      { id: 'amalaki-1', title: 'Amalaki Bebida Funcional 500 gr', category: 'Nutrición', price: 74900, oldPrice: 95000, url: '/products/gamaki-bebida-funcional-con-extracto-de-amalaki-y-colageno-world-tv', keywords: 'amalaki gamaki digestivo defensas te colageno' },
      { id: 'colageno-marino-1', title: 'Colágeno Marino con Ajonjolí, Cúrcuma y Jengibre', category: 'Nutrición', price: 101031, oldPrice: 127500, url: '/products/colageno-marino-formula-unica-con-ajonjoli-curcuma-y-genjibre', keywords: 'colageno marino curcuma jengibre articulaciones' },
      { id: 'citrato-1', title: 'Citrato de Magnesio con Hierbas Aromáticas', category: 'Nutrición', price: 101031, oldPrice: 127500, url: '/products/citrato-de-magnesio-formula-unica-con-hierbas-aromaticas', keywords: 'citrato magnesio sueno descanso relajacion' },
      { id: 'serum-1', title: 'Sérum Facial Fórmula Única con Vitamina C', category: 'Belleza', price: 118405, oldPrice: 130000, url: '/products/serum-facil-con-formula-unica-con-vitamina-c', keywords: 'serum suero facial vitamina c piel manchas' },
      { id: 'cannabix-1', title: 'Cannabix Crema con Árnica, Colágeno y Magnesio', category: 'Belleza', price: 77231, oldPrice: 85000, url: '/products/cannabis-formula-unica-con-arnica-vainilla-colageno-y-cloruro-de-magnesio', keywords: 'cannabix crema cbd arnica dolor muscular masaje' },
      { id: 'rv-premium', title: 'Gafas Relax Vision Premium - Filtro Azul y UV400', category: 'Salud Visual', price: 217651, oldPrice: 260000, url: '/products/relax-vision-premium-gafas-con-filtro-uv-400-antirreflejo-y-proteccion-visual-world-tv-copia', keywords: 'gafas lentes relax vision premium pantallas filtro azul' },
      { id: 'rv-clasicas', title: 'Gafas Relax Vision Clásicas - UV400 y Antirreflejo', category: 'Salud Visual', price: 202181, oldPrice: 240000, url: '/products/relax-vision-clasicas-lentes-de-proteccion-visual', keywords: 'gafas lentes relax vision clasicas' },
      { id: 'rv-chromax', title: 'Gafas Relax Vision Chromax - Protección Avanzada', category: 'Salud Visual', price: 231931, oldPrice: 275000, url: '/products/relax-vision-premium-gafas-con-filtro-azul-uv-400-y-antirreflejo-world-tv-copia', keywords: 'gafas lentes relax vision chromax' },
      { id: 'rv-sky', title: 'Gafas Relax Vision Sky - Estilo Aviador', category: 'Salud Visual', price: 206900, oldPrice: 245000, url: '/products/relax-vision-sky-gafas-con-filtro-azul-uv-400-y-antirreflejo-world-tv', keywords: 'gafas lentes relax vision sky aviador' },
      { id: 'rv-venturi', title: 'Gafas Relax Vision Venturi - Máxima Ergonomía', category: 'Salud Visual', price: 204900, oldPrice: 240000, url: '/products/relax-vision-venturi-gafas-con-filtro-azul-uv-400-y-tecnologia-antirreflejo-world-tv', keywords: 'gafas lentes relax vision venturi' },
      { id: 'outlet-power-belt', title: 'Cinturilla Reductora Dama Power Belt', category: 'Outlet', price: 195041, oldPrice: 297800, url: '/products/cinturilla-reductora-dama-power-belt', keywords: 'faja cinturilla reductora dama power belt outlet' },
      { id: 'outlet-pantalon-dama', title: 'Hot Slim Dama - Pantalón Reductor Térmico', category: 'Outlet', price: 136731, oldPrice: 199800, url: '/products/hot-slim-dama-pantalon-reductor', keywords: 'pantalon reductor hot slim dama sauna outlet' },
      { id: 'outlet-camisilla-hombre', title: 'Hot Slim Hombre - Camisilla Reductora', category: 'Outlet', price: 136731, oldPrice: 199800, url: '/products/hot-slim-hombre-camisilla-reductora', keywords: 'camisilla reductora hombre hot slim outlet' },
      { id: 'outlet-cinturilla-sport', title: 'Cinturilla Sport Styliza Mujer', category: 'Outlet', price: 112336, oldPrice: 158800, url: '/products/cinturilla-sport-styliza-mujer', keywords: 'cinturilla sport styliza mujer faja outlet' },
      { id: 'outlet-pantalon-styliza', title: 'Pantalón Sauna Styliza', category: 'Outlet', price: 196231, oldPrice: 300000, url: '/products/pantalon-sauna-styliza', keywords: 'pantalon sauna styliza termico outlet' },
      { id: 'outlet-chaleco-hombre', title: 'Hombre Chaleco Sauna Térmico', category: 'Outlet', price: 196231, oldPrice: 299800, url: '/products/chaleco-hot-slim-sauna-hombre', keywords: 'chaleco sauna hombre reductor outlet' },
      { id: 'outlet-camisilla-dama', title: 'Hot Slim Dama Camisilla Reductora', category: 'Outlet', price: 136731, oldPrice: 199800, url: '/products/chaleco-slim-sauna-dama', keywords: 'camisilla reductora dama hot slim outlet' }
    ],

    handleSearchInput: function(inputEl) {
      if (!inputEl) return;
      var q = (inputEl.value || '').trim().toLowerCase();
      var formEl = inputEl.closest('.search-bar');
      if (!formEl) return;
      formEl.style.position = 'relative';
      formEl.style.zIndex = '900';

      var drop = formEl.querySelector('.wtv-search-dropdown');
      if (!drop) {
        drop = document.createElement('div');
        drop.className = 'wtv-search-dropdown';
        formEl.appendChild(drop);
      }

      if (q.length < 1) {
        drop.style.display = 'none';
        return;
      }

      var scored = [];
      this.catalogData.forEach(function(item) {
        var tLow = item.title.toLowerCase();
        var cLow = item.category.toLowerCase();
        var kLow = item.keywords.toLowerCase();
        var score = 0;

        if (tLow.indexOf(q) === 0) {
          score = 100;
        } else if (tLow.indexOf(' ' + q) !== -1) {
          score = 80;
        } else if (kLow.indexOf(q) === 0 || kLow.indexOf(' ' + q) !== -1) {
          score = 65;
        } else if (tLow.indexOf(q) !== -1) {
          score = 40;
        } else if (cLow.indexOf(q) !== -1 || kLow.indexOf(q) !== -1) {
          score = 20;
        }

        if (score > 0) {
          scored.push({ item: item, score: score });
        }
      });

      scored.sort(function(a, b) {
        return b.score - a.score;
      });

      var matches = scored.slice(0, 4).map(function(s) { return s.item; });

      if (matches.length === 0) {
        drop.innerHTML =
          '<div class="wtv-search-header">' +
            '<span>SIN RESULTADOS</span>' +
            '<button type="button" class="wtv-search-close" onclick="this.closest(\'.wtv-search-dropdown\').style.display=\'none\'">&times;</button>' +
          '</div>' +
          '<div class="wtv-search-empty">No encontramos "' + inputEl.value.replace(/</g, '&lt;') + '". Prueba con Melena, Cloruro, Inositol, Gafas o Sérum.</div>';
        drop.style.display = 'block';
        return;
      }

      drop.innerHTML =
        '<div class="wtv-search-header">' +
          '<span>PRODUCTOS SUGERIDOS (' + matches.length + ')</span>' +
          '<button type="button" class="wtv-search-close" onclick="this.closest(\'.wtv-search-dropdown\').style.display=\'none\'">Cerrar</button>' +
        '</div>' +
        matches.map(function(m) {
          var safeTitle = m.title.replace(/'/g, "\\'");
          return (
            '<div class="wtv-search-item">' +
              '<div class="wtv-search-info" onclick="window.location.href=\'' + m.url + '\'">' +
                '<span class="wtv-search-cat">' + m.category + '</span>' +
                '<strong>' + m.title + '</strong>' +
                '<span class="wtv-search-price">' + formatMoney(m.price) + ' COP</span>' +
              '</div>' +
              '<div class="wtv-search-actions">' +
                '<button type="button" class="wtv-s-view" onclick="window.location.href=\'' + m.url + '\'">Ver</button>' +
                '<button type="button" class="wtv-s-add" onclick="event.stopPropagation(); WTVCart.addItem({ id: \'' + m.id + '\', title: \'' + safeTitle + '\', packTitle: \'Una Unidad\', price: ' + m.price + ', oldPrice: ' + m.oldPrice + ' }, true);">+ Carrito</button>' +
              '</div>' +
            '</div>'
          );
        }).join('');
      drop.style.display = 'block';
    },

    handleSearchSubmit: function(e, formEl) {
      var inp = formEl ? formEl.querySelector('input') : null;
      var q = inp ? inp.value.trim() : '';
      if (!q) {
        if (e) e.preventDefault();
        if (inp) inp.focus();
        showToast('Escribe el nombre del producto que deseas buscar');
        return false;
      }
      // Si estamos en archivo estático .html, mostrar el desplegable de resultados sin recargar a 404
      if (window.location.pathname.endsWith('.html')) {
        if (e) e.preventDefault();
        this.handleSearchInput(inp);
        return false;
      }
      return true;
    },

    submitNewsletter: function(e, formOrBtn) {
      if (e) e.preventDefault();
      var container = formOrBtn ? (formOrBtn.closest('.footer-newsletter, .footer-col') || formOrBtn.parentElement) : document.querySelector('.footer-newsletter');
      var emailInput = container ? container.querySelector('input[type="email"]') : null;
      var emailVal = emailInput ? emailInput.value.trim() : '';
      if (!emailVal || emailVal.indexOf('@') === -1) {
        showToast('Por favor ingresa un correo electrónico válido');
        if (emailInput) emailInput.focus();
        return false;
      }
      if (emailInput) emailInput.value = '';
      var msg = container.querySelector('.wtv-newsletter-ok');
      if (!msg) {
        msg = document.createElement('div');
        msg.className = 'wtv-newsletter-ok';
        msg.style.cssText = 'margin-top:10px; padding:10px 12px; background:#ECFDF5; border:1px solid #86EFAC; border-radius:8px; color:#15803D; font-size:12px; font-weight:700;';
        container.appendChild(msg);
      }
      msg.textContent = '¡Suscripción exitosa! Recibirás nuestras ofertas exclusivas en ' + emailVal;
      showToast('¡Gracias por suscribirte a World TV Colombia!');
      return false;
    },

    openInfoModal: function(topic) {
      var modal = document.getElementById('wtvInfoModal');
      var overlay = document.getElementById('wtvInfoModalOverlay');
      if (!modal) {
        overlay = document.createElement('div');
        overlay.id = 'wtvInfoModalOverlay';
        overlay.className = 'checkout-modal-overlay';
        overlay.onclick = function() { WTVCart.closeInfoModal(); };

        modal = document.createElement('div');
        modal.id = 'wtvInfoModal';
        modal.className = 'checkout-modal-container wtv-info-modal';
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
      }

      var contentMap = {
        shipping: {
          title: 'TÉRMINOS Y CONDICIONES DE ENVÍO',
          body:
            '<h4>Cobertura Nacional en Toda Colombia</h4>' +
            '<p>En <strong>World TV Colombia</strong> realizamos despachos diarios a todos los departamentos y municipios del país a través de transportadoras aliadas certificadas (Coordinadora, Interrapidísimo, Envía y Servientrega).</p>' +
            '<ul>' +
              '<li><strong>Tiempo de entrega:</strong> Entre 24 y 48 horas hábiles en ciudades principales (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga, Eje Cafetero) y de 2 a 4 días hábiles en el resto del país.</li>' +
              '<li><strong>Envío Gratis:</strong> Incluido en todos nuestros kits, paquetes ahorradores y pedidos contraentrega o en línea.</li>' +
              '<li><strong>Modalidades de Pago:</strong> Puedes pagar ahora en línea (Tarjeta, PSE, Nequi) o solicitar <strong>Pago Contraentrega</strong> para pagar únicamente al recibir en tu puerta.</li>' +
            '</ul>'
        },
        returns: {
          title: 'POLÍTICA DE DEVOLUCIONES, GARANTÍA Y RETRACTO',
          body:
            '<h4>Compra 100% Protegida (Ley 1480 — Estatuto del Consumidor)</h4>' +
            '<p>Tu satisfacción y tranquilidad son nuestra prioridad. Todos los productos de World TV Colombia cuentan con garantía directa:</p>' +
            '<ul>' +
              '<li><strong>Derecho de Retracto:</strong> Cuentas con cinco (5) días hábiles a partir de la entrega del producto para ejercer tu derecho de retracto manteniendo el sello de seguridad intacto.</li>' +
              '<li><strong>Cambio por Avería en Transporte:</strong> Si tu pedido llega con alguna novedad en el envase o empaque, te enviamos una reposición nueva sin costo adicional.</li>' +
              '<li><strong>Canales de Atención Inmediata:</strong> Escríbenos a <strong>worldtvcolombia@gmail.com</strong> o llámanos al <strong>(57) 3500010</strong>.</li>' +
            '</ul>'
        },
        quality: {
          title: 'CALIDAD CERTIFICADA E INGREDIENTES WORLD TV',
          body:
            '<h4>Fórmulas Funcionales con Respaldo Sanitario</h4>' +
            '<p>Cada suplemento, bebida funcional y producto de bienestar de <strong>World TV Colombia</strong> es elaborado bajo estrictas Buenas Prácticas de Manufactura (GMP) y cuenta con su respectivo Registro Sanitario INVIMA vigente.</p>' +
            '<ul>' +
              '<li><strong>Materias Primas Seleccionadas:</strong> Extractos puros de Melena de León, Ganoderma, Shiitake, Resveratrol, Inositol, Colágeno Marino y Cloruro de Magnesio.</li>' +
              '<li><strong>0% Azúcares Añadidos:</strong> Nuestras fórmulas nutricionales están diseñadas para cuidar tu metabolismo diario sin calorías vacías.</li>' +
              '<li><strong>Fabricación Colombiana de Alta Pureza:</strong> Control de calidad en cada lote para garantizar frescura, sabor y biodisponibilidad.</li>' +
            '</ul>'
        },
        privacy: {
          title: 'POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES',
          body:
            '<h4>Cumplimiento de la Ley 1581 de 2012 (Habeas Data Colombia)</h4>' +
            '<p><strong>World TV Colombia</strong> garantiza la confidencialidad, seguridad y protección de los datos personales que nos suministras al realizar tus pedidos en línea o contraentrega.</p>' +
            '<ul>' +
              '<li><strong>Uso exclusivo logístico y comercial:</strong> Tus datos de nombre, teléfono, dirección y correo se utilizan únicamente para despachar tu pedido, enviarte tu número de guía y brindarte soporte posventa.</li>' +
              '<li><strong>Cero divulgación a terceros no autorizados:</strong> Solo compartimos los datos de entrega con la transportadora encargada de llevar el paquete a tu residencia.</li>' +
              '<li><strong>Derechos del Titular:</strong> Puedes actualizar, rectificar o solicitar la supresión de tus datos en cualquier momento escribiendo a <strong>worldtvcolombia@gmail.com</strong>.</li>' +
            '</ul>'
        },
        contact: {
          title: 'CONTÁCTENOS — ATENCIÓN AL CLIENTE WORLD TV',
          body:
            '<h4>Estamos listos para asesorarte en tu pedido</h4>' +
            '<p>Comunícate con nuestro equipo en Medellín o déjanos tu mensaje aquí mismo:</p>' +
            '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px,1fr)); gap:10px; margin:14px 0;">' +
              '<div style="background:#F8FAFC; padding:12px; border-radius:8px; border:1px solid #E2E8F0;"><strong>Línea de Atención:</strong><br><a href="tel:+573500010" style="color:var(--brand-red); font-weight:700;">(57) 3500010</a></div>' +
              '<div style="background:#F8FAFC; padding:12px; border-radius:8px; border:1px solid #E2E8F0;"><strong>Correo Oficial:</strong><br><a href="mailto:worldtvcolombia@gmail.com" style="color:var(--brand-red); font-weight:700;">worldtvcolombia@gmail.com</a></div>' +
              '<div style="background:#F8FAFC; padding:12px; border-radius:8px; border:1px solid #E2E8F0;"><strong>Sede Principal:</strong><br>Medellín, Antioquia, Colombia</div>' +
            '</div>' +
            '<form onsubmit="return WTVCart.submitContactForm(event, this);" style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">' +
              '<div class="form-row">' +
                '<div class="form-group"><label>Tu Nombre *</label><input type="text" required placeholder="Nombre completo" style="padding:9px 11px; border:1px solid #ddd; border-radius:6px; width:100%;"></div>' +
                '<div class="form-group"><label>Tu Teléfono / WhatsApp *</label><input type="tel" required placeholder="Ej: 300 123 4567" style="padding:9px 11px; border:1px solid #ddd; border-radius:6px; width:100%;"></div>' +
              '</div>' +
              '<div class="form-group"><label>¿En qué podemos ayudarte? *</label><textarea required rows="3" placeholder="Escribe tu consulta o solicitud..." style="padding:9px 11px; border:1px solid #ddd; border-radius:6px; width:100%; font-family:inherit;"></textarea></div>' +
              '<button type="submit" class="btn-checkout-submit" style="margin-top:4px;">ENVIAR MENSAJE A WORLD TV</button>' +
            '</form>'
        }
      };

      var info = contentMap[topic] || contentMap.shipping;
      modal.innerHTML =
        '<div class="checkout-modal-header">' +
          '<h2>' + info.title + '</h2>' +
          '<button class="checkout-close-btn" type="button" onclick="WTVCart.closeInfoModal()">&times;</button>' +
        '</div>' +
        '<div class="wtv-info-modal-body">' +
          info.body +
          (topic !== 'contact' ? '<div style="margin-top:20px; text-align:right;"><button type="button" class="btn-primary" style="border:none; cursor:pointer;" onclick="WTVCart.closeInfoModal()">ENTENDIDO</button></div>' : '') +
        '</div>';

      overlay.classList.add('active');
      modal.classList.add('active');
    },

    closeInfoModal: function() {
      var modal = document.getElementById('wtvInfoModal');
      var overlay = document.getElementById('wtvInfoModalOverlay');
      if (modal) modal.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
    },

    submitContactForm: function(e, formEl) {
      if (e) e.preventDefault();
      showToast('¡Mensaje recibido! Un asesor de World TV te contactará pronto.');
      this.closeInfoModal();
      return false;
    },

    sortCollectionGrid: function(selectEl) {
      if (!selectEl) return;
      var val = (selectEl.value || '').toLowerCase();
      var section = selectEl.closest('section');
      var grid = section && section.nextElementSibling ? section.nextElementSibling.querySelector('.products-grid') : document.querySelector('.products-grid');
      if (!grid) grid = document.querySelector('.products-grid');
      if (!grid) return;

      var cards = Array.prototype.slice.call(grid.querySelectorAll('.product-card'));
      if (cards.length < 2) return;

      cards.forEach(function(c, idx) {
        if (!c.hasAttribute('data-orig-index')) {
          c.setAttribute('data-orig-index', String(idx));
        }
      });

      cards.sort(function(a, b) {
        var paEl = a.querySelector('.new-p, .product-price');
        var pbEl = b.querySelector('.new-p, .product-price');
        var pa = parsePrice(paEl ? paEl.textContent : '0');
        var pb = parsePrice(pbEl ? pbEl.textContent : '0');
        if (val.indexOf('menor a mayor') !== -1 || val.indexOf('ascending') !== -1) {
          return pa - pb;
        }
        if (val.indexOf('mayor a menor') !== -1 || val.indexOf('descending') !== -1) {
          return pb - pa;
        }
        return Number(a.getAttribute('data-orig-index')) - Number(b.getAttribute('data-orig-index'));
      });

      cards.forEach(function(c) {
        grid.appendChild(c);
      });
      showToast('Productos ordenados por: ' + selectEl.options[selectEl.selectedIndex].text);
    },

    render: renderCart
  };

  // Delegación automática en fase de captura para garantizar que todos los botones de producto,
  // kits, tarjetas y barra inferior sumen al carrito correctamente en cualquier página
  document.addEventListener('click', function(e) {
    // A. Botón "Agregar al carrito" en página de producto (.btn-add-cart)
    var addMainBtn = e.target.closest('.btn-add-cart');
    if (addMainBtn && !(addMainBtn.getAttribute('onclick') || '').includes('WTVCart')) {
      e.preventDefault();
      e.stopPropagation();
      window.WTVCart.addSelectedProductFromPage(false);
      return;
    }

    // B. Botón "COMPRA AHORA" dentro de la ficha de producto (.product-info-card .cart-checkout-btn)
    var buyNowMainBtn = e.target.closest('.product-info-card .cart-checkout-btn');
    if (buyNowMainBtn && !(buyNowMainBtn.getAttribute('onclick') || '').includes('WTVCart')) {
      e.preventDefault();
      e.stopPropagation();
      window.WTVCart.addSelectedProductFromPage(true);
      return;
    }

    // C. Botón "AÑADIR AL CARRITO" en la barra flotante inferior (.btn-sticky-buy)
    var stickyBtn = e.target.closest('.btn-sticky-buy');
    if (stickyBtn && !(stickyBtn.getAttribute('onclick') || '').includes('WTVCart')) {
      e.preventDefault();
      e.stopPropagation();
      window.WTVCart.addSelectedProductFromPage(false, window.WTVCart.getStickyQty());
      return;
    }

    // D. Botones - y + del selector de cantidad en la barra flotante (.qty-selector-sticky button)
    var stickyQtyBtn = e.target.closest('.qty-selector-sticky button');
    if (stickyQtyBtn && !(stickyQtyBtn.getAttribute('onclick') || '').includes('WTVCart')) {
      e.preventDefault();
      e.stopPropagation();
      var txt = stickyQtyBtn.textContent.trim();
      window.WTVCart.changeStickyQty(txt === '+' ? 1 : -1);
      return;
    }

    // E. Botones "Añadir +" o "Añadir" en tarjetas de producto (.product-card) y upsells (.upsell-card)
    var addCardBtn = e.target.closest('.product-card .add-btn, .product-card .btn-beauty-add, .upsell-card .upsell-add');
    if (addCardBtn && !(addCardBtn.getAttribute('onclick') || '').includes('WTVCart')) {
      var btnLabel = addCardBtn.textContent.trim().toLowerCase();
      // Si el botón dice "añadir" o "+", sumarlo directamente al carrito
      if (btnLabel.includes('añadir') || btnLabel.includes('agregar') || btnLabel.includes('+')) {
        e.preventDefault();
        e.stopPropagation();
        var card = addCardBtn.closest('.product-card, .upsell-card');
        if (card) {
          var titleEl = card.querySelector('.product-title, .upsell-name, h3');
          var priceEl = card.querySelector('.product-price, .new-p, .upsell-price');
          var oldEl = card.querySelector('.old-p, del');
          var imgEl = card.querySelector('img');
          var title = titleEl ? titleEl.textContent.trim() : 'Producto World TV';
          var price = parsePrice(priceEl ? priceEl.textContent : '0');
          var oldPrice = parsePrice(oldEl ? oldEl.textContent : '0');
          var img = imgEl ? imgEl.src : '';
          window.WTVCart.addItem({
            title: title,
            packTitle: 'Una Unidad',
            price: price,
            oldPrice: oldPrice,
            image: img,
            qty: 1
          }, true);
        }
        return;
      }
    }

    // F. Selección de tarjeta de Kit (.kit-card) o clic en su botón (.kit-card .btn-primary)
    var kitBtn = e.target.closest('.kit-card .btn-primary');
    if (kitBtn && !(kitBtn.getAttribute('onclick') || '').includes('WTVCart')) {
      e.preventDefault();
      e.stopPropagation();
      var kitCard = kitBtn.closest('.kit-card');
      if (kitCard) {
        if (!kitCard.id) kitCard.id = 'kitCardAuto_' + Math.random().toString(36).slice(2, 6);
        window.WTVCart.highlightKitCard(kitCard.id);
        var kTitleEl = kitCard.querySelector('h3');
        var kPriceEl = kitCard.querySelector('.kit-price');
        var kDelEl = kitCard.querySelector('.kit-price del');
        var kImgEl = kitCard.querySelector('img');
        var rawPriceText = kPriceEl ? kPriceEl.textContent.replace(kDelEl ? kDelEl.textContent : '', '') : '0';
        window.WTVCart.addItem({
          title: kTitleEl ? kTitleEl.textContent.trim() : 'Kit Ahorro World TV',
          packTitle: 'Combo Ahorro Completo',
          price: parsePrice(rawPriceText),
          oldPrice: parsePrice(kDelEl ? kDelEl.textContent : '0'),
          image: kImgEl ? kImgEl.src : '',
          qty: 1
        }, true);
      }
      return;
    }

    var clickedKitCard = e.target.closest('.kit-card');
    if (clickedKitCard && !e.target.closest('.btn-primary')) {
      if (!clickedKitCard.id) clickedKitCard.id = 'kitCardAuto_' + Math.random().toString(36).slice(2, 6);
      window.WTVCart.highlightKitCard(clickedKitCard.id);
    }

    // G. Enlaces del Footer (Políticas, Calidad, Contacto) y botón SUSCRIBIRME
    var footerLink = e.target.closest('.site-footer a');
    if (footerLink) {
      var lText = (footerLink.textContent || '').trim().toLowerCase();
      var hrefVal = footerLink.getAttribute('href') || '';
      if (lText.includes('suscribir')) {
        e.preventDefault();
        e.stopPropagation();
        window.WTVCart.submitNewsletter(e, footerLink);
        return;
      }
      if (lText.includes('envío') || lText.includes('envio')) {
        e.preventDefault();
        e.stopPropagation();
        window.WTVCart.openInfoModal('shipping');
        return;
      }
      if (lText.includes('devoluciones') || lText.includes('retracto')) {
        e.preventDefault();
        e.stopPropagation();
        window.WTVCart.openInfoModal('returns');
        return;
      }
      if (lText.includes('calidad')) {
        e.preventDefault();
        e.stopPropagation();
        window.WTVCart.openInfoModal('quality');
        return;
      }
      if (lText.includes('tratamiento de datos') || lText.includes('privacidad')) {
        e.preventDefault();
        e.stopPropagation();
        window.WTVCart.openInfoModal('privacy');
        return;
      }
      if (lText.includes('contáctenos') || lText.includes('contactenos') || lText.includes('contacto')) {
        e.preventDefault();
        e.stopPropagation();
        window.WTVCart.openInfoModal('contact');
        return;
      }
      if (footerLink.classList.contains('footer-logo-link') && hrefVal === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // H. Botón "COMPRAR MELENA DE LEÓN" en el Hero cuando tiene href="#"
    var heroPrimary = e.target.closest('.hero-ctas .btn-primary');
    if (heroPrimary && (heroPrimary.getAttribute('href') === '#')) {
      e.preventDefault();
      if (window.location.pathname.endsWith('.html')) {
        window.location.href = './productos_pages/melena.html';
      } else {
        window.location.href = '/products/melena-de-leon-en-polvo-formula-unica-sabor-a-capuchino';
      }
      return;
    }

    // I. Clic en el icono de lupa dentro de .search-bar
    var searchSvg = e.target.closest('.search-bar svg');
    if (searchSvg && !e.target.closest('button')) {
      var sForm = searchSvg.closest('.search-bar');
      if (sForm) {
        window.WTVCart.handleSearchSubmit(e, sForm);
      }
    }

    // Cerrar desplegable de búsqueda al hacer clic fuera de .search-bar
    if (!e.target.closest('.search-bar')) {
      document.querySelectorAll('.wtv-search-dropdown').forEach(function(d) {
        d.style.display = 'none';
      });
    }
  }, true);

  // Escuchar escritura en cualquier barra de búsqueda y cambios en selectores de filtro
  document.addEventListener('input', function(e) {
    if (e.target && e.target.matches('.search-bar input')) {
      window.WTVCart.handleSearchInput(e.target);
    }
  });

  document.addEventListener('change', function(e) {
    if (e.target && e.target.matches('.filter-select')) {
      window.WTVCart.sortCollectionGrid(e.target);
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    // Marcar el body cuando la barra inferior fija de compra está presente
    if (document.querySelector('.sticky-buy-bar')) {
      document.body.classList.add('has-sticky-bar');
    }

    renderCart();
  });
})();

// ============================================================================
// FUNCIONES DE UI Y NAVEGACIÓN (COMPATIBLES CON TODAS LAS PÁGINAS)
// ============================================================================

// Cambiar la foto principal al hacer clic en las miniaturas de la izquierda
function changeImage(element, imageUrl) {
  document.querySelectorAll('.thumb-item').forEach(function(el) { el.classList.remove('active'); });
  if (element) element.classList.add('active');
  var mainImg = document.getElementById('mainProductImg');
  if (mainImg && imageUrl) mainImg.src = imageUrl;
}

// Seleccionar paquetes (Lleva 1 / Una Unidad, Lleva 2 / Paquete x 2, Lleva 3 / Paquete x 3)
function selectPackage(element, oldPrice, currentPrice) {
  document.querySelectorAll('.pack-option').forEach(function(el) { el.classList.remove('active'); });
  if (element) element.classList.add('active');

  var oldPriceElem = document.querySelector('.old-price');
  var currentPriceElem = document.querySelector('.current-price');
  var savePillElem = document.querySelector('.save-pill');
  var stickyPriceElem = document.querySelector('.sticky-price');

  var curNum = window.WTVCart ? window.WTVCart.parsePrice(currentPrice) : 0;
  var oldNum = window.WTVCart ? window.WTVCart.parsePrice(oldPrice) : 0;

  if (oldPriceElem) {
    if (oldNum > curNum) {
      oldPriceElem.innerText = window.WTVCart.formatMoney(oldNum);
      oldPriceElem.style.display = 'inline';
    } else {
      oldPriceElem.style.display = 'none';
    }
  }
  if (currentPriceElem) {
    currentPriceElem.innerHTML = window.WTVCart.formatMoney(curNum) + ' <small>COP</small>';
  }
  if (savePillElem) {
    if (oldNum > curNum) {
      savePillElem.innerText = 'Ahorra ' + window.WTVCart.formatMoney(oldNum - curNum);
    } else {
      savePillElem.innerText = 'Envío Gratis';
    }
  }
  if (stickyPriceElem) {
    stickyPriceElem.innerHTML = window.WTVCart.formatMoney(curNum) + ' <small>COP</small>' +
      (oldNum > curNum ? ' <del>' + window.WTVCart.formatMoney(oldNum) + '</del>' : '');
  }

  // Cambiar también la imagen principal si el paquete tiene su propia imagen
  if (element) {
    var packImg = element.querySelector('img');
    var mainImg = document.getElementById('mainProductImg');
    if (packImg && mainImg && packImg.src) {
      mainImg.src = packImg.src;
    }
  }
}

// Lógica para cambiar las gafas en la colección Relax Vision del Home
document.querySelectorAll('.model-item').forEach(function(item) {
  item.addEventListener('click', function() {
    document.querySelectorAll('.model-item').forEach(function(i) { i.classList.remove('active'); });
    this.classList.add('active');

    var imgUrl = this.getAttribute('data-img');
    var title = this.getAttribute('data-title');
    var desc = this.getAttribute('data-desc');

    var mainVisionImg = document.getElementById('mainVisionImg');
    var mainVisionTitle = document.getElementById('mainVisionTitle');
    var mainVisionDesc = document.getElementById('mainVisionDesc');

    if (mainVisionImg) mainVisionImg.src = imgUrl;
    if (mainVisionTitle) mainVisionTitle.innerText = title;
    if (mainVisionDesc) mainVisionDesc.innerText = desc;
  });
});

// Abrir y cerrar el panel lateral del carrito
function toggleCart() {
  var drawer = document.getElementById('cartDrawer');
  var overlay = document.getElementById('cartOverlay');
  if (drawer && overlay) {
    drawer.classList.toggle('active');
    overlay.classList.toggle('active');
    if (window.WTVCart) window.WTVCart.render();
  }
}

// Abrir y cerrar el modal de checkout (Realiza tu pedido)
function toggleCheckoutModal() {
  var modal = document.getElementById('checkoutModal');
  var overlay = document.getElementById('checkoutModalOverlay');
  if (modal && overlay) {
    modal.classList.toggle('active');
    overlay.classList.toggle('active');
    if (window.WTVCart) window.WTVCart.render();
  }
}

// Seleccionar paquetes dentro del modal de checkout (fallback para páginas estáticas)
function selectCheckoutPackage(element, priceValue) {
  document.querySelectorAll('.chk-pkg-card').forEach(function(card) {
    card.classList.remove('active');
  });
  if (element) element.classList.add('active');

  var subtotalElem = document.getElementById('chkSubtotal');
  var totalElem = document.getElementById('chkTotal');
  if (subtotalElem) subtotalElem.innerText = priceValue;
  if (totalElem) totalElem.innerText = priceValue;
}

// Lógica del header inteligente y barra flotante inferior
(function() {
  var lastScrollTop = 0;
  window.addEventListener('scroll', function() {
    var headerWrapper = document.getElementById('headerWrapper');
    var stickyBuyBar = document.getElementById('stickyBuyBar');
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (headerWrapper) {
      if (scrollTop > lastScrollTop && scrollTop > 150) {
        headerWrapper.classList.add('header-hidden');
      } else {
        headerWrapper.classList.remove('header-hidden');
      }
    }

    if (stickyBuyBar) {
      var buyForm = document.getElementById('shopifyProductForm') || document.querySelector('.action-buttons') || document.querySelector('.product-actions');
      if (buyForm) {
        var rect = buyForm.getBoundingClientRect();
        if (rect.bottom < 80) {
          stickyBuyBar.classList.add('visible');
        } else {
          stickyBuyBar.classList.remove('visible');
        }
      } else {
        if (scrollTop > 380) {
          stickyBuyBar.classList.add('visible');
        } else {
          stickyBuyBar.classList.remove('visible');
        }
      }
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }, { passive: true });
})();

// Abrir y cerrar el menú de navegación en teléfonos
function toggleMobileMenu() {
  var navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.classList.toggle('active');
  }
}

// Abrir y cerrar la barra de búsqueda desplegable en móviles
function toggleSearchBox() {
  var searchBox = document.getElementById('expandableSearch');
  if (searchBox) {
    searchBox.classList.toggle('active');
    if (searchBox.classList.contains('active')) {
      var input = searchBox.querySelector('input');
      if (input) input.focus();
    }
  }
}

// Rotación automática del Hero Banner adaptada para móvil y escritorio
document.addEventListener('DOMContentLoaded', function() {
    // Marcar el body cuando la barra inferior fija de compra está presente
    if (document.querySelector('.sticky-buy-bar')) {
      document.body.classList.add('has-sticky-bar');
    }

  // --- ROTADOR DE SLIDES HERO BANNER (5 segundos con animación sincronizada) ---
  var heroSlider = document.getElementById('heroBannerSlider');
  if (heroSlider) {
    var heroSlides = heroSlider.querySelectorAll('.hero-slide');
    var heroDots = heroSlider.querySelectorAll('.hero-dot');
    var currentHeroSlide = 0;
    var totalHeroSlides = heroSlides.length;
    var heroSlideTimer = null;

    var updateHeroResponsiveBg = function() {
      var isMobile = window.innerWidth <= 768;
      heroSlides.forEach(function(slide) {
        var bgEl = slide.querySelector('.hero-slide-bg');
        if (bgEl) {
          var dBg = bgEl.getAttribute('data-desktop-bg');
          var mBg = bgEl.getAttribute('data-mobile-bg');
          if (isMobile && mBg) {
            bgEl.style.backgroundImage = "url('" + mBg + "')";
          } else if (!isMobile && dBg) {
            bgEl.style.backgroundImage = "url('" + dBg + "')";
          }
        }
      });
    };
    updateHeroResponsiveBg();
    window.addEventListener('resize', updateHeroResponsiveBg);

    var goToHeroSlide = function(index) {
      if (index === currentHeroSlide && heroSlides[currentHeroSlide].classList.contains('active')) return;
      heroSlides[currentHeroSlide].classList.remove('active');
      if (heroDots[currentHeroSlide]) heroDots[currentHeroSlide].classList.remove('active');

      currentHeroSlide = (index + totalHeroSlides) % totalHeroSlides;

      heroSlides[currentHeroSlide].classList.add('active');
      if (heroDots[currentHeroSlide]) heroDots[currentHeroSlide].classList.add('active');
    };

    var nextHeroSlide = function() {
      goToHeroSlide(currentHeroSlide + 1);
    };

    var prevHeroSlide = function() {
      goToHeroSlide(currentHeroSlide - 1);
    };

    var startHeroAutoplay = function() {
      if (heroSlideTimer) clearInterval(heroSlideTimer);
      heroSlideTimer = setInterval(nextHeroSlide, 5000);
    };

    var stopHeroAutoplay = function() {
      if (heroSlideTimer) clearInterval(heroSlideTimer);
    };

    heroSlider.addEventListener('mouseenter', stopHeroAutoplay);
    heroSlider.addEventListener('mouseleave', startHeroAutoplay);
    heroSlider.addEventListener('touchstart', stopHeroAutoplay, { passive: true });
    heroSlider.addEventListener('touchend', startHeroAutoplay, { passive: true });

    heroDots.forEach(function(dot) {
      dot.addEventListener('click', function(e) {
        e.preventDefault();
        var targetIndex = parseInt(this.getAttribute('data-slide'), 10);
        goToHeroSlide(targetIndex);
        startHeroAutoplay();
      });
    });

    var heroPrevArrow = heroSlider.querySelector('.hero-arrow-prev');
    var heroNextArrow = heroSlider.querySelector('.hero-arrow-next');
    if (heroPrevArrow) {
      heroPrevArrow.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        prevHeroSlide();
        startHeroAutoplay();
      });
    }
    if (heroNextArrow) {
      heroNextArrow.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        nextHeroSlide();
        startHeroAutoplay();
      });
    }

    var touchStartX = 0;
    heroSlider.addEventListener('touchstart', function(e) {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].screenX;
      }
    }, { passive: true });

    heroSlider.addEventListener('touchend', function(e) {
      if (e.changedTouches && e.changedTouches[0]) {
        var touchEndX = e.changedTouches[0].screenX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) {
            nextHeroSlide();
          } else {
            prevHeroSlide();
          }
          startHeroAutoplay();
        }
      }
    }, { passive: true });

    startHeroAutoplay();
  } else {
    var heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      var desktopBg = heroSection.getAttribute('data-desktop-bg');
      var mobileBg = heroSection.getAttribute('data-mobile-bg');
      if (desktopBg || mobileBg) {
        var updateLegacyHeroBg = function() {
          var isMobile = window.innerWidth <= 768;
          if (isMobile && mobileBg) {
            heroSection.style.backgroundImage = "url('" + mobileBg + "')";
          } else if (!isMobile && desktopBg) {
            heroSection.style.backgroundImage = "url('" + desktopBg + "')";
          }
        };
        updateLegacyHeroBg();
        window.addEventListener('resize', updateLegacyHeroBg);
      }
    }
  }

  // --- ROTADOR DE SLIDES BANNER OUTLET (5 segundos con animación fluida) ---
  var outletSlider = document.getElementById('outletBannerSlider');
  if (outletSlider) {
    var outletSlides = outletSlider.querySelectorAll('.outlet-slide');
    var outletDots = outletSlider.querySelectorAll('.outlet-dot');
    var currentOutletSlide = 0;
    var totalOutletSlides = outletSlides.length;
    var outletSlideTimer = null;

    var updateOutletResponsiveBg = function() {
      var isMobile = window.innerWidth <= 768;
      outletSlides.forEach(function(slide) {
        var bgEl = slide.querySelector('.outlet-slide-bg');
        if (bgEl) {
          var dBg = bgEl.getAttribute('data-desktop-bg');
          var mBg = bgEl.getAttribute('data-mobile-bg');
          if (isMobile && mBg) {
            bgEl.style.backgroundImage = "url('" + mBg + "')";
          } else if (!isMobile && dBg) {
            bgEl.style.backgroundImage = "url('" + dBg + "')";
          }
        }
      });
    };
    updateOutletResponsiveBg();
    window.addEventListener('resize', updateOutletResponsiveBg);

    var goToOutletSlide = function(index) {
      if (index === currentOutletSlide) return;
      outletSlides[currentOutletSlide].classList.remove('active');
      if (outletDots[currentOutletSlide]) outletDots[currentOutletSlide].classList.remove('active');

      currentOutletSlide = (index + totalOutletSlides) % totalOutletSlides;

      outletSlides[currentOutletSlide].classList.add('active');
      if (outletDots[currentOutletSlide]) outletDots[currentOutletSlide].classList.add('active');
    };

    var nextOutletSlide = function() {
      goToOutletSlide(currentOutletSlide + 1);
    };

    var startOutletAutoplay = function() {
      if (outletSlideTimer) clearInterval(outletSlideTimer);
      outletSlideTimer = setInterval(nextOutletSlide, 5000);
    };

    var stopOutletAutoplay = function() {
      if (outletSlideTimer) clearInterval(outletSlideTimer);
    };

    outletSlider.addEventListener('mouseenter', stopOutletAutoplay);
    outletSlider.addEventListener('mouseleave', startOutletAutoplay);
    outletSlider.addEventListener('touchstart', stopOutletAutoplay, { passive: true });
    outletSlider.addEventListener('touchend', startOutletAutoplay, { passive: true });

    outletDots.forEach(function(dot) {
      dot.addEventListener('click', function(e) {
        e.preventDefault();
        var targetIndex = parseInt(this.getAttribute('data-slide'), 10);
        goToOutletSlide(targetIndex);
        startOutletAutoplay();
      });
    });

    var prevArrow = outletSlider.querySelector('.outlet-arrow-prev');
    var nextArrow = outletSlider.querySelector('.outlet-arrow-next');
    if (prevArrow) {
      prevArrow.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        goToOutletSlide(currentOutletSlide - 1);
        startOutletAutoplay();
      });
    }
    if (nextArrow) {
      nextArrow.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        goToOutletSlide(currentOutletSlide + 1);
        startOutletAutoplay();
      });
    }

    // Soporte para gestos táctiles de deslizamiento (swipe) en móvil
    var touchStartX = 0;
    var touchEndX = 0;
    outletSlider.addEventListener('touchstart', function(e) {
      if (e.touches && e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
      }
    }, { passive: true });
    outletSlider.addEventListener('touchend', function(e) {
      if (e.changedTouches && e.changedTouches.length > 0) {
        touchEndX = e.changedTouches[0].clientX;
        var diffX = touchEndX - touchStartX;
        if (Math.abs(diffX) > 40) {
          if (diffX < 0) {
            nextOutletSlide();
          } else {
            goToOutletSlide(currentOutletSlide - 1);
          }
          startOutletAutoplay();
        }
      }
    }, { passive: true });

    startOutletAutoplay();
  }
});
