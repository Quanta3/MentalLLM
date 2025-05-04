import express from 'express'
import textController from '../Controllers/textController.js'
import voiceQuery from '../Controllers/voiceController.js'
import protect from '../Middleware/auth_middleware.js'
import sucideLogger from '../Controllers/sucideLogger.js'
import saveQuery from '../Middleware/saveQuery.js'
import startSession from '../Controllers/startSession.js'
const router = express.Router()
import { transcribeAudio } from '../Controllers/audioController.js'


router.post('/query/text', saveQuery, textController)
router.post('/query/voice', saveQuery, voiceQuery)
router.get('/logs', protect, sucideLogger)
router.post('/start', startSession)
router.post('/transcribe', transcribeAudio)


export default router;