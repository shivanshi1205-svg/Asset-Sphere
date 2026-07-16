const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'session_hardware.html'), 'utf8');

const regex = /headers|Authorization|bearer|token|ajaxOptions/gi;
const lines = html.split('\n');
console.log('--- HEADERS & AUTHENTICATION MENTIONS ---');
lines.forEach((line, idx) => {
  if (regex.test(line)) {
    console.log(`${idx + 1}: ${line.trim().substring(0, 150)}`);
  }
});
