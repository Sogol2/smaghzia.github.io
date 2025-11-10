/* scripts/main.js */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Highlight current page in nav
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href === here) {
      a.classList.add('active');
    }
  });

  // Smooth-scroll for same-page hash links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = (link.getAttribute('href') || '').slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Footer year (if element exists)
  const yearEl = document.getElementById('y');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});

// Tiny toast helper
window.showToast = (msg, ms = 2500) => {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => {
    t.classList.add('show');
  });
  setTimeout(() => {
    t.classList.remove('show');
  }, ms);
};
