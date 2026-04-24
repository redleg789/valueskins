import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';

/**
 * Nexus ↔ ValueSkins Bridge API
 *
 * This endpoint acts as a proxy/bridge between Nexus and ValueSkins.
 * Nexus and ValueSkins are separate companies with separate databases.
 * This endpoint fetches deals from ValueSkins and presents them to Nexus users.
 */

const VALUESKINS_API = process.env.VALUESKINS_API_BASE || 'http://localhost:3002';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.userId : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // GET - Fetch ValueSkins deals
  if (req.method === 'GET') {
    try {
      const { platform, level, minBudget, maxBudget, page = '1' } = req.query;

      // Build query params for ValueSkins API
      const params = new URLSearchParams();
      if (platform) params.append('platform', platform as string);
      if (level) params.append('level', level as string);
      if (minBudget) params.append('minBudget', minBudget as string);
      if (maxBudget) params.append('maxBudget', maxBudget as string);
      params.append('page', page as string);

      // Fetch from ValueSkins (cross-company API call)
      const response = await fetch(`${VALUESKINS_API}/deals?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Platform': 'nexus',
          'X-User-Id': userId,
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch deals from ValueSkins' });
      }

      const deals = await response.json();
      return res.status(200).json(deals);
    } catch (error) {
      console.error('ValueSkins deals error:', error);
      return res.status(500).json({ error: 'Failed to fetch deals' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
