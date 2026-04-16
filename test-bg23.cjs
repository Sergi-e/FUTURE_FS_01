const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    // Check if there is a box-shadow on the hobbies-carousel-container
    const cc = document.querySelector('.hobbies-carousel-container');
    if (cc) cc.style.boxShadow = 'none';
    
    // Check if there is a box-shadow on the hobby-card-img-wrapper
    const wrappers = document.querySelectorAll('.hobby-card-img-wrapper');
    for (let w of wrappers) {
      w.style.boxShadow = 'none';
    }
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_no_shadows.png', fullPage: true });
  await browser.close();
})();