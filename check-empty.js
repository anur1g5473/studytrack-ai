const fs = require('fs');
const path = require('path');

function findEmptyFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        findEmptyFiles(filePath);
      }
    } else {
      if (stat.size === 0) {
        console.log(`❌ EMPTY FILE: ${filePath}`);
      }
    }
  });
}

console.log('🔍 Scanning for empty files...');
findEmptyFiles('./src');
console.log('✅ Scan complete.');