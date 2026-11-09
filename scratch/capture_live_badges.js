const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop
  const contextDesktop = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  const pageDesktop = await contextDesktop.newPage();
  
  const productUrl = 'https://www.worldtv.com.co/products/cloruro-de-magnesio-con-colageno-y-biotina';
  console.log('Navigating desktop to:', productUrl);
  await pageDesktop.goto(productUrl, { waitUntil: 'networkidle', timeout: 35000 });
  await pageDesktop.waitForTimeout(1000);

  const trustBarDesktop = await pageDesktop.$('.product-payment-trust-bar');
  if (trustBarDesktop) {
    await trustBarDesktop.scrollIntoViewIfNeeded();
    await pageDesktop.screenshot({
      path: '/home/camper/.gemini/antigravity/brain/ed696706-93ca-4d5a-8306-c9119ddfef80/live_desktop_context.png'
    });
    await trustBarDesktop.screenshot({
      path: '/home/camper/.gemini/antigravity/brain/ed696706-93ca-4d5a-8306-c9119ddfef80/live_desktop_crop.png'
    });
    console.log('Desktop screenshots saved!');
  } else {
    console.log('Trust bar not found on desktop!');
  }

  // 2. Mobile
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    isMobile: true
  });
  const pageMobile = await contextMobile.newPage();
  console.log('Navigating mobile to:', productUrl);
  await pageMobile.goto(productUrl, { waitUntil: 'networkidle', timeout: 35000 });
  await pageMobile.waitForTimeout(1000);

  const trustBarMobile = await pageMobile.$('.product-payment-trust-bar');
  if (trustBarMobile) {
    await trustBarMobile.scrollIntoViewIfNeeded();
    await pageMobile.screenshot({
      path: '/home/camper/.gemini/antigravity/brain/ed696706-93ca-4d5a-8306-c9119ddfef80/live_mobile_context.png'
    });
    await trustBarMobile.screenshot({
      path: '/home/camper/.gemini/antigravity/brain/ed696706-93ca-4d5a-8306-c9119ddfef80/live_mobile_crop.png'
    });
    console.log('Mobile screenshots saved!');
  } else {
    console.log('Trust bar not found on mobile!');
  }

  await browser.close();
})();
