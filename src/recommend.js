// The "brain" of Dressify.
// It takes the user's choices and builds a recommendation from data/fashion.json.

const data = require('../data/fashion.json');

// Lists used to fill the dropdowns on the website.
function getOptions() {
  return {
    countries: Object.entries(data.countries).map(([id, c]) => ({ id, label: `${c.flag} ${c.name}` })),
    genders: data.genders,
    seasons: Object.entries(data.seasons).map(([id, s]) => ({ id, label: `${s.icon} ${s.label}` })),
    occasions: Object.entries(data.occasions).map(([id, o]) => ({ id, label: `${o.icon} ${o.label}` }))
  };
}

// Checks the inputs and returns a list of problems (empty list = all good).
function validate({ country, gender, season, occasion }) {
  const errors = [];
  if (!data.countries[country]) errors.push('Please choose a valid country.');
  if (!data.genders.some((g) => g.id === gender)) errors.push('Please choose a valid gender.');
  if (!data.seasons[season]) errors.push('Please choose a valid season.');
  if (!data.occasions[occasion]) errors.push('Please choose a valid occasion.');
  return errors;
}

// Adapts a basic outfit to the season: adds a warm or rain layer and swaps footwear when needed.
function adaptToSeason(outfit, seasonId, season, gender) {
  const pieces = [...outfit.pieces];
  let footwear = outfit.footwear;

  if (season.layer) pieces.push(season.layer[gender]);
  if (seasonId === 'winter' && /sandal|flats|mules|canvas/i.test(footwear)) footwear = 'Ankle boots or closed leather shoes';
  if (seasonId === 'monsoon' && /suede|sneakers|heels|canvas/i.test(footwear)) footwear = 'Waterproof shoes or rubber sandals';

  return {
    name: outfit.name,
    pieces,
    footwear,
    accessories: [...outfit.accessories],
    fabrics: season.fabrics.slice(0, 3)
  };
}

// Builds the full recommendation for one set of choices.
function recommend({ country, gender, season, occasion }) {
  const c = data.countries[country];
  const s = data.seasons[season];
  const o = data.occasions[occasion];

  const outfits = o.outfits[gender].map((outfit) => adaptToSeason(outfit, season, s, gender));

  // A local / traditional idea, if the country has one for this occasion.
  const localWear = (c.traditional[gender] || {})[occasion] || null;

  return {
    summary: `${o.label} outfits for ${gender === 'unisex' ? 'everyone' : gender} in ${c.name} during ${s.label.toLowerCase()}`,
    country: { name: c.name, flag: c.flag, styleNote: c.styleNote, seasonNote: c.seasonNotes[season] },
    season: { label: s.label, icon: s.icon },
    occasion: { label: o.label, icon: o.icon },
    outfits,
    localWear,
    colors: s.colors,
    accessories: s.accessories,
    tips: [...s.tips, ...c.etiquette],
    avoid: s.avoid
  };
}

module.exports = { getOptions, validate, recommend };
