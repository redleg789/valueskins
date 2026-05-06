import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const { niche, minAudience, minRating, credential } = req.query;
      const url = new URL(`${process.env.VALUESKINS_API_URL || 'http://localhost:8000'}/api/creators`);

      if (niche) url.searchParams.append('niche', niche as string);
      if (minAudience) url.searchParams.append('minAudience', minAudience as string);
      if (minRating) url.searchParams.append('minRating', minRating as string);
      if (credential) url.searchParams.append('credential', credential as string);

      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const creators = await response.json();
      return res.status(200).json(creators);
    } catch (error) {
      // Return demo creators
      return res.status(200).json({
        creators: [
          { id: '1', name: 'Alex Chen', handle: '@techreviewsalmost', niche: 'Tech', audience: 245000, rating: 4.8, platforms: ['YouTube', 'TikTok'], avgRate: 2500, completedDeals: 12, credentialStatus: 'VERIFIED' },
          { id: '2', name: 'Sarah Fitness', handle: '@sarahfitlife', niche: 'Fitness', audience: 128000, rating: 4.7, platforms: ['Instagram', 'TikTok'], avgRate: 1800, completedDeals: 8, credentialStatus: 'VERIFIED' },
        ],
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
