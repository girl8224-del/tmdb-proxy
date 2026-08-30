const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const { path, ...query } = req.query;
    if (!path) {
      res.status(400).json({ error: 'Missing path' });
      return;
    }

    let baseUrl, apiPath;
    if (path.startsWith('api/')) {
      baseUrl = TMDB_API_BASE;
      apiPath = path.slice(4); // убираем 'api/'
    } else if (path.startsWith('image/')) {
      baseUrl = TMDB_IMAGE_BASE;
      apiPath = path.slice(6); // убираем 'image/'
    } else {
      baseUrl = TMDB_API_BASE;
      apiPath = path;
    }

    const fullUrl = `${baseUrl}/${apiPath}?${new URLSearchParams(query)}`;
    console.log('Proxying to:', fullUrl);

    const response = await fetch(fullUrl);

    if (path.startsWith('image/')) {
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
      res.status(200).send(Buffer.from(buffer));
    } else {
      const data = await response.json();
      res.status(200).json(data);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
};
