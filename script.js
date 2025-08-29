 

(async function init() {
  const els = {
    avatar: document.getElementById('avatar'),
    name: document.getElementById('name'),
    nameFooter: document.getElementById('name-footer'),
    pageTitle: document.getElementById('page-title'),
    bio: document.getElementById('bio'),
    discord: document.getElementById('discord-username'),
    discordNote: document.getElementById('discord-note'),
    copyDiscord: document.getElementById('copy-discord'),
    links: document.getElementById('links'),
    year: document.getElementById('year'),
    themeColorMeta: document.getElementById('theme-color-meta'),
  // routing & pages
  homeSection: document.getElementById('home-section'),
  contactSection: document.getElementById('contact-section'),
  infoSection: document.getElementById('info-section'),
  brand: document.getElementById('brand'),
  contactLink: document.getElementById('contact-link'),
  contactDiscord: document.getElementById('contact-discord'),
  contactEmailWrap: document.getElementById('contact-email-wrap'),
  contactEmail: document.getElementById('contact-email'),
  infoBio: document.getElementById('info-bio'),
  products: document.getElementById('products'),
  // audio
  audio: document.getElementById('bg-audio'),
  musicToggle: document.getElementById('music-toggle'),
  };

  const defaults = {
    name: 'Your Name',
    bio: 'A short bio about you.',
    discord: 'yourdiscord',
    avatar: 'assets/avatar.jpg',
    accentColor: '#7c3aed',
    links: [
      { label: 'GitHub', url: 'https://github.com/' },
    ],
  };

  let data = defaults;
  try {
    const res = await fetch('data.json', { cache: 'no-store' });
    if (res.ok) data = await res.json();
  } catch (_) {
    // keep defaults
  }

  const setVar = (k, v) => document.documentElement.style.setProperty(k, v);

  // Apply content
  els.avatar.src = data.avatar || defaults.avatar;
  els.avatar.alt = `${data.name || defaults.name}'s avatar`;
  els.name.textContent = data.name || defaults.name;
  els.nameFooter.textContent = data.name || defaults.name;
  if (els.brand) els.brand.textContent = data.name || defaults.name;
  els.pageTitle.textContent = (data.name ? `${data.name} — Profile` : 'My Profile');
  els.bio.textContent = data.bio || '';
  els.discord.textContent = data.discord ? `@${data.discord}` : '';
  els.year.textContent = new Date().getFullYear();

  const accent = data.accentColor || defaults.accentColor;
  setVar('--accent', accent);
  els.themeColorMeta?.setAttribute('content', accent);

  // Copy Discord
  els.copyDiscord?.addEventListener('click', async () => {
    const text = data.discord || defaults.discord;
    try {
      await navigator.clipboard.writeText(text);
      toast('Discord username copied!');
    } catch {
      toast('Could not copy. Long-press to select.');
    }
  });

  // Links
  els.links.innerHTML = '';
  const links = Array.isArray(data.links) ? data.links : [];
  if (links.length === 0) {
    const li = document.createElement('li');
    li.style.color = 'var(--muted)';
    li.textContent = 'No links yet.';
    els.links.appendChild(li);
  } else {
    for (const link of links) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'link';

      const icon = document.createElement('span');
      icon.className = 'icon';

      const favicon = document.createElement('img');
      try {
        const url = new URL(link.url);
        favicon.src = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
        favicon.alt = '';
      } catch {
        favicon.src = '';
        favicon.alt = '';
      }
      icon.appendChild(favicon);

      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = link.label || link.url;

      a.appendChild(icon);
      a.appendChild(label);
      li.appendChild(a);
      els.links.appendChild(li);
    }
  }

  // Optional Discord note for new username format
  if (data.discord && !data.discord.includes('#')) {
    els.discordNote.textContent = 'Owned By: xSync69';
  }

  // toast for UX feedback
  function toast(message) {
    const t = document.createElement('div');
    t.textContent = message;
    Object.assign(t.style, {
      position: 'fixed',
      left: '50%',
      bottom: '24px',
      transform: 'translateX(-50%)',
      background: 'color-mix(in oklab, var(--bg-2), white 0%)',
      border: '1px solid var(--border)',
      color: 'var(--text)',
      padding: '10px 14px',
      borderRadius: '10px',
      boxShadow: '0 10px 30px rgba(0,0,0,.2)',
      zIndex: 10,
      opacity: '0',
      transition: 'opacity .15s ease, transform .15s ease',
    });
    document.body.appendChild(t);
    requestAnimationFrame(() => {
      t.style.opacity = '1';
      t.style.transform = 'translateX(-50%) translateY(-4px)';
    });
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%)';
      setTimeout(() => t.remove(), 250);
    }, 1800);
  }
  // ===== end toast()

  // Contact & Info sections
  if (els.contactDiscord) els.contactDiscord.textContent = data.discord ? `@${data.discord}` : '';
  if (els.infoBio) els.infoBio.textContent = data.bio || '';
  if (els.contactEmailWrap) {
    const email = data.email || '';
    if (!email) {
      els.contactEmailWrap.style.display = 'none';
    } else {
      els.contactEmailWrap.style.display = '';
      els.contactEmail.textContent = email;
      els.contactEmail.href = `mailto:${email}`;
    }
  }

  // Theme toggle (persisted)
  const themeToggle = document.getElementById('theme-toggle');
  function applyTheme(t) {
    if (t === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
  }
  const saved = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(saved);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const cur = document.documentElement.classList.contains('light') ? 'light' : 'dark';
      const next = cur === 'light' ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  }

  // Products list on Info page
  if (els.products) {
    const products = Array.isArray(data.products) && data.products.length
      ? data.products
      : [
          { name: 'Custom Websites', description: 'Modern, responsive sites (landing pages, portfolios, small business) with clean code and fast performance.' },
          { name: 'Custom Discord Bots', description: 'Fully tailored bots with commands, moderation, auto-roles, logging, and APIs.' },
          { name: 'Python Scripts', description: 'Automation, data processing, scrapers, CLI tools, and utilities.' },
          { name: 'Web Automation Bots', description: 'Headless browser or API-driven automations with error handling and scheduling.' },
          { name: 'API Integrations', description: 'Connect your app to third-party APIs (Discord, Stripe, Twitch, YouTube, and more).' },
          { name: 'Bug Fixes & Refactors', description: 'Fix broken features, clean up code, and improve maintainability.' }
        ];
    els.products.innerHTML = '';
    for (const p of products) {
      const li = document.createElement('li');
      li.className = 'product-item';
      li.setAttribute('role','article');
      const title = document.createElement('div');
      title.className = 'product-name';
      title.textContent = p.name || String(p);
      li.appendChild(title);
      if (p.description) {
        const desc = document.createElement('div');
        desc.className = 'product-desc';
        desc.textContent = p.description;
        li.appendChild(desc);
      }
      els.products.appendChild(li);
    }
  }

  // Testimonials (from data.json if provided)
  const testimonialsEl = document.getElementById('testimonials');
  if (testimonialsEl) {
    const testItems = Array.isArray(data.testimonials) && data.testimonials.length ? data.testimonials : [
      { author: 'Alice', text: 'Great work, fast delivery.' },
      { author: 'Bob', text: 'Highly recommend for small businesses.' }
    ];
    testimonialsEl.innerHTML = '';
    for (const t of testItems) {
      const li = document.createElement('li');
      li.className = 'testimonial';
      li.innerHTML = `<strong>${t.author}</strong><div style="color:var(--muted);">${t.text}</div>`;
      testimonialsEl.appendChild(li);
    }
  }

  // 404 route handling
  const notFoundSection = document.getElementById('notfound-section');
  const originalShowRoute = showRoute;
  function showRouteWith404(hash) {
    const routesKeys = Object.keys(routes);
    if (routesKeys.includes(hash)) {
      originalShowRoute(hash);
      return;
    }
    // show 404
    for (const key in routes) { routes[key]?.setAttribute('hidden',''); }
    if (notFoundSection) notFoundSection.removeAttribute('hidden');
    els.pageTitle.textContent = (data.name ? `${data.name}` : 'Profile') + ' — Not Found';
  }
  window.removeEventListener('hashchange', () => showRoute(location.hash));
  window.addEventListener('hashchange', () => showRouteWith404(location.hash));
  showRouteWith404(location.hash || '#home');

  // Contact form handling
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const tsInput = document.getElementById('cf-ts');
    tsInput.value = Date.now();
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const payload = {};
      for (const [k,v] of formData.entries()) payload[k] = v;
      try {
        const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error('Failed');
        toast('Message sent!');
        contactForm.reset();
      } catch (_) { toast('Could not send. Try again later.'); }
    });
  }

  // Contact nav link
  if (els.contactLink) {
    const discordServer = (data.links || []).find(l => /discord\.gg|discord\.com\/invite/.test(l.url || ''))?.url;
    if (discordServer) {
      els.contactLink.href = discordServer;
      els.contactLink.target = '_blank';
      els.contactLink.rel = 'noopener noreferrer';
    } else {
      els.contactLink.href = '#contact';
      els.contactLink.removeAttribute('target');
      els.contactLink.removeAttribute('rel');
    }
  }

  // Simple hash router
  const routes = {
    '#home': els.homeSection,
    '#contact': els.contactSection,
    '#info': els.infoSection,
  };
  function showRoute(hash) {
    const target = routes[hash] || routes['#home'];
    for (const key in routes) {
      const el = routes[key];
      if (!el) continue;
      if (el === target) el.removeAttribute('hidden');
      else el.setAttribute('hidden', '');
    }
    const base = data.name ? `${data.name}` : 'Profile';
    const label = hash === '#contact' ? 'Contact' : hash === '#info' ? 'Info' : 'Home';
    els.pageTitle.textContent = `${base} — ${label}`;
  }
  window.addEventListener('hashchange', () => showRoute(location.hash));
  showRoute(location.hash || '#home');

  // Audio setup and autoplay attempt
  const audioSrc = data.audio?.src || '';
  if (audioSrc) {
    els.audio.src = audioSrc;
  try { els.audio.autoplay = true; } catch {}
  }
  let isPlaying = false;
  function updateMusicButton() {
    if (!els.musicToggle) return;
    els.musicToggle.textContent = isPlaying ? 'Pause Music' : 'Play Music';
    els.musicToggle.setAttribute('aria-pressed', String(isPlaying));
  }
  async function playAudio() {
    if (!els.audio?.src) return;
    try {
      await els.audio.play();
      isPlaying = true;
      localStorage.setItem('music-playing', '1');
      updateMusicButton();
    } catch (_) {
      // autoplay
    }
  }
  function pauseAudio() {
    if (!els.audio) return;
    els.audio.pause();
    isPlaying = false;
    localStorage.setItem('music-playing', '0');
    updateMusicButton();
  }
  els.musicToggle?.addEventListener('click', () => {
    if (!isPlaying) playAudio();
    else pauseAudio();
  });
  // Try to start music on load
  if (els.audio?.src) setTimeout(playAudio, 0);
  const kickstart = () => { playAudio(); window.removeEventListener('pointerdown', kickstart); };
  window.addEventListener('pointerdown', kickstart, { once: true });

  // Two-per-session logging: one on page load, one on consent
    // Logging with TTL cap (localStorage)
    const LOG_KEY = 'visit-log-cap';
    let LOG_TTL_MS = 24 * 60 * 60 * 1000; // default 24h
    const ttlVal = (data && data.logTTLHours) ?? undefined;
    const ttlNum = typeof ttlVal === 'string' ? parseFloat(ttlVal) : ttlVal;
    if (typeof ttlNum === 'number' && isFinite(ttlNum) && ttlNum > 0) {
      LOG_TTL_MS = ttlNum * 60 * 60 * 1000;
    }
    function now() { return Date.now(); }
    function readCap() {
      try {
        const raw = localStorage.getItem(LOG_KEY);
        if (!raw) return null;
        const obj = JSON.parse(raw);
        if (!obj || typeof obj !== 'object') return null;
        return { count: Number(obj.count) || 0, expiresAt: Number(obj.expiresAt) || 0 };
      } catch { return null; }
    }
    function writeCap(obj) {
      try { localStorage.setItem(LOG_KEY, JSON.stringify(obj)); } catch {}
    }
    function ensureCapWindow() {
      const cur = readCap();
      if (!cur || !cur.expiresAt || cur.expiresAt <= now()) {
        const fresh = { count: 0, expiresAt: now() + LOG_TTL_MS };
        writeCap(fresh);
        return fresh;
      }
      return cur;
    }
    async function logVisit(endpoint, event) {
      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event }),
          keepalive: true,
        });
      } catch {}
    }
    function logIfUnderLimit(endpoint, event) {
      if (!endpoint) return;
      const cap = ensureCapWindow();
      if (cap.count >= 2) return;
      cap.count += 1;
      writeCap(cap);
      return logVisit(endpoint, event);
    }
    if (data.logEndpoint) logIfUnderLimit(data.logEndpoint, 'page_load');

  
  async function askConsentAndSend(endpoint) {
    const backdrop = document.createElement('div');
    Object.assign(backdrop.style, {
      position: 'fixed', inset: '0', background: 'rgba(0,0,0,.35)', zIndex: 1000,
      display: 'grid', placeItems: 'center', padding: '20px'
    });
    const box = document.createElement('div');
    Object.assign(box.style, {
      background: 'color-mix(in oklab, var(--bg-2), white 0%)',
      border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '14px',
      padding: '18px', width: 'min(520px, 100%)', boxShadow: '0 24px 60px rgba(0,0,0,.35)'
    });
    const title = document.createElement('h3');
    title.textContent = 'Are You A Human?';
    title.style.margin = '0 0 8px 0';
    const msg = document.createElement('p');
    msg.textContent = 'Please Click The Box';
    msg.style.margin = '0 0 14px 0';
    const row = document.createElement('div');
    row.style.display = 'flex'; row.style.gap = '10px';
    const deny = document.createElement('button');
    deny.className = 'btn'; deny.textContent = 'No Im Not A Human';
    const allow = document.createElement('button');
    allow.className = 'btn'; allow.textContent = 'Yes I Am A Human';
    row.appendChild(deny); row.appendChild(allow);
    box.appendChild(title); box.appendChild(msg); box.appendChild(row);
    backdrop.appendChild(box);
    document.body.appendChild(backdrop);

    function close() { backdrop.remove(); }
    deny.addEventListener('click', () => { close(); });
    allow.addEventListener('click', async () => {
      await logIfUnderLimit(endpoint, 'consent_human');
      toast('Thanks!');
      close();
    });
  }

  if (data.logEndpoint) {
    askConsentAndSend(data.logEndpoint);
  }
})();