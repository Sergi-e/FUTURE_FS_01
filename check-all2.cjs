const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  
  const elementData = await page.evaluate(() => {
    // Check all elements on the entire page just in case
    const all = Array.from(document.querySelectorAll('*'));
    return all.map(el => {
      const comp = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        className: typeof el.className === 'string' ? el.className : '',
        id: el.id,
        bg: comp.backgroundColor,
      }
    }).filter(data => 
      data.bg !== 'rgba(0, 0, 0, 0)' && 
      data.bg !== 'rgb(0, 0, 0)' &&
      data.bg !== 'transparent'
    );
  });
  
  console.dir(elementData, { depth: null });
  
  await browser.close();
})();