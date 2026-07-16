const fs = require('fs');
const path = require('path');

const searchDirs = [
  'C:\\Users\\USER\\.gemini\\antigravity\\scratch',
  'C:\\Users\\USER\\.gemini\\antigravity\\browser_recordings',
  'C:\\Users\\USER\\.gemini\\antigravity\\html_artifacts',
  'C:\\Users\\USER\\.gemini\\antigravity\\knowledge',
  'C:\\Users\\USER\\.gemini\\antigravity\\worktrees',
  'C:\\Users\\USER\\.gemini\\antigravity\\skills'
];

function findZips(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        continue;
      }
      if (stat.isDirectory()) {
        // limit depth
        if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
          findZips(fullPath);
        }
      } else if (file.toLowerCase().endsWith('.zip')) {
        console.log('FOUND ZIP:', fullPath, stat.size, 'bytes');
      }
    }
  } catch (e) {
    // console.error('Error reading', dir, e.message);
  }
}

for (const d of searchDirs) {
  console.log('Searching in', d);
  findZips(d);
}
