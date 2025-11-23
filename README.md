# Smart Prompt Builder - Deployment Guide

## 🔐 Password
**Default Password:** `AmbujAI`

## 📁 Project Structure
```
smart-prompt-builder/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # All styles
└── js/
    └── script.js      # All JavaScript (includes authentication)
```

## 🚀 Deployment on Render (or any static host)

### Important: NO .env FILE NEEDED!

This is a **static website** (HTML + CSS + JavaScript). It runs entirely in the browser.

**Why no .env file?**
- `.env` files are for **server-side** applications (Node.js, Python, etc.)
- This app has **no server** - it's just HTML/CSS/JS files
- Everything runs in the user's browser

### How Security Works:

1. **Password:**
   - Stored as a **hash** in `js/script.js` (line ~17)
   - Hash: `772869139` = Password: `AmbujAI`
   - To change password:
     - Open `js/script.js`
     - Find `const CORRECT_HASH = "772869139";`
     - Calculate new hash using the `simpleHash()` function
     - Replace the hash value

2. **API Key:**
   - **NOT stored in code**
   - Users enter their own OpenRouter API key
   - Saved in browser's `localStorage`
   - This is called "Bring Your Own Key" (BYOK) model

### Deployment Steps (Render):

1. Push code to GitHub
2. Go to Render.com → New Static Site
3. Connect your GitHub repo
4. **Build Command:** Leave empty (no build needed)
5. **Publish Directory:** `./` (root directory)
6. Deploy!

### Deployment Steps (Other Platforms):

**Netlify:**
- Drag and drop the entire folder
- Done!

**GitHub Pages:**
```bash
git add .
git commit -m "Deploy"
git push origin main
```
- Go to Settings → Pages → Select branch → Save

**Vercel:**
- Import GitHub repo
- Framework Preset: Other
- Deploy!

## 🔑 Changing the Password

1. Open `js/script.js`
2. Find the `simpleHash` function (around line 19)
3. Use browser console to calculate new hash:
```javascript
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return hash.toString();
}
console.log(simpleHash("YourNewPassword"));
```
4. Replace `CORRECT_HASH` value with the new hash

## ⚠️ Security Note

This is **client-side authentication** - it prevents casual access but is NOT military-grade security. For production apps with sensitive data, use proper backend authentication.

For a public tool like this, it's perfectly fine! 👍
