import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { validateInput } from '@/lib/validation';
import { z } from 'zod';

const createDealSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  budget: z.number().int().positive(),
  currency: z.string().default('INR'),
  niche: z.array(z.string()).min(1),
  creatorTierMin: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).default('BRONZE'),
  followerCountMin: z.number().int().nonnegative().default(0),
  deliverableType: z.array(z.string()).min(1),
  deliverableCount: z.number().int().positive(),
  specificRequirements: z.string().optional(),
  applicationDeadline: z.string().datetime(),
  deliveryDeadline: z.string().datetime(),
  maxApplications: z.number().int().positive().optional(),
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

    if (user?.userType !== 'BRAND') {
      return res.status(403).json({ error: 'Only brands can create deals' });
    }

    const validationResult = await validateInput(createDealSchema, req.body);
    if (!validationResult.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validationResult.errors });
    }

    const data = validationResult.data;

    const deal = await prisma.deal.create({
      data: {
        brandId: decoded.userId,
        title: data.title,
        description: data.description,
        budget: data.budget,
        currency: data.currency,
        niche: data.niche,
        creatorTierMin: data.creatorTierMin,
        followerCountMin: data.followerCountMin,
        deliverableType: data.deliverableType,
        deliverableCount: data.deliverableCount,
        specificRequirements: data.specificRequirements,
        applicationDeadline: new Date(data.applicationDeadline),
        deliveryDeadline: new Date(data.deliveryDeadline),
        maxApplications: data.maxApplications,
        state: 'DRAFT',
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: decoded.userId,
        action: 'deal_created',
        entityType: 'deal',
        entityId: deal.id,
        changes: data,
        ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(201).json(deal);
  } catch (error) {
    console.error('Create deal error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
