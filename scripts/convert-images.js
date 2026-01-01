// convert-images.js
// Converts all .jpg/.jpeg/.png files in images/originals/ to WebP in images/optimized/
// and preserves originals in images/originals/
// Usage: node scripts/convert-images.js
// Requires: sharp

const fs = require('fs');
const path = require('path');

(async function main(){
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('Please install sharp first: npm install --save-dev sharp');
    process.exit(1);
  }

  const imagesDir = path.join(__dirname, '..', 'images');
  const originalsDir = path.join(imagesDir, 'originals');
  const optimizedDir = path.join(imagesDir, 'optimized');

  if (!fs.existsSync(imagesDir)){
    console.error('images/ directory not found at', imagesDir);
    process.exit(1);
  }
  if (!fs.existsSync(originalsDir)) fs.mkdirSync(originalsDir);
  if (!fs.existsSync(optimizedDir)) fs.mkdirSync(optimizedDir);

  const { createLogger } = require('./logger');
  const log = createLogger('convert-images');

  const exts = ['.jpg', '.jpeg', '.png'];
  // ensure originals are populated (copies all top-level images into originals/ if not present)
  const topFiles = fs.readdirSync(imagesDir).filter(f => exts.includes(path.extname(f).toLowerCase()));
  for (const f of topFiles){
    const src = path.join(imagesDir, f);
    const dst = path.join(originalsDir, f);
    if (!fs.existsSync(dst)) fs.copyFileSync(src, dst);
  }

  const files = fs.readdirSync(originalsDir).filter(f => exts.includes(path.extname(f).toLowerCase()));
  log.info('Found', files.length, 'image(s) in originals/.');
  if (!files.length){
    writeLog('INFO', 'No JPG/PNG images found to convert.');
    return;
  }

  for (const file of files){
    const infile = path.join(originalsDir, file);
    const outname = path.basename(file, path.extname(file)) + '.webp';
    const outfile = path.join(optimizedDir, outname);
    try{
      log.info('Converting', file, '...');
      await sharp(infile)
        .webp({quality: 80})
        .toFile(outfile);
      log.info('✅ Converted', file, '→', path.join('optimized', outname));
    } catch(err){
      log.error('❌ Failed to convert', file, err.message);
    }
  }
  log.info('All done.');
})();