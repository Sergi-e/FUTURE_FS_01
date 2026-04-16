const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    // There is a dark-grey looking box that only appears on the Hobbies section 
    // It's possibly caused by a drop shadow, or gradient, or a pseudo element.
    // Let's hide the pseudo elements, shadows and gradients for hobbies
    
    const style = document.createElement('style');
    style.innerHTML = `
      .hobbies-innovative {
         background: #000 !important;
         box-shadow: none !important;
      }
      .hobbies-innovative::before,
      .hobbies-innovative::after {
         display: none !important;
      }
      .books-section {
         background: #000 !important;
      }
      .hobbies-carousel-container {
         background: #000 !important;
      }
    `;
    document.head.appendChild(style);
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_forced_pseudo.png', fullPage: true });
  await browser.close();
})();