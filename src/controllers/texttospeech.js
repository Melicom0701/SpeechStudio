// azure-cognitiveservices-speech.js

const sdk = require('microsoft-cognitiveservices-speech-sdk');
const { Buffer } = require('buffer');
const { PassThrough } = require('stream');
const fs = require('fs');
const { promiseHooks } = require('v8');


const textToSpeech = async (key, region, text, filename)=> {
    
    // convert callback function to promise
    return new Promise((resolve, reject) => {
        
        const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
        speechConfig.speechSynthesisOutputFormat = 5; // mp3
        
        let audioConfig = null;
        
        if (filename) {
            audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename);
        }
        
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

        synthesizer.speakTextAsync(
            text,
            result => {
                
                const { audioData } = result;

                synthesizer.close();
                
                if (filename) {
                    
                    // return stream from file
                    const audioFile = fs.createReadStream(filename);
                    resolve(audioFile);
                    
                } else {
                    
                    // return stream from memory
                    const bufferStream = new PassThrough();
                    bufferStream.end(Buffer.from(audioData));
                    resolve(bufferStream);
                }
            },
            error => {
                synthesizer.close();
                reject(error);
            }); 
    });
};
const subscriptionKey = process.env.SPEECH_SERVICE_KEY;
const serviceRegion = process.env.SPEECH_SERVICE_REGION;

function tts(req, res) {
    console.log(subscriptionKey)
    textToSpeech(subscriptionKey, serviceRegion, req.body.text, null)
        .then((stream) => {
            console.log(req.body.text)
            res.set({
                'Content-Type': 'audio/mpeg',
                'Transfer-Encoding': 'chunked'
            });
            stream.pipe(res);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error generating speech");
        });
}

module.exports = {
    tts
};