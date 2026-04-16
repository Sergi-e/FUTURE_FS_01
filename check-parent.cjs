const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  
  const elementData = await page.evaluate(() => {
    const hobbiesSect = document.querySelector('.hobbies-innovative');
    if (!hobbiesSect) return [];
    
    let cur = hobbiesSect.parentElement;
    let ancestors = [];
    while (cur && cur !== document.body) {
      const comp = window.getComputedStyle(cur);
      ancestors.push({
        tag: cur.tagName,
        className: typeof cur.className === 'string' ? cur.className : '',
        bg: comp.backgroundColor,
        bgImage: comp.backgroundImage,
      });
      cur = cur.parentElement;
    }
    
    return ancestors;
  });
  
  console.dir(elementData, { depth: null });
  
  await browser.close();
})();