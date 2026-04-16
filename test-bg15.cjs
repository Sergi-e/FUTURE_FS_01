const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    // The grey background is still there. Let's hide the hobbies-carousel-container
    const carousel = document.querySelector('.hobbies-carousel-container');
    if (carousel) carousel.style.display = 'none';
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_no_carousel.png', fullPage: true });
  await browser.close();
})();