const express = require('express')
const router = express.Router()
const { login, register, resetPassword } = require('../controllers/auth.controller')

router.post('/login', login)
router.post('/register', register)
router.post('/reset-password', resetPassword)

module.exports = router