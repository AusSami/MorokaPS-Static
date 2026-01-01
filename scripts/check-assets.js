// check-assets.js
// Checks that key assets exist (icons, optimized images) before release
// Usage: node scripts/check-assets.js

const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const icons = [ 'icons/icon-192.png', 'icons/icon-512.png' ];
const imagesDir = path.join(root, 'images', 'optimized');
const { createLogger } = require('./logger');
const log = createLogger('check-assets');

let ok = true;

for (const i of icons){
  if (!fs.existsSync(path.join(root, i))) {
    log.warn('MISSING ICON:', i);
    ok = false;
  } else log.info('Found', i);
}

if (!fs.existsSync(imagesDir)){
  log.warn('Missing optimized images directory:', imagesDir);
  ok = false;
} else {
  const files = fs.readdirSync(imagesDir).filter(f => /webp$|\.jpg$|\.png$/.test(f));
  log.info('Optimized images count:', files.length);
  if (!files.length) ok = false;
}

if (!ok) {
  log.error('\nSome assets are missing. Run `npm run images:prepare` and `npm run icons:generate` then re-run this script.');
  process.exit(2);
}
log.info('\nAll assets look present.');
