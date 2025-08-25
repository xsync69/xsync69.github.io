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
        // Google S2 favicons is a simple way to get site icons
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
    els.discordNote.textContent = 'Tip: New Discord usernames do not use #0000.';
  }

  // Tiny toast for UX feedback
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

  // Fill Contact & Info sections
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

  // Products list on Info page
  if (els.products) {
    const products = Array.isArray(data.products) && data.products.length
      ? data.products
      : [
          { name: 'Discord Bot' },
          { name: 'Discord Tools' },
          { name: 'Everything (custom services)' }
        ];
    els.products.innerHTML = '';
    for (const p of products) {
      const li = document.createElement('li');
      li.textContent = p.name || String(p);
      els.products.appendChild(li);
    }
  }

  // Contact nav link -> Discord server if available, otherwise local Contact route
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
      // autoplay may be blocked until user interacts
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
  // Try to start music on load (subject to browser autoplay policies)
  if (els.audio?.src) setTimeout(playAudio, 0);
  // Fallback: start on first interaction
  const kickstart = () => { playAudio(); window.removeEventListener('pointerdown', kickstart); };
  window.addEventListener('pointerdown', kickstart, { once: true });
})();