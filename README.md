# 👗 Dressify – Fashion Guidance Web Application

Dressify is a full-stack web app that gives you **personalized outfit ideas** based on four things:

- 🌍 **Country** (10 countries: India, USA, UK, Japan, UAE, France, Nigeria, South Korea, Brazil, Australia)
- 🧑 **Gender** (Women, Men, Unisex / gender-neutral)
- 🌦️ **Season** (Summer, Winter, Monsoon / Rainy, Spring, Autumn)
- 🎉 **Occasion** (Casual, Office, Party, Wedding, Festival, Date night, Job interview, Travel)

For every choice you get outfit ideas with a **picture of each look** (a real photo from Pixabay if you add a free key, otherwise a drawing), a local / traditional style idea, colours that suit the season, fabrics, accessories, do's and don'ts, and cultural etiquette tips. You can also **save looks you like**, and they are stored on the server.

![Dressify results page](screenshots/desktop-results.png)

---

## 🚀 How to run it

You only need **Node.js** (version 18 or newer). Download it from https://nodejs.org if you don't have it.

```bash
# 1. Go into the project folder
cd dressify

# 2. Install the one library we use (Express)
npm install

# 3. Start the app
npm start
```

Now open **http://localhost:3000** in your browser. 🎉

> 🌐 **Want it online for everyone?** See [DEPLOY.md](DEPLOY.md) for free step-by-step hosting instructions.

Other handy commands:

| Command | What it does |
|---|---|
| `npm run dev` | Starts the app and restarts it automatically when you change a file |
| `npm test` | Runs the automatic tests (checks all 1,200 combinations work) |

---

## 🧠 How it works (in simple words)

1. **You pick** a country, gender, season and occasion on the web page.
2. The **browser asks the server**: "What should this person wear?" (it calls `/api/recommend`).
3. The **server looks things up** in `data/fashion.json`, our fashion "database":
   - It takes the basic outfits for that **occasion and gender**,
   - then **adapts them to the season** (for example, it adds a warm coat in winter, a rain jacket in monsoon, and swaps sandals for boots when it's cold),
   - then adds **country info**: weather notes, a traditional outfit idea, and etiquette tips.
4. The server sends the answer back as JSON and the **page draws the result cards**. Each outfit gets a picture drawn in code by `public/illustration.js`: it reads words like "jeans", "dress" or "boots" and draws those shapes in the season's colours. Because the pictures are drawn by the app, they work offline and have no copyright issues.
6. **Real photos (optional):** if you set a `PIXABAY_API_KEY`, the page also asks the server for a photo (`/api/photo`). The server searches Pixabay, for example for "woman midi wrap dress outfit", and the photo replaces the drawing, with credit to the photographer. See [DEPLOY.md](DEPLOY.md#-step-4-turn-on-real-outfit-photos-optional-free) for how to get a key.
5. When you press **"♥ Save this look"**, the browser sends it to the server, which writes it into `data/favorites.json`.

```
 Browser (public/)  ──── asks ────▶  Server (server.js)  ──── reads ────▶  data/fashion.json
        ▲                                   │
        └────────── JSON answer ◀───────────┘
```

---

## 📁 Project structure

```
dressify/
├── server.js            # The web server (Express) and API routes
├── src/
│   └── recommend.js     # The recommendation logic ("the brain")
├── data/
│   ├── fashion.json     # All fashion data: countries, seasons, occasions, outfits
│   └── favorites.json   # Saved looks (created automatically, not in git)
├── public/              # The website the user sees
│   ├── index.html       # Page layout
│   ├── style.css        # Colours, fonts and layout
│   ├── app.js           # Talks to the API and shows results
│   └── illustration.js  # Draws a picture for each outfit
├── test/
│   └── app.test.js      # Automatic tests
├── screenshots/         # Pictures of the app
├── render.yaml          # Settings for free hosting on Render
├── DEPLOY.md            # How to put the app online
└── package.json         # Project info and commands
```

---

## 🔌 API (for the curious)

| Method | URL | What it does |
|---|---|---|
| GET | `/api/options` | Lists of countries, genders, seasons, occasions |
| GET | `/api/recommend?country=india&gender=women&season=summer&occasion=wedding` | Get a recommendation |
| GET | `/api/photo?query=woman+wrap+dress+outfit` | A matching Pixabay photo (or `null` without a key) |
| GET | `/api/favorites` | All saved looks |
| POST | `/api/favorites` | Save a look (send `country, gender, season, occasion, outfitName` as JSON) |
| DELETE | `/api/favorites/:id` | Remove a saved look |

---

## ✏️ How to add your own data

Everything lives in **`data/fashion.json`**, so you can grow the app without touching code:

- **Add a country:** copy one of the entries under `"countries"` (e.g. `"france"`), give it a new key like `"italy"`, and change the text. It shows up in the dropdown automatically.
- **Add an outfit:** add a new `{ "name", "pieces", "footwear", "accessories" }` object to any occasion's list.
- **Add an occasion:** copy an entry under `"occasions"` and fill in outfits for `women`, `men` and `unisex`.

Run `npm test` afterwards. It checks every combination still works.

---

## 🛠️ Built with

- **Frontend:** HTML, CSS and plain JavaScript (no framework, easy to read)
- **Backend:** Node.js + Express
- **Data:** a JSON file (simple to edit, no database setup needed)

## 💡 Ideas for next steps

- Detect the user's country and current season automatically
- Add user accounts so each person has their own saved looks
- Move the data into a real database such as SQLite or MongoDB

## 📄 License

MIT. Free to use and change.
