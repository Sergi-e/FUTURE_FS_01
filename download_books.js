import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, 'public', 'assets', 'books');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const books = [
  { id: 'b1', url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1401432508i/4099.jpg' },
  { id: 'b2', url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1344710125i/13606990.jpg' },
  { id: 'b3', url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1589133887i/1303.jpg' },
  { id: 'b4', url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1529023349i/39330937.jpg' },
  { id: 'b5', url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg' }
];

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
        file.on('finish', () => {
          file.close();
          console.log(b.id + ' success');
          resolve();
        });
      }).on('error', (e) => {
        console.log(b.id + ' error: ' + e.message);
        resolve();
      });
    });
  }
}

download();
