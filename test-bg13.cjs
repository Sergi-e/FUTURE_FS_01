const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    // Let's completely remove the hero section and ethos to see if they bleed down
    const hero = document.querySelector('.hero-section');
    if (hero) hero.style.display = 'none';
    const ethos = document.querySelector('.ethos');
    if (ethos) ethos.style.display = 'none';
    const skills = document.querySelector('.skills');
    if (skills) skills.style.display = 'none';
    const works = document.querySelector('.works');
    if (works) works.style.display = 'none';
    const test = document.querySelector('.testimonials');
    if (test) test.style.display = 'none';
  });

  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'local_screenshot_only_hobbies.png', fullPage: true });
  await browser.close();
})();