const axios = require('axios');

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

    let baseUrl;
    if (path.startsWith('t/p/')) {
      baseUrl = TMDB_IMAGE_BASE;
    } else {
      baseUrl = TMDB_API_BASE;
    }

    const fullUrl = `${baseUrl}/${path}?${new URLSearchParams(query)}`;
    const response = await axios.get(fullUrl, {
      responseType: path.startsWith('t/p/') ? 'stream' : 'json',
    });

    if (path.startsWith('t/p/')) {
      res.setHeader('Content-Type', response.headers['content-type']);
      response.data.pipe(res);
    } else {
      res.status(200).json(response.data);
    }
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
};
