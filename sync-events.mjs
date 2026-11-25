// Sync 510 Society events from Sweatpals' public API into data/events.json.
// No API key needed: this reads the same public endpoints the Sweatpals host page uses.
// Runs every 6 hours from .github/workflows/sync-events.yml, and can be run by hand: node scripts/sync-events.mjs
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';

const API = 'https://ilove.sweatpals.com/api';
const HOST = '510society_';
const OUT = 'data/events.json';
const IMG_DIR = 'assets/img/sp';
const SINCE = '2025-01-01T00:00:00.000Z';

const getJSON = async (url, body) => {
  const r = await fetch(url, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {});
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};
const exists = (p) => access(p).then(() => true, () => false);

// "🎀 PINK MATS SPONSORED BY JOSSY’S TOUCH! 💗\n\nA San Rafael..." -> "Pink mats sponsored by Jossy’s Touch"
const headline = (txt = '', name = '') => {
  if (!txt || txt === 'null') return '';
  const first = String(txt).split('\n').map((l) => l.replace(/[\p{Extended_Pictographic}️‍]/gu, '').trim()).find(Boolean) || '';
  let h = first.replace(/[!.]+$/, '').trim();
  if (!h || h.length > 70) return '';
  if (h === h.toUpperCase()) {
    h = h.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
    h = h.replace(/\bvip\b/gi, 'VIP');
    if (name) { const loose = name.replace(/[’']/g, '').toLowerCase(); h = h.replace(/\b[\w’'&. ]+$/, (tail) => (tail.replace(/[’']/g, '').toLowerCase().endsWith(loose) ? tail.slice(0, tail.length - tail.replace(/^.*?(?=\S*$)/, '').length) : tail)); if (/sponsored by\s+/i.test(h)) h = h.replace(/(sponsored by\s+).*$/i, `$1${name}`); }
  }
  return h;
};
const city = (addr = '') => {
  const m = addr.match(/(Oakland|Alameda|San Leandro|San Francisco|Berkeley|Emeryville|Richmond|Hayward)/i);
  return m ? m[1] : '';
};
const venue = (addr = '') => addr.split(',')[0].trim();
const title = (s = '') => (s === s.toUpperCase() ? s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : s).trim();

async function saveFlyer(id) {
  if (!id) return null;
  const path = `${IMG_DIR}/${id}.webp`;
  if (await exists(path)) return path;
  try {
    const r = await fetch(`https://edge.sweatpals.com/api/files/${id}?variant=l`);
    if (!r.ok) return null;
    await writeFile(path, Buffer.from(await r.arrayBuffer()));
    return path;
  } catch { return null; }
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true });
  const user = await getJSON(`${API}/users/username/${HOST}?withEventsCount=true&withAttendeesCount=true`);
  const base = { creatorsIds: [user.id], withUnverifiedEvents: true };
  const now = new Date();
  const past = await getJSON(`${API}/events/public/search`, { ...base, oneInstancePerEvent: true, filterByEndDate: true, periodFrom: SINCE, periodTo: now.toISOString(), limit: 100 });
  const upcoming = await getJSON(`${API}/events/public/search`, { ...base, periodFrom: now.toISOString(), periodTo: new Date(now.getTime() + 400 * 864e5).toISOString(), limit: 50 });

  const norm = async (e) => ({
    id: e.id,
    title: title(e.name),
    start: e.instance || e.actualFrom || e.startDate,
    end: e.instanceEndDate || e.actualTo || e.endDate || null,
    date: e.shortLocalInstance,
    venue: venue(e.addressName),
    city: city(e.addressName),
    url: `https://sweatpals.com/${String(e.eventType?.name || e.eventType || 'event').toLowerCase() === 'class' ? 'class' : 'event'}/${e.alias}/${e.shortLocalInstance}`,
    image: await saveFlyer(e.avatarId),
    going: e.participantsCount || 0,
    host: e.author?.userName || HOST,
    kind: String(e.eventType?.name || e.eventType || 'EVENT').toUpperCase(),
    summary: String(e.description || '').replace(/\[([^\]]*)\]\([^)]*\)?/g, '$1').replace(/https?:\/\/\S+/g, '').replace(/[*_#>`]/g, '').replace(/<[^>]+>/g, ' ').replace(/[\p{Extended_Pictographic}️‍]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 260),
    sponsors: (e.eventSponsors || []).map((s) => ({ name: s.sponsorName, what: headline(s.sponsorDescription, s.sponsorName), url: s.sponsorUrl || null })).filter((s) => s.name),
  });

  const pastN = (await Promise.all(past.filter((e) => String(e.eventType?.name || e.eventType || '').toUpperCase() !== 'CLASS').map(norm))).sort((a, b) => new Date(b.start) - new Date(a.start));
  const upN = (await Promise.all(upcoming.map(norm))).sort((a, b) => new Date(a.start) - new Date(b.start));

  const data = {
    source: 'sweatpals',
    updated: now.toISOString(),
    stats: {
      events: user.eventsCount ?? pastN.length,
      rsvps: user.attendeesCount ?? pastN.reduce((n, e) => n + e.going, 0),
      members: user.followersCount ?? null,
      activations: pastN.reduce((n, e) => n + e.sponsors.length, 0),
    },
    events: upN,
    past: pastN,
  };

  // Keep the old file if the API came back empty-handed, so the site never goes blank.
  if (!pastN.length && !upN.length && (await exists(OUT))) {
    const prev = JSON.parse(await readFile(OUT, 'utf8'));
    if ((prev.past || []).length) { console.log('API returned nothing; keeping previous data.'); return; }
  }
  await writeFile(OUT, JSON.stringify(data, null, 2) + '\n');
  console.log(`Synced ${upN.length} upcoming, ${pastN.length} past, ${data.stats.activations} brand activations.`);
}

main().catch((e) => { console.error('Sync failed, leaving existing data in place:', e.message); process.exit(0); });
