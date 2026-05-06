import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Apply for a ValueSkins deal
 *
 * Nexus creator applies for a deal on ValueSkins platform.
 * This creates an application record on ValueSkins and syncs to Nexus.
 */

const VALUESKINS_API = process.env.VALUESKINS_API_BASE || 'http://localhost:3002';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.userId : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { dealId, pitch, portfolioLinks, proposedRate } = req.body;

  try {
    // Get creator profile from Nexus
    const creator = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, handle: true, avatar: true, verified: true, followers: true },
    });

    if (!creator) return res.status(404).json({ error: 'Creator not found' });

    // Submit application to ValueSkins (cross-company API call)
    const response = await fetch(`${VALUESKINS_API}/deals/${dealId}/apply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Platform': 'nexus',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creatorId: userId,
        creatorName: creator.name,
        creatorHandle: creator.handle,
        creatorAvatar: creator.avatar,
        verified: creator.verified,
        followers: creator.followers,
        pitch,
        portfolioLinks,
        proposedRate,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const application = await response.json();

    // Log this application in Nexus audit trail for creator's reference
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'applied_to_valueskins_deal',
        entityType: 'deal_application',
        entityId: application.id,
        changes: {
          dealId,
          applicationId: application.id,
          pitch,
          portfolioLinks,
        },
      },
    });

    return res.status(201).json(application);
  } catch (error) {
    console.error('Apply for deal error:', error);
    return res.status(500).json({ error: 'Failed to apply for deal' });
  }
}
