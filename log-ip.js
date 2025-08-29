module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = (req.headers['x-forwarded-for'] || '')
    .toString()
    .split(',')[0]
    .trim() ||
    req.headers['x-real-ip'] ||
    req.headers['cf-connecting-ip'] ||
    (req.socket && req.socket.remoteAddress) ||
    'unknown';

  const ua = (req.headers['user-agent'] || '').toString();
  const referer = (req.headers['referer'] || req.headers['referrer'] || '').toString();
  const ts = new Date().toISOString();
  const host = (req.headers['host'] || '').toString();
  const method = (req.method || 'POST').toString();
  const urlPath = (req.url || '').toString();
  const acceptLanguage = (req.headers['accept-language'] || '').toString();
  const country = (req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || '').toString();
  const city = (req.headers['x-vercel-ip-city'] || '').toString();
  const region = (req.headers['x-vercel-ip-country-region'] || '').toString();
  const latitude = (req.headers['x-vercel-ip-latitude'] || '').toString();
  const longitude = (req.headers['x-vercel-ip-longitude'] || '').toString();
  let body = {};
  try {
    if (req.body && typeof req.body === 'object') body = req.body;
    else if (req.body && typeof req.body === 'string') body = JSON.parse(req.body);
  } catch {}
  const clientEvent = (body.event || '').toString();
  const clientPage = (body.page || '').toString();
  const clientTitle = (body.title || '').toString();
  const clientTZ = (body.tz || body.timezone || '').toString();
  const clientLang = (body.lang || '').toString();
  const clientScreen = (body.screen || '').toString();

  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) return res.status(500).json({ error: 'Webhook not configured' });

  const trunc = (v, n = 1024) => (v ? String(v).slice(0, n) : 'n/a');
  const payload = {
    content: null,
    embeds: [
      {
        title: 'New page visit',
        description: `IP: ${ip}`,
        color: 0x7c3aed,
        fields: [
          { name: 'User-Agent', value: trunc(ua), inline: false },
          { name: 'Referer', value: trunc(referer, 1024), inline: false },
          { name: 'Host/Path', value: trunc(`${host}${urlPath}` || 'n/a'), inline: false },
          { name: 'Method', value: trunc(method, 64), inline: true },
          { name: 'Accept-Language', value: trunc(acceptLanguage), inline: false },
          { name: 'Geo', value: trunc([country, region, city].filter(Boolean).join(' • ') || 'n/a'), inline: false },
          { name: 'Lat/Lng', value: trunc(latitude && longitude ? `${latitude}, ${longitude}` : 'n/a', 128), inline: true },
          { name: 'Client Event', value: trunc(clientEvent || 'n/a', 128), inline: true },
          { name: 'Client Page', value: trunc(clientPage || 'n/a'), inline: false },
          { name: 'Client Title', value: trunc(clientTitle || 'n/a'), inline: false },
          { name: 'Client TZ', value: trunc(clientTZ || 'n/a', 128), inline: true },
          { name: 'Client Lang', value: trunc(clientLang || 'n/a', 128), inline: true },
          { name: 'Client Screen', value: trunc(clientScreen || 'n/a', 128), inline: true },
          { name: 'Time', value: ts, inline: false }
        ],
      }
    ],
  };

  try {
    const r = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(`Discord responded ${r.status}`);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: 'Failed to send to Discord' });
  }
};
