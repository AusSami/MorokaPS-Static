// generate-responsive-images.js
// For each JPG/PNG in images/, copy originals to images/originals (if not present)
// and generate WebP versions at multiple widths into images/optimized
// Usage: node scripts/generate-responsive-images.js
// Requires: sharp

const fs = require('fs');
const path = require('path');
const { createLogger } = require('./logger');
const log = createLogger('generate-responsive-images');

(async function main(){
  let sharp;
  try { sharp = require('sharp'); } catch(e){
    log.error('Please install sharp first: npm install --save-dev sharp');
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

  const exts = ['.jpg', '.jpeg', '.png'];

  // copy originals into images/originals (idempotent)
  const allFiles = fs.readdirSync(imagesDir).filter(f => exts.includes(path.extname(f).toLowerCase()));
  for (const f of allFiles){
    const src = path.join(imagesDir, f);
    const dst = path.join(originalsDir, f);
    if (!fs.existsSync(dst)) fs.copyFileSync(src, dst);
  }

  const files = fs.readdirSync(originalsDir).filter(f => exts.includes(path.extname(f).toLowerCase()));
  if (!files.length){ console.log('No images found for processing in originals/'); return; }

  const sizes = [400, 800, 1200];
  for (const file of files){
    const base = path.basename(file, path.extname(file));
    const infile = path.join(originalsDir, file);

    // generate multiple widths
    for (const w of sizes){
      const outname = `${base}-${w}.webp`;
      const outfile = path.join(optimizedDir, outname);
      try {
        await sharp(infile).resize({ width: w }).webp({ quality: 78 }).toFile(outfile);
        log.info('✅', file, '→', path.join('optimized', outname));
      } catch(err){
        log.error('❌', file, '→', outname, err.message);
      }
    }

    // also create a non-resized WebP baseline
    const baseline = `${base}.webp`;
    try {
      await sharp(infile).webp({quality: 80}).toFile(path.join(optimizedDir, baseline));
      console.log('✅', file, '→', path.join('optimized', baseline));
    } catch(err){
      console.error('❌', file, '→', baseline, err.message);
    }
  }
  log.info('Responsive images generated in images/optimized/');
})();