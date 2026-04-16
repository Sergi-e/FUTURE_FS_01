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
    
    // Hide the cards
    const cards = document.querySelectorAll('.hobby-card');
    for (let c of cards) {
      c.style.display = 'none';
    }
    
    // Hide the padding blocks
    const pads = document.querySelectorAll('.hobby-padding-block');
    for (let p of pads) {
      p.style.display = 'none';
    }
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_no_cards.png', fullPage: true });
  await browser.close();
})();