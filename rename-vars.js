const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend', 'src');

const replaceCache = {
  'var(--bg-primary)': 'var(--bg)',
  'var(--bg-secondary)': 'var(--card)',
  'var(--text-primary)': 'var(--text)',
  'var(--text-secondary)': 'var(--muted)',
  'var(--border-color)': 'var(--border)',
};

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      for (const [oldVar, newVar] of Object.entries(replaceCache)) {
        if (content.includes(oldVar)) {
          content = content.split(oldVar).join(newVar);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Renamed variables in ${fullPath}`);
      }
    }
  });
}

console.log("Starting variable rename script...");
processDirectory(directoryPath);
console.log("Done!");
