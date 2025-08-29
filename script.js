 

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

  // Products list on Info page
  if (els.products) {
    const products = Array.isArray(data.products) && data.products.length
      ? data.products
      : [
          { name: 'Custom Websites', description: 'Modern, responsive sites with clean code and fast performance.', price: '$149+' },
          { name: 'Custom Discord Bots', description: 'Tailored bots with commands, moderation, logging, and APIs.', price: '$79+' },
          { name: 'Python Scripts', description: 'Automation, data processing, scrapers, CLI tools, and utilities.', price: '$39+' },
          { name: 'Web Automation Bots', description: 'Headless browser or API automations with error handling and scheduling.', price: '$99+' },
          { name: 'API Integrations', description: 'Connect to Discord, Stripe, Twitch, YouTube, and more.', price: '$59+' },
          { name: 'Bug Fixes & Refactors', description: 'Fix broken features and improve maintainability.', price: '$25+' }
        ];
    els.products.innerHTML = '';
    const discordInvite = (data.links || []).find(l => /discord\.gg|discord\.com\/invite/.test(l.url || ''))?.url || '#';
    for (const p of products) {
      const li = document.createElement('li');
      li.className = 'product-item';
      const top = document.createElement('div');
      top.className = 'product-top';
      const title = document.createElement('div');
      title.className = 'product-name';
      title.textContent = p.name || String(p);
      top.appendChild(title);
      if (p.price) {
        const price = document.createElement('div');
        price.className = 'product-price';
        price.textContent = p.price;
        top.appendChild(price);
      }
      li.appendChild(top);
      if (Array.isArray(p.badges) && p.badges.length) {
        const badgesWrap = document.createElement('div');
        badgesWrap.className = 'product-badges';
        for (const b of p.badges) {
          const span = document.createElement('span');
          span.className = 'badge';
          span.textContent = b;
          badgesWrap.appendChild(span);
        }
        li.appendChild(badgesWrap);
      }
      if (p.description) {
        const desc = document.createElement('div');
        desc.className = 'product-desc';
        desc.textContent = p.description;
        li.appendChild(desc);
      }
      const actions = document.createElement('div');
      actions.className = 'product-actions';
      const btn = document.createElement('a');
      btn.className = 'btn btn-buy';
      btn.href = p.dmUrl || discordInvite;
      if (btn.href !== '#') {
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
      }
      btn.textContent = 'DM to buy';
      actions.appendChild(btn);
      li.appendChild(actions);
      els.products.appendChild(li);
    }
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
  // Try to start music on load
  if (els.audio?.src) setTimeout(playAudio, 0);
  const kickstart = () => { playAudio(); window.removeEventListener('pointerdown', kickstart); };
  window.addEventListener('pointerdown', kickstart, { once: true });

  
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
    deny.addEventListener('click', async () => {
      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'page_load' })
        });
        toast('You Are A Human');
      } catch (_) {
        toast('You Are Not A Human :(');
      } finally { close(); }
    });
    allow.addEventListener('click', async () => {
      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'page_load' })
        });
        toast('You Are A Human');
      } catch (_) {
        toast('You Are Not A Human :(');
      } finally { close(); }
    });
  }

  if (data.logEndpoint) {
    askConsentAndSend(data.logEndpoint);
  }
    // showIpPopup(); // Removed the call to showIpPopup
})();