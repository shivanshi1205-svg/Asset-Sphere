const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'dashboard.html'), 'utf8');

console.log('--- SIDEBAR LINKS ---');
const sidebarLinks = [];
// Find <aside class="main-sidebar">... </aside> or search for links inside list items
const sidebarRegex = /<li[^>]*>\s*<a href="([^"]+)"[^>]*>[\s\S]*?<span>([^<]+)<\/span>/g;
let match;
while ((match = sidebarRegex.exec(html)) !== null) {
  sidebarLinks.push({ href: match[1], label: match[2].trim() });
}
console.log(sidebarLinks);

console.log('\n--- INFO BOXES (METRICS) ---');
// Info boxes look like: <span class="info-box-text">...</span> <span class="info-box-number">...</span>
const infoBoxRegex = /<span class="info-box-text">([^<]+)<\/span>[\s\S]*?<span class="info-box-number">([^<]+)<\/span>/g;
const metrics = [];
while ((match = infoBoxRegex.exec(html)) !== null) {
  metrics.push({ label: match[1].trim(), value: match[2].trim() });
}
console.log(metrics);

console.log('\n--- TITLES & HEADINGS ---');
const hRegex = /<h[1234][^>]*>([\s\S]*?)<\/h[1234]>/g;
const headings = [];
while ((match = hRegex.exec(html)) !== null) {
  const text = match[1].replace(/<[^>]+>/g, '').trim();
  if (text) headings.push(text);
}
console.log(headings.slice(0, 20));

console.log('\n--- FORMS AND TABLES ---');
// Let's print out what other sections exist
const sectionRegex = /<section class="content">([\s\S]*?)<\/section>/;
const sectionMatch = sectionRegex.exec(html);
if (sectionMatch) {
  console.log('Content section length:', sectionMatch[1].length);
  // Find tables in it
  const tableRegex = /<table[^>]*id="([^"]+)"/g;
  const tables = [];
  while ((match = tableRegex.exec(sectionMatch[1])) !== null) {
    tables.push(match[1]);
  }
  console.log('Tables found:', tables);
}
