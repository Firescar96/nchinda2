class WSClient {
  constructor(websocket) {
    this.id = websocket.id;
    this.websocket = websocket;
    this.lastFrameTime;
    this.lastSyncTime;
    this.ackedSyncRequest = false; //marks clients who provided updated current time for sync request
  }

  update(data) {
    this.name = data.name;
    this.loadingSyncComplete = data.loadingSyncComplete;
    this.lastFrameTime = data.lastFrameTime;
    this.lastSyncTime = Date.now();
  }
}

export { WSClient };
