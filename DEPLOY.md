# 🌐 Put Dressify online (free)

Right now Dressify only runs on your own computer (`localhost`). Follow these steps to give it a **real public website** that anyone can open, like `https://dressify-xxxx.onrender.com`.

We use two free services:

- **GitHub** stores your code online.
- **Render** runs the code and gives you the website link.

It takes about 15 minutes. You don't need a credit card.

---

## Step 1: Put the code on GitHub

1. Sign in at https://github.com.
2. Click the **+** at the top right, then **New repository**.
3. Name it `dressify`, set it to **Public**, and click **Create repository**. Don't tick "Add a README" because we already have one.
4. On the next page, click the link **"uploading an existing file"**.
5. Open your unzipped `dressify` folder on your computer. Select **everything inside it** except the `node_modules` folder (if you have one), and drag it into the GitHub page.
   - Make sure `package.json`, `server.js` and `render.yaml` are in the list, not inside another folder.
   - **Drag, don't use "choose your files".** The file picker can't select folders, so the `src`, `data` and `public` folders get left out and the site crashes with `Cannot find module './src/recommend'`. Dragging from File Explorer keeps the folders.
   - After committing, check that the repo page shows the folders `data`, `public` and `src`.
6. Scroll down and click **Commit changes**.

> 💡 If you know Git, you can instead run `git init`, `git add .`, `git commit -m "Dressify"` and push, as GitHub shows on the empty repo page.

## Step 2: Create the website on Render

1. Go to https://render.com and click **Get Started**. Choose **Sign in with GitHub** (easiest).
2. In the Render dashboard, click **+ New**, then **Web Service**.
3. Pick your `dressify` repository from the list. If you don't see it, click **Configure account** and give Render access to it.
4. Fill in the form (most of it is filled in already):

   | Setting | Value |
   |---|---|
   | Name | `dressify` (this becomes part of your web address) |
   | Language / Runtime | `Node` |
   | Branch | `main` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | **Free** |

5. Click **Deploy Web Service**.
6. Wait 2 to 3 minutes while it shows the logs. When you see **"Your service is live 🎉"**, click the link at the top of the page (it ends in `.onrender.com`).

That's your website! Share the link with anyone. 🎉

> Alternative: choose **+ New → Blueprint** instead of Web Service. Render reads the `render.yaml` file in the project and fills in all the settings for you.

## Step 3: Updating the website later

Whenever you change the code, upload the changed files to your GitHub repo again (**Add file → Upload files**). Render notices and updates the website by itself in a couple of minutes.

---

## 📸 Step 4: Turn on real outfit photos (optional, free)

Dressify can show a real photo for every outfit, taken from **Pixabay**, a free photo website. It needs a free "key" (like a password that lets the app ask Pixabay for photos). Without a key, the site shows the drawn pictures instead.

1. Go to https://pixabay.com/accounts/register/ and create a free account (or sign in with Google or Facebook). Confirm your email if it asks.
2. Open https://pixabay.com/api/docs/ while signed in. Your key is shown in the page text, in a green box under **Parameters** (next to `key`).
3. Copy the key. Don't share it with anyone or put it in your code.
4. In Render, open your service, click **Environment**, then **Add Environment Variable**:
   - Key: `PIXABAY_API_KEY`
   - Value: paste your key
5. Click **Save, rebuild, and deploy**. After a couple of minutes, the outfits show photos, each crediting its photographer.

You can delete any old `UNSPLASH_ACCESS_KEY` or `PEXELS_API_KEY` entries on the same Environment page.

**Running on your own computer with photos** (Windows PowerShell):

```powershell
$env:PIXABAY_API_KEY="paste-your-key-here"
npm start
```

> Pixabay allows 100 photo searches per minute for free. Dressify also remembers the photos it found (for 24 hours, as Pixabay asks), so that's plenty.

---

## ⚠️ Good to know about the free plan

- **It "sleeps" when nobody uses it.** After about 15 minutes without visitors, the site goes to sleep. The next visitor waits around 30 to 60 seconds while it wakes up, then it's fast again. Paid plans don't sleep.
- **Saved looks are not permanent.** The free plan wipes saved files whenever the site restarts or updates, so the "Saved looks" list can reset. To keep them forever you would need a database (a good next project!).

## 🏷️ Want your own name, like `dressify.com`?

This is **optional**. The free `.onrender.com` link works perfectly well.

If you want your own domain name:

1. Buy one from a domain seller such as Namecheap, GoDaddy, Google Domains / Squarespace or Hostinger. It usually costs about ₹500 to ₹1,500 (about $8 to $20) per year. `.com` and `.in` names are common.
2. In Render, open your service, go to **Settings → Custom Domains**, and click **Add Custom Domain**.
3. Render shows you one or two DNS records. Add them in your domain seller's DNS settings.
4. Wait up to a few hours. Render sets up the secure `https://` padlock for you, free.
