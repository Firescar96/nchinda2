import path from 'path';
import express from 'express';
import fs from 'fs';
import gzipStatic from 'connect-gzip-static';
import https from 'https';
import http from 'http';

const httpPort = process.env.NODE_ENV == 'production' ? 80 : 8080;
const httpsPort = process.env.NODE_ENV == 'production' ? 443 : 8081;
const httpApp = express();
const certbot = path.resolve('./public/');
httpApp.get('/.well-known*', gzipStatic(certbot));
httpApp.get('/*', (req, res) => {
  res.redirect(`https://${req.hostname}:${httpsPort}${req.url}`);
});

const httpsApp = express();
const staticPath = path.resolve('./dist');
httpsApp.use('/', gzipStatic(staticPath));
httpsApp.use('/*', gzipStatic(staticPath));

const sslDir = process.env.NODE_ENV == 'production' ? '/etc/letsencrypt/live/nchinda2.com/' : path.resolve();

//Yes, SSL is required
const credentials = {
  key: fs.readFileSync(path.resolve(sslDir, 'privkey.pem')),
  cert: fs.readFileSync(path.resolve(sslDir, 'cert.pem')),
};

const httpServer = http.createServer(httpApp);
const httpsServer = https.createServer(credentials, httpsApp);

export {
  httpServer, httpsServer, httpPort, httpsPort,
};
