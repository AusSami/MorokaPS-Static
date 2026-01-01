// run-lighthouse.js
// Simple helper to run Lighthouse on multiple pages using the CLI (executes `npx -y lighthouse`)
// Usage: node scripts/run-lighthouse.js

const { execSync } = require('child_process');
const pages = [
  '/Index.html',
  '/subjects.html',
  '/about.html',
  '/staff.html',
  '/admissions.html'
];

try {
  for (const p of pages){
    const url = `http://localhost:8080${p}`;
    const out = `reports/${p.replace(/\//g, '').replace(/\.html$/, '')}-lighthouse.html`;
    console.log('Running Lighthouse for', url);
    execSync(`npx -y lighthouse "${url}" --output html --output-path ${out} --chrome-flags="--headless"`, { stdio: 'inherit' });
  }
  console.log('All Lighthouse runs are complete.');
} catch(err){
  console.error('Error running Lighthouse:', err.message);
  process.exit(1);
}