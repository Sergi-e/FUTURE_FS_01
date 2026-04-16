const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/#hobbies');
  await page.waitForTimeout(2000);
  
  // Element from point at the grey background
  const yOffsets = [200, 400, 600, 800];
  for (let y of yOffsets) {
      const bg = await page.evaluate((yOff) => {
          const el = document.elementFromPoint(window.innerWidth/2, yOff);
          return { y: yOff, tag: el?.tagName, className: el?.className, bgColor: el ? window.getComputedStyle(el).backgroundColor : null };
      }, y);
      console.log('Element at center y='+y+':', bg);
  }

  // Get all computed backgrounds
  const allBgs = await page.evaluate(() => {
    const els = document.querySelectorAll('.hobbies-innovative, .hobbies-innovative div');
    const result = [];
    els.forEach(el => {
       const bg = window.getComputedStyle(el).backgroundColor;
       if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
           result.push({className: el.className, bgColor: bg});
       }
    });
    return result;
  });
  console.log('Elements with colored bg:', allBgs);

  await browser.close();
})();
