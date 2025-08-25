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
  els.copyDiscord?.addEventListener('click', async (e) => {
    e.preventDefault();
    const text = data.discord || defaults.discord;
    try {
      await navigator.clipboard.writeText(text);
      toast('Discord username copied!');
      createRipple(e.clientX, e.clientY);
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

  // Water drop animation system
  let lastDropTime = 0;
  const dropCooldown = 150; // Minimum time between drops in ms
  
  function createWaterDrop(x, y) {
    const now = Date.now();
    if (now - lastDropTime < dropCooldown) return;
    lastDropTime = now;
    
    const drop = document.createElement('div');
    drop.className = 'water-drop';
    drop.style.left = (x - 4) + 'px';
    drop.style.top = (y - 4) + 'px';
    
    // Add some randomness to size and animation
    const size = 6 + Math.random() * 6;
    drop.style.width = size + 'px';
    drop.style.height = size + 'px';
    
    document.body.appendChild(drop);
    
    // Create ripple effect
    setTimeout(() => createRipple(x, y), 100);
    
    // Remove drop after animation
    setTimeout(() => {
      if (drop.parentNode) {
        drop.remove();
      }
    }, 2000);
  }
  
  function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'water-ripple';
    ripple.style.left = (x - 50) + 'px';
    ripple.style.top = (y - 50) + 'px';
    
    document.body.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.remove();
      }
    }, 1500);
  }
  
  // Track mouse movement for water drops
  let isMouseMoving = false;
  let mouseMoveTimeout;
  
  document.addEventListener('mousemove', (e) => {
    // Only create drops when mouse is actually moving (not just hovering)
    if (!isMouseMoving) {
      isMouseMoving = true;
      // Start creating drops with some randomness
      if (Math.random() > 0.7) {
        createWaterDrop(e.clientX, e.clientY);
      }
    }
    
    clearTimeout(mouseMoveTimeout);
    mouseMoveTimeout = setTimeout(() => {
      isMouseMoving = false;
    }, 100);
  });
  
  // Enhanced interactions
  document.querySelectorAll('.btn, .link').forEach(element => {
    element.addEventListener('mouseenter', (e) => {
      createWaterDrop(e.clientX, e.clientY);
    });
  });

  // Professional loading animation
  function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loading-spinner active';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
    return loader;
  }

  function hideLoading(loader) {
    if (loader) {
      loader.classList.remove('active');
      setTimeout(() => loader.remove(), 300);
    }
  }

  // Success indicator
  function showSuccess(message) {
    const indicator = document.createElement('div');
    indicator.className = 'success-indicator';
    indicator.textContent = message;
    document.body.appendChild(indicator);
    
    setTimeout(() => indicator.classList.add('show'), 100);
    setTimeout(() => {
      indicator.classList.remove('show');
      setTimeout(() => indicator.remove(), 300);
    }, 2000);
  }

  // Enhanced copy functionality with better UX
  if (els.copyDiscord) {
    // Remove the old event listener and add enhanced one
    const newCopyButton = els.copyDiscord.cloneNode(true);
    els.copyDiscord.parentNode.replaceChild(newCopyButton, els.copyDiscord);
    
    newCopyButton.addEventListener('click', async (e) => {
      e.preventDefault();
      const loader = showLoading();
      
      try {
        const text = data.discord || defaults.discord;
        await navigator.clipboard.writeText(text);
        hideLoading(loader);
        showSuccess('Discord username copied!');
        createRipple(e.clientX, e.clientY);
      } catch {
        hideLoading(loader);
        toast('Could not copy. Long-press to select.');
      }
    });
  }

  // Floating particles system
  function createFloatingParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = window.innerHeight + 'px';
    particle.style.animationDelay = Math.random() * 2 + 's';
    particle.style.animationDuration = (8 + Math.random() * 4) + 's';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      if (particle.parentNode) {
        particle.remove();
      }
    }, 12000);
  }

  // Create particles periodically
  setInterval(createFloatingParticle, 3000);

  // Enhanced route transitions
  const originalShowRoute = window.showRoute || function() {};
  function enhancedShowRoute(hash) {
    const target = routes[hash] || routes['#home'];
    
    // Fade out current route
    for (const key in routes) {
      const el = routes[key];
      if (!el) continue;
      if (el !== target && !el.hasAttribute('hidden')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => el.setAttribute('hidden', ''), 200);
      }
    }
    
    // Fade in target route
    setTimeout(() => {
      target.removeAttribute('hidden');
      target.style.opacity = '0';
      target.style.transform = 'translateY(20px)';
      
      requestAnimationFrame(() => {
        target.style.opacity = '1';
        target.style.transform = 'translateY(0)';
      });
    }, 200);
    
    const base = data.name ? `${data.name}` : 'Profile';
    const label = hash === '#contact' ? 'Contact' : hash === '#info' ? 'Info' : 'Home';
    els.pageTitle.textContent = `${base} — ${label}`;
  }

  // Override the showRoute function
  window.showRoute = enhancedShowRoute;
  window.addEventListener('hashchange', () => enhancedShowRoute(location.hash));

  // Performance monitoring
  const perfStart = performance.now();
  window.addEventListener('load', () => {
    const loadTime = performance.now() - perfStart;
    console.log(`🚀 Website loaded in ${loadTime.toFixed(2)}ms`);
    
    // Add typing animation to bio
    const bioElement = els.bio;
    if (bioElement && bioElement.textContent) {
      const originalText = bioElement.textContent;
      bioElement.textContent = '';
      bioElement.style.borderRight = '2px solid var(--accent)';
      bioElement.style.animation = 'blink 1s infinite';
      
      let i = 0;
      function typeText() {
        if (i < originalText.length) {
          bioElement.textContent += originalText.charAt(i);
          i++;
          setTimeout(typeText, 50);
        } else {
          // Remove cursor after typing is complete
          setTimeout(() => {
            bioElement.style.borderRight = 'none';
            bioElement.style.animation = 'none';
          }, 1000);
        }
      }
      
      // Start typing after a short delay
      setTimeout(typeText, 500);
    }
  });
  
  // Add blink animation for typing cursor
  const style = document.createElement('style');
  style.textContent = `
    @keyframes blink {
      0%, 50% { border-color: var(--accent); }
      51%, 100% { border-color: transparent; }
    }
  `;
  document.head.appendChild(style);
})();