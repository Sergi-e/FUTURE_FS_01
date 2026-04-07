import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, 'public', 'assets', 'books');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const books = [
  { id: 'b1', url: 'https://covers.openlibrary.org/b/id/10143650-L.jpg' },
  { id: 'b2', url: 'https://covers.openlibrary.org/b/id/11917842-L.jpg' },
  { id: 'b3', url: 'https://covers.openlibrary.org/b/id/6424160-L.jpg' },
  { id: 'b4', url: 'https://covers.openlibrary.org/b/id/10170095-L.jpg' },
  { id: 'b5', url: 'https://covers.openlibrary.org/b/id/12539702-L.jpg' }
];

async function download() {
  for (const b of books) {
    const dest = path.join(dir, b.id + '.jpg');
    console.log('Downloading ' + b.id);
    try {
      const response = await fetch(b.url, {
        headers: { 'User-Agent': 'PortfolioBot/1.0 (info@example.com)' },
        redirect: 'follow'
      });
      if (!response.ok) {
        console.log(b.id + ' failed with ' + response.status);
        continue;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(b.id + ' success');
    } catch (e) {
      console.log(b.id + ' error: ' + e.message);
    }
  }
}

download();
