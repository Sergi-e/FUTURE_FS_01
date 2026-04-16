const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    // Let's check if the background is coming from the pseudo-elements on the body
    const style = document.createElement('style');
    style.innerHTML = `
      * {
         background: transparent !important;
         background-color: transparent !important;
         background-image: none !important;
         box-shadow: none !important;
      }
      body {
         background-color: #000 !important;
      }
    `;
    document.head.appendChild(style);
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_all_transparent.png', fullPage: true });
  await browser.close();
})();