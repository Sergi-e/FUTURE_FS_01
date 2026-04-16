const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    document.body.style.backgroundColor = '#000000';
    document.querySelector('.app-main').style.backgroundColor = '#000000';
    document.documentElement.style.backgroundColor = '#000000';
    
    // Also remove the "grainy" bg image just to check
    const grain = document.querySelector('.hero-grain');
    if (grain) grain.style.display = 'none';
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_forced_body.png', fullPage: true });
  await browser.close();
})();