const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'session_hardware.html'), 'utf8');

// Find table tags
const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/g;
let match;
console.log('--- TABLES ---');
while ((match = tableRegex.exec(html)) !== null) {
  const tableTag = match[0].match(/<table[^>]*>/)[0];
  console.log(tableTag);
}

console.log('\n--- DATA-URL ATTRIBUTES ---');
// Let us search for data-url in the whole file
const dataUrlRegex = /data-url="([^"]+)"/g;
while ((match = dataUrlRegex.exec(html)) !== null) {
  console.log('Found data-url:', match[1]);
}

console.log('\n--- SCRIPTS SEARCHING FOR AJAX ---');
// Let's write a script to look at all script blocks and search for URLs or $.ajax or bootstrapTable config
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1];
  if (code.includes('bootstrapTable') || code.includes('url:') || code.includes('ajax') || code.includes('api')) {
    console.log('Found script block of interest. Length:', code.length);
    // Print lines containing table, url, or endpoint
    const lines = code.split('\n');
    lines.forEach(line => {
      if (line.includes('url') || line.includes('table') || line.includes('api') || line.includes('columns')) {
        console.log('  LINE:', line.trim().substring(0, 150));
      }
    });
  }
}
