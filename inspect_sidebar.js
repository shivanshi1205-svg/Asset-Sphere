const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'dashboard.html'), 'utf8');

// Find sidebar menu
const sidebarMenuMatch = html.match(/<ul class="sidebar-menu"[^>]*>([\s\S]*?)<\/ul>\s*<\/section>/);
if (sidebarMenuMatch) {
  console.log('Sidebar Menu HTML:');
  const cleanMenuHtml = sidebarMenuMatch[1]
    .replace(/<i\s+class="[^"]+"><\/i>/g, '') // remove icons for clarity
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
  console.log(cleanMenuHtml);
} else {
  console.log('Could not find sidebar-menu in HTML. Let us look for <aside>');
  const asideMatch = html.match(/<aside[^>]*>([\s\S]*?)<\/aside>/);
  if (asideMatch) {
    fs.writeFileSync(path.join(__dirname, 'aside.html'), asideMatch[1]);
    console.log('Saved aside.html');
  }
}
