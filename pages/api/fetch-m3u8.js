export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, referer } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Validate URL
    new URL(url);

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    if (referer) {
      headers['Referer'] = referer;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/vnd.apple.mpegurl') && 
        !contentType.includes('audio/mpegurl') && !contentType.includes('text/plain')) {
      // Allow text content types as well
    }

    const content = await response.text();

    res.status(200).json({
      success: true,
      content: content,
      contentType: contentType || 'unknown'
    });

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch M3U8 file',
      details: error.message 
    });
  }
}