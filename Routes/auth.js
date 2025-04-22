import express from 'express'
const router = express.Router()

import register from '../Controllers/register.js'
import login from '../Controllers/login.js'

router.post('/auth/register', register)
router.post('/auth/login', login)

export default router;