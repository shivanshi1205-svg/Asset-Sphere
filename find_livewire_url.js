const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'account_api.html'), 'utf8');

console.log('--- LIVEWIRE MENTIONS ---');
const lines = html.split('\n');
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('livewire')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
