import express from 'express'
import textController from '../Controllers/textController.js'
import voiceQuery from '../Controllers/voiceController.js'
import protect from '../Middleware/auth_middleware.js'
import sucideLogger from '../Controllers/sucideLogger.js'
const router = express.Router()



router.get('/query/text', textController)
router.get('/query/voice', voiceQuery)
router.get('/logs', protect, sucideLogger)

export default router;