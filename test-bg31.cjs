const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    // There appears to be a gradient overlaying the whole page or section
    // Let's check for any element with a linear-gradient or radial-gradient
    const all = Array.from(document.querySelectorAll('*'));
    for (let el of all) {
      const comp = window.getComputedStyle(el);
      if (comp.backgroundImage.includes('gradient')) {
         el.style.backgroundImage = 'none';
      }
    }
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_no_gradients.png', fullPage: true });
  await browser.close();
})();