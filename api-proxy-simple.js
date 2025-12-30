// Simple DeepL Proxy - Deploy ke Vercel/Netlify
// File: api/translate.js (Vercel) atau netlify/functions/translate.js (Netlify)

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { text, source_lang, target_lang, api_key } = req.body;
    
    if (!api_key) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    // Forward to DeepL API
    const deeplResponse = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        source_lang,
        target_lang,
      }),
    });
    
    const data = await deeplResponse.json();
    
    if (!deeplResponse.ok) {
      return res.status(deeplResponse.status).json(data);
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Alternative: Express.js version (jika pakai Node server)
/*
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/translate', async (req, res) => {
  const { text, source_lang, target_lang, api_key } = req.body;
  
  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, source_lang, target_lang }),
  });
  
  const data = await response.json();
  res.json(data);
});

app.listen(3001, () => console.log('Proxy running on port 3001'));
*/
