// normalize-images.js
// Normalizes filenames and copies top-level images into images/originals/ (idempotent),
// and copies baseline -1200 copies into images/optimized/ for safe fallback until WebP generation happens.
// Usage: node scripts/normalize-images.js

const fs = require('fs');
const path = require('path');
const { createLogger } = require('./logger');
const log = createLogger('normalize-images');

const imagesDir = path.join(__dirname, '..', 'images');
const originals = path.join(imagesDir, 'originals');
const optimized = path.join(imagesDir, 'optimized');

if (!fs.existsSync(imagesDir)) {
  log.error('images/ directory not found at', imagesDir);
  process.exit(1);
}
if (!fs.existsSync(originals)) fs.mkdirSync(originals);
if (!fs.existsSync(optimized)) fs.mkdirSync(optimized);

const exts = ['.png', '.jpg', '.jpeg'];
const files = fs.readdirSync(imagesDir).filter(f => exts.includes(path.extname(f).toLowerCase()));
if (!files.length) { console.log('No top-level images found to normalize.'); process.exit(0); }

for (const f of files) {
  const src = path.join(imagesDir, f);
  // normalize base name: lowercase, replace spaces with -, remove duplicate extensions
  let base = path.basename(f, path.extname(f));
  base = base.replace(/\s+/g, '-').toLowerCase();
  // example: newsletter-bg.jpeg -> newsletter-bg
  const ext = path.extname(f).toLowerCase();
  const normalized = `${base}${ext === '.jpeg' ? '.jpg' : ext}`; // prefer .jpg over .jpeg

  const dstOriginal = path.join(originals, normalized);
  if (!fs.existsSync(dstOriginal)) {
    log.info('Copying', f, '→', path.join('originals', normalized));
    fs.copyFileSync(src, dstOriginal);
  } else {
    log.info('Original exists:', path.join('originals', normalized));
  }

  // create baseline optimized -1200 variant (same ext as normalized)
  const extForOpt = path.extname(normalized);
  const optName = `${base}-1200${extForOpt}`;
  const dstOpt = path.join(optimized, optName);
  if (!fs.existsSync(dstOpt)) {
    log.info('Creating fallback optimized copy:', path.join('optimized', optName));
    fs.copyFileSync(dstOriginal, dstOpt);
  } else {
    log.info('Optimized fallback exists:', path.join('optimized', optName));
  }
}

log.info('Normalization complete. Check images/originals and images/optimized.');