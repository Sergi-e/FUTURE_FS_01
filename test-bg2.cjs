const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');

  const info = await page.evaluate(() => {
    return Array.from(document.styleSheets)
      .filter(sheet => {
        try {
          return sheet.cssRules;
        } catch (e) {
          return false;
        }
      })
      .map(sheet => Array.from(sheet.cssRules))
      .reduce((acc, val) => acc.concat(val), [])
      .filter(rule => rule.selectorText && (
        rule.selectorText.includes('.hobbies') || 
        rule.selectorText.includes('.books') ||
        (rule.style && rule.style.backgroundColor && rule.style.backgroundColor !== 'transparent' && rule.style.backgroundColor !== 'rgba(0, 0, 0, 0)')
      ))
      .map(rule => ({
        selector: rule.selectorText,
        bg: rule.style ? rule.style.backgroundColor : null,
        bgImg: rule.style ? rule.style.backgroundImage : null
      }));
  });

  const bgStyles = info.filter(i => i.bg || i.bgImg);
  console.dir(bgStyles.filter(i => !i.selector.includes(':hover') && !i.selector.includes('btn') && !i.selector.includes('icon')), { depth: null });
  await browser.close();
})();