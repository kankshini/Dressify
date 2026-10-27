// Run with: npm test
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const os = require('os');
const path = require('path');

process.env.FAVORITES_FILE = path.join(os.tmpdir(), `dressify-test-${Date.now()}.json`);
const app = require('../server');
const { getOptions, recommend } = require('../src/recommend');

let server, base;
before(() => new Promise((done) => {
  server = app.listen(0, () => { base = `http://localhost:${server.address().port}`; done(); });
}));
after(() => server.close());

test('every combination gives at least one outfit', () => {
  const o = getOptions();
  for (const country of o.countries) for (const gender of o.genders)
    for (const season of o.seasons) for (const occasion of o.occasions) {
      const r = recommend({ country: country.id, gender: gender.id, season: season.id, occasion: occasion.id });
      assert.ok(r.outfits.length > 0);
      assert.ok(r.country.seasonNote, `missing season note for ${country.id}/${season.id}`);
      r.outfits.forEach((x) => assert.ok(x.pieces.every(Boolean)));
    }
});

test('winter adds a warm layer and swaps sandals', () => {
  const r = recommend({ country: 'uk', gender: 'women', season: 'winter', occasion: 'casual' });
  assert.ok(r.outfits[1].pieces.some((p) => /coat|puffer/i.test(p)));
  assert.doesNotMatch(r.outfits[1].footwear, /sandal/i);
});

test('local wear shows for India weddings', () => {
  const r = recommend({ country: 'india', gender: 'men', season: 'winter', occasion: 'wedding' });
  assert.match(r.localWear.text, /Sherwani/);
  assert.strictEqual(r.localWear.photo.query, 'sherwani');
});

test('API rejects bad input', async () => {
  const res = await fetch(`${base}/api/recommend?country=mars&gender=men&season=summer&occasion=party`);
  assert.strictEqual(res.status, 400);
});

test('favourites can be saved, listed and deleted', async () => {
  const body = { country: 'japan', gender: 'unisex', season: 'spring', occasion: 'date', outfitName: 'Cosy cool' };
  const saved = await (await fetch(`${base}/api/favorites`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  })).json();
  let list = await (await fetch(`${base}/api/favorites`)).json();
  assert.strictEqual(list[0].outfitName, 'Cosy cool');
  const del = await fetch(`${base}/api/favorites/${saved.id}`, { method: 'DELETE' });
  assert.strictEqual(del.status, 204);
  list = await (await fetch(`${base}/api/favorites`)).json();
  assert.strictEqual(list.length, 0);
});

test('photo search: no key means no photo', async () => {
  delete process.env.PIXABAY_API_KEY;
  const body = await (await fetch(`${base}/api/photo?query=saree`)).json();
  assert.strictEqual(body.photo, null);
});

test('photo search: uses the backup search when the first finds nothing', async () => {
  process.env.PIXABAY_API_KEY = 'test-key';
  const realFetch = globalThis.fetch;
  const asked = [];
  globalThis.fetch = async (url, opts) => {
    if (!String(url).startsWith('https://pixabay.com/api/')) return realFetch(url, opts);
    const q = new URL(url).searchParams.get('q');
    asked.push(q);
    assert.strictEqual(new URL(url).searchParams.get('key'), 'test-key');
    const hits = q === 'nothing here' ? [] : [{
      webformatURL: 'https://pixabay.com/get/a_640.jpg', tags: 'suit, man', user: 'Asha', user_id: 7,
      pageURL: 'https://pixabay.com/photos/suit-1/'
    }];
    return new Response(JSON.stringify({ hits }), { status: 200 });
  };
  try {
    const body = await (await realFetch(`${base}/api/photo?query=nothing+here&backup=man+wedding+outfit`)).json();
    assert.deepStrictEqual(asked, ['nothing here', 'man wedding outfit']);
    assert.strictEqual(body.photo.photographer, 'Asha');
    assert.strictEqual(body.photo.sourceUrl, 'https://pixabay.com/photos/suit-1/');
    assert.strictEqual(body.photo.photographerUrl, 'https://pixabay.com/users/Asha-7/');
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.PIXABAY_API_KEY;
  }
});
