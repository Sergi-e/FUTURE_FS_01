const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    document.querySelector('.hobbies-innovative').style.backgroundColor = '#000000';
    document.querySelector('.books-section').style.backgroundColor = '#000000';
    document.querySelector('.hobbies-carousel-container').style.backgroundColor = '#000000';
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_forced.png', fullPage: true });
  await browser.close();
})();