/*eslint-disable max-classes-per-file */
import rtmpServer from '@mediafish/rtmp-server';
import flv from '@mediafish/flv';
import fs from 'fs';

import { Writable, Transform } from 'stream';

const {
  writeData, type: {
    Video, AVC, Audio, AAC, FLVFile, FLVHeader, FLVTag,
  },
} = flv;

class Terminator extends Writable {
  constructor() {
    super({ objectMode: true });
  }

  _write(chunk, encoding, cb) {
    setImmediate(cb);
  }
}

class AudioExtractor extends Transform {
  constructor() {
    super({ objectMode: true });

    this.tags = [];
    this.start = 0;
    this.wroteHeader = false;

    this.header = new FLVHeader({
      version: 1,
      hasAudio: true,
      hasVideo: false,
    });
    this.tags = [];
  }

  _transform(obj, _, cb) {
    const { type, timestamp, data } = obj;
    if(type === 'audio') {
      this.tags.push(
        new FLVTag({ type: FLVTag.TagType.audio, timestamp, data }),
      );
      if(!this.start || timestamp - this.start > 750) {
        if(!this.wroteHeader) {
          this.wroteHeader = true;
          const flv = new FLVFile(this.header, this.tags);
          const byteLength = writeData(flv, null, 0);
          const buf = Buffer.alloc(byteLength);
          writeData(flv, buf, 0);
          cb(null, buf);
        } else {
          const byteLength = this.tags
            .map((t) => writeData(t, null, 0))
            .reduce((p, c) => p + c, 0);
          const buf = Buffer.alloc(byteLength);
          let offset = 4;
          this.tags.forEach((t) => {
            offset = writeData(t, buf, offset);
            //offset = writer.writeNumber(base - offset, buf, base, 4);
          });
          cb(null, buf);
        }
        this.tags = [];
        this.start = timestamp;
      } else {
        cb();
      }
    } else {
      cb(null);
    }
  }
}

let videoBuffer = Buffer.alloc(0);
let audioBuffer = Buffer.alloc(0);

//Start an RTMP server at rtmp://localhost/live
rtmpServer.createSimpleServer('/live')
  .on('data', ({ timestamp, type, data }) => {
    console.log(`RTMP message: type=${type}, timestamp=${timestamp}`);

    switch(type) {
      case 'video': {
        if(data.codec !== 7) {
          console.log('video', data);
          break;
        }
        //data is FLV video tag (AVC)
        //flv.print(data);

        //And then alloc a buff
        videoBuffer = Buffer.concat([videoBuffer, data.data]);
        break;
      }
      case 'audio':
        //console.log('audio', data);
        audioBuffer = Buffer.concat([audioBuffer, data.data]);
        break;
        //case 'data':
        ////data is an array of JS object
        //for(const item of data) {
        //console.log(`${JSON.stringify(item, null, 4)}`);
        //}
        //break;
      default:
        break;
    }
  })
  .pipe(new AudioExtractor())
  .on('finish', () => {
    console.log('Finish!');
  })
  .on('error', (err) => {
    console.error(err.stack);
  })
  .pipe(new Terminator());

//setInterval(() => {
//const video = new AVC({
//frameType: 2,
//codec: Video.Codec.AVC,
//packetType: AVC.PacketType.NALU,
//compositionTimeOffset: 0,
//data: videoBuffer,
//});

//const audio = new AAC({
//format: Audio.SoundFormat.AAC,
//sampleRate: Audio.SampleRate._44kHz,
//size: Audio.SampleLength._16Bit,
//isStereo: true,
//packetType: AAC.PacketType.Raw,
//data: audioBuffer,
//});

//const header = new FLVHeader({ version: 1, hasAudio: false, hasVideo: true });

//const tags = [
////new FLVTag({ type: FLVTag.TagType.audio, timestamp: 0, data: audio }),
//new FLVTag({ type: FLVTag.TagType.video, timestamp: 0, data: video }),
//];

//const file = new FLVFile(header, tags);

////First, pass null instead of a buffer to detect how many bytes are needed
//const byteLength = writeData(file, null, 0);
////And then alloc a buff
//const buffer = Buffer.alloc(byteLength);
////Finally, write the data actually to the buffer
//writeData(file, buffer, 0);

//fs.writeFileSync('example.flv', buffer, { flag: 'w' });
//console.log('wrote example');
//}, 5000);
