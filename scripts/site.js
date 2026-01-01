// Simple site script: injects a hamburger button for each hero and toggles nav on small screens
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.hero').forEach((hero, idx) => {
    const nav = hero.querySelector('nav');
    if (!nav) return;

    // create toggle button
    const btn = document.createElement('button');
    btn.className = 'nav-toggle';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', `site-nav-${idx}`);
    btn.innerHTML = '☰ <span class="sr-only">Menu</span>';

    // associate nav with ID for accessibility
    nav.setAttribute('id', `site-nav-${idx}`);

    hero.appendChild(btn);

    btn.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // close nav when clicking outside on small screens
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      const isInside = hero.contains(e.target);
      const isBtn = e.target === btn || btn.contains(e.target);
      if (!isInside && !isBtn) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Register a basic service worker for offline caching (optional)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service worker registered.', reg.scope))
      .catch(err => console.warn('Service worker registration failed:', err));
  }
});