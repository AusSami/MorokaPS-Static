✅ Release checklist — Moroka Primary School static site

1. Install dev dependencies
   - npm install

2. Generate and optimize images
   - npm run images:prepare

3. Generate app icons
   - npm run icons:generate
   - Confirm icons/ contains icon-192.png and icon-512.png

4. Case-sensitive filename check (important for Linux hosting)
   - Ensure the homepage file is `index.html` (lowercase).
   - On Windows, to change case in git: git mv Index.html tmp && git mv tmp index.html && git commit -m "Normalize homepage filename"

5. Update production settings
   - Update `robots.txt` and `sitemap.xml` to reference your production domain (replace example.com)

6. Serve locally and run audits
   - npm run serve
   - npm run audit:page (or use npx lighthouse on each URL)
   - Review Lighthouse reports and fix high-priority issues (accessibility, performance, SEO)

7. Verify PWA & offline behavior
   - Confirm `manifest.webmanifest` icons exist and PWA install prompt works
   - Confirm service worker caches expected assets and fallback to `/index.html` works

8. Final checks
   - Verify all images have meaningful `alt` text
   - Verify canonical URLs and meta descriptions on all pages
   - Run accessibility checks (axe or Lighthouse)

9. Deploy
   - Deploy to production hosting (Netlify/Vercel/GCP/AWS/Static hosting) and validate live site

10. Post-deploy
   - Re-run Lighthouse against the production domain
   - Submit sitemap to Google Search Console and Bing Webmaster Tools

If you'd like, I can implement the remaining automated fixes (icon generation script added, links updated, service-worker normalized). The next step is to run `npm install` and `npm run images:prepare` locally, then I can help triage Lighthouse reports and fix any remaining issues.