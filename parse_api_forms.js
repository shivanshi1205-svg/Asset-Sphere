const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'account_api.html'), 'utf8');

const forms = [];
const formRegex = /<form[^>]*>([\s\S]*?)<\/form>/g;
let match;
while ((match = formRegex.exec(html)) !== null) {
  const formTag = match[0].match(/<form[^>]*>/)[0];
  forms.push({ tag: formTag, inner: match[1] });
}
console.log('Forms found:', forms.map(f => f.tag));

// If there's a token form, print it
forms.forEach((f, idx) => {
  console.log(`\nForm ${idx} Content:`);
  console.log(f.inner.replace(/<[^>]+>/g, '').trim().split('\n').map(l => l.trim()).filter(l => l.length > 0).join('\n'));
});
