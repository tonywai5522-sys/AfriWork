import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'AfriWork backend is running' })
})

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`)
})
