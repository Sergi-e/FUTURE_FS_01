const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    // Check if there are any pseudo-elements on .hobbies-innovative
    const style = document.createElement('style');
    style.innerHTML = `
      .hobbies-innovative::before,
      .hobbies-innovative::after {
         display: none !important;
         background: transparent !important;
      }
      .hobbies-innovative {
         background: transparent !important;
      }
    `;
    document.head.appendChild(style);
    
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
  
  await page.screenshot({ path: 'local_screenshot_hobbies_no_pseudo.png', fullPage: true });
  await browser.close();
})();