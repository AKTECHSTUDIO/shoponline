// netlify/functions/github-oauth.js
// Exchanges GitHub OAuth code → access_token server-side
// so CLIENT_SECRET never appears in browser JS.

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method not allowed' }) };

  let code;
  try { code = JSON.parse(event.body || '{}').code; }
  catch (e) { return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Invalid body' }) }; }

  if (!code) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Missing code' }) };

  const CLIENT_ID     = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({
      error: 'OAuth not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Netlify → Site Settings → Environment Variables.'
    })};
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      return { statusCode: 401, headers: cors, body: JSON.stringify({
        error: tokenData.error_description || tokenData.error || 'No token returned'
      })};
    }

    // Get GitHub user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${tokenData.access_token}`, Accept: 'application/vnd.github+json' },
    });
    const user = await userRes.json();

    if (!user.login) return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Could not fetch GitHub profile' }) };

    return { statusCode: 200, headers: cors, body: JSON.stringify({
      access_token: tokenData.access_token,
      login: user.login,
      name: user.name || user.login,
      avatar_url: user.avatar_url,
    })};

  } catch (e) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message }) };
  }
};
