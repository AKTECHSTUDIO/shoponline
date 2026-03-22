# GitHub OAuth Setup — Cloudflare Pages
# ==========================================
# Your site: https://shoponline.pages.dev
# ==========================================

## OVERVIEW
Cloudflare Pages Functions work like Netlify Functions.
The file /functions/github-oauth.js is already included
in this zip and handles the OAuth exchange server-side.

## STEP 1 — Create GitHub OAuth App (2 minutes)

1. Go to: https://github.com/settings/applications/new
   (or GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App)

2. Fill in EXACTLY:
   ┌─────────────────────────────────────────────────────────────┐
   │ Application name:    My ShopOnline Admin                    │
   │ Homepage URL:        https://shoponline.pages.dev           │
   │ Authorization callback URL: https://shoponline.pages.dev/admin/  │
   └─────────────────────────────────────────────────────────────┘
   ⚠️  The callback URL must match EXACTLY — including the trailing slash.

3. Click "Register application"

4. On the next page:
   • Copy the "Client ID" (looks like: Ov23liXXXXXXXXXXXXXX)
   • Click "Generate a new client secret"
   • Copy the secret IMMEDIATELY — GitHub only shows it once

   Keep both values ready for Step 2.


## STEP 2 — Add Environment Variables in Cloudflare Pages (2 minutes)

1. Go to: https://dash.cloudflare.com
2. Click "Pages" in the left sidebar
3. Click your project "shoponline"
4. Click "Settings" tab → "Environment variables"
5. Click "Add variable" and add BOTH:

   ┌──────────────────────────┬──────────────────────────────────┐
   │ Variable name            │ Value                            │
   ├──────────────────────────┼──────────────────────────────────┤
   │ GITHUB_CLIENT_ID         │ (paste your Client ID here)      │
   │ GITHUB_CLIENT_SECRET     │ (paste your Client Secret here)  │
   └──────────────────────────┴──────────────────────────────────┘

6. Set both for "Production" environment
7. Click "Save"

⚠️  NEVER paste the Client Secret anywhere in your HTML/JS files.
    It must ONLY go in Cloudflare environment variables.


## STEP 3 — Deploy the Updated Files (1 minute)

Push the updated code to your GitHub repo (which has the
/functions/github-oauth.js file). Cloudflare will auto-deploy.

If you're uploading manually:
1. Cloudflare Pages → your project → "Deployments" tab
2. Click "Upload assets" or push to connected GitHub repo
3. Wait for deploy to complete (~30 seconds)


## STEP 4 — Configure Admin Panel (1 minute)

1. Visit: https://shoponline.pages.dev/admin/
2. You'll see "First-Time Setup" screen
3. Click "Use GitHub Login (Recommended)"
4. You'll see setup instructions — paste your GitHub Client ID
5. Click "Save & Enable OAuth"
6. Click "Sign in with GitHub"
7. Authorize the app on GitHub
8. You're in! ✅


## STEP 5 — Test it works (30 seconds)

1. Open an incognito/private window
2. Go to https://shoponline.pages.dev/admin/
3. You should see "Sign in with GitHub" — NOT the old password screen
4. If you sign in with a DIFFERENT GitHub account, you should see "Access Denied"
5. If you sign in with YOUR account (the repo owner), you get in ✅


## TROUBLESHOOTING

Problem: "OAuth not configured" error
→ Check Step 2 — environment variables must be named exactly:
   GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET (case-sensitive)
→ Make sure you saved for "Production" not just "Preview"
→ Redeploy after adding variables

Problem: "redirect_uri mismatch" error from GitHub
→ Your callback URL in the GitHub OAuth App settings doesn't match
→ Go to github.com/settings/developers → edit your app
→ Set callback URL to EXACTLY: https://shoponline.pages.dev/admin/
→ (include the trailing slash, no extra path)

Problem: "Access denied — wrong account"
→ Normal! Only the repo owner can log in
→ Make sure you're logging in with the GitHub account that owns the repo
→ The "allowed owner" is read from Admin → Integrations → GitHub Username

Problem: Function returns 500 or "failed to fetch /github-oauth"
→ The Cloudflare function may not be deployed yet
→ Check Cloudflare Pages → Functions tab — should show github-oauth
→ Try redeploying

Problem: Still seeing old password screen
→ Clear localStorage: open DevTools → Application → Local Storage → Clear all
→ Hard refresh (Ctrl+Shift+R)


## HOW THE SECURITY WORKS

  Browser                     Cloudflare Function           GitHub
     │                               │                        │
     │── visits /admin/ ────────────>│                        │
     │<─ shows "Sign in with GitHub" │                        │
     │                               │                        │
     │── clicks Sign in ─────────────────────────────────────>│
     │<─ GitHub asks permission ─────────────────────────────│
     │── user approves ──────────────────────────────────────>│
     │<─ GitHub sends ?code=XXXX ────────────────────────────│
     │                               │                        │
     │── POST /github-oauth {code} ->│                        │
     │                               │── POST with SECRET ──>│
     │                               │<─ access_token ───────│
     │<── {token, login, avatar} ────│                        │
     │                               │                        │
     │── checks: login === owner? ───│                        │
     │── YES: grant access ──────────│                        │
     │── NO:  show "Access Denied" ──│                        │

The CLIENT_SECRET never touches the browser.
Even if someone opens DevTools, they cannot see it.


## SECURITY RATING: ⭐⭐⭐⭐⭐
- Only YOUR GitHub account can log in
- Client Secret is server-side only (Cloudflare env var)
- Sessions expire after 8 hours
- State parameter prevents CSRF attacks
- Works on free Cloudflare Pages plan
