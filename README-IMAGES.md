Image optimization notes

What I changed:
- Added `loading="lazy"` and `decoding="async"` to gallery images in `gallery.html`.
- Added a grid layout for `.gallery` and `.gallery-img` styles in `style.css` so images crop nicely and load responsively.
- Added `scripts/convert-images.js` which uses `sharp` to convert JPG/PNG images to WebP.
- Added `package.json` with a script `images:convert` that runs the conversion script.

How to convert images to WebP locally (recommended):

1) Normalize filenames and create safe fallbacks (recommended first step):

```powershell
cd "C:\Users\missm\Documents\MorokaPS-Static"
# normalize top-level images (copies to images/originals and creates fallback -1200 copies in images/optimized)
node scripts/normalize-images.js
```

2) Install `sharp` and dev helpers (dev dependencies) and prepare optimized WebP images:

```powershell
npm install --save-dev sharp http-server lighthouse
# then
npm run images:prepare
# generate app icons (uses images/originals/school-bg.png by default)
npm run icons:generate
# sanity check that icons and optimized images exist
npm run check:assets
```

3) What the scripts do now:
- `scripts/normalize-images.js` will copy top-level JPG/PNG images into `images/originals/` with normalized names and create safe fallback copies `images/optimized/<basename>-1200.<ext>` so pages don't 404 before WebP generation.
- `images:convert` converts originals into WebP baseline files in `images/optimized/`.
- `images:responsive` reads from `images/originals/` and generates `images/optimized/<basename>-400.webp`, `-800.webp`, `-1200.webp`, plus a baseline `<basename>.webp`.

3) I updated `gallery.html` to use `<picture>` elements that prefer `.webp` and include `srcset` and `sizes` so browsers pick an appropriately-sized image; CSS hero backgrounds now point to `images/optimized/*-1200.webp` for a better balance between quality and size.

Notes & next improvements:
- After running `npm run images:prepare`, check `images/originals/` to keep your source images safe and `images/optimized/` for the generated WebP files.
- We can extend the scripts to also generate resized JPEG/PNG fallbacks if you need wider compatibility, or plug this into CI to run automatically.
- If you'd like, I can run the conversions locally in your PowerShell session (that will require installing `sharp` first).