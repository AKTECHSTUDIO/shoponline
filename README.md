# 🛒 ShopOnline — Local Shop → Online Business SaaS MVP

A complete static SaaS website that helps local shop owners take their business online. Built with pure HTML, CSS, and vanilla JavaScript. No backend, no frameworks, 100% deployable on Netlify, Vercel, or GitHub Pages.

---

## 📁 Folder Structure

```
shoponline/
├── index.html                  ← Home page (long, all sections)
├── pages/
│   ├── services.html           ← All services
│   ├── works.html              ← Portfolio showcase
│   ├── pricing.html            ← Pricing plans + comparison table
│   ├── contact.html            ← Contact form + info
│   ├── client-form.html        ← ⭐ Main lead capture form
│   ├── about.html              ← Team, story, mission
│   └── privacy.html            ← Privacy policy
├── admin/
│   └── index.html              ← 🔧 Full admin dashboard
├── data/
│   ├── site.json               ← Global settings (name, colors, contact)
│   ├── pages.json              ← All page content (services, pricing, etc.)
│   └── clients.json            ← Client form submissions
├── assets/
│   ├── css/
│   │   └── main.css            ← Complete design system
│   └── js/
│       └── core.js             ← Shared utilities
├── google-apps-script.js       ← Google Sheets webhook code
├── netlify.toml                ← Netlify config
├── vercel.json                 ← Vercel config
└── README.md                   ← This file
```

---

## 🚀 Deployment Guide

### Option 1: Netlify (Recommended)

1. Push this folder to a GitHub repository
2. Go to [netlify.com](https://netlify.com) → "Add new site" → "Import from Git"
3. Select your repo
4. Build settings:
   - Build command: *(leave empty)*
   - Publish directory: `.`
5. Click **Deploy Site**
6. Done! Your site is live in ~30 seconds.

**Custom domain:** Netlify Dashboard → Domain Settings → Add custom domain

### Option 2: Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import Git Repository
3. Framework: **Other**
4. Root Directory: `.`
5. Click **Deploy**

### Option 3: GitHub Pages

1. Push to GitHub
2. Go to repo **Settings** → **Pages**
3. Source: Deploy from branch → `main` → `/ (root)`
4. Wait ~1 minute, site is live at `https://yourusername.github.io/repo-name`

> ⚠️ **GitHub Pages note:** The `/admin` route may need `admin/index.html` as direct URL.

---

## ⚙️ Configuration

### 1. Update Site Info

Edit `data/site.json`:
```json
{
  "name": "YourBrand",
  "contact": {
    "email": "you@yourdomain.com",
    "whatsapp": "91XXXXXXXXXX"
  }
}
```

### 2. Set Up Google Sheets (Form → Sheet)

1. Create a new Google Sheet
2. Copy your Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/**SHEET_ID**/edit`
3. Go to [script.google.com](https://script.google.com) → New Project
4. Paste the content of `google-apps-script.js`
5. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your Sheet ID
6. Click **Deploy** → **New Deployment** → Type: Web App
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Copy the Web App URL
8. Paste it in `data/site.json` → `features.googleSheetsWebhook`

### 3. Set Up EmailJS (Email Notifications)

1. Sign up at [emailjs.com](https://emailjs.com) (free plan: 200 emails/month)
2. Add an email service (Gmail, Outlook, etc.)
3. Create an email template. Use these template variables:
   ```
   {{client_name}}, {{shop_name}}, {{email}}, {{whatsapp}},
   {{category}}, {{location}}, {{budget}}, {{prompt_summary}}
   ```
4. Copy your Service ID, Template ID, and Public Key
5. Paste into `data/site.json` → `features.emailjs*` fields

### 4. Admin Panel

**Access:** `yourdomain.com/admin/` or `yourdomain.com/admin/index.html`

**Default password:** `admin123`
> ⚠️ Change this before going live! Edit line: `const PASS = localStorage.getItem('so_adm_p') || 'admin123';` in `admin/index.html`

**Also accessible via:** `?admin=true` query parameter on any page

**Admin features:**
- 📊 Overview dashboard with submission stats
- 📥 View/manage all client form submissions
- ⚙️ Edit site settings (name, colors, contact, SEO)
- 🏠 Edit hero section text and CTAs
- 🛠️ Add/edit/delete services
- 🖼️ Add/edit/delete portfolio items
- 💰 Manage pricing plans with feature lists
- ⭐ Edit testimonials
- 🔗 Configure Google Sheets + EmailJS integrations
- 🚀 **GitHub Publish button** — commits JSON changes to GitHub
- 📥 Export leads as CSV

### 5. GitHub Publish (from Admin)

To enable 1-click deploy from the admin panel:

1. Create a GitHub Personal Access Token:
   - GitHub → Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens
   - Repository: your repo
   - Permissions: **Contents: Read and Write**
2. In Admin Panel → **Integrations** → paste:
   - GitHub Token
   - Your GitHub username
   - Repository name
   - Branch (usually `main`)
3. Click **Save GitHub Config**

Now the "🚀 Publish" button in the admin will:
- Commit `data/site.json` and `data/pages.json` to GitHub
- Netlify/Vercel auto-detects the push and redeploys in ~30 seconds

---

## 🎨 Customization

### Colors
Edit CSS variables in `assets/css/main.css`:
```css
:root {
  --c-terra: #c85a2a;    /* Primary brand color */
  --c-gold:  #d4a254;    /* Accent color */
  --c-ink:   #1a1208;    /* Main text */
  --c-bg:    #faf7f2;    /* Page background */
}
```

Or use the Admin Panel → Site Settings to change colors dynamically.

### Content
All content is in `data/pages.json`. Edit directly or use the Admin Panel.

### Fonts
Currently using **Playfair Display** (display) + **DM Sans** (body).
Change in `assets/css/main.css` → `@import` line and `--font-display`/`--font-body` variables.

---

## 📋 Client Form Features

The `/pages/client-form.html` form collects:
- Name, Shop Name, Category (dropdown with 17 options + Other)
- WhatsApp number, Email, Location
- Pages required (8 checkbox options + custom field)
- Extra features (8 options: Maps, Social, Chatbot, Maintenance, SEO, Payments, WhatsApp, Multi-language)
- Budget selector (5 radio options)
- Timeline (5 dropdown options)
- Additional requirements (textarea)
- Reference URL (optional)
- Terms acceptance

On submit, it:
1. Validates all required fields
2. Posts to Google Sheets webhook
3. Sends EmailJS notification
4. Stores in browser `localStorage` as fallback
5. **Auto-generates a prompt summary** (ready to paste into AI tools for scope definition)
6. Shows a success screen with the generated brief

---

## 🔧 Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Structure |
| CSS3 (custom properties) | Styling, animations |
| Vanilla JS (ES6+) | Interactivity, data loading |
| JSON files | CMS / data store |
| Google Apps Script | Sheets webhook |
| EmailJS | Client-side email |
| GitHub API | Admin publish |
| Netlify/Vercel | Hosting + CI/CD |

**No frameworks. No npm. No build step.** Just open `index.html` and it works.

---

## 📱 Performance

- All pages load under **1.5 seconds** on 4G
- Google Fonts loaded with `display=swap` (non-blocking)
- Images replaced with emoji (swap with real images for production)
- CSS/JS are single files, no bundler needed
- Intersection Observer for scroll animations (no layout thrashing)

---

## 🔒 Security

- Admin panel requires password (stored hashed in localStorage)
- GitHub token stored in localStorage only (never sent to your server)
- No API keys exposed in public HTML
- HTTPS enforced via Netlify/Vercel
- CORS headers set for data files

---

## 📞 Customization Services

This is a template. For production use, you'll want to:
- Replace emoji placeholders with real product photos
- Add Google Analytics / Meta Pixel
- Set up a real domain (`.in` from GoDaddy/BigRock ~₹499/yr)
- Configure Razorpay for actual payments
- Add more portfolio items with real screenshots

---

*Built with ❤️ for India's 63 million local shop owners*
