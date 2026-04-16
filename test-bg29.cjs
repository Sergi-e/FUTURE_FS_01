const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    // Let's check the background of the image itself
    const images = document.querySelectorAll('.hobby-card-img');
    for (let img of images) {
       img.style.background = 'transparent';
       img.style.backgroundColor = 'transparent';
    }
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_no_image_bg.png', fullPage: true });
  await browser.close();
})();