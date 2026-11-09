const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to live product and clicking checkout...');
  await page.goto('https://www.worldtv.com.co/products/cloruro-500-gr-formula-unica', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Get variant id
  const variantId = await page.evaluate(() => {
    const input = document.querySelector('input[name="id"]');
    return input ? input.value : null;
  });
  console.log('Variant ID on live store:', variantId);

  // Navigate to checkout directly via Shopify cart permalink
  // Format: /cart/VARIANT_ID:QTY
  const checkoutUrl = `https://www.worldtv.com.co/cart/${variantId}:1`;
  console.log('Navigating to cart permalink:', checkoutUrl);
  await page.goto(checkoutUrl, { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(2000);

  console.log('URL reached:', page.url());
  const title = await page.title();
  console.log('Page Title:', title);

  await page.screenshot({
    path: '/home/camper/.gemini/antigravity/brain/ed696706-93ca-4d5a-8306-c9119ddfef80/live_checkout_screenshot.png'
  });
  console.log('Saved live_checkout_screenshot.png');

  // Let's inspect the payment methods, gateways, and options present in checkout
  const checkoutInfo = await page.evaluate(() => {
    // Check if we are on Shopify checkout
    const bodyText = document.body.innerText;
    const paymentSections = Array.from(document.querySelectorAll('input[name*="payment"], [data-payment-subform], fieldset, [data-gateway-group], .section--payment-method, [id*="payment"]')).map(el => {
      return {
        tag: el.tagName,
        id: el.id,
        name: el.name,
        type: el.type,
        value: el.value,
        text: el.innerText ? el.innerText.trim().slice(0, 100) : ''
      };
    });

    const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]')).map(b => ({
      text: b.innerText || b.value,
      id: b.id,
      className: b.className
    }));

    return {
      url: window.location.href,
      paymentSections,
      buttons,
      hasShopifyCheckout: window.location.href.includes('/checkouts/'),
      pageHeading: document.querySelector('h1, h2') ? document.querySelector('h1, h2').innerText : ''
    };
  });

  console.log('Checkout Info:');
  console.dir(checkoutInfo, { depth: null });

  await browser.close();
})();
