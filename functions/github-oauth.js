// functions/github-oauth.js
// ============================================
// Cloudflare Pages Function
// Handles GitHub OAuth code → token exchange
// server-side so CLIENT_SECRET stays hidden.
//
// Cloudflare Pages Functions live in /functions/
// and are served at the same path as the file.
// This file is served at: /github-oauth
// ============================================

export async function onRequestPost({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Parse request body
  let code;
  try {
    const body = await request.json();
    code = body.code;
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400, headers: cors });
  }

  if (!code) {
    return new Response(JSON.stringify({ error: 'Missing code parameter' }), { status: 400, headers: cors });
  }

  const CLIENT_ID     = env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return new Response(JSON.stringify({
      error: 'OAuth not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Cloudflare Pages → Settings → Environment Variables.'
    }), { status: 500, headers: cors });
  }

  try {
    // Exchange code → access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      return new Response(JSON.stringify({
        error: tokenData.error_description || tokenData.error || 'No access token returned'
      }), { status: 401, headers: cors });
    }

    // Get GitHub user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${tokenData.access_token}`,
        Accept: 'application/vnd.github+json',
      },
    });
    const user = await userRes.json();

    if (!user.login) {
      return new Response(JSON.stringify({ error: 'Could not fetch GitHub user profile' }), { status: 401, headers: cors });
    }

    return new Response(JSON.stringify({
      access_token: tokenData.access_token,
      login: user.login,
      name: user.name || user.login,
      avatar_url: user.avatar_url,
    }), { status: 200, headers: cors });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
