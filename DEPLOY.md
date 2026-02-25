# Deploy to GitHub Pages

Your project is ready to push. Follow these steps:

## 1. Create the GitHub repository

1. Go to **https://github.com/new**
2. **Repository name:** `climate-spirograph`
3. **Visibility:** Public
4. Do **not** add a README, .gitignore, or license (we already have them)
5. Click **Create repository**

## 2. Push your code

If your GitHub username is **not** `angelinasilvestri`, update the remote:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/climate-spirograph.git
```

Then push:

```bash
git push -u origin main
```

(Cursor may prompt you to sign in to GitHub if needed.)

## 3. Enable GitHub Pages

1. On the repo page, go to **Settings** → **Pages**
2. Under **Source**, choose **Deploy from a branch**
3. **Branch:** `main` → **/ (root)** → **Save**

## 4. Live URL

After a minute or two, your site will be at:

**https://YOUR_USERNAME.github.io/climate-spirograph/**

Example: **https://angelinasilvestri.github.io/climate-spirograph/**
