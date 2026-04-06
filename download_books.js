import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, 'public', 'assets', 'books');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const books = [
  { id: 'b1', url: 'https://m.media-amazon.com/images/I/51W1sBPO7tL._SL500_.jpg' },
  { id: 'b2', url: 'https://m.media-amazon.com/images/I/51A1v5P-u-L._SL500_.jpg' },
  { id: 'b3', url: 'https://m.media-amazon.com/images/I/71951W96oWL._SL500_.jpg' },
  { id: 'b4', url: 'https://m.media-amazon.com/images/I/71N1N1G+h9L._SL500_.jpg' },
  { id: 'b5', url: 'https://m.media-amazon.com/images/I/81bGKUa1e0L._SL500_.jpg' }
];

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
  }
};

async function download() {
  for (const b of books) {
    const dest = path.join(dir, b.id + '.jpg');
    console.log('Downloading ' + b.id);
    await new Promise((resolve) => {
      https.get(b.url, options, (res) => {
        if (res.statusCode !== 200) {
          console.log(b.id + ' failed with ' + res.statusCode);
          resolve();
          return;
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => { file.close(); console.log(b.id + ' success'); resolve(); });
      }).on('error', (e) => { console.log(b.id + ' error: ' + e.message); resolve(); });
    });
  }
}

download();
