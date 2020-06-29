import url from 'url';
import { httpServer, httpsServer, httpsPort } from './server/server.mjs';
import liveWS from './server/live.mjs';

/**
* Listen on provided port, on all network interfaces.
*/
httpServer.listen(8080);
httpsServer.listen(httpsPort, '0.0.0.0');
