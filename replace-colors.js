const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend', 'src');

const colorMap = {
  '#F9FAFB': 'var(--bg-primary)',
  '#FFFFFF': 'var(--bg-secondary)',
  '#111827': 'var(--text-primary)',
  '#6B7280': 'var(--text-secondary)',
  '#E5E7EB': 'var(--border-color)',
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

      for (const [hex, cssVar] of Object.entries(colorMap)) {
        // Find strings like '#F9FAFB'
        const regex = new RegExp(`['"\`]${hex}['"\`]`, 'gi');
        if (regex.test(content)) {
          content = content.replace(regex, `"${cssVar}"`);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated colors in ${fullPath}`);
      }
    }
  });
}

console.log("Starting color replacement script...");
processDirectory(directoryPath);
console.log("Done!");
