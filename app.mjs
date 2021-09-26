import {
  httpServer, httpsServer, httpPort, httpsPort,
} from './server/server.mjs';

httpServer.listen(httpPort);
httpsServer.listen(httpsPort, '0.0.0.0');
