class JSMpegPipeSource {
  constructor(url, options) {
    this.url = url;
    this.options = options;

    //video/audio output desination
    this.destination = null;

    //streaming tells jsmpeg to not collect timestamps and use the latest frame
    //unfortunately it also forces jsmpeg autoplay on, so we can't create the jsmpeg instance til after we want to start making noise
    this.streaming = true;
  }

  connect(destination) {
    this.destination = destination;
  }

  destroy() {
    this.running = false;
  }

  start() {
    this.running = true;
    this.established = true;
  }

  resume(secondsHeadroom) {}

  write(data) {
    if(this.destination && this.established) {
      this.destination.write(data);
    }
  }
}

export default JSMpegPipeSource;
