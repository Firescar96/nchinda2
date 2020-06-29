import { httpServer, httpsServer, httpsPort } from './server/server.mjs';
import './server/live.mjs';

httpServer.listen(8080);
httpsServer.listen(httpsPort, '0.0.0.0')