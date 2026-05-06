import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { validateInput } from '@/lib/validation';
import { z } from 'zod';

const applySchema = z.object({
  dealId: z.string().cuid(),
  motivation: z.string().min(10).max(2000),
  portfolioLinks: z.array(z.string().url()).optional(),
  priceQuote: z.number().int().positive().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (user?.userType !== 'CREATOR') {
      return res.status(403).json({ error: 'Only creators can apply to deals' });
    }

    const validationResult = await validateInput(applySchema, req.body);
    if (!validationResult.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validationResult.errors });
    }

    const { dealId, motivation, portfolioLinks, priceQuote } = validationResult.data;

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { brand: true },
    });

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const existingApp = await prisma.dealApplication.findUnique({
      where: { dealId_creatorId: { dealId, creatorId: decoded.userId } },
    });

    if (existingApp) {
      return res.status(409).json({ error: 'You have already applied to this deal' });
    }

    const application = await prisma.dealApplication.create({
      data: {
        dealId,
        creatorId: decoded.userId,
        motivation,
        portfolioLinks: portfolioLinks || [],
        priceQuote,
        status: 'PENDING',
        deliveryStatus: 'PENDING',
      },
    });

    // Update applicants count
    await prisma.deal.update({
      where: { id: dealId },
      data: { applicantsCount: { increment: 1 } },
    });

    // Notify brand
    await prisma.notification.create({
      data: {
        userId: deal.brandId,
        type: 'DEAL_OFFER',
        actorId: decoded.userId,
        actorName: user?.name || 'Unknown',
        title: 'New Application',
        message: `${user?.name} applied to your deal "${deal.title}"`,
        metadata: {
          dealId,
          dealApplicationId: application.id,
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        action: 'deal_application_created',
        entityType: 'deal_application',
        entityId: application.id,
        changes: { dealId },
        ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(201).json(application);
  } catch (error) {
    console.error('Apply to deal error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
