import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { validateInput } from '@/lib/validation';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  banner: z.string().url().optional(),
  phone: z.string().optional(),
  portfolioUrl: z.string().url().optional(),
  rateCardMinimum: z.number().int().positive().optional(),
  creatorNiche: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const token = extractToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (req.method === 'GET') {
    try {
      const userId = req.query.userId as string || decoded.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          handle: true,
          bio: true,
          avatar: true,
          banner: true,
          verified: true,
          userType: true,
          followers: true,
          following: true,
          creatorNiche: true,
          portfolioUrl: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const validationResult = await validateInput(updateProfileSchema, req.body);
      if (!validationResult.valid) {
        return res.status(400).json({ error: 'Validation failed', errors: validationResult.errors });
      }

      const data = validationResult.data;

      const updatedUser = await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          ...data,
        },
        select: {
          id: true,
          name: true,
          handle: true,
          bio: true,
          avatar: true,
          banner: true,
          verified: true,
          userType: true,
          followers: true,
          following: true,
          createdAt: true,
        },
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          userId: decoded.userId,
          action: 'user_profile_updated',
          entityType: 'user',
          entityId: decoded.userId,
          changes: data,
          ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
        },
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
