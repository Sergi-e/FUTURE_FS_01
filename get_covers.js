const https = require('https');

const titles = [
  'The Pragmatic Programmer',
  'Think Like a Programmer',
  '48 Laws of Power',
  'The Laws of Human Nature',
  'Atomic Habits'
];

titles.forEach(title => {
  https.get(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=5`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const doc = json.docs.find(d => d.cover_i);
        if (doc) {
          console.log(`"${title}": "https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg",`);
        } else {
          console.log(`"${title}": No cover found`);
        }
      } catch(e) { console.error(e); }
    });
  });
});
