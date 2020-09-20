import {
  httpServer, httpsServer, httpPort, httpsPort,
} from './server/server.mjs';
import './server/live.mjs';

httpServer.listen(httpPort);
httpsServer.listen(httpsPort, '0.0.0.0');
