const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'account_api.html'), 'utf8');

// Let's print out rows of the tokens table
const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
let match;
console.log('--- TOKENS TABLE ROWS ---');
while ((match = rowRegex.exec(html)) !== null) {
  const rowContent = match[1].replace(/<[^>]+>/g, '').trim().split('\n').map(l => l.trim()).filter(l => l.length > 0).join(' | ');
  if (rowContent.includes('Token') || rowContent.includes('Created') || rowContent.includes('Expires')) {
    console.log(rowContent);
  }
}
