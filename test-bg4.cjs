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
    // Get all elements within the entire hobbies section
    const target = document.querySelector('.hobbies-innovative');
    
    // Check specific elements in the image
    let elems = Array.from(target.querySelectorAll('*'));
    let backgrounds = [];
    for (let node of elems) {
       const comp = window.getComputedStyle(node);
       if (comp.backgroundColor !== 'rgba(0, 0, 0, 0)' && comp.backgroundColor !== 'rgb(0, 0, 0)' && comp.backgroundColor !== 'transparent') {
           backgrounds.push({
               tag: node.tagName,
               class: typeof node.className === 'string' ? node.className : '',
               bg: comp.backgroundColor,
               bgImg: comp.backgroundImage,
           });
       }
    }
    
    return backgrounds;
  });

  console.dir(info);
  await browser.close();
})();