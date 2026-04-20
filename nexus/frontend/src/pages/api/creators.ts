import { NextApiRequest, NextApiResponse } from 'next'

const VALUESKINS_API = process.env.VALUESKINS_API_URL || 'http://localhost:8080'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')

  try {
    if (req.method === 'GET') {
      const { id, limit = 20, offset = 0 } = req.query

      if (id === 'me') {
        const response = await fetch(`${VALUESKINS_API}/personas/me/profile`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })

        if (!response.ok) {
          return res.status(response.status).json({ error: 'Failed to fetch profile' })
        }

        const data = await response.json()
        return res.status(200).json(data)
      }

      if (id) {
        const response = await fetch(`${VALUESKINS_API}/personas/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })

        if (!response.ok) {
          return res.status(response.status).json({ error: 'Creator not found' })
        }

        const data = await response.json()
        return res.status(200).json(data)
      }

      let url = `${VALUESKINS_API}/personas?limit=${limit}&offset=${offset}`
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch creators' })
      }

      const data = await response.json()
      return res.status(200).json(data)
    }

    if (req.method === 'PATCH') {
      if (!token) return res.status(401).json({ error: 'Unauthorized' })

      const response = await fetch(`${VALUESKINS_API}/personas/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(req.body)
      })

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to update profile' })
      }

      const data = await response.json()
      return res.status(200).json(data)
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Creators API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
