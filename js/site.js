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

  // Platform tabs (demo video, card screenshot) start on the visitor's platform; Windows otherwise.
  const mine = os === 'mac' || (os === 'phone' && /iPhone|iPad|iPod|Mac/.test(ua)) ? 'mac'
    : os === 'linux' ? 'omarchy' : 'windows';

  // Card screenshot.
  const tabs = document.querySelectorAll('.shots .tabs button');
  const show = id => {
    tabs.forEach(b => b.setAttribute('aria-selected', b.dataset.shot === id));
    document.querySelectorAll('.card-shot img').forEach(i => i.hidden = i.dataset.shot !== id);
  };
  tabs.forEach(b => b.addEventListener('click', () => show(b.dataset.shot)));
  show(mine);

  // Demo video: only the visible tab's recording loads, once the section is near, and it
  // pauses off screen. Reduced motion or Data Saver: the poster, with controls to play it by choice.
  const video = document.querySelector('.demo-frame video');
  if (video) {
    const dtabs = document.querySelectorAll('[data-demo]');
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches || !!(navigator.connection && navigator.connection.saveData);
    let current = mine, near = !('IntersectionObserver' in window), seen = false;
    if (still) { video.removeAttribute('autoplay'); video.autoplay = false; video.controls = true; }
    const load = () => {
      const base = `/media/demo/${current}-${video.dataset.lang}`;
      video.poster = base + '.webp';
      if (!near) return;
      if (!video.src.endsWith(base + '.mp4')) video.src = base + '.mp4';
      if (!still && seen) video.play().catch(() => {});
    };
    const pick = id => {
      current = id;
      dtabs.forEach(b => b.setAttribute('aria-selected', b.dataset.demo === id));
      load();
    };
    dtabs.forEach(b => b.addEventListener('click', () => pick(b.dataset.demo)));
    if (near) seen = true;
    else new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && !near) near = true;
      if (seen) load(); else video.pause();
    }, { rootMargin: '200px 0px' }).observe(video);
    pick(current);
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
