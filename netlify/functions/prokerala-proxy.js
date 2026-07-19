// netlify/functions/prokerala-proxy.js
// No fetch import needed — Node 18 has it built-in

const PROKERALA_BASE = 'https://api.prokerala.com';
let cachedToken = null;
let tokenExpiry = 0;

const getToken = async (clientId, clientSecret) => {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  const res = await fetch(`${PROKERALA_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) throw new Error(`Prokerala auth failed: ${res.status}`);
  const d = await res.json();
  cachedToken = d.access_token;
  tokenExpiry = now + (d.expires_in - 60) * 1000;
  return cachedToken;
};

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  try {
    const clientId     = process.env.PROKERALA_CLIENT_ID_NEW;
    const clientSecret = process.env.PROKERALA_CLIENT_SECRET_NEW;

    if (!clientId || !clientSecret) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Prokerala credentials not configured' }),
      };
    }

    const token = await getToken(clientId, clientSecret);

    const prokeralaPath = event.path
	  .replace('/.netlify/functions/prokerala-proxy', '')
	  .replace('/api/prokerala', '');
	
	const targetUrl = `${PROKERALA_BASE}/v2${prokeralaPath}${event.rawQuery ? '?' + event.rawQuery : ''}`;

    const apiRes = await fetch(targetUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await apiRes.json();

    return {
      statusCode: apiRes.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};