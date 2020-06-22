import path from 'path';
import express from 'express';
import fs from 'fs';
import gzipStatic from 'connect-gzip-static';
import https from 'https';

const httpsPort = process.env.NODE_ENV == 'production' ? 443 : 8081;
const httpServer = express();
const certbot = path.resolve('./static/');
httpServer.get('/.well-known*', gzipStatic(certbot));
httpServer.get('/*', (req, res) => {
  res.redirect(`https://${req.hostname}:${httpsPort}${req.url}`);
});

const app = express();
const staticPath = path.resolve('./dist');
app.use('/', gzipStatic(staticPath));
app.use('/*', gzipStatic(staticPath));

const sslDir = process.env.NODE_ENV == 'production' ? '/etc/letsencrypt/live/nchinda2.com/' : path.resolve();

//Yes, SSL is required
const credentials = {
  key: fs.readFileSync(path.resolve(sslDir, 'privkey.pem')),
  cert: fs.readFileSync(path.resolve(sslDir, 'cert.pem')),
};

const httpsServer = https.createServer(credentials, app);


export {httpServer, httpsServer, httpsPort};