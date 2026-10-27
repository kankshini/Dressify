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
