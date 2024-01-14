const express = require('express');
const voiceAnalysis = require('../controllers/voiceAnalysis');
const texttospeech = require('../controllers/texttospeech');
const router = express.Router();
router.post('/voiceAnalysis', voiceAnalysis.analyzeAudio);
router.post('/textToSpeech', texttospeech.tts);
module.exports = router; 