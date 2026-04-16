const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  const found = await page.evaluate(() => {
    // Check if the grey block is actually an element
    const all = Array.from(document.querySelectorAll('*'));
    let foundElems = [];
    for (let el of all) {
      const comp = window.getComputedStyle(el);
      if (comp.backgroundColor === 'rgb(26, 26, 26)' || comp.backgroundColor === 'rgb(17, 17, 17)' || comp.backgroundColor === 'rgb(34, 34, 34)' || comp.backgroundColor === 'rgb(10, 10, 10)' || comp.backgroundColor === 'rgb(12, 12, 12)' || comp.backgroundColor === 'rgb(14, 14, 14)' || comp.backgroundColor === 'rgb(20, 20, 20)') {
         foundElems.push({tag: el.tagName, class: el.className, bg: comp.backgroundColor});
         el.style.backgroundColor = '#000000';
      }
    }
    return foundElems;
  });
  console.log(found);

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_no_grey.png', fullPage: true });
  await browser.close();
})();