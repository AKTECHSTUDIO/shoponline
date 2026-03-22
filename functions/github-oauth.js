// functions/github-oauth.js — Cloudflare Pages Function

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const res = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: CORS });

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

// GET /github-oauth?debug=1 — shows config status without exposing secrets
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  if (url.searchParams.get('debug') === '1') {
    const id     = env.GITHUB_CLIENT_ID || '';
    const secret = env.GITHUB_CLIENT_SECRET || '';
    return res({
      debug: true,
      GITHUB_CLIENT_ID_set:     !!id,
      GITHUB_CLIENT_ID_length:  id.length,
      GITHUB_CLIENT_ID_prefix:  id.slice(0, 6) || '(empty)',
      GITHUB_CLIENT_SECRET_set:    !!secret,
      GITHUB_CLIENT_SECRET_length: secret.length,
      GITHUB_CLIENT_SECRET_prefix: secret.slice(0, 4) || '(empty)',
      note: 'Secrets are not shown in full for security. Check prefix matches what you set.'
    });
  }
  return res({ status: 'github-oauth function is running', method: 'POST required' });
}

export async function onRequestPost({ request, env }) {
  const CLIENT_ID     = env.GITHUB_CLIENT_ID     || '';
  const CLIENT_SECRET = env.GITHUB_CLIENT_SECRET || '';

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res({
      error: `Environment variables not set. GITHUB_CLIENT_ID=${!!CLIENT_ID}, GITHUB_CLIENT_SECRET=${!!CLIENT_SECRET}. Add them in Cloudflare Pages → Settings → Variables and Secrets, then redeploy.`
    }, 500);
  }

  let code;
  try { code = (await request.json()).code; }
  catch (e) { return res({ error: 'Invalid JSON: ' + e.message }, 400); }
  if (!code) return res({ error: 'Missing code' }, 400);

  // Exchange code for access token — log raw GitHub response for debugging
  let rawBody, tok;
  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
    });
    rawBody = await r.text();
    try { tok = JSON.parse(rawBody); }
    catch(e) { return res({ error: 'GitHub returned non-JSON: ' + rawBody.slice(0, 200) }, 502); }
  } catch (e) {
    return res({ error: 'Fetch to GitHub failed: ' + e.message }, 502);
  }

  if (tok.error || !tok.access_token) {
    // Return the EXACT GitHub error + a hint about what it means
    const hint =
      tok.error === 'bad_verification_code' ? 'The code expired or was already used. Try logging in again.' :
      tok.error === 'incorrect_client_credentials' ? 'GITHUB_CLIENT_SECRET is wrong. Regenerate it on GitHub and update Cloudflare env var.' :
      tok.error === 'redirect_uri_mismatch' ? 'Callback URL in GitHub OAuth App settings does not match.' :
      tok.error === 'not_found' ? 'GITHUB_CLIENT_ID does not match any OAuth app, OR GITHUB_CLIENT_SECRET belongs to a different app.' :
      'Check your GitHub OAuth App settings.';

    return res({
      error: `GitHub says: "${tok.error}" — ${tok.error_description || hint}`,
      github_raw: tok,
      client_id_used: CLIENT_ID.slice(0,8) + '...',
      client_id_length: CLIENT_ID.length,
    }, 401);
  }

  // Get user
  let user;
  try {
    const r = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${tok.access_token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'ShopOnline-Admin' },
    });
    user = await r.json();
  } catch (e) { return res({ error: 'User fetch failed: ' + e.message }, 502); }

  if (!user.login) return res({ error: 'No login in user response: ' + JSON.stringify(user).slice(0,100) }, 401);

  return res({ access_token: tok.access_token, login: user.login, name: user.name || user.login, avatar_url: user.avatar_url });
}

export async function onRequest(ctx) {
  const m = ctx.request.method;
  if (m === 'POST')    return onRequestPost(ctx);
  if (m === 'GET')     return onRequestGet(ctx);
  if (m === 'OPTIONS') return onRequestOptions();
  return res({ error: 'Use POST' }, 405);
}
