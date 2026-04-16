const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  await page.evaluate(() => {
    const el = document.getElementById('hobbies');
    if (el) el.scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(600);

  const data = await page.evaluate(() => {
    const section = document.querySelector('.hobbies-innovative');
    const rect = section.getBoundingClientRect();
    const midX = Math.floor(rect.left + rect.width / 2);
    // Sample a few Y positions: gap between carousel bottom and books header
    const books = document.querySelector('.books-section');
    const booksRect = books ? books.getBoundingClientRect() : null;
    const carousel = document.querySelector('.hobbies-carousel-container');
    const carRect = carousel ? carousel.getBoundingClientRect() : null;

    const sampleY = (y) => {
      const el = document.elementFromPoint(midX, y);
      if (!el) return { y, tag: null, className: null, bg: null };
      const comp = window.getComputedStyle(el);
      return {
        y,
        tag: el.tagName,
        className: typeof el.className === 'string' ? el.className : '',
        bg: comp.backgroundColor,
        bgImage: comp.backgroundImage,
      };
    };

    const ys = [];
    if (carRect && booksRect) {
      const gapTop = Math.floor(carRect.bottom + 8);
      const gapMid = Math.floor((carRect.bottom + booksRect.top) / 2);
      const gapNearBooks = Math.floor(booksRect.top - 12);
      ys.push(gapTop, gapMid, gapNearBooks);
    }
    ys.push(Math.floor(rect.top + 40));

    const sectionBg = section ? window.getComputedStyle(section).backgroundColor : null;

    return {
      sectionBg,
      booksTop: booksRect ? booksRect.top : null,
      carouselBottom: carRect ? carRect.bottom : null,
      samples: ys.filter((y) => y > 0 && y < window.innerHeight).map(sampleY),
    };
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
