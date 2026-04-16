const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    // Is there a gradient on the parent container?
    const container = document.querySelector('.hobbies-carousel-container');
    if (container) {
      container.style.background = 'transparent';
      container.style.backgroundImage = 'none';
      container.style.backgroundColor = 'transparent';
    }
    
    const track = document.querySelector('.hobbies-carousel-track');
    if (track) {
      track.style.background = 'transparent';
      track.style.backgroundImage = 'none';
      track.style.backgroundColor = 'transparent';
    }
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_no_container_bg.png', fullPage: true });
  await browser.close();
})();