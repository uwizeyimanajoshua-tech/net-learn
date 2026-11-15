import app from '../server.js';

export default function handler(req: any, res: any) {
  // Restore original request path if modified or stripped by Vercel serverless gateway
  const originalPath = 
    req.headers['x-matched-path'] || 
    req.headers['x-forwarded-uri'] || 
    req.headers['x-now-original-path'] || 
    req.headers['x-original-url'];

  if (typeof originalPath === 'string' && originalPath.startsWith('/api')) {
    const queryIdx = (req.url || '').indexOf('?');
    const queryString = queryIdx !== -1 ? req.url.slice(queryIdx) : '';
    req.url = originalPath + queryString;
  } else if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/sitemap') && !req.url.startsWith('/robots')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }

  return app(req, res);
}
