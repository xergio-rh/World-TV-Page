const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  // Use the cart permalink
  const checkoutUrl = 'https://www.worldtv.com.co/cart/46782984323246:1';
  await page.goto(checkoutUrl, { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(2500);

  // Scroll down to Pago section
  await page.evaluate(() => {
    const pagoHeading = Array.from(document.querySelectorAll('h2, legend')).find(el => el.innerText.includes('Pago'));
    if (pagoHeading) pagoHeading.scrollIntoView();
  });
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: '/home/camper/.gemini/antigravity/brain/ed696706-93ca-4d5a-8306-c9119ddfef80/live_checkout_payment_section.png'
  });
  console.log('Saved live_checkout_payment_section.png');

  // Extract all text and radios in the payment section
  const paymentDetails = await page.evaluate(() => {
    const paymentForm = document.querySelector('[data-payment-subform], #payment, fieldset[id*="payment"]');
    const radios = Array.from(document.querySelectorAll('input[type="radio"]')).map(r => ({
      id: r.id,
      name: r.name,
      value: r.value,
      checked: r.checked,
      labels: Array.from(r.labels || []).map(l => l.innerText.trim())
    }));
    return {
      allText: document.body.innerText,
      radios
    };
  });

  console.log('Radios found:', paymentDetails.radios);

  await browser.close();
})();
