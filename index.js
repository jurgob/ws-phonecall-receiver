'use strict'

const {
    getSpeakerStream, 
    writeWSMsgIntoSpeaker,
    startStreamMicAudioIntoWebSocket
} = require('./audioutils.js')

/* 
    phone example: https://gixthub.com/sammachin/puckcall
    websocket audio example: https://www.nexmo.com/legacy-blog/2016/12/19/streaming-calls-to-a-browser-with-voice-websockets-dr
*/
const DATACENTER = `https://api.nexmo.com`

function getDomain(url){
    const domain = url.split('://')[1]
    return domain;
}



const voiceEvent = async (req, res, next) => {
    const { logger } = req.nexmo;
    try { 
        logger.info("voiceEvent", { event: req.body});
        res.json({});
    } catch (err) {
        logger.error("Error on voiceEvent function")
    }
}

const voiceAnswer = async (req, res, next) => {
    const {
        config
    } = req.nexmo;
    const ncco = [
        {
            "action": "connect",
            "random_from_number": true,
            "endpoint":[
                {
                    "type": "websocket",
                    "uri": `wss://${getDomain(config.server_url)}/socket`,
                    "content-type": "audio/l16;rate=16000",
                    "headers": {
                        "app": "audiosocket"
                    }
                }
            ]
        },
    ]
    res.json(ncco)
}


const route = (app, express) => {
    
    const expressWs = require('express-ws')(app);
    const WebSocket = require('ws');
    
    expressWs.getWss().on('connection', function (ws) {});
    const speaker = getSpeakerStream()
    
    app.ws('/socket', (ws, req) => {
        const {
            logger,
            csClient,
            config
        } = req.nexmo;
        logger.info('web socket start /socket')
        startStreamMicAudioIntoWebSocket(ws)
        ws.on('message', (msg) => {
            writeWSMsgIntoSpeaker(speaker, msg)
        });
    });

};

module.exports = {
    voiceEvent,
    voiceAnswer,
    route
}