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
    els.discordNote.textContent = 'Dm me to contact.';
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
})();
