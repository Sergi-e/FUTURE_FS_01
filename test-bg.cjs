const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');

  const info = await page.evaluate(() => {
    // Check if the section before hobbies has a gradient or something leaking
    const testSect = document.querySelector('#testimonials');
    const hobbiesSect = document.querySelector('#hobbies');
    
    return {
      testBg: window.getComputedStyle(testSect).backgroundColor,
      testBgImg: window.getComputedStyle(testSect).backgroundImage,
      hobbiesBg: window.getComputedStyle(hobbiesSect).backgroundColor,
      hobbiesBgImg: window.getComputedStyle(hobbiesSect).backgroundImage,
    }
  });

  console.dir(info);
  await browser.close();
})();