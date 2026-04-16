const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    document.body.style.backgroundColor = '#000';
    document.documentElement.style.backgroundColor = '#000';
    const appMain = document.querySelector('.app-main');
    if (appMain) appMain.style.backgroundColor = '#000';
    
    const lenis = document.querySelector('.lenis');
    if (lenis) lenis.style.backgroundColor = '#000';
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_black_body.png', fullPage: true });
  await browser.close();
})();