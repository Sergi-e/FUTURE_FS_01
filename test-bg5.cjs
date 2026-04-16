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
    return {
      hobbiesClasses: document.querySelector('#hobbies').className,
      hobbiesStyle: document.querySelector('#hobbies').getAttribute('style'),
      hobbiesBg: window.getComputedStyle(document.querySelector('#hobbies')).backgroundColor,
      
      booksClasses: document.querySelector('.books-section').className,
      booksStyle: document.querySelector('.books-section').getAttribute('style'),
      booksBg: window.getComputedStyle(document.querySelector('.books-section')).backgroundColor,
      
      carouselClasses: document.querySelector('.hobbies-carousel-container').className,
      carouselStyle: document.querySelector('.hobbies-carousel-container').getAttribute('style'),
      carouselBg: window.getComputedStyle(document.querySelector('.hobbies-carousel-container')).backgroundColor,
    };
  });

  console.dir(info);
  await browser.close();
})();