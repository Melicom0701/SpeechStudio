// azure-cognitiveservices-speech.js

const sdk = require('microsoft-cognitiveservices-speech-sdk');
const { Buffer } = require('buffer');
const { PassThrough } = require('stream');
const fs = require('fs');
const { promiseHooks } = require('v8');
const { uploadToBlobStorage } = require('../config/blob');

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
    const text = req.body.text;
    
    const filename ='audio.mp3';
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = 'jhackathon'; // Replace with your container name

    textToSpeech(subscriptionKey, serviceRegion, text, null)
        .then((stream) => {
            return uploadToBlobStorage(stream, containerName, filename, connectionString);
        })
        .then(() => {
            res.status(200).json({filelocation: `https://jhackathon.blob.core.windows.net/jhackathon/${filename}`});
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error generating or uploading speech");
        });
}

module.exports = {
    tts
};