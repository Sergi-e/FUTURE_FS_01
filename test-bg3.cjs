const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');

  // wait a bit for animation just in case
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);

  const info = await page.evaluate(() => {
    // Get all background colors in the hierarchy leading to .hobbies-innovative
    
    // Check specific elements in the image
    const readingListText = document.querySelector('.books-section-intro');
    let node = readingListText;
    let backgrounds = [];
    while (node && node !== document.body) {
       const comp = window.getComputedStyle(node);
       backgrounds.push({
           tag: node.tagName,
           className: typeof node.className === 'string' ? node.className : '',
           bg: comp.backgroundColor,
           bgImg: comp.backgroundImage,
       });
       node = node.parentElement;
    }
    
    return backgrounds;
  });

  console.dir(info);
  await browser.close();
})();