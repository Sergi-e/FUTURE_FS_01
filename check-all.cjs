const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  
  const elementData = await page.evaluate(() => {
    const hobbiesSect = document.querySelector('.hobbies-innovative');
    
    // Find any element with a non-transparent background
    const all = Array.from(hobbiesSect.querySelectorAll('*'));
    return all.map(el => {
      const comp = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        className: typeof el.className === 'string' ? el.className : '',
        bg: comp.backgroundColor,
        bgImage: comp.backgroundImage,
        boxShadow: comp.boxShadow,
      }
    }).filter(data => 
      (data.bg !== 'rgba(0, 0, 0, 0)' && data.bg !== 'rgb(0, 0, 0)') || 
      (data.bgImage !== 'none' && data.bgImage !== '') ||
      (data.className && data.className.includes('watermark'))
    );
  });
  
  console.dir(elementData, { depth: null });
  
  await browser.close();
})();