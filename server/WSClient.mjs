import wrtc from 'wrtc';
import SimplePeer from 'simple-peer';

class WSClient {
  constructor(websocket) {
    this.id = websocket.id;
    this.websocket = websocket;
    this.lastFrameTime = null;
    this.ackedSyncRequest = false; //marks clients who provided updated current time for sync request

    this.webrtcConnection = new SimplePeer({
      wrtc,
      initiator: true,
    });

    this.streams = {};
  }

  update(data) {
    this.name = data.name;
    this.loadingSyncComplete = data.loadingSyncComplete;
    this.lastFrameTime = data.lastFrameTime;
    this.isActiveTyping = data.isActiveTyping;
  }
}

export { WSClient };
