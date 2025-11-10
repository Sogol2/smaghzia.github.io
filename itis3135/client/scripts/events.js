// scripts/events.js — datepicker + JSON events + RSVP validate + Add to Calendar
let allEvents = [];

function toISODate(d){ return d.toISOString().slice(0,10); }

function makeICS(ev){
  // Minimal ICS file content (UTC naive)
  const dt = ev.date.replace(/-/g,'') + 'T' + ev.time.replace(':','') + '00';
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Weekly Fitness//EN','BEGIN:VEVENT',
    `UID:${crypto.randomUUID()}`,
    `DTSTAMP:${dt}Z`,
    `DTSTART:${dt}Z`,
    `SUMMARY:${ev.title}`,
    `LOCATION:${ev.location}`,
    `DESCRIPTION:${ev.details||''}`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], {type:'text/calendar'});
  return URL.createObjectURL(blob);
}

function render(list){
  const wrap = document.getElementById('event-list');
  const none = document.getElementById('no-events');
  const sel = document.getElementById('revent');
  wrap.innerHTML = '';
  sel.innerHTML = '<option value="">Select an event…</option>';

  if (!list.length){ none.style.display='block'; return; }
  none.style.display='none';

  list.forEach(ev=>{
    const card = document.createElement('article');
    card.className='card';
    const ics = makeICS(ev);
    card.innerHTML = `
      <h3>${ev.title}</h3>
      <p class="muted">${ev.date} • ${ev.time} — ${ev.location}</p>
      <p>${ev.details||''}</p>
      <p><a class="btn" href="${ics}" download="${ev.title.replaceAll(' ','_')}.ics">Add to Calendar</a></p>
    `;
    wrap.appendChild(card);

    const opt = document.createElement('option');
    opt.value = ev.id;
    opt.textContent = `${ev.date} ${ev.time} — ${ev.title}`;
    sel.appendChild(opt);
  });
}

(async () => {
  try{
    allEvents = await loadJSON('data/events.json');
  }catch(e){
    document.getElementById('event-list').innerHTML = '<p class="error">Failed to load events.</p>';
    return;
  }

  // init datepicker
  $("#pick").datepicker({
    onSelect: (dateText) => {
      const d = new Date(dateText);
      const iso = toISODate(d);
      const list = allEvents.filter(e => e.date === iso);
      render(list);
    }
  });

  // Default: show all upcoming (next 10)
  const today = toISODate(new Date());
  const upcoming = allEvents.filter(e => e.date >= today).slice(0,10);
  render(upcoming);

  // RSVP form validation (client-side only)
  const f = document.getElementById('rsvpForm');
  f.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('rname');
    const email = document.getElementById('remail');
    const eventSel = document.getElementById('revent');
    const err = document.getElementById('rerr');

    err.textContent = '';
    if (!name.value.trim() || name.value.length < 2){ err.textContent='Enter your name.'; return; }
    if (!email.checkValidity()){ err.textContent='Use your UNCC/Charlotte email.'; return; }
    if (!eventSel.value){ err.textContent='Choose an event.'; return; }

    showToast('RSVP received (demo) ✅');
    f.reset();
  });
})();
