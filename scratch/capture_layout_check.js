const { chromium } = require('playwright');
const path = require('path');

const outDir = '/home/camper/.gemini/antigravity/brain/ed696706-93ca-4d5a-8306-c9119ddfef80';
const url = 'https://worldtvcolombia.myshopify.com/?preview_theme_id=189125656750';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 1. Desktop Test (1440x900)
  {
    console.log('Testing Desktop 1440x900...');
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(1000);

    // Navigate to Colasteel view
    await page.evaluate(() => window.navigateToWorldTV('colasteel'));
    await page.waitForTimeout(800);

    // Initial viewport screenshot (before any scrolling!)
    await page.screenshot({
      path: path.join(outDir, 'colasteel_desktop_above_fold.png')
    });
    console.log('Saved colasteel_desktop_above_fold.png');
    await context.close();
  }

  // 2. Mobile Test (390x844)
  {
    console.log('Testing Mobile 390x844...');
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.navigateToWorldTV('colasteel'));
    await page.waitForTimeout(800);

    await page.screenshot({
      path: path.join(outDir, 'colasteel_mobile_above_fold.png')
    });
    console.log('Saved colasteel_mobile_above_fold.png');
    await context.close();
  }

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
