const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    const toHide = ['.hero-section', '.ethos', '.skills', '.works', '.testimonials', '.contact'];
    toHide.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.style.display = 'none';
    });
    
    // The grey background is definitely coming from the Hobbies section itself!
    // Let's check if it's the section element itself.
    const hobbies = document.querySelector('.hobbies-innovative');
    if (hobbies) {
      hobbies.style.background = 'none';
      hobbies.style.backgroundColor = 'transparent';
    }
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_hobbies_transparent.png', fullPage: true });
  await browser.close();
})();