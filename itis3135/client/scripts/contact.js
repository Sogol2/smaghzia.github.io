// scripts/contact.js — client-side validation + mock submit
'use strict';

(() => {
  const f = document.getElementById('contactForm');
  const err = document.getElementById('err');

  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.textContent = '';

    const name = f.name.value.trim();
    const email = f.email;                 // <input> element (for checkValidity)
    const interest = f.interest.value;
    const msg = f.msg.value.trim();

    if (name.length < 2) { err.textContent = 'Enter your name.'; return; }
    if (!email.checkValidity()) { err.textContent = 'Use your UNCC/Charlotte email.'; return; }
    if (!interest) { err.textContent = 'Select your interest.'; return; }
    if (msg.length < 10) { err.textContent = 'Add a brief message (10+ chars).'; return; }

    // Mock submit (replace later with Formspree/EmailJS if desired)
    showToast('Message sent (demo) ✅');
    f.reset();
  });
})();
