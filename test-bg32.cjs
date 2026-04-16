const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    // Hide the hero section, ethos section, skills section, works section, testimonials section
    // AND contact section
    const toHide = ['.hero-section', '.ethos', '.skills', '.works', '.testimonials', '.contact'];
    toHide.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        el.style.display = 'none';
      }
    });
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_only_hobbies_isolated.png', fullPage: true });
  await browser.close();
})();