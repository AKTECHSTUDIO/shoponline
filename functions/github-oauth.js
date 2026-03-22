// functions/github-oauth.js
// ============================================
// Cloudflare Pages Function
// Location: /functions/github-oauth.js  ← must be at repo ROOT/functions/
// Served at URL: /github-oauth
//
// Set these in Cloudflare Pages → Settings → Variables and Secrets:
//   GITHUB_CLIENT_ID     (type: Text)
//   GITHUB_CLIENT_SECRET (type: Secret)
// ============================================

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const ok  = (data)    => new Response(JSON.stringify(data), { status: 200, headers: CORS });
const err = (msg, s)  => new Response(JSON.stringify({ error: msg }), { status: s||400, headers: CORS });

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  const CLIENT_ID     = env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return err(
      'Environment variables missing. In Cloudflare Pages → Settings → Variables and Secrets, add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET, then redeploy.',
      500
    );
  }

  let code;
  try { code = (await request.json()).code; }
  catch (e) { return err('Invalid request body', 400); }
  if (!code) return err('Missing code', 400);

  // Exchange code for access token
  let tok;
  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
    });
    tok = await r.json();
  } catch (e) { return err('GitHub token request failed: ' + e.message, 502); }

  if (tok.error || !tok.access_token) {
    return err('GitHub OAuth error: ' + (tok.error_description || tok.error || 'no token returned'), 401);
  }

  // Get user profile
  let user;
  try {
    const r = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${tok.access_token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'ShopOnline-Admin' },
    });
    user = await r.json();
  } catch (e) { return err('GitHub user fetch failed: ' + e.message, 502); }

  if (!user.login) return err('Could not get GitHub username', 401);

  return ok({ access_token: tok.access_token, login: user.login, name: user.name || user.login, avatar_url: user.avatar_url });
}

// Catch all other methods
export async function onRequest(ctx) {
  if (ctx.request.method === 'POST')   return onRequestPost(ctx);
  if (ctx.request.method === 'OPTIONS') return onRequestOptions();
  return err('Use POST', 405);
}
