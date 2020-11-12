class JSMpegPipeSource {
  constructor(url, options) {
    this.url = url;
    this.options = options;
    this.streaming = true;

    this.destination = null;

    this.running = false;

    this.completed = false;
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
    if(this.destination && this.running) {
      this.destination.write(data);
    }
  }
}

export default JSMpegPipeSource;
