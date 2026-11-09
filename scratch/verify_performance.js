const { chromium } = require('playwright');
const path = require('path');

const outDir = '/home/camper/.gemini/antigravity/brain/ed696706-93ca-4d5a-8306-c9119ddfef80';
const url = 'https://worldtvcolombia.myshopify.com/?preview_theme_id=189125656750';

async function testPerformance() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 1. Mobile Performance Test (Simulating mobile 4G / phone)
  console.log('Testing Mobile Performance (390x844)...');
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  let totalBytes = 0;
  let requestCount = 0;
  let failedRequests = 0;

  const pageMobile = await contextMobile.newPage();
  pageMobile.on('response', resp => {
    requestCount++;
    const headers = resp.headers();
    const len = headers['content-length'];
    if (len) totalBytes += parseInt(len, 10);
    if (!resp.ok() && resp.status() >= 400 && !resp.url().includes('favicon')) {
      failedRequests++;
      console.log(`Failed request: ${resp.status()} ${resp.url()}`);
    }
  });

  const startTime = Date.now();
  await pageMobile.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
  const domLoadedTime = Date.now() - startTime;
  await pageMobile.waitForTimeout(1500);
  const totalLoadTime = Date.now() - startTime;

  console.log(`Mobile DOM Content Loaded: ${domLoadedTime} ms`);
  console.log(`Mobile Total Time: ${totalLoadTime} ms`);
  console.log(`Requests: ${requestCount}, Total Transferred (approx): ${(totalBytes / (1024*1024)).toFixed(2)} MB`);
  console.log(`Failed requests: ${failedRequests}`);

  await pageMobile.screenshot({
    path: path.join(outDir, 'perf_mobile_home.png')
  });

  // Test SPA Navigation to Nutricion
  console.log('Navigating to Nutrición...');
  await pageMobile.evaluate(() => window.navigateToWorldTV('nutricion'));
  await pageMobile.waitForTimeout(800);
  await pageMobile.screenshot({
    path: path.join(outDir, 'perf_mobile_nutricion.png')
  });

  // Test SPA Navigation to Colasteel Product
  console.log('Navigating to Colasteel PDP...');
  await pageMobile.evaluate(() => window.navigateToWorldTV('colasteel'));
  await pageMobile.waitForTimeout(800);
  await pageMobile.screenshot({
    path: path.join(outDir, 'perf_mobile_colasteel.png')
  });

  // 2. Desktop Test
  console.log('\nTesting Desktop Performance (1440x900)...');
  const contextDesktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const pageDesktop = await contextDesktop.newPage();
  const dStart = Date.now();
  await pageDesktop.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
  const dDomTime = Date.now() - dStart;
  await pageDesktop.waitForTimeout(1000);

  console.log(`Desktop DOM Loaded: ${dDomTime} ms`);
  await pageDesktop.screenshot({
    path: path.join(outDir, 'perf_desktop_home.png')
  });

  await pageDesktop.evaluate(() => window.navigateToWorldTV('colasteel'));
  await pageDesktop.waitForTimeout(800);
  await pageDesktop.screenshot({
    path: path.join(outDir, 'perf_desktop_colasteel.png')
  });

  await browser.close();
  console.log('\nAll performance tests completed successfully!');
}

testPerformance().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
