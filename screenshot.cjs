const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  
  // Wait a bit for animations
  await page.waitForTimeout(2000);
  
  // Scroll down to hobbies section
  await page.evaluate(() => {
    const el = document.getElementById('hobbies');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot.png', fullPage: true });
  await browser.close();
})();