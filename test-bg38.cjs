const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    // Check for any box-shadows on the page
    const all = Array.from(document.querySelectorAll('*'));
    for (let el of all) {
      const comp = window.getComputedStyle(el);
      if (comp.boxShadow !== 'none') {
         el.style.boxShadow = 'none';
      }
      if (comp.backgroundImage !== 'none' && comp.backgroundImage.includes('gradient')) {
         el.style.backgroundImage = 'none';
      }
    }
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_no_shadows_gradients.png', fullPage: true });
  await browser.close();
})();