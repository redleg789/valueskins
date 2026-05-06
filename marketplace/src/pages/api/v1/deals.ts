import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // Fetch deals from ValueSkins backend
    try {
      const response = await fetch(`${process.env.VALUESKINS_API_URL || 'http://localhost:8000'}/api/deals`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const deals = await response.json();
      return res.status(200).json(deals);
    } catch (error) {
      // Return demo deals
      return res.status(200).json({
        deals: [
          {
            id: '1',
            brandName: 'TechBrand Co',
            title: '3 Instagram Reels',
            description: 'Product showcase',
            budget: 2500,
            platforms: ['Instagram'],
            status: 'OPEN',
            deadline: '2026-06-01',
            applicantCount: 12,
          },
          {
            id: '2',
            brandName: 'Beauty Corp',
            title: 'TikTok Campaign (5 videos)',
            description: 'Trending sound integration',
            budget: 5000,
            platforms: ['TikTok'],
            status: 'OPEN',
            deadline: '2026-06-15',
            applicantCount: 45,
          },
        ],
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const response = await fetch(`${process.env.VALUESKINS_API_URL || 'http://localhost:8000'}/api/deals`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const newDeal = await response.json();
      return res.status(201).json(newDeal);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create deal' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
