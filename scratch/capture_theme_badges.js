const { chromium } = require('playwright');
const path = require('path');

const outDir = '/home/camper/.gemini/antigravity/brain/ed696706-93ca-4d5a-8306-c9119ddfef80';
const url = 'https://worldtvcolombia.myshopify.com/products/colasteel?preview_theme_id=189125656750';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 1. Desktop Test (1440x900)
  {
    console.log('Testing Desktop 1440x900 on theme 189125656750...');
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      isMobile: false
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(1000);

    const trustBar = page.locator('.product-payment-trust-bar').first();
    await trustBar.waitFor({ state: 'visible', timeout: 15000 });
    await trustBar.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(outDir, 'live_official_desktop_context.png')
    });

    await trustBar.screenshot({
      path: path.join(outDir, 'live_official_desktop_crop.png')
    });
    console.log('Desktop screenshots saved!');
    await context.close();
  }

  // 2. Mobile Test (390x844)
  {
    console.log('Testing Mobile 390x844 on theme 189125656750...');
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(1000);

    const trustBar = page.locator('.product-payment-trust-bar').first();
    await trustBar.waitFor({ state: 'visible', timeout: 15000 });
    await trustBar.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(outDir, 'live_official_mobile_context.png')
    });

    await trustBar.screenshot({
      path: path.join(outDir, 'live_official_mobile_crop.png')
    });
    console.log('Mobile screenshots saved!');
    await context.close();
  }

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
