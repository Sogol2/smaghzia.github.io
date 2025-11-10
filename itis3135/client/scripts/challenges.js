/* scripts/challenges.js */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const key = 'fitness-weeks';

  // Load saved progress
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(key) || '{}');
  } catch (e) {
    saved = {};
  }

  // Restore UI from saved data (if you store step names)
  document.querySelectorAll('.week').forEach((wk) => {
    const id = wk.dataset.week;
    const data = saved[id];
    if (!data) return;

    if (Array.isArray(data.steps)) {
      data.steps.forEach((name) => {
        const el = wk.querySelector(`input[name="${name}"]`);
        if (el) el.checked = true;
      });
    }
    if (data.done) {
      const status = wk.querySelector('.status');
      if (status) status.textContent = 'Completed ✅';
    }
  });

  // Complete button: require all required checkboxes to be checked
  $(document).on('click', '.week .complete', function (e) {
    e.preventDefault();

    const form = $(this).closest('.week')[0];
    const id = form.dataset.week;

    const req = $(form).find('input[required]');
    const allChecked = Array.from(req).every((cb) => cb.checked);
    if (!allChecked) {
      $(form).find('.status').text('Please complete all steps 🖐️');
      return;
    }

    // Save which steps were checked (optional but handy)
    const steps = Array.from($(form).find('input[type="checkbox"]'))
      .filter((cb) => cb.checked)
      .map((cb) => cb.name);

    const data = saved[id] || {};
    data.done = true;
    data.steps = steps;
    saved[id] = data;
    localStorage.setItem(key, JSON.stringify(saved));

    $(form).find('.status').text('Completed ✅');

    // Tiny confetti (emoji burst via toast)
    for (let i = 0; i < 12; i++) {
      setTimeout(() => window.showToast('Week complete! 🎉'), i * 80);
    }
  });
});
