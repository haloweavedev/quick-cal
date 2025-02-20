// scripts/check-api-dirs.js
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const apiDir = path.join(rootDir, 'app', 'api');

// Directories to check/create
const dirs = [
  path.join(apiDir, 'calendars'),
  path.join(apiDir, 'calendars', 'secondary'),
  path.join(apiDir, 'calendars', 'secondary', 'connect'),
  path.join(apiDir, 'calendars', 'secondary', 'callback'),
  path.join(apiDir, 'jobs'),
  path.join(apiDir, 'jobs', 'sync-calendars'),
];

console.log('Checking API directory structure...');

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${path.relative(rootDir, dir)}`);
    fs.mkdirSync(dir, { recursive: true });
  } else {
    console.log(`Directory exists: ${path.relative(rootDir, dir)}`);
  }
});

console.log('Directory structure check complete!');