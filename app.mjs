import url from 'url';
import {httpServer, httpsServer, httpsPort} from './server/server.mjs';
import liveWS from './server/live.mjs';

httpsServer.on('upgrade', function upgrade(request, socket, head) {
    const streamPage = url.parse(request.url).pathname.split('/')[1];
    if (streamPage === 'live') {
      liveWS.handleUpgrade(request, socket, head, function done(ws) {
          liveWS.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  
/**
* Listen on provided port, on all network interfaces.
*/
httpServer.listen(8080);
httpsServer.listen(httpsPort, '0.0.0.0');
