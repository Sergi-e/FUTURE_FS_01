const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    // Hide ALL sections before Hobbies
    const allSecs = Array.from(document.querySelectorAll('section'));
    for (let sec of allSecs) {
       if (!sec.classList.contains('hobbies-innovative')) {
          sec.style.display = 'none';
       }
    }
    // Also remove any possible hero or other overlays
    const overlays = Array.from(document.querySelectorAll('div'));
    for (let div of overlays) {
       if (window.getComputedStyle(div).position === 'fixed') {
          div.style.display = 'none';
       }
    }
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_only_hobbies_literally.png', fullPage: true });
  await browser.close();
})();