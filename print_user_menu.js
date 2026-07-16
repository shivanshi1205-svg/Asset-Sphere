const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'dashboard.html'), 'utf8');

const userMenuRegex = /<li class="dropdown user user-menu">([\s\S]*?)<\/li>/;
const match = userMenuRegex.exec(html);
if (match) {
  console.log(match[0].replace(/<[^>]+>/g, '').trim().split('\n').map(l => l.trim()).filter(l => l.length > 0).join('\n'));
} else {
  console.log('User menu not found');
}
