/* scripts/resources.js */
'use strict';

async function loadJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

(async () => {
  // Load resources.json and filter client-side
  const container = document.getElementById('resources');
  const empty = document.getElementById('empty');

  let items = [];
  try {
    items = await loadJSON('data/resources.json');
  } catch (e) {
    container.innerHTML = '<p class="error">Failed to load resources.</p>';
    throw e;
  }

  const render = (list) => {
    container.innerHTML = '';
    if (!list.length) { empty.style.display = 'block'; return; }
    empty.style.display = 'none';

    list.forEach((r) => {
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `
        <h3>${r.name}</h3>
        <p class="muted">${r.description}</p>
        <p><a class="btn" href="${r.url}" target="_blank" rel="noopener">Open resource</a></p>
      `;
      container.appendChild(el);
    });
  };

  render(items);

  const q = document.getElementById('q');
  q.addEventListener('input', () => {
    const s = q.value.toLowerCase().trim();
    const filtered = items.filter((r) => {
      const tags = Array.isArray(r.tags) ? r.tags.join(' ') : '';
      const hay = `${r.name} ${r.description} ${tags}`.toLowerCase();
      return hay.includes(s);
    });
    render(filtered);
  });
})();
