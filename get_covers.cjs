const https = require('https');
const fs = require('fs');

const titles = [
  'The Pragmatic Programmer',
  'Think Like a Programmer',
  '48 Laws of Power',
  'The Laws of Human Nature',
  'Atomic Habits'
];

let results = {};
let completed = 0;

titles.forEach(title => {
  https.get(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=10`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const doc = json.docs.find(d => d.cover_i);
        if (doc) {
          results[title] = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
        } else {
          results[title] = `No cover found`;
        }
      } catch(e) { 
        results[title] = `Error`;
      }
      completed++;
      if(completed === titles.length) {
        fs.writeFileSync('covers.json', JSON.stringify(results, null, 2));
      }
    });
  });
});
