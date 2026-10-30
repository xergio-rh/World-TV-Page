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

    // Asegurar banner superior de Contraentrega en el Carrito
    var cartDrawer = document.getElementById('cartDrawer');
    var cartBodyEl = document.querySelector('#cartDrawer .cart-body');
    if (cartDrawer && cartBodyEl && !cartDrawer.querySelector('.cart-cod-top-banner')) {
      var codBanner = document.createElement('div');
      codBanner.className = 'cart-cod-top-banner';
      codBanner.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V9c0-.6.4-1 1-1h2m14 10h2c.6 0 1-.4 1-1v-4c0-.5-.2-1-.5-1.4l-3-4c-.3-.4-.8-.6-1.3-.6H15v6m-10 4h10m-10 0a2 2 0 1 0 4 0m6 0a2 2 0 1 0 4 0M7 8h8v6H7V8z"></path></svg><span><strong>PAGO CONTRAENTREGA ACTIVO:</strong> Pide hoy solo con tus datos y paga al recibir en casa.</span>';
      cartDrawer.insertBefore(codBanner, cartBodyEl);
    }

    // Asegurar que el botón de pagar en el carrito sea el Botón de Contraentrega
    var cartCheckoutBtn = document.querySelector('#cartDrawer .cart-footer .cart-checkout-btn');
    if (cartCheckoutBtn && !cartCheckoutBtn.classList.contains('btn-cod-main')) {
      cartCheckoutBtn.classList.add('btn-cod-main');
      cartCheckoutBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:6px;"><path d="M5 18H3c-.6 0-1-.4-1-1V9c0-.6.4-1 1-1h2m14 10h2c.6 0 1-.4 1-1v-4c0-.5-.2-1-.5-1.4l-3-4c-.3-.4-.8-.6-1.3-.6H15v6m-10 4h10m-10 0a2 2 0 1 0 4 0m6 0a2 2 0 1 0 4 0M7 8h8v6H7V8z"></path></svg><span>PEDIR CONTRAENTREGA (SOLO TUS DATOS)</span>';
      cartCheckoutBtn.setAttribute('onclick', 'WTVCart.proceedToCheckoutModal(event); return false;');
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
      chkSubmitBtn.textContent = 'CONFIRMAR PEDIDO CONTRAENTREGA';
      chkSubmitBtn.setAttribute('onclick', 'WTVCart.submitCheckoutForm(event)');
    }

    // Promocionar insignia "Pago Contraentrega" en todas las tarjetas de producto si no la tienen
    document.querySelectorAll('.product-card').forEach(function(card) {
      card.style.position = 'relative';
      if (!card.querySelector('.card-cod-badge')) {
        var b = document.createElement('span');
        b.className = 'card-cod-badge';
        b.textContent = 'Pago Contraentrega';
        card.appendChild(b);
      }
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
                  '<button type="button" class="item-remove" title="Eliminar producto" onclick="WTVCart.removeItem(\'' + safeId + '\')">✕</button>' +
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

    // Si el último producto agregado tiene opciones de paquetes (Lleva 1, Lleva 2, Lleva 3),
    // mostrarlas en el modal de checkout para que pueda cambiar de paquete en vivo
    var chkGrid = document.getElementById('chkPackagesGrid');
    var chkWrapper = document.getElementById('chkPackagesWrapper') || (chkGrid ? chkGrid.parentElement : null);
    if (chkGrid && items.length > 0) {
      var activeItem = items[items.length - 1];
      if (activeItem.packages && activeItem.packages.length > 1) {
        if (chkWrapper) chkWrapper.style.display = 'block';
        var pkgHtml = '';
        var safeItemId = String(activeItem.id).replace(/'/g, "\\'");
        activeItem.packages.forEach(function(pkg, idx) {
          var isSelected = (pkg.packTitle === activeItem.packTitle) || (Number(pkg.price) === Number(activeItem.price));
          var hasOld = pkg.oldPrice && Number(pkg.oldPrice) > Number(pkg.price);
          pkgHtml +=
            '<div class="chk-pkg-card ' + (isSelected ? 'active' : '') + '" onclick="WTVCart.switchItemPackage(\'' + safeItemId + '\', ' + idx + ')">' +
              (idx === 1 && activeItem.packages.length === 3 ? '<span class="badge-best-chk">MÁS VENDIDO</span>' : '') +
              '<span class="chk-title">' + pkg.packTitle + '</span>' +
              (pkg.image ? '<img src="' + pkg.image + '" alt="' + pkg.packTitle + '" width="80" height="80">' : '') +
              (hasOld ? '<del>' + formatMoney(pkg.oldPrice) + '</del>' : '') +
              '<strong>' + formatMoney(pkg.price) + '</strong>' +
            '</div>';
        });
        chkGrid.innerHTML = pkgHtml;
      } else if (chkWrapper) {
        chkWrapper.style.display = 'none';
      }
    }
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
        ribbon.textContent = 'KIT SELECCIONADO ✓';
        target.appendChild(ribbon);
      }
    },

    selectAndAddKit: function(cardId, kitData, openContraentrega) {
      if (cardId) {
        this.highlightKitCard(cardId);
      }
      this.addItem(kitData, !openContraentrega);
      if (openContraentrega) {
        closeCartDrawer();
        openCheckoutModal();
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

    addSelectedProductFromPage: function(goToCheckoutModal, customQty) {
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
      }
    },

    proceedToCheckoutModal: function(e) {
      if (e) e.preventDefault();
      var items = getItems();
      if (items.length === 0) {
        showToast('Agrega al menos un producto al carrito primero');
        return false;
      }
      closeCartDrawer();
      openCheckoutModal();
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
        // Hacer que el correo sea opcional en páginas estáticas también
        var emailInp = form.querySelector('input[type="email"]');
        if (emailInp) emailInp.removeAttribute('required');
        if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
          return false;
        }
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
      var itemsSummaryLines = [];
      items.forEach(function(it) {
        var line = (Number(it.price) || 0) * (Number(it.qty) || 1);
        subtotal += line;
        itemsSummaryLines.push(it.qty + 'x ' + it.title + ' (' + (it.packTitle || 'Unidad') + ') - ' + formatMoney(line));
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
            '<span class="cod-order-badge">ORDEN #' + orderCode + ' • PAGO CONTRAENTREGA</span>' +
            '<h3>¡Tu pedido contraentrega ha sido confirmado!</h3>' +
            '<p class="cod-success-lead">Hola <strong>' + firstName + ' ' + lastName + '</strong>, ya registramos tu pedido. <strong>No tienes que pagar nada ahora:</strong> pagas únicamente cuando el transportador te entregue en tu dirección.</p>' +
            '<div class="cod-summary-grid">' +
              '<div class="cod-summary-block">' +
                '<h5>DATOS DE ENTREGA</h5>' +
                '<p><strong>Cliente:</strong> ' + firstName + ' ' + lastName + '</p>' +
                '<p><strong>Teléfono:</strong> ' + phone + '</p>' +
                '<p><strong>Destino:</strong> ' + city + ', ' + province + '</p>' +
                '<p><strong>Dirección:</strong> ' + address1 + (address2 ? ' (' + address2 + ')' : '') + '</p>' +
              '</div>' +
              '<div class="cod-summary-block">' +
                '<h5>RESUMEN DEL PEDIDO</h5>' +
                '<ul class="cod-items-ul">' +
                  items.map(function(it) {
                    return '<li><span>' + it.qty + '× ' + it.title + ' <small>(' + (it.packTitle || 'Unidad') + ')</small></span><strong>' + formatMoney((Number(it.price) || 0) * (Number(it.qty) || 1)) + '</strong></li>';
                  }).join('') +
                '</ul>' +
                '<div class="cod-total-pay-row">' +
                  '<span>Total a pagar al recibir:</span>' +
                  '<strong>' + formatMoney(subtotal) + ' COP</strong>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="cod-success-actions">' +
              '<button type="button" class="btn-checkout-submit" onclick="WTVCart.finishCodOrder()">FINALIZAR Y SEGUIR COMPRANDO</button>' +
            '</div>' +
          '</div>';
      }

      showToast('¡Pedido Contraentrega #' + orderCode + ' confirmado!');
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
  }, true);

  document.addEventListener('DOMContentLoaded', function() {
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
      if (scrollTop > 450 && scrollTop < 2600) {
        stickyBuyBar.classList.add('visible');
      } else {
        stickyBuyBar.classList.remove('visible');
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

// Rotación automática del Hero Banner cada 2 segundos
document.addEventListener('DOMContentLoaded', function() {
  var heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    var slidesAttr = heroSection.getAttribute('data-slides');
    if (slidesAttr) {
      try {
        var slides = JSON.parse(slidesAttr);
        var currentIndex = 0;
        setInterval(function() {
          currentIndex = (currentIndex + 1) % slides.length;
          var imageUrl = slides[currentIndex];
          heroSection.style.backgroundImage = "linear-gradient(90deg, rgba(232,228,220,0.1) 40%, rgba(235,232,224,0.92) 60%), url('" + imageUrl + "')";
        }, 2000);
      } catch (e) {}
    }
  }
});
