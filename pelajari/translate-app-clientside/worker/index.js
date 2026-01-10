/**
 * Cloudflare Worker - DeepL API Proxy
 * 
 * This worker acts as a proxy between your frontend and DeepL API
 * to bypass CORS restrictions.
 */

const DEEPL_API_URL = 'https://api-free.deepl.com/v2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-DeepL-API-Key',
  'Access-Control-Max-Age': '86400',
};

async function handleRequest(request) {
  const url = new URL(request.url);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  // Get API key from request header
  const apiKey = request.headers.get('X-DeepL-API-Key');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key is required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Route requests
  const path = url.pathname;

  try {
    if (path === '/languages') {
      return await getLanguages(apiKey);
    } else if (path === '/translate/text') {
      return await translateText(request, apiKey);
    } else if (path === '/document/upload') {
      return await uploadDocument(request, apiKey);
    } else if (path.startsWith('/document/') && path.endsWith('/status')) {
      return await checkStatus(request, apiKey, path);
    } else if (path.startsWith('/document/') && path.endsWith('/download')) {
      return await downloadDocument(request, apiKey, path);
    } else {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Get supported languages
async function getLanguages(apiKey) {
  const response = await fetch(`${DEEPL_API_URL}/languages?type=target`, {
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`
    }
  });

  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Translate text
async function translateText(request, apiKey) {
  const body = await request.json();
  
  const params = new URLSearchParams();
  params.append('text', body.text);
  params.append('target_lang', body.target_lang);
  if (body.source_lang) {
    params.append('source_lang', body.source_lang);
  }
  
  const response = await fetch(`${DEEPL_API_URL}/translate`, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Upload document for translation
async function uploadDocument(request, apiKey) {
  const formData = await request.formData();
  
  const response = await fetch(`${DEEPL_API_URL}/document`, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`
    },
    body: formData
  });

  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Check translation status
async function checkStatus(request, apiKey, path) {
  // Extract document_id from path: /document/{id}/status
  const documentId = path.split('/')[2];
  
  const body = await request.text();
  
  const response = await fetch(`${DEEPL_API_URL}/document/${documentId}`, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body
  });

  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Download translated document
async function downloadDocument(request, apiKey, path) {
  // Extract document_id from path: /document/{id}/download
  const documentId = path.split('/')[2];
  
  const body = await request.text();
  
  const response = await fetch(`${DEEPL_API_URL}/document/${documentId}/result`, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body
  });

  // Return the file blob
  const blob = await response.blob();
  
  return new Response(blob, {
    status: response.status,
    headers: {
      ...corsHeaders,
      'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment'
    }
  });
}

// Export for Cloudflare Workers
export default {
  async fetch(request) {
    return handleRequest(request);
  }
};
