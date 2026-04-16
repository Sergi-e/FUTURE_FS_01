const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    // Hide the arc
    const arc = document.querySelector('.hobbies-arc');
    if (arc) arc.style.display = 'none';
    
    // Hide the pseudo-elements and shadows
    const style = document.createElement('style');
    style.innerHTML = `
      .hobbies-innovative::before,
      .hobbies-innovative::after {
         display: none !important;
      }
      .hobby-card-img-wrapper {
         box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_no_arc_pseudo_shadow.png', fullPage: true });
  await browser.close();
})();