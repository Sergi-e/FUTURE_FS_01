const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    // There might be a pseudo element or something on the body or app-main
    const style = document.createElement('style');
    style.innerHTML = `
      body::before, body::after, .app-main::before, .app-main::after, #root::before, #root::after {
         display: none !important;
      }
      .hobbies-innovative {
        background-color: #000000 !important;
      }
    `;
    document.head.appendChild(style);
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_no_pseudo_body.png', fullPage: true });
  await browser.close();
})();