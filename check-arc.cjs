const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  
  const bgData = await page.evaluate(() => {
    return {
      arcBg: window.getComputedStyle(document.querySelector('.hobbies-arc')).backgroundColor,
      headerBg: window.getComputedStyle(document.querySelector('.hobbies-header-alt')).backgroundColor,
      containerBg: window.getComputedStyle(document.querySelector('.hobbies-carousel-container')).backgroundColor,
      sectionBg: window.getComputedStyle(document.querySelector('.hobbies-innovative')).backgroundColor,
      booksBg: window.getComputedStyle(document.querySelector('.books-section')).backgroundColor,
      marqueeBg: window.getComputedStyle(document.querySelector('.books-marquee-container')).backgroundColor
    };
  });
  
  console.log(bgData);
  
  await browser.close();
})();