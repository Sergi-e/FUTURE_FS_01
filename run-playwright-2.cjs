const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/#hobbies');
  await page.waitForTimeout(2000);
  
  const allGreys = await page.evaluate(() => {
    const els = document.querySelectorAll('*');
    const result = [];
    els.forEach(el => {
       const style = window.getComputedStyle(el);
       const bg = style.backgroundColor;
       const backgroundImage = style.backgroundImage;
       const boxShadow = style.boxShadow;
       if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
           // We are looking for grey, e.g. rgb(17, 17, 17) up to rgb(50, 50, 50)
           const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
           if (match) {
               const r = parseInt(match[1]);
               const g = parseInt(match[2]);
               const b = parseInt(match[3]);
               if (r > 10 && r < 80 && Math.abs(r-g) < 10 && Math.abs(g-b) < 10) {
                   result.push({className: el.className, bgColor: bg, tag: el.tagName});
               }
           }
       }
       if (boxShadow && boxShadow !== 'none') {
           result.push({className: el.className, boxShadow: boxShadow, tag: el.tagName});
       }
       if (backgroundImage && backgroundImage !== 'none') {
           // Skip noise svg or simple gradients if possible, but let's log them to be sure
           if (backgroundImage.includes('gradient')) {
              result.push({className: el.className, bgImage: backgroundImage, tag: el.tagName});
           }
       }
    });
    return result;
  });
  console.log('Elements with grey bg or box-shadow or bg-image:', allGreys);

  await browser.close();
})();
