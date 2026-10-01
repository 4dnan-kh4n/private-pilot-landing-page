import express from 'express';
import helmet from 'helmet';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const release = JSON.parse(readFileSync(path.join(directory, 'downloads', 'release.json'), 'utf8'));
export const app = express();
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: { directives: {
  'style-src': ["'self'", "'unsafe-inline'"],
  'upgrade-insecure-requests': null
} } }));
app.get('/downloads/privatepilot.zip', (_req, res, next) => {
  res.download(path.join(directory, 'downloads', release.fileName), release.fileName, error => {
    if (error && !res.headersSent) next(error);
  });
});
app.use(express.static(path.join(directory, 'dist')));

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 4173;
  app.listen(port, '127.0.0.1', () => console.log(`PrivatePilot website: http://127.0.0.1:${port}`));
}
