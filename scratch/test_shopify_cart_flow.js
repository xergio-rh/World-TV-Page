const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Testing cart API on preview theme...');
  await page.goto('https://worldtvcolombia.myshopify.com/?preview_theme_id=189125656750', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Test adding an item via fetch('/cart/add.js')
  const addResult = await page.evaluate(async () => {
    try {
      // Clear cart first
      await fetch('/cart/clear.js', { method: 'POST' });
      // Add Cloruro variant
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: 46782984323246, quantity: 1 }]
        })
      });
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      return { error: e.message };
    }
  });

  console.log('Cart add result:', addResult);

  // Now navigate to /checkout
  console.log('Navigating to /checkout ...');
  await page.goto('https://worldtvcolombia.myshopify.com/checkout?preview_theme_id=189125656750', { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(2000);

  console.log('Final URL after /checkout:', page.url());
  const title = await page.title();
  console.log('Checkout Page Title:', title);

  await page.screenshot({
    path: '/home/camper/.gemini/antigravity/brain/ed696706-93ca-4d5a-8306-c9119ddfef80/preview_theme_real_checkout.png'
  });
  console.log('Saved preview_theme_real_checkout.png');

  await browser.close();
})();
