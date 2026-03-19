const https = require('https');

function sendEmail(apiKey, { name, email, message }) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      from: 'Siskiyou Farmstead <hello@siskiyoufarmstead.com>',
      to: ['hello@siskiyoufarmstead.com'],
      reply_to: email,
      subject: `Contact Form: ${name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; padding: 20px;">
          <h2 style="color: #2d2d2d;">New Contact Form Message</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr style="border: 1px solid #e8e4dc;" />
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server configuration error' });

  try {
    await sendEmail(apiKey, { name, email, message });
    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Contact error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to send message. Please try again.' });
  }
};
