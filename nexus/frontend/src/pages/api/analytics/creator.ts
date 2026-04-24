import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET') {
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
      return res.status(403).json({ error: 'Only creators can view this' });
    }

    // Total earnings
    const payments = await prisma.payment.findMany({
      where: {
        payeeId: decoded.userId,
        status: 'COMPLETED',
      },
    });

    const totalEarnings = payments.reduce((sum, p) => sum + p.netAmount, 0);

    // Month breakdown
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyPayments = payments.filter(p => p.completedAt && p.completedAt > thirtyDaysAgo);
    const monthlyEarnings = monthlyPayments.reduce((sum, p) => sum + p.netAmount, 0);

    // Deal statistics
    const totalApplications = await prisma.dealApplication.count({
      where: { creatorId: decoded.userId },
    });

    const approvedApplications = await prisma.dealApplication.count({
      where: { creatorId: decoded.userId, status: 'APPROVED' },
    });

    const completedDeals = await prisma.dealApplication.count({
      where: { creatorId: decoded.userId, deliveryStatus: 'COMPLETED' },
    });

    // Follower growth
    const followerData = await prisma.follows.count({
      where: { followingId: decoded.userId },
    });

    // Average rating
    const reviews = await prisma.review.findMany({
      where: { revieweeId: decoded.userId },
    });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    return res.status(200).json({
      totalEarnings,
      monthlyEarnings,
      totalApplications,
      approvedApplications,
      completedDeals,
      followers: followerData,
      avgRating: avgRating ? parseFloat(avgRating) : null,
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error('Creator analytics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
