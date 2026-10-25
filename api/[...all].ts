import app from '../server.ts';

export default function handler(req: any, res: any) {
  // If cloud provider stripped /api prefix, restore it so Express routes match
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/sitemap') && !req.url.startsWith('/robots')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
}
