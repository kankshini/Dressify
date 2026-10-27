// Dressify front-end: talks to the server's API and shows the results.

const form = document.getElementById('finder');
const results = document.getElementById('results');
const formError = document.getElementById('form-error');
const favoritesList = document.getElementById('favorites-list');

let options = null;     // dropdown lists from the server
let lastChoice = null;  // the choices used for the current results

// Simple colour names -> colours for the little swatches.
const COLOR_MAP = {
  'white': '#ffffff', 'pastel blue': '#aec6cf', 'mint': '#b9f2d0', 'peach': '#ffcba4', 'lemon yellow': '#fff44f',
  'charcoal': '#36454f', 'camel': '#c19a6b', 'burgundy': '#800020', 'forest green': '#228b22', 'navy': '#1f2a56',
  'olive': '#708238', 'mustard': '#e1ad01', 'teal': '#008080', 'lavender': '#c8a2c8', 'blush pink': '#f4c2c2',
  'sage green': '#b2ac88', 'sky blue': '#87ceeb', 'cream': '#fffdd0', 'rust': '#b7410e', 'chocolate brown': '#5c3317',
  'deep orange': '#e65c00'
};

// Escape text before putting it into HTML (keeps the page safe).
function esc(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/"/g, '&quot;');
}

function labelFor(list, id) {
  const item = options[list].find((x) => x.id === id);
  return item ? item.label : id;
}

// 1. Load dropdown options when the page opens.
async function loadOptions() {
  const res = await fetch('/api/options');
  options = await res.json();
  for (const name of ['country', 'gender', 'season', 'occasion']) {
    const select = form.elements[name];
    select.innerHTML = '<option value="">Choose…</option>' +
      options[name === 'country' ? 'countries' : name + 's']
        .map((o) => `<option value="${o.id}">${esc(o.label)}</option>`).join('');
  }
}

// 2. Ask the server for a recommendation when the form is submitted.
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.hidden = true;

  const choice = Object.fromEntries(new FormData(form));
  const res = await fetch('/api/recommend?' + new URLSearchParams(choice));
  const data = await res.json();

  if (!res.ok) {
    formError.textContent = data.errors.join(' ');
    formError.hidden = false;
    return;
  }
  lastChoice = choice;
  showResults(data);
});

// 3. Draw the results on the page.
function showResults(r) {
  // Season colours as hex codes, used to colour the outfit pictures.
  const palette = r.colors.map((c) => COLOR_MAP[c.toLowerCase()]).filter(Boolean);

  const outfitCards = r.outfits.map((o, i) => `
    <article class="outfit">
      <div class="media" data-query="${esc(o.photo.query)}" data-backup="${esc(o.photo.backup)}">
        ${outfitSVG(o, palette, i)}
      </div>
      <h3>${esc(o.name)}</h3>
      <ul>${o.pieces.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      <div class="row"><strong>Shoes:</strong> ${esc(o.footwear)}</div>
      <div class="row"><strong>Accessories:</strong> ${esc(o.accessories.join(', '))}</div>
      <div>${o.fabrics.map((f) => `<span class="tag">${esc(f)}</span>`).join('')}</div>
      <button class="btn-small" data-save="${i}">♥ Save this look</button>
    </article>`).join('');

  results.innerHTML = `
    <div class="card summary">
      <div class="flag">${r.country.flag}</div>
      <div>
        <h2>${esc(r.summary)}</h2>
        <p class="muted">${esc(r.country.styleNote)}</p>
        <p><strong>${r.season.icon} Weather note:</strong> ${esc(r.country.seasonNote)}</p>
      </div>
    </div>

    <div class="card">
      <h2>Outfit ideas</h2>
      <div class="outfits">${outfitCards}</div>
    </div>

    ${r.localWear ? `
    <div class="card local">
      <h2>🌍 Local style idea</h2>
      <div class="local-body">
        <div class="media local-media" data-query="${esc(r.localWear.photo.query)}" data-backup="${esc(r.localWear.photo.backup)}"></div>
        <p>${esc(r.localWear.text)}</p>
      </div>
    </div>` : ''}

    <div class="two-col">
      <div class="card">
        <h2>Colours that work</h2>
        <div class="swatches">${r.colors.map((c) =>
          `<div class="swatch"><span style="background:${COLOR_MAP[c.toLowerCase()] || 'linear-gradient(45deg,#f9a,#9cf,#fd7)'}"></span>${esc(c)}</div>`).join('')}
        </div>
        <h3 style="margin-top:20px">Season extras</h3>
        <div>${r.accessories.map((a) => `<span class="tag">${esc(a)}</span>`).join('')}</div>
      </div>
      <div class="card">
        <h2>Tips</h2>
        <ul class="list-check">${r.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <h3 style="margin-top:20px">Better to avoid</h3>
        <ul class="list-cross">${r.avoid.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>
    </div>`;

  results.hidden = false;
  results.scrollIntoView({ behavior: 'smooth' });

  loadPhotos();

  // Hook up the "Save this look" buttons.
  results.querySelectorAll('[data-save]').forEach((btn) => {
    btn.addEventListener('click', () => saveFavorite(r.outfits[btn.dataset.save].name, btn));
  });
}

// Ask the server for a real photo for each picture spot.
// If there's no photo (or no internet), the drawing simply stays.
function loadPhotos() {
  results.querySelectorAll('.media').forEach(async (box) => {
    try {
      const params = new URLSearchParams({ query: box.dataset.query, backup: box.dataset.backup });
      const { photo } = await (await fetch('/api/photo?' + params)).json();
      if (!photo) return;
      const img = new Image();
      img.alt = photo.alt;
      img.className = 'outfit-photo';
      img.onload = () => {
        box.innerHTML = '';
        box.append(img);
        box.insertAdjacentHTML('beforeend', `<p class="credit">Photo by
          <a href="${esc(photo.photographerUrl)}" target="_blank" rel="noopener">${esc(photo.photographer)}</a> on
          <a href="${esc(photo.sourceUrl)}" target="_blank" rel="noopener">Pixabay</a></p>`);
        box.classList.add('has-photo');
      };
      img.src = photo.url;
    } catch {
      // keep the drawing
    }
  });
}

// 4. Saved looks (stored on the server).
async function saveFavorite(outfitName, btn) {
  const res = await fetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...lastChoice, outfitName })
  });
  if (res.ok) {
    btn.textContent = '✓ Saved';
    btn.disabled = true;
    loadFavorites();
  }
}

async function loadFavorites() {
  const res = await fetch('/api/favorites');
  const list = await res.json();
  if (!list.length) {
    favoritesList.innerHTML = '<li class="muted">No saved looks yet. Find an outfit and tap "Save this look".</li>';
    return;
  }
  favoritesList.innerHTML = list.map((f) => `
    <li>
      <div>
        <strong>${esc(f.outfitName)}</strong><br />
        <span class="muted">${esc(labelFor('countries', f.country))} · ${esc(labelFor('genders', f.gender))} · ${esc(labelFor('seasons', f.season))} · ${esc(labelFor('occasions', f.occasion))}</span>
      </div>
      <button class="remove" data-id="${esc(f.id)}" title="Remove">✕</button>
    </li>`).join('');

  favoritesList.querySelectorAll('.remove').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await fetch('/api/favorites/' + btn.dataset.id, { method: 'DELETE' });
      loadFavorites();
    });
  });
}

// Start!
loadOptions().then(loadFavorites);
