const path = require('path');
const express = require('express');
const fs = require('fs');
const gzipStatic = require('connect-gzip-static');
const http = require('http');
const https = require('https');

const httpsPort = process.env.NODE_ENV == 'production' ? 443 : 8081;

const httpServer = express();
const certbot = path.join(__dirname, './static/');
httpServer.get('/.well-known*', gzipStatic(certbot));
httpServer.get('/*', (req, res) => {
  res.redirect(`https://${req.hostname}:${httpsPort}${req.url}`);
});
httpServer.listen(8080);

const app = express();
const staticPath = path.join(__dirname, './dist');
app.use('/', gzipStatic(staticPath));
app.use('/*', gzipStatic(staticPath));

const sslDir = process.env.NODE_ENV == 'production' ? '/etc/letsencrypt/live/nchinda2.com/' : __dirname;

//Yes, SSL is required
const credentials = {
  key: fs.readFileSync(path.resolve(sslDir, 'privkey.pem')),
  cert: fs.readFileSync(path.resolve(sslDir, 'cert.pem')),
};

const httpsServer = https.createServer(credentials, app);

/**
* Listen on provided port, on all network interfaces.
*/
httpsServer.listen(httpsPort, '0.0.0.0');
