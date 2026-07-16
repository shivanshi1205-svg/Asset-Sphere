const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'account_api.html'), 'utf8');

const formRegex = /<form[^>]*class="form-horizontal"[^>]*>([\s\S]*?)<\/form>/;
const match = formRegex.exec(html);
if (match) {
  console.log('Form 2 HTML:');
  console.log(match[0]);
} else {
  console.log('Form 2 not found');
}
