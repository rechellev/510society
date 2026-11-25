/* 510 Society · site script */
(function () {
  const nav = document.querySelector('.nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  const burger = document.querySelector('.burger');
  const links = document.querySelector('.nav-links');
  if (burger) burger.addEventListener('click', () => links.classList.toggle('open'));

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.1 });
  const observe = () => document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
  observe();

  // ---------- events (from data/events.json, synced from Sweatpals) ----------
  const SP = 'https://sweatpals.com/host/510society_';
  const IMG = '';
  const ART = [
    [/tennis|tenny|courtside/i, ['tennis-solo.jpg', 'tennis-serve.jpg', 'tennis-net.jpg'], 'Tennis'],
    [/pickle/i, ['pickle-paddle.jpg', 'pickle-duo.jpg', 'pickle-pals.jpg'], 'Pickleball'],
    [/pilates|yoga|prosecco/i, ['pilates-room.jpg', 'pilates-wide.jpg', 'pilates-hall.jpg'], 'Movement'],
  ];
  const art = (ev, i) => {
    for (const [re, imgs, label] of ART) if (re.test(ev.title + ' ' + (ev.format || ''))) return { img: ev.image || IMG + imgs[i % imgs.length], label };
    return { img: ev.image || IMG + 'tennis-friends.jpg', label: '510 Original' };
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (d, o) => new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', ...o }).format(d);
  const when = (ev) => { const s = new Date(ev.start); let t = fmt(s, { weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' + fmt(s, { hour: 'numeric', minute: '2-digit' }); if (ev.end) t += ' to ' + fmt(new Date(ev.end), { hour: 'numeric', minute: '2-digit' }); return t; };
  const where = (ev) => [ev.venue, ev.city].filter(Boolean).join(', ');
  const status = (ev) => { const s = (ev.status || '').toLowerCase(); if (s.includes('sold')) return 'Sold out'; if (s.includes('wait')) return 'Waitlist'; if (s.includes('limited') || s.includes('almost')) return 'Limited'; return 'On sale'; };
  const price = (ev) => { if (ev.price == null || ev.price === '') return ''; const n = Number(ev.price); if (Number.isNaN(n)) return esc(ev.price); return n === 0 ? 'Free' : 'From $' + (Number.isInteger(n) ? n : n.toFixed(2)); };
  const cta = (ev) => status(ev) === 'Sold out' ? 'Join waitlist' : 'Get tickets';
  const gcal = (ev) => { const f = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); const end = ev.end || new Date(new Date(ev.start).getTime() + 3 * 3600e3).toISOString(); return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(ev.title + ' · 510 Society') + '&dates=' + f(ev.start) + '/' + f(end) + '&location=' + encodeURIComponent(where(ev)) + '&details=' + encodeURIComponent('Tickets: ' + (ev.url || SP)); };
  const chip = (s) => `<div class="date-chip"><div class="m">${fmt(s, { month: 'short' })}</div><div class="d">${fmt(s, { day: 'numeric' })}</div></div>`;

  const card = (ev, i) => { const a = art(ev, i); const s = new Date(ev.start); return `<article class="ev-card reveal d${i % 3}" data-cat="${esc(a.label)}">
      <div class="bg" style="background-image:url('${esc(a.img)}')"></div>${chip(s)}<span class="tag"><i></i>${status(ev)}</span>
      <h3>${esc(ev.title)}</h3>
      <div class="meta"><span>${when(ev)}</span>${where(ev) ? `<span>${esc(where(ev))}</span>` : ''}${ev.going ? `<span class="going">${esc(ev.going)} going</span>` : ''}</div>
      <div class="row"><span class="price">${price(ev)}</span><div class="acts"><a class="cal" href="${gcal(ev)}" target="_blank" rel="noopener">+ Calendar</a><a class="btn btn-blue btn-sm" href="${esc(ev.url || SP)}" target="_blank" rel="noopener">${cta(ev)} <span class="arr">→</span></a></div></div>
    </article>`; };

  const feature = (ev) => { const a = art(ev, 0); const s = new Date(ev.start); return `<div class="feature reveal">
      <div class="fi" style="background-image:url('${esc(a.img)}')">${chip(s)}</div>
      <div class="fb"><span class="tag" style="align-self:flex-start"><i></i>${status(ev)}</span><h3>${esc(ev.title)}</h3>
        ${ev.summary ? `<p>${esc(ev.summary)}</p>` : ''}
        <div class="meta"><span>${when(ev)}</span>${where(ev) ? `<span>${esc(where(ev))}</span>` : ''}${price(ev) ? `<span>${price(ev)}</span>` : ''}${ev.going ? `<span class="going">${esc(ev.going)} going</span>` : ''}</div>
        <div class="hero-btns" style="margin-top:6px"><a class="btn btn-blue" href="${esc(ev.url || SP)}" target="_blank" rel="noopener">${cta(ev)} <span class="arr">→</span></a><a class="tlink" href="${gcal(ev)}" target="_blank" rel="noopener">Add to calendar</a></div>
      </div></div>`; };

  const recap = () => `<div class="feature blue reveal">
      <div class="fi" style="background-image:url('${IMG}g-tt-lineup.jpg');background-position:50% 45%"></div>
      <div class="fb"><span class="eyebrow">Our biggest yet</span><h3>Tennis &amp; Tequila at Harbor Bay Club</h3>
        <p>Our biggest one yet: a country club takeover in Alameda with Maestro Dobel pouring courtside.</p>
        <div class="facts"><div><b>8</b><span>courts</span></div><div><b>Sep 13</b><span>2026 · Alameda</span></div></div>
        <a class="btn btn-green" style="align-self:flex-start" href="${SP}" target="_blank" rel="noopener">Get the next date first <span class="arr">→</span></a>
      </div></div>`;

  const empty = () => `<div class="empty glass reveal"><span class="tag"><i></i>New dates loading</span>
      <h3>The next one is almost here</h3><p>New dates drop to our list first, and they sell out fast.</p>
      <a class="btn btn-blue" href="${SP}" target="_blank" rel="noopener">Join the list <span class="arr">→</span></a></div>`;

  const featureEl = document.querySelector('[data-next-event]');
  const gridEl = document.querySelector('[data-events]');
  const filtersEl = document.querySelector('[data-filters]');
  if (featureEl || gridEl) {
    const none = () => {
      if (featureEl) featureEl.innerHTML = featureEl.hasAttribute('data-recap') ? recap() : empty();
      if (gridEl) gridEl.innerHTML = empty();
      if (filtersEl) filtersEl.style.display = 'none';
      observe();
    };
    fetch('events.json', { cache: 'no-store' }).then((r) => r.json()).then((d) => {
      const now = Date.now();
      const evs = (d.events || []).filter((e) => new Date(e.end || e.start).getTime() > now).sort((a, b) => new Date(a.start) - new Date(b.start));
      if (!evs.length) return none();
      if (featureEl) featureEl.innerHTML = feature(evs[0]);
      if (gridEl) gridEl.innerHTML = `<div class="ev-grid">${evs.map(card).join('')}</div>`;
      observe();
      if (filtersEl) filtersEl.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        filtersEl.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        gridEl.querySelectorAll('.ev-card').forEach((c) => { c.style.display = b.dataset.f === 'all' || c.dataset.cat === b.dataset.f ? '' : 'none'; });
      });
    }).catch(none);
  }

  // simple, cookie-free analytics events (GoatCounter)
  const track = (name, title) => { try { window.goatcounter && window.goatcounter.count && window.goatcounter.count({ path: name, title: title || name, event: true }); } catch (_) {} };
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    const h = a.href, page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
    if (/sweatpals\.com/.test(h)) track('click-sweatpals', 'Sweatpals click from ' + page);
    else if (/instagram\.com/.test(h)) track('click-instagram', 'Instagram click from ' + page);
    else if (/tiktok\.com/.test(h)) track('click-tiktok', 'TikTok click from ' + page);
    else if (/one-pager\.pdf/.test(h)) track('download-one-pager', 'One-pager download');
    else if (/^mailto:/.test(h)) track('click-email', 'Email click from ' + page);
  });

  // partner inquiry: sends straight to the 510 inbox, falls back to email if the service is down
  const form = document.querySelector('[data-partner-form]');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault(); const f = new FormData(form);
    if (f.get('_honey')) return;
    const msg = form.querySelector('.form-msg'), btn = form.querySelector('button[type=submit]');
    const data = { Name: f.get('name'), Brand: f.get('brand'), Email: f.get('email'), Category: f.get('category'), 'Interested in': f.get('tier'), 'Moment or quarter': f.get('window'), Message: f.get('message') || '',
      _subject: 'Partnership inquiry: ' + f.get('brand'), _replyto: f.get('email'), _template: 'table', _captcha: 'false' };
    btn.disabled = true; msg.textContent = 'Sending…'; msg.className = 'form-msg';
    try {
      const r = await fetch('https://formsubmit.co/ajax/' + form.dataset.to, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || String(j.success) === 'false') throw new Error(j.message || 'send failed');
      form.reset(); msg.textContent = "Thank you! Your inquiry is in. We'll reply within a few days."; msg.classList.add('ok'); track('partner-inquiry', 'Partner inquiry sent');
    } catch (err) {
      const body = Object.entries(data).filter(([k]) => !k.startsWith('_')).map(([k, v]) => k + ': ' + v).join('\n');
      msg.innerHTML = 'That didn’t go through. <a href="mailto:' + form.dataset.to + '?subject=' + encodeURIComponent(data._subject) + '&body=' + encodeURIComponent(body) + '">Send it by email instead</a>.'; msg.classList.add('err');
    } finally { btn.disabled = false; }
  });
  const yr = document.querySelector('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();

  // ---------- motion ----------
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  // headings rise in word by word
  if (!reduce) document.querySelectorAll('.sec-head .display, .statement .display, .split .display, .case .display').forEach((h) => {
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; if (/^\s+$/.test(w)) return frag.appendChild(document.createTextNode(w)); const o = document.createElement('span'); o.className = 'split-w'; const i = document.createElement('span'); i.textContent = w; o.appendChild(i); frag.appendChild(o); });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('script')) walk(n);
    });
    walk(h);
    h.querySelectorAll('.split-w > span').forEach((s, k) => { s.style.transitionDelay = (k * 0.06) + 's'; });
    const o = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { h.classList.add('split-on'); o.disconnect(); } }), { threshold: 0.3 });
    o.observe(h);
  });

  // stats count up
  document.querySelectorAll('.bs .n, .hero-stats b, .rm-head b').forEach((el) => {
    const m = el.textContent.trim().match(/^(~?)([\d.,]+)(.*)$/); if (!m || reduce) return;
    const pre = m[1], target = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length, comma = m[2].includes(','), suf = m[3];
    const show = (v) => pre + (comma ? Math.round(v).toLocaleString('en-US') : v.toFixed(dec)) + suf;
    const o = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return; o.disconnect(); const t0 = performance.now();
      const step = (t) => { const p = Math.min(1, (t - t0) / 1400); el.textContent = show(target * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }), { threshold: 0.4 });
    o.observe(el);
  });

  if (reduce) return;
  const hero = document.querySelector('.hero'), heroBg = hero && hero.querySelector('.hero-bg'), heroWrap = hero && hero.querySelector('.wrap');
  const par = [...document.querySelectorAll('[data-speed]')];
  let ticking = false;
  const frame = () => {
    ticking = false; const vh = window.innerHeight, y = window.scrollY;
    if (heroBg) {
      const p = Math.min(1, Math.max(0, y / vh));
      heroBg.style.transform = `scale(${1.03 - p * 0.03}) translateY(${p * 6}%)`;
      if (heroWrap) { heroWrap.style.opacity = String(1 - p * 1.2); heroWrap.style.transform = `translateY(${-p * 50}px)`; }
    }
    par.forEach((el) => { const r = el.getBoundingClientRect(); el.style.translate = `0 ${((r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed)).toFixed(1)}px`; });
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();

  if (!fine) return;
  const cur = document.createElement('div'); cur.className = 'cursor'; cur.innerHTML = '<span></span>'; document.body.appendChild(cur);
  let cx = 0, cy = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); const t = e.target.closest('[data-cursor]'); cur.classList.toggle('big', !!t); cur.firstChild.textContent = t ? t.dataset.cursor : ''; });
  document.addEventListener('pointerleave', () => cur.classList.remove('on'));
  const loop = () => { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`; requestAnimationFrame(loop); };
  loop();
  document.querySelectorAll('.btn').forEach((b) => {
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.15}px, ${(e.clientY - r.top - r.height / 2) * 0.22}px)`; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
})();

// home hero slideshow
(() => {
  const slides = document.querySelectorAll('.hero-slides .slide'), dots = document.querySelectorAll('.slide-dots i');
  if (slides.length < 2) return;
  let i = 0;
  setInterval(() => {
    slides[i].classList.remove('on'); dots[i] && dots[i].classList.remove('on');
    i = (i + 1) % slides.length;
    slides[i].classList.add('on'); dots[i] && dots[i].classList.add('on');
  }, 5500);
})();

// horizontal timeline: arrows, progress line, dots light as they enter
(() => {
  const w = document.querySelector('.tlh'); if (!w) return;
  const tr = w.querySelector('.tlh-track'), items = [...tr.querySelectorAll('.tlh-i')], prev = w.querySelector('.prev'), next = w.querySelector('.next');
  const step = () => items[0].getBoundingClientRect().width * 2;
  prev.onclick = () => tr.scrollBy({ left: -step() }); next.onclick = () => tr.scrollBy({ left: step() });
  const tick = () => {
    tr.style.setProperty('--tw', (items[items.length - 1].offsetLeft + 20 - items[0].offsetLeft) + 'px');
    const max = tr.scrollWidth - tr.clientWidth || 1, f = tr.scrollLeft / max;
    tr.style.setProperty('--p', Math.max(8, f * 100) + '%');
    const edge = tr.getBoundingClientRect().right - 60;
    items.forEach(it => it.classList.toggle('hit', it.getBoundingClientRect().left < edge));
    prev.disabled = tr.scrollLeft < 5; next.disabled = tr.scrollLeft > max - 5;
  };
  tr.addEventListener('scroll', tick, { passive: true }); addEventListener('resize', tick); setTimeout(tick, 300); tick();
})();

// Sweatpals rail: glides on its own, loops forever, pauses on hover/touch, still draggable
document.querySelectorAll('.spx-rail').forEach(r => {
  const items = [...r.children];
  items.forEach(n => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; r.appendChild(c); });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused = false, down = false, x0 = 0, s0 = 0, moved = false, pos = 0, last = 0;
  const half = () => r.scrollWidth / 2;
  const loop = (t) => {
    const dt = last ? Math.min(t - last, 50) : 16; last = t;
    if (!paused && !down && !reduce) { pos += dt * 0.045; if (pos >= half()) pos -= half(); r.scrollLeft = pos; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  r.addEventListener('mouseenter', () => (paused = true));
  r.addEventListener('mouseleave', () => (paused = false));
  r.addEventListener('touchstart', () => { paused = true; }, { passive: true });
  r.addEventListener('touchend', () => { pos = r.scrollLeft; setTimeout(() => (paused = false), 2500); });
  r.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = r.scrollLeft; });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; r.scrollLeft = s0 - dx; });
  addEventListener('pointerup', () => { if (!down) return; down = false; pos = r.scrollLeft % half(); });
  r.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);
});

// ---------- living pitch deck: everything below renders from data/events.json (synced from Sweatpals) ----------
(() => {
  if (!document.querySelector('[data-live-chart],[data-live-stats]')) return;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (n) => Number(n || 0).toLocaleString('en-US');
  const fmt = (d, o) => new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', ...o }).format(new Date(d));
  const FORMATS = [[/henny|tenny/i, '#D92F26', 'Henny & Tenny'], [/pickle/i, '#F08A3C', 'Pickleball'], [/yoga/i, '#61C5F4', 'Trap Yoga'], [/pilates/i, '#F28DB2', 'Pilates'], [/tennis/i, '#2F8F5B', 'Tennis'], [/./, '#E2B26E', 'Socials']];
  const fmtOf = (t) => FORMATS.find(([re]) => re.test(t));
  const SP = 'https://sweatpals.com/host/510society_';

  Promise.all([fetch('events.json', { cache: 'no-store' }).then((r) => r.json()), fetch('partner-notes.json', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({}))]).then(([d, notes]) => {
    (d.past || []).forEach((e) => { (notes[e.date] || []).forEach((n) => {
      const hit = n.match && e.sponsors.find((s) => s.name.toLowerCase().includes(n.match.toLowerCase()));
      if (hit) { hit.name = n.name || hit.name; hit.what = n.what || hit.what; } else e.sponsors.push({ name: n.name, what: n.what, url: n.url || null });
    }); });
    const past = d.past || [], up = d.events || [], st = d.stats || {};
    // hero numbers
    document.querySelectorAll('[data-live-stats] [data-k]').forEach((b) => { const v = st[b.dataset.k]; if (v != null) b.textContent = num(v); });
    const pill = document.querySelector('[data-live-updated]');
    if (pill && d.updated) pill.innerHTML = `<i></i>Live from Sweatpals · updated ${fmt(d.updated, { month: 'short', day: 'numeric' })}`;

    // just wrapped
    const L = past[0], latest = document.querySelector('[data-live-latest]');
    if (latest && L) latest.innerHTML = `${L.image ? `<div class="ll-img"><img class="ll-bg" src="${esc(L.image)}" alt=""><img class="ll-fg" src="${esc(L.image)}" alt="${esc(L.title)} flyer" loading="lazy"></div>` : ''}
      <div class="ll-b"><span class="ll-tag"><span class="lp-dot"></span>Just wrapped</span><h3>${esc(L.title)}</h3>
        <div class="ll-meta">${fmt(L.start, { month: 'long', day: 'numeric', year: 'numeric' })}${L.venue ? ' · ' + esc(L.venue) : ''}</div>
        ${L.summary ? `<p class="ll-sum">${esc(L.summary.replace(/^(Join\s+\S+\s+Society\s*)/i,'').split(/(?<=[.!?])\s/).slice(0,2).join(' '))}</p>` : ''}
        ${L.sponsors?.length ? `<div class="ll-sp">${L.sponsors.slice(0, 6).map((s) => `<span>${esc(s.name)}</span>`).join('')}</div>` : ''}
        <a class="tlink" href="${esc(L.url)}" target="_blank" rel="noopener">See it on Sweatpals ↗</a></div>`;

    // every event, no per-event counts
    const chart = document.querySelector('[data-live-chart]');
    if (chart && past.length) {
      const rows = past.slice(0, 12);
      chart.className = 'lc-grid';
      chart.innerHTML = rows.map((e) => { const [, c] = fmtOf(e.title); return `<a class="lc-ev" href="${esc(e.url)}" target="_blank" rel="noopener" style="--c:${c}">${e.image ? `<img src="${esc(e.image)}" alt="" loading="lazy">` : ''}<span class="lc-t"><small>${fmt(e.start, { month: 'short', year: 'numeric' })}</small>${esc(e.title)}</span></a>`; }).join('');
      const used = [...new Set(rows.map((e) => fmtOf(e.title)[2]))];
      const key = document.querySelector('[data-live-key]');
      if (key) key.innerHTML = FORMATS.filter((f) => used.includes(f[2])).map((f) => `<span><i style="background:${f[1]}"></i>${esc(f[2])}</span>`).join('');
    }
    const big = past.reduce((a, e) => (e.going > (a?.going || 0) ? e : a), null);
    const strip = document.querySelector('[data-live-strip]');
    if (strip) strip.innerHTML = [[big ? num(Math.floor(big.going / 10) * 10) + '+' : '', big ? 'Guests at ' + esc(big.title) : ''], [num(past.reduce((n, e) => n + e.sponsors.length, 0)), 'Brand and vendor partners']].filter((x) => x[0]).map(([b, l]) => `<div><b>${b}</b><span>${l}</span></div>`).join('');

    // next up
    const nx = document.querySelector('[data-live-next]');
    if (nx) nx.innerHTML = up.length
      ? `<div><h3>Next up: ${up.length} event${up.length > 1 ? 's' : ''} open for partners</h3><p>Live on Sweatpals now. Slots fill as tickets sell.</p></div>
         <div class="nx-list">${up.slice(0, 4).map((e) => `<a class="nx" href="${esc(e.url)}" target="_blank" rel="noopener"><b>${esc(e.title)}</b>${fmt(e.start, { month: 'short', day: 'numeric' })}${e.going ? ' · ' + num(e.going) + ' going' : ''}</a>`).join('')}</div>`
      : `<div><h3>The next drop is being planned</h3><p>Partners get first look before tickets go live. Lock in your quarter now.</p></div>
         <div class="nx-list"><a class="btn btn-green" href="#roadmap">See the 2027 roadmap <span class="arr">→</span></a><a class="btn btn-glass" style="color:var(--green);border-color:rgba(20,56,43,.25)" href="#connect">Claim a moment</a></div>`;

    // activations, grouped by event
    const ag = document.querySelector('[data-live-acts]');
    if (ag) {
      const evs = past.filter((e) => (e.sponsors || []).length).slice(0, 6);
      ag.className = 'ev-acts';
      ag.innerHTML = evs.map((e, k) => { const [, c] = fmtOf(e.title); const rich = e.sponsors.filter((s) => s.what), plain = e.sponsors.filter((s) => !s.what);
        return `<div class="ea reveal in d${k % 3}" style="--c:${c}"><div class="ea-h">${e.image ? `<img src="${esc(e.image)}" alt="" loading="lazy">` : ''}<div><span class="ev">${fmt(e.start, { month: 'short', day: 'numeric', year: 'numeric' })}</span><h4>${esc(e.title)}</h4><span class="n">${e.sponsors.length} partner${e.sponsors.length > 1 ? 's' : ''}</span></div></div>
          ${rich.length ? `<ul>${rich.slice(0, 5).map((s) => `<li><span><b>${esc(s.name)}</b> · ${esc(s.what.replace(/\s*sponsored by .*$/i, ""))}</span></li>`).join('')}${rich.length > 5 ? `<li class="more"><span>+ ${rich.length - 5} more partners</span></li>` : ''}</ul>` : ''}
          ${plain.length ? `<div class="chips">${plain.map((s) => `<span>${esc(s.name)}</span>`).join('')}</div>` : ''}</div>`; }).join('');
    }
  }).catch(() => {});
})();

// white caps headings: one blue sweep across the whole line, painted word by word
(() => {
  const SEL = '.hero-hed, .sec:not(.light):not(.blue) .display, .cta .display, .statement .display';
  const paint = () => document.querySelectorAll(SEL).forEach((h) => {
    if (h.closest('.light,.blue,.founder,.connect-letter,.live-next')) return;
    const words = h.querySelectorAll('.split-w');
    if (!words.length) { h.classList.add('sweep-el'); return; }
    h.classList.add('sweep');
    const r = h.getBoundingClientRect(); h.style.setProperty('--hw', Math.max(r.width, 1) + 'px');
    words.forEach((w) => w.firstElementChild && w.firstElementChild.style.setProperty('--wx', (w.getBoundingClientRect().left - r.left) + 'px'));
  });
  addEventListener('load', paint); addEventListener('resize', paint); setTimeout(paint, 400); setTimeout(paint, 1600);
})();

// word bands auto-scroll via CSS (.band-loop)


// photo album lightbox
(() => {
  const albums = document.querySelectorAll('.alb'); if (!albums.length) return;
  const lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog');
  lb.innerHTML = '<div class="lb-top"><div><span class="when"></span><h3></h3></div><div class="lb-acts"><a class="btn btn-blue lb-sp" target="_blank" rel="noopener">See the event on Sweatpals <span class="arr">↗</span></a><button class="lb-x" aria-label="Close">×</button></div></div><div class="lb-main"><button class="lb-nav lb-prev" aria-label="Previous">←</button><img alt=""><button class="lb-nav lb-next" aria-label="Next">→</button></div><div class="lb-strip"></div>';
  document.body.appendChild(lb);
  const img = lb.querySelector('.lb-main img'), strip = lb.querySelector('.lb-strip'), sp = lb.querySelector('.lb-sp');
  let list = [], k = 0;
  const show = (n) => { k = (n + list.length) % list.length; img.src = list[k]; strip.querySelectorAll('img').forEach((t, i) => t.classList.toggle('on', i === k)); const on = strip.children[k]; on && on.scrollIntoView({ inline: 'center', block: 'nearest' }); };
  albums.forEach(a => a.addEventListener('click', () => {
    list = a.dataset.photos.split('|'); lb.querySelector('.when').textContent = a.dataset.when; lb.querySelector('h3').textContent = a.dataset.title;
    sp.style.display = a.dataset.url ? '' : 'none'; if (a.dataset.url) sp.href = a.dataset.url;
    strip.innerHTML = list.map(u => `<img src="${u}" alt="">`).join(''); strip.querySelectorAll('img').forEach((t, i) => t.onclick = () => show(i));
    lb.querySelectorAll('.lb-nav').forEach(b => b.style.display = list.length > 1 ? '' : 'none');
    lb.classList.add('on'); document.body.style.overflow = 'hidden'; show(0);
  }));
  const close = () => { lb.classList.remove('on'); document.body.style.overflow = ''; };
  lb.querySelector('.lb-x').onclick = close; lb.querySelector('.lb-prev').onclick = () => show(k - 1); lb.querySelector('.lb-next').onclick = () => show(k + 1);
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-main')) close(); });
  addEventListener('keydown', e => { if (!lb.classList.contains('on')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(k + 1); if (e.key === 'ArrowLeft') show(k - 1); });
})();


// receipts: ticker-counter numbers, live from Sweatpals data
(() => {
  const box = document.querySelector('[data-live-receipts]'); if (!box) return;
  const ticks = [...box.querySelectorAll('.tick')];
  const fmt = (n, el) => (el.dataset.dec ? n.toFixed(+el.dataset.dec) : Math.round(n).toLocaleString('en-US')) + (el.dataset.suf || '') + (el.dataset.plus || '');
  const run = () => ticks.forEach(el => {
    const to = +el.dataset.to, t0 = performance.now(), dur = 1800;
    const f = (t) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(to * e, el); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
  fetch('events.json', { cache: 'no-store' }).then(r => r.json()).then(d => {
    const st = d.stats || {};
    ticks.forEach(el => { const k = el.dataset.k; if (k && st[k]) { let v = st[k]; if (k === 'rsvps') v = Math.floor(v / 100) * 100; el.dataset.to = v; } });
  }).catch(() => {}).finally(() => {
    const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { run(); io.disconnect(); } }, { threshold: .4 });
    io.observe(box);
  });
})();

// badge: cycle the sport balls
document.querySelectorAll('.core-balls').forEach(c => { const im = c.querySelectorAll('img'); let i = 0; setInterval(() => { im[i].classList.remove('on'); i = (i + 1) % im.length; im[i].classList.add('on'); }, 1800); });


// manifesto: every line runs edge to edge; photo words stretch to fill, no gaps
(() => {
  const mf = document.querySelector('.mf'); if (!mf) return;
  const lines = [...mf.querySelectorAll('.mfl')];
  const fit = () => {
    mf.style.removeProperty('font-size');
    lines.forEach(l => { l.style.fontSize = ''; l.querySelectorAll('.mfp').forEach(w => { w.style.setProperty('--sx', 1); w.style.marginRight = '0px'; }); });
    const W = mf.clientWidth * 0.985;
    const base = parseFloat(getComputedStyle(mf).fontSize);
    const widest = Math.max(...lines.map(l => l.getBoundingClientRect().width));
    mf.style.setProperty('font-size', (base * W / widest) + 'px', 'important');
    lines.forEach(l => {
      const w = l.querySelector('.mfp'); const lw = l.getBoundingClientRect().width;
      if (!w) { l.style.fontSize = (W / lw) + 'em'; return; }
      const ww = w.getBoundingClientRect().width;
      const sx = Math.max(.75, Math.min(1.9, (ww + (W - lw)) / ww));
      w.style.setProperty('--sx', sx); w.style.marginRight = (ww * (sx - 1)) + 'px';
    });
  };
  addEventListener('load', fit); addEventListener('resize', fit); document.fonts && document.fonts.ready.then(fit); fit();
})();

// timeline auto-scroll on desktop (pauses on hover, loops)
(() => {
  const tr = document.querySelector('.tlh-track'); if (!tr || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let paused = false, last = 0, hold = 0;
  tr.addEventListener('mouseenter', () => paused = true); tr.addEventListener('mouseleave', () => paused = false);
  tr.closest('.tlh').querySelectorAll('.tlh-nav').forEach(b => b.addEventListener('click', () => { hold = performance.now() + 4000; }));
  const loop = (t) => {
    const dt = last ? Math.min(t - last, 50) : 16; last = t;
    if (innerWidth > 700 && !paused && t > hold) {
      tr.style.scrollBehavior = 'auto'; tr.style.scrollSnapType = 'none';
      const max = tr.scrollWidth - tr.clientWidth;
      if (tr.scrollLeft >= max - 1) { hold = t + 2500; tr.style.scrollBehavior = 'smooth'; tr.scrollLeft = 0; }
      else tr.scrollLeft += dt * 0.04;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();

// mobile join button appears only after the header, so it never covers the header buttons
(() => {
  const b = document.querySelector('.sticky-cta'), h = document.querySelector('.hero'); if (!b || !h) return;
  const t = () => b.classList.toggle('show', h.getBoundingClientRect().bottom < 80);
  addEventListener('scroll', t, { passive: true }); t();
})();
