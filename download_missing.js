import https from 'https';
import fs from 'fs';

const urls = {
  b2: 'https://images-na.ssl-images-amazon.com/images/P/1593274246.01.LZZZZZZZ.jpg',
  b4: 'https://images-na.ssl-images-amazon.com/images/P/0525428143.01.LZZZZZZZ.jpg'
};

['b2', 'b4'].forEach(id => {
  https.get(urls[id], res => {
    res.pipe(fs.createWriteStream('public/assets/books/' + id + '.jpg'));
    res.on('end', () => console.log('Downloaded ' + id));
  });
});
