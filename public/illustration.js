// Draws a simple "flat-lay" picture of an outfit as an SVG image.
// It reads the outfit's words (e.g. "jeans", "dress", "sneakers") to decide
// which clothing shapes to draw, and colours them with the season's palette.
// Everything is drawn in code, so it works offline and has no copyright issues.

// Colour words that may appear in an item's name, e.g. "Black shirt".
const ITEM_COLORS = {
  black: '#2b2b2e', white: '#f7f5f2', navy: '#1f2a56', grey: '#8a8d93', red: '#c0392b',
  gold: '#d4a017', pink: '#e89ab0', denim: '#4a6fa5', jeans: '#4a6fa5', khaki: '#c3b091',
  chinos: '#c3b091', camel: '#c19a6b', brown: '#6b4226', silver: '#b8bcc4', green: '#2e7d4f'
};

// Clothing shapes. Each one is drawn around the point (0, 0).
const SHAPES = {
  tee: 'M-30,-35 L-12,-40 Q0,-30 12,-40 L30,-35 L50,-15 L38,-3 L28,-12 L28,40 L-28,40 L-28,-12 L-38,-3 L-50,-15 Z',
  longTop: 'M-30,-35 L-12,-40 Q0,-30 12,-40 L30,-35 L48,22 L36,25 L28,-6 L28,40 L-28,40 L-28,-6 L-36,25 L-48,22 Z',
  kurta: 'M-30,-45 L-12,-50 Q0,-40 12,-50 L30,-45 L48,12 L36,15 L28,-16 L34,55 L-34,55 L-28,-16 L-36,15 L-48,12 Z',
  pants: 'M-26,-42 L26,-42 L31,45 L9,45 L0,-8 L-9,45 L-31,45 Z',
  widePants: 'M-26,-42 L26,-42 L40,45 L8,45 L0,-5 L-8,45 L-40,45 Z',
  shorts: 'M-26,-22 L26,-22 L32,20 L6,20 L0,0 L-6,20 L-32,20 Z',
  skirt: 'M-20,-38 L20,-38 L40,40 L-40,40 Z',
  dress: 'M-15,-62 L15,-62 L19,-40 L22,-18 L48,62 L-48,62 L-22,-18 L-19,-40 Z',
  coat: 'M-32,-52 L-10,-58 L0,-30 L10,-58 L32,-52 L52,30 L39,33 L31,-10 L34,62 L4,62 L0,-25 L-4,62 L-34,62 L-31,-10 L-39,33 L-52,30 Z',
  jacket: 'M-32,-40 L-10,-46 L0,-18 L10,-46 L32,-40 L52,28 L39,31 L31,-4 L31,40 L4,40 L0,-14 L-4,40 L-31,40 L-31,-4 L-39,31 L-52,28 Z',
  bag: 'M-24,-8 L24,-8 L28,26 L-28,26 Z',
  hat: 'M-38,8 Q0,22 38,8 Q30,-2 18,0 Q16,-22 0,-22 Q-16,-22 -18,0 Q-30,-2 -38,8 Z'
};

// One shoe pointing right; we draw two of them side by side.
const SHOES = {
  sneaker: 'M-22,-6 L-4,-8 L6,-2 L20,2 Q26,4 24,10 L-22,10 Z',
  heel: 'M-22,-10 L-18,-10 L-6,0 L22,4 Q26,6 22,10 L-4,10 L-16,2 L-18,14 L-22,14 Z',
  boot: 'M-20,-26 L-4,-26 L-4,-4 L18,0 Q26,3 24,10 L-20,10 Z',
  sandal: 'M-22,6 L24,6 Q27,9 24,11 L-22,11 Z M-14,6 L-6,-4 L2,6 M4,6 L10,-2 L16,6'
};

// Finds the first rule whose keywords appear in the text.
function pick(text, rules) {
  for (const [shape, words] of rules) {
    if (words.some((w) => text.includes(w))) return shape;
  }
  return null;
}

// Works out which garments an outfit has, based on its words.
function analyse(outfit) {
  const items = { top: null, bottom: null, dress: null, layer: null };
  for (const raw of outfit.pieces) {
    const p = raw.toLowerCase();
    const layer = pick(p, [
      ['coat', ['coat', 'puffer', 'trench', 'poncho', 'windcheater']],
      ['jacket', ['jacket', 'blazer', 'cardigan', 'hoodie', 'overshirt', 'suit', 'sherwani']]
    ]);
    const dress = /dress shirt/.test(p) ? null : pick(p, [['dress', ['dress', 'gown', 'saree', 'lehenga', 'kaftan', 'jumpsuit', 'abaya', 'kimono', 'yukata', 'hanbok']]]);
    const bottom = pick(p, [
      ['shorts', ['shorts']],
      ['skirt', ['skirt']],
      ['widePants', ['wide-leg', 'wide trousers', 'cargo', 'joggers', 'pyjama']],
      ['pants', ['jeans', 'trousers', 'pants', 'chinos']]
    ]);
    const top = pick(p, [
      ['kurta', ['kurta', 'tunic']],
      ['longTop', ['sweater', 'knit', 'blouse', 'shirt', 'button', 'satin top', 'mesh', 'oxford']],
      ['tee', ['tee', 't-shirt', 'polo', 'top']]
    ]);
    // A "suit" or "set" gives both a jacket and matching trousers.
    if (/suit|set/.test(p) && !items.bottom) items.bottom = { shape: 'pants', text: p };
    if (dress && !items.dress) items.dress = { shape: dress, text: p };
    else if (layer && !items.layer) items.layer = { shape: layer, text: p };
    else if (bottom && !items.bottom) items.bottom = { shape: bottom, text: p };
    else if (top && !items.top) items.top = { shape: top, text: p };
  }
  if (!items.dress && !items.top) items.top = { shape: 'tee', text: '' };
  if (!items.dress && !items.bottom) items.bottom = { shape: 'pants', text: '' };

  const shoeText = outfit.footwear.toLowerCase();
  const shoe = pick(shoeText, [
    ['boot', ['boot']],
    ['heel', ['heel', 'mules', 'pointed']],
    ['sandal', ['sandal', 'flip']],
    ['sneaker', ['sneaker', 'canvas', 'loafer', 'oxford', 'derby', 'brogue', 'shoes', 'flats', 'slip-on']]
  ]) || 'sneaker';

  const extras = (outfit.accessories.join(' ') + ' ' + outfit.pieces.join(' ')).toLowerCase();
  const bag = /bag|tote|clutch|backpack|potli|folder|portfolio/.test(extras);
  const hat = /\b(hat|cap|beanie)\b/.test(extras);
  const printed = /print|floral|graphic|sequin|embroider/.test(outfit.pieces.join(' ').toLowerCase());

  return { items, shoe, bag, hat, printed };
}

// Colour for one garment: a colour word in its name wins, otherwise the palette.
function colourFor(item, palette, i) {
  if (item && item.text) {
    for (const [word, hex] of Object.entries(ITEM_COLORS)) {
      if (item.text.includes(word)) return hex;
    }
  }
  return palette[i % palette.length];
}

function shape(d, x, y, fill, scale = 1, extra = '') {
  return `<path d="${d}" transform="translate(${x} ${y}) scale(${scale})" fill="${fill}" ${extra}
    stroke="rgba(0,0,0,.22)" stroke-width="1.5" stroke-linejoin="round" />`;
}

// Builds the SVG picture. `palette` is a list of hex colours.
function outfitSVG(outfit, palette, seed = 0) {
  const { items, shoe, bag, hat, printed } = analyse(outfit);
  const colours = palette.length ? palette : ['#c2577a', '#5b3a4f', '#e8d5c4'];
  const id = 'p' + Math.random().toString(36).slice(2, 8);
  const pattern = printed ? `fill="url(#${id})"` : '';
  let c = seed;
  let body = '';

  // Clothes on the left, extras on the right.
  if (items.dress) {
    body += shape(SHAPES.dress, 90, 120, colourFor(items.dress, colours, c++));
    if (printed) body += shape(SHAPES.dress, 90, 120, 'none', 1, pattern);
  } else {
    body += shape(SHAPES[items.bottom.shape], 95, 160, colourFor(items.bottom, colours, c + 1));
    body += shape(SHAPES[items.top.shape], 85, 75, colourFor(items.top, colours, c), 0.95);
    if (printed) body += shape(SHAPES[items.top.shape], 85, 75, 'none', 0.95, pattern);
    c += 2;
  }
  if (items.layer) body += shape(SHAPES[items.layer.shape], 205, 95, colourFor(items.layer, colours, c++), 0.85);

  const shoeColour = /white/.test(outfit.footwear.toLowerCase()) ? '#f7f5f2' : '#3a3036';
  const sx = items.layer ? 200 : 210;
  body += shape(SHOES[shoe], sx - 16, 200, shoeColour, 0.9);
  body += shape(SHOES[shoe], sx + 30, 200, shoeColour, 0.9);

  if (bag) {
    body += `<path d="M262,128 Q275,108 288,128" fill="none" stroke="#6b4226" stroke-width="3" />`;
    body += shape(SHAPES.bag, 275, 140, '#a0522d', 0.8);
  }
  if (hat) body += shape(SHAPES.hat, items.layer ? 275 : 215, 40, colourFor(null, colours, c + 1), 0.8);

  return `<svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" role="img"
      aria-label="Illustration of the ${outfit.name} outfit" class="outfit-img">
    <defs>
      <pattern id="${id}" width="12" height="12" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="3" r="1.8" fill="rgba(255,255,255,.75)" />
        <circle cx="9" cy="9" r="1.8" fill="rgba(0,0,0,.18)" />
      </pattern>
    </defs>
    <rect width="320" height="240" rx="14" fill="#f7efe9" />
    <circle cx="90" cy="120" r="88" fill="#fff" opacity=".55" />
    ${body}
  </svg>`;
}
