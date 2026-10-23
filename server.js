require('dotenv').config()
const express = require('express')
const { createClient } = require('@libsql/client')

const app = express()
app.use(express.json())
app.use(express.static('public'))

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function asegurarTabla() {
  await db.execute(`CREATE TABLE IF NOT EXISTS registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    fecha TEXT
  )`)
}

app.post('/api/users', async (req, res) => {
  const { username } = req.body
  try {
    await asegurarTabla()
    await db.execute({
      sql: 'INSERT INTO registros (email, fecha) VALUES (?, ?)',
      args: [username, new Date().toISOString()],
    })
    res.status(201).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/registros', async (req, res) => {
  try {
    await asegurarTabla()
    const result = await db.execute({
      sql: 'SELECT * FROM registros',
    })
    res.status(200).json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log('Servidor en puerto ' + PORT))
