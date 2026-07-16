const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'session_hardware.html'), 'utf8');

const tableRegex = /<table[^>]*>/g;
let match;
while ((match = tableRegex.exec(html)) !== null) {
  console.log(match[0]);
}
