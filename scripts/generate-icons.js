// generate-icons.js
// Generate PNG app icons (192x192, 512x512) from a source image in images/originals/
// Usage: node scripts/generate-icons.js
// Requires: sharp

const fs = require('fs');
const path = require('path');
const { createLogger } = require('./logger');
const log = createLogger('generate-icons');
(async function main(){
  let sharp;
  try { sharp = require('sharp'); } catch(e){
    log.error('Please install sharp first: npm install --save-dev sharp');
    process.exit(1);
  }

  const root = path.join(__dirname, '..');
  const iconsDir = path.join(root, 'icons');
  const srcCandidates = [
    path.join(root, 'images', 'originals', 'school-bg.png'),
    path.join(root, 'images', 'originals', 'newsletter-bg.jpg'),
  ];
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir);

  const src = srcCandidates.find(p => fs.existsSync(p));
  if (!src) {
    log.error('No source image found for generating icons. Expected one of:', srcCandidates.join(', '));
    process.exit(1);
  }

  const sizes = [192, 512];
  for (const s of sizes){
    const out = path.join(iconsDir, `icon-${s}.png`);
    try {
      await sharp(src).resize(s, s, {fit: 'cover'}).png().toFile(out);
      log.info('✅ Generated', out);
    } catch(err){
      log.error('❌ Failed to generate', out, err.message);
    }
  }
  log.info('Icon generation complete.');
})();