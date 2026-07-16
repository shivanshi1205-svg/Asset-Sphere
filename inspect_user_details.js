const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'dashboard.html'), 'utf8');

console.log('--- USER INFO MENTIONS ---');
const lines = html.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('demo') || line.includes('Admin') || line.includes('user') || line.includes('Profile')) {
    if (line.length < 200) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  }
});
