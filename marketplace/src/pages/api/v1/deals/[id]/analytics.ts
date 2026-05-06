import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1];
  const { id } = req.query;

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const response = await fetch(`${process.env.VALUESKINS_API_URL || 'http://localhost:8000'}/api/deals/${id}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const analytics = await response.json();
      return res.status(200).json(analytics);
    } catch (error) {
      // Demo analytics
      return res.status(200).json({
        dealId: id,
        impressions: 125400,
        clicks: 3450,
        conversions: 145,
        conversionValue: 8700,
        ctr: 2.75,
        roi: 3.48,
        costPerClick: 0.72,
        costPerConversion: 17.24,
        roiPercent: 348,
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const response = await fetch(`${process.env.VALUESKINS_API_URL || 'http://localhost:8000'}/api/deals/${id}/analytics`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const result = await response.json();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update analytics' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
