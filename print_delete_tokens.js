const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'account_api.html'), 'utf8');

const regex = /<tr[^>]*>([\s\S]*?deleteToken[\s\S]*?)<\/tr>/g;
let match;
console.log('--- ROWS WITH DELETETOKEN ---');
while ((match = regex.exec(html)) !== null) {
  console.log(match[0].replace(/<[^>]+>/g, ' ').trim().split('\n').map(l => l.trim()).filter(l => l.length > 0).join(' | '));
  console.log('---');
}
