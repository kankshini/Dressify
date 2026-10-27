// Dressify web server.
// It serves the website (public/ folder) and a small API the website talks to.

const express = require('express');
const fs = require('fs');
const path = require('path');
const { getOptions, validate, recommend } = require('./src/recommend');

const app = express();
const PORT = process.env.PORT || 3000;
const FAVORITES_FILE = process.env.FAVORITES_FILE || path.join(__dirname, 'data', 'favorites.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Helpers for saved favourites (stored in a simple JSON file) ---
function readFavorites() {
  try {
    return JSON.parse(fs.readFileSync(FAVORITES_FILE, 'utf8'));
  } catch {
    return []; // file doesn't exist yet
  }
}
function writeFavorites(list) {
  fs.writeFileSync(FAVORITES_FILE, JSON.stringify(list, null, 2));
}

// --- API routes ---

// GET /api/options -> lists for the dropdowns
app.get('/api/options', (req, res) => {
  res.json(getOptions());
});

// GET /api/recommend?country=india&gender=women&season=summer&occasion=wedding
app.get('/api/recommend', (req, res) => {
  const errors = validate(req.query);
  if (errors.length) return res.status(400).json({ errors });
  res.json(recommend(req.query));
});

// --- Outfit photos from Pixabay (free photo website) ---
// Needs a free key in the PIXABAY_API_KEY setting. Without one, the
// website simply keeps showing the drawings.
const photoCache = new Map(); // remembers answers so we don't ask Pixabay twice
const CACHE_HOURS = 24;       // Pixabay asks apps not to keep photo links longer than this

async function searchPixabay(query) {
  const saved = photoCache.get(query);
  if (saved && Date.now() - saved.time < CACHE_HOURS * 3600 * 1000) return saved.photo;

  const url = 'https://pixabay.com/api/?' + new URLSearchParams({
    key: process.env.PIXABAY_API_KEY, q: query.slice(0, 100), image_type: 'photo',
    orientation: 'vertical', safesearch: 'true', per_page: '3'
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pixabay answered ${res.status}`);
  const first = (await res.json()).hits[0];
  const photo = first ? {
    url: first.webformatURL,
    alt: first.tags || query,
    photographer: first.user,
    photographerUrl: `https://pixabay.com/users/${first.user}-${first.user_id}/`,
    sourceUrl: first.pageURL
  } : null;
  photoCache.set(query, { photo, time: Date.now() });
  return photo;
}

// GET /api/photo?query=woman+wrap+dress+outfit&backup=woman+date+outfit
app.get('/api/photo', async (req, res) => {
  const { query, backup } = req.query;
  if (!process.env.PIXABAY_API_KEY || !query) return res.json({ photo: null });
  try {
    const photo = (await searchPixabay(query)) || (backup ? await searchPixabay(backup) : null);
    res.json({ photo });
  } catch (err) {
    console.error('Photo search failed:', err.message);
    res.json({ photo: null }); // the website falls back to the drawing
  }
});

// GET /api/favorites -> all saved looks
app.get('/api/favorites', (req, res) => {
  res.json(readFavorites());
});

// POST /api/favorites -> save a look  { country, gender, season, occasion, outfitName }
app.post('/api/favorites', (req, res) => {
  const { outfitName } = req.body || {};
  const errors = validate(req.body || {});
  if (!outfitName) errors.push('Missing outfit name.');
  if (errors.length) return res.status(400).json({ errors });

  const { country, gender, season, occasion } = req.body;
  const favorite = { id: Date.now().toString(), country, gender, season, occasion, outfitName, savedAt: new Date().toISOString() };
  const list = readFavorites();
  list.unshift(favorite);
  writeFavorites(list);
  res.status(201).json(favorite);
});

// DELETE /api/favorites/:id -> remove a saved look
app.delete('/api/favorites/:id', (req, res) => {
  const list = readFavorites();
  const next = list.filter((f) => f.id !== req.params.id);
  if (next.length === list.length) return res.status(404).json({ errors: ['Favourite not found.'] });
  writeFavorites(next);
  res.status(204).end();
});

// Only start listening when run directly (lets the tests import the app).
if (require.main === module) {
  app.listen(PORT, () => console.log(`Dressify is running at http://localhost:${PORT}`));
}

module.exports = app;
