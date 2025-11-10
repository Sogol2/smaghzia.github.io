// scripts/main.js
(() => {
    // Highlight current page in nav
    const here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a=>{
      const href = (a.getAttribute('href')||'').split('/').pop();
      if (href === here) a.classList.add('active');
    });
  
    // Smooth-scroll for same-page anchor links
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
    });
  
    // Tiny toast helper
    window.showToast = (msg, ms=2500) => {
      let t = document.querySelector('.toast');
      if (!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
      t.textContent = msg;
      requestAnimationFrame(()=>{ t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), ms); });
    };
  
    // JSON fetch helper
    window.loadJSON = async (url) => {
      const res = await fetch(url, {cache:'no-store'});
      if (!res.ok) throw new Error(`Failed to load ${url}`);
      return res.json();
    };
  })();
  