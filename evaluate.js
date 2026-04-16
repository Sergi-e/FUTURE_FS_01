const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  
  const bg = await page.evaluate(() => {
    const el = document.querySelector('.hobbies-innovative');
    if (!el) return null;
    const comp = window.getComputedStyle(el);
    return comp.backgroundColor;
  });
  console.log('.hobbies-innovative bg:', bg);
  
  const books = await page.evaluate(() => {
    const el = document.querySelector('.books-section');
    if (!el) return null;
    const comp = window.getComputedStyle(el);
    return comp.backgroundColor;
  });
  console.log('.books-section bg:', books);

  const container = await page.evaluate(() => {
    const el = document.querySelector('.hobbies-carousel-container');
    if (!el) return null;
    const comp = window.getComputedStyle(el);
    return comp.backgroundColor;
  });
  console.log('.hobbies-carousel-container bg:', container);

  const body = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  console.log('body bg:', body);

  const allElements = await page.evaluate(() => {
    const section = document.querySelector('.hobbies-innovative');
    if (!section) return [];
    let elems = [];
    let cur = section;
    while(cur && cur !== document.body) {
      elems.push({
        tag: cur.tagName,
        class: cur.className,
        bg: window.getComputedStyle(cur).backgroundColor,
        bgImg: window.getComputedStyle(cur).backgroundImage,
        boxShadow: window.getComputedStyle(cur).boxShadow
      });
      cur = cur.parentElement;
    }
    return elems;
  });
  console.log('ancestors:', allElements);

  await browser.close();
})();