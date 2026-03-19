const https = require('https');

function uploadToSupabase(fileBuffer, fileName, contentType) {
  const SB_URL = process.env.SUPABASE_URL || 'https://wqziuuslzjyfgqsvvcca.supabase.co';
  const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const host = SB_URL.replace('https://', '');
  const path = `/storage/v1/object/product-images/${fileName}`;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: host,
      path: path,
      method: 'POST',
      headers: {
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length,
        'x-upsert': 'true'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const publicUrl = `${SB_URL}/storage/v1/object/public/product-images/${fileName}`;
          resolve(publicUrl);
        } else {
          reject(new Error(`Storage error ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(fileBuffer);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { image, fileName, contentType } = req.body || {};

    if (!image || !fileName) {
      return res.status(400).json({ error: 'Image data and fileName are required' });
    }

    // image is a base64 string
    const buffer = Buffer.from(image, 'base64');

    // Generate unique filename
    const ext = fileName.split('.').pop();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;

    const publicUrl = await uploadToSupabase(buffer, uniqueName, contentType || 'image/jpeg');

    return res.status(200).json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Upload error:', error.message);
    return res.status(500).json({ error: error.message || 'Upload failed' });
  }
};
