// Shared by / and /ru/. Page-specific strings come from data-* on <body>.
(() => {
  const body = document.body, t = body.dataset;
  const ru = document.documentElement.lang === 'ru';

  // Which device is this? A phone/tablet can't run the app, so it gets "send to my computer".
  const ua = navigator.userAgent, uad = navigator.userAgentData;
  const plat = (uad && uad.platform) || navigator.platform || '';
  const phone = (uad && uad.mobile) || /Android|iPhone|iPad|iPod|Mobi/i.test(ua) ||
    (/Mac/.test(plat) && navigator.maxTouchPoints > 1); // iPadOS reports itself as a Mac
  const os = phone ? 'phone'
    : /Win/i.test(plat) ? 'windows'
    : /Mac/i.test(plat) ? 'mac'
    : /Linux|X11/i.test(plat) && !/CrOS/.test(ua) ? 'linux'
    : '';
  document.documentElement.dataset.os = os || 'other';

  // Hero: keep the visitor's platform solid and first, tone the others down.
  const hero = document.querySelector('.hero .pair');
  if (hero && os) {
    hero.querySelectorAll('[data-os]').forEach(b => {
      b.style.transition = 'none'; // no fade from solid on load
      b.classList.toggle('ghost', b.dataset.os !== os);
      requestAnimationFrame(() => requestAnimationFrame(() => { b.style.transition = ''; }));
    });
    const mine = hero.querySelector(`[data-os="${os}"]`);
    if (mine) hero.prepend(mine);
  }
  const phoneBox = document.querySelector('.phone');
  if (phoneBox && os === 'phone') phoneBox.hidden = false;

  // Demo recording (media/demo): a computer sees its own platform with a caption; phones and
  // unknown systems get platform tabs. It downloads once on screen and pauses off screen; with
  // reduced motion or Data Saver it shows the poster, with controls to play it by choice.
  const demo = document.querySelector('.demo');
  const video = demo && demo.querySelector('video');
  const bar = demo && demo.querySelector('.tabs'), cap = demo && demo.querySelector('.demo-caption');
  const toggle = demo && demo.querySelector('.demo-toggle');
  if (video && bar && cap && toggle) {
    const lang = ru ? 'ru' : 'en';
    // The current recording and poster names; % is the language. A new cut gets a new name (media/demo/README.md).
    const REC = {
      windows: { name: 'Windows', file: 'windows-%-3', poster: 'windows-%-3', ratio: '16 / 9' },
      mac: { name: 'macOS', file: 'mac-%', poster: 'mac-%', ratio: '16 / 10' },
      omarchy: { name: 'Omarchy', file: 'omarchy-%-2', poster: 'omarchy-%', ratio: '1920 / 1060' },
    };
    const fill = (s, map) => s.replace(/\{(\w+)\}/g, (m, k) => map[k]);
    const mine = os === 'mac' || (os === 'phone' && /iPhone|iPad|iPod|Mac/.test(ua)) ? 'mac'
      : os === 'linux' ? 'omarchy' : 'windows';
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !!(navigator.connection && navigator.connection.saveData);
    if (still) video.controls = true;
    let current = mine, active = false, held = false; // held: paused by the visitor, stays paused
    // Pause button (looping motion needs one); native controls replace it when they are on.
    const ICON = {
      play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4 2.5v11L13 8z"/></svg>',
      pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z"/></svg>',
    };
    const icon = () => {
      const k = video.paused ? 'play' : 'pause';
      toggle.innerHTML = ICON[k];
      toggle.setAttribute('aria-label', toggle.dataset[k]);
    };
    // Autoplay refused (e.g. iOS Low Power Mode): native controls instead. An AbortError only means
    // a pause or a new src interrupted the pending play, which is expected.
    const play = () => video.play().catch(e => {
      if (e.name !== 'NotAllowedError') return;
      const focused = document.activeElement === toggle;
      video.controls = true;
      toggle.hidden = true;
      if (focused) video.focus();
    });
    const load = () => {
      const src = `/media/demo/${REC[current].file.replace('%', lang)}.mp4`;
      if (!video.src.endsWith(src)) video.src = src;
    };
    video.addEventListener('play', icon);
    video.addEventListener('pause', icon);
    toggle.addEventListener('click', () => {
      held = !video.paused;
      if (held) video.pause(); else { load(); play(); }
    });
    toggle.hidden = still;
    icon();
    const set = id => {
      current = id;
      const r = REC[id];
      video.style.aspectRatio = r.ratio;
      video.poster = `/media/demo/${r.poster.replace('%', lang)}.webp`;
      video.setAttribute('aria-label', fill(video.dataset.label, { name: r.name }));
      bar.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b.dataset.demo === id));
      if (!active) return;
      load();
      if (!still && !held) play();
    };
    if (os === 'windows' || os === 'mac' || os === 'linux') {
      const [a, b] = Object.keys(REC).filter(id => id !== mine).map(id => REC[id].name);
      const link = document.createElement('a');
      link.href = '#install';
      link.textContent = fill(cap.dataset.also, { a, b });
      cap.append(fill(cap.dataset.text, { name: REC[mine].name }) + ' ', link);
      cap.hidden = false;
    } else {
      bar.hidden = false;
      bar.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { held = false; set(b.dataset.demo); }));
    }
    set(mine);
    const run = on => { active = on; if (on) set(current); else video.pause(); };
    // Without autoplay the src goes on at once (preload="none" keeps it from downloading), so play always works.
    if (still || !('IntersectionObserver' in window)) run(true);
    else new IntersectionObserver(entries => run(entries[entries.length - 1].isIntersecting), { threshold: 0.3 }).observe(video);
  }

  // Microsoft Store attribution: ?utm_source= / ?ref= (or the referring site) becomes the
  // Store campaign ID, so Partner Center → Acquisitions shows installs per channel.
  const q = new URLSearchParams(location.search);
  let src = q.get('utm_source') || q.get('ref') || '';
  if (!src && document.referrer) {
    try {
      const h = new URL(document.referrer).hostname.replace(/^www\./, '');
      if (h && h !== location.hostname) src = h;
    } catch (e) {}
  }
  src = src.toLowerCase().replace(/[^a-z0-9._-]+/g, '').slice(0, 60);
  const cid = ['site', ru && 'ru', src].filter(Boolean).join('-');
  document.querySelectorAll('a[data-store]').forEach(a => {
    const u = new URL(a.href);
    u.searchParams.set('cid', cid);
    a.href = u.toString();
  });

  // Copy buttons.
  const flash = (b, msg) => {
    const label = b.querySelector('span') || b;
    if (!label.dataset.text) label.dataset.text = label.textContent;
    clearTimeout(b._t);
    if (!b.style.minWidth) b.style.minWidth = b.offsetWidth + 'px';
    label.textContent = msg;
    b._t = setTimeout(() => { label.textContent = label.dataset.text; b.style.minWidth = ''; }, 1600);
  };
  const copy = (b, text) => (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
    .then(() => flash(b, t.copied || 'Copied'), () => flash(b, t.copyFail || 'Select the text to copy'));
  document.querySelectorAll('[data-copy]').forEach(b =>
    b.addEventListener('click', () => copy(b, b.closest('.panel').querySelector('pre').textContent)));

  // Phone: send the page to yourself (share sheet, or an email as a fallback).
  const link = location.origin + location.pathname + '?ref=phone';
  document.querySelectorAll('[data-copylink]').forEach(b => b.addEventListener('click', () => copy(b, link)));
  document.querySelectorAll('[data-send]').forEach(b => b.addEventListener('click', () => {
    const title = 'Museum Wallpapers', text = t.shareText || '';
    if (navigator.share) {
      navigator.share({ title, text, url: link }).catch(() => {});
    } else {
      location.href = 'mailto:?subject=' + encodeURIComponent(title) +
        '&body=' + encodeURIComponent((text ? text + '\n\n' : '') + link);
    }
  }));
})();
