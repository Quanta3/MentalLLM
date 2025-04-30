import express from 'express'
import textController from '../Controllers/textController.js'
import voiceQuery from '../Controllers/voiceController.js'
import protect from '../Middleware/auth_middleware.js'
import sucideLogger from '../Controllers/sucideLogger.js'
import saveQuery from '../Middleware/saveQuery.js'
const router = express.Router()



router.get('/query/text', saveQuery, textController)
router.post('/query/voice', saveQuery, voiceQuery)
router.get('/logs', protect, sucideLogger)

export default router;