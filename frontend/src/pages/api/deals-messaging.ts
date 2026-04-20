import { NextApiRequest, NextApiResponse } from 'next'

const VALUESKINS_API = process.env.VALUESKINS_API_URL || 'http://localhost:8080'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { dealRoomId, action } = req.query

  try {
    if (req.method === 'GET') {
      if (action === 'messages' && dealRoomId) {
        const { limit = 50, offset = 0 } = req.query
        const url = `${VALUESKINS_API}/deal-rooms/${dealRoomId}/messages?limit=${limit}&offset=${offset}`

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!response.ok) {
          return res.status(response.status).json({ error: 'Failed to fetch messages' })
        }

        const data = await response.json()
        return res.status(200).json(data)
      }

      res.status(400).json({ error: 'Invalid request' })
    }

    if (req.method === 'POST') {
      if (action === 'send' && dealRoomId) {
        const response = await fetch(`${VALUESKINS_API}/deal-rooms/${dealRoomId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(req.body)
        })

        if (!response.ok) {
          return res.status(response.status).json({ error: 'Failed to send message' })
        }

        const data = await response.json()
        return res.status(201).json(data)
      }

      res.status(400).json({ error: 'Invalid request' })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Deals messaging API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
