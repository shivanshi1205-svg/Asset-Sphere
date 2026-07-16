const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'account_api.html'), 'utf8');

const wireRegex = /wire:initial-data="([^"]+)"/g;
let match;
while ((match = wireRegex.exec(html)) !== null) {
  console.log('Found Livewire Initial Data:');
  const decoded = JSON.parse(match[1].replace(/&quot;/g, '"'));
  console.log(JSON.stringify(decoded, null, 2));
}

// Let's print any other wire: attributes
const wireAttrs = [];
const wireAttrRegex = /wire:[a-zA-Z\.]+="[^"]*"/g;
while ((match = wireAttrRegex.exec(html)) !== null) {
  wireAttrs.push(match[0]);
}
console.log('Other wire attributes:', wireAttrs);
