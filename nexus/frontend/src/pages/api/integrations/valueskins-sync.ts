import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Bidirectional Sync: Nexus ↔ ValueSkins
 *
 * When Nexus user updates profile, push to ValueSkins.
 * When ValueSkins user accepts deal, pull updates to Nexus.
 *
 * This maintains data consistency across both platforms.
 */

const VALUESKINS_API = process.env.VALUESKINS_API_BASE || 'http://localhost:3002';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.userId : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // POST - Sync profile from Nexus to ValueSkins
  if (req.method === 'POST') {
    try {
      const { action, data } = req.body;

      if (action === 'sync_profile') {
        // Get latest profile from Nexus
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            name: true,
            handle: true,
            avatar: true,
            bio: true,
            verified: true,
            followers: true,
            creatorNiche: true,
            portfolioUrl: true,
          },
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Push to ValueSkins
        const response = await fetch(`${VALUESKINS_API}/sync/nexus-profile`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Platform': 'nexus',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            profileData: user,
          }),
        });

        if (!response.ok) {
          return res.status(response.status).json({ error: 'Failed to sync with ValueSkins' });
        }

        // Log sync
        await prisma.auditLog.create({
          data: {
            userId,
            action: 'synced_profile_to_valueskins',
            entityType: 'profile_sync',
            changes: user,
          },
        });

        return res.status(200).json({ message: 'Profile synced to ValueSkins' });
      }

      if (action === 'fetch_applications') {
        // Get creator's applications from ValueSkins
        const response = await fetch(`${VALUESKINS_API}/creators/${userId}/applications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Platform': 'nexus',
          },
        });

        if (!response.ok) {
          return res.status(response.status).json({ error: 'Failed to fetch applications' });
        }

        const applications = await response.json();

        // Cache in Nexus for quick access
        await prisma.auditLog.create({
          data: {
            userId,
            action: 'fetched_valueskins_applications',
            entityType: 'applications_sync',
            changes: { count: applications.length },
          },
        });

        return res.status(200).json(applications);
      }

      if (action === 'fetch_earnings') {
        // Get creator's earnings from ValueSkins
        const response = await fetch(`${VALUESKINS_API}/creators/${userId}/earnings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Platform': 'nexus',
          },
        });

        if (!response.ok) {
          return res.status(response.status).json({ error: 'Failed to fetch earnings' });
        }

        const earnings = await response.json();
        return res.status(200).json(earnings);
      }

      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      console.error('Sync error:', error);
      return res.status(500).json({ error: 'Failed to sync' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
