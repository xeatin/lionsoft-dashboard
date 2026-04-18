// api/clickup.js — Vercel Serverless Function
// Proxy seguro para a ClickUp API (esconde o token do frontend)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const token = process.env.CLICKUP_API_TOKEN

  if (!token) {
    return res.status(503).json({
      error: 'CLICKUP_API_TOKEN não configurado',
      demo: true,
    })
  }

  const { path } = req.query

  if (!path) {
    return res.status(400).json({ error: 'Parâmetro "path" obrigatório' })
  }

  try {
    const url = `https://api.clickup.com/api/v2/${path}`
    const response = await fetch(url, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
