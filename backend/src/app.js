const express = require('express')
const cors = require('cors')
const testRoutes = require('./routes/test.routes')
const authRoutes = require('./routes/auth.routes')
const protectedRoutes = require('./routes/protected.routes')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API TicketBengoa funcionando correctamente'
  })
})

app.use('/api', testRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/protected', protectedRoutes)

module.exports = app