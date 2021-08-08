var mic = require('mic');

const Speaker = require('speaker');

const baudio = require('baudio');

const {Readable} = require('stream')

const isBuffer = require('is-buffer')

const chunkingStreams = require('chunking-streams');
var SizeChunker = chunkingStreams.SizeChunker;



const getSpeakerStream = () => {
    const speaker = new Speaker({
        channels: 1,          
        bitDepth: 16,         
        sampleRate: 16000,
      });
      return speaker
}

const writeWSMsgIntoSpeaker = (speaker, msg) => {
    if(isBuffer(msg)){
        try {
            speaker.write(msg);        
         } catch (e) {}
    }
}


const startStreamMicAudioIntoWebSocket = (ws) => {  
    var micInstance = mic({
        rate: '16000',
        channels: 1
    });
    var chunker = new SizeChunker({
        chunkSize: 640 // must be a number greater than zero. 
    });  
    var micInputStream = micInstance.getAudioStream();
    micInputStream.pipe(chunker);
    micInstance.start();
    chunker.on('data', function(chunk) {
        const data = chunk.data;
        var buf;
        if (data.length == 640){
            try {
               ws.send(data);
            }
            catch (e) {
            };
        }
        else{
            buf += data;
            if (buf.length == 640){
                try {
                   ws.send(data);
                }
                catch (e) {
                };
                buf = null;
            }
        }
    });
}

module.exports = {
    getSpeakerStream,
    writeWSMsgIntoSpeaker,
    startStreamMicAudioIntoWebSocket
}