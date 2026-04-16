const fs = require('fs');
const cssPath = 'c:/Users/serge/OneDrive/Desktop/portfolio-2026/src/components/Hobbies.css';
const cssContent = fs.readFileSync(cssPath, 'utf8');
console.log("Hobbies.css:");
console.log(cssContent.slice(0, 1500));
