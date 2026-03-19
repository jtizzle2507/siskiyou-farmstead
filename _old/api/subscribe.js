const https = require('https');

function sendResendEmail(apiKey, to) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      from: 'Siskiyou Farmstead <hello@siskiyoufarmstead.com>',
      to: [to],
      subject: 'Welcome to Siskiyou Farmstead!',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2d5a3a; text-align: center;">Welcome to Siskiyou Farmstead!</h1>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Thank you for signing up for our newsletter! You'll be the first to know about:
          </p>
          <ul style="color: #333; font-size: 16px; line-height: 1.8;">
            <li>Fresh product availability</li>
            <li>Seasonal specials and new offerings</li>
            <li>Delivery schedule updates</li>
            <li>Farm news and events</li>
          </ul>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            We're passionate about bringing you the freshest greens and mushrooms grown right here in Siskiyou County.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://siskiyoufarmstead.com/#/shop"
               style="background: linear-gradient(135deg, #7c6a46 0%, #5a4a2a 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
              Shop Now
            </a>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">
            Siskiyou Farmstead &bull; Siskiyou County, CA
          </p>
        </div>
      `
    });

    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Resend API error ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function saveSubscriber(supabaseUrl, serviceRoleKey, email) {
  return new Promise((resolve, reject) => {
    const url = new URL(supabaseUrl);
    const data = JSON.stringify({ email: email, active: true });

    const req = https.request({
      hostname: url.hostname,
      path: '/rest/v1/farm_subscribers',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'resolution=merge-duplicates,return=representation'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body ? JSON.parse(body) : {});
        } else {
          reject(new Error(`Supabase error ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Send welcome email
    await sendResendEmail(apiKey, email);

    // Save subscriber to Supabase
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    if (serviceRoleKey && supabaseUrl) {
      try {
        await saveSubscriber(supabaseUrl, serviceRoleKey, email);
        console.log(`Subscriber saved to Supabase: ${email}`);
      } catch (subErr) {
        // Log but don't fail the request - email was already sent
        console.error('Failed to save subscriber to Supabase:', subErr.message);
      }
    } else {
      console.log(`New subscriber (no Supabase configured): ${email} at ${new Date().toISOString()}`);
    }

    return res.status(200).json({ success: true, message: 'Subscribed successfully!' });
  } catch (error) {
    console.error('Subscribe error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to subscribe. Please try again.' });
  }
};
