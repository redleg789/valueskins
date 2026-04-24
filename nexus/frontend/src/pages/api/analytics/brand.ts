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

    if (user?.userType !== 'BRAND') {
      return res.status(403).json({ error: 'Only brands can view this' });
    }

    // Total spent
    const payments = await prisma.payment.findMany({
      where: {
        payerId: decoded.userId,
        status: 'COMPLETED',
      },
    });

    const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

    // Month breakdown
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyPayments = payments.filter(p => p.completedAt && p.completedAt > thirtyDaysAgo);
    const monthlySpent = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

    // Campaign statistics
    const totalCampaigns = await prisma.deal.count({
      where: { brandId: decoded.userId },
    });

    const activeCampaigns = await prisma.deal.count({
      where: {
        brandId: decoded.userId,
        state: 'ACTIVE',
      },
    });

    const completedCampaigns = await prisma.deal.count({
      where: {
        brandId: decoded.userId,
        state: 'COMPLETED',
      },
    });

    // Total applications received
    const deals = await prisma.deal.findMany({
      where: { brandId: decoded.userId },
      select: { id: true },
    });

    const dealIds = deals.map(d => d.id);

    const totalApplications = await prisma.dealApplication.count({
      where: { dealId: { in: dealIds } },
    });

    const approvedApplications = await prisma.dealApplication.count({
      where: {
        dealId: { in: dealIds },
        status: 'APPROVED',
      },
    });

    return res.status(200).json({
      totalSpent,
      monthlySpent,
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      totalApplications,
      approvedApplications,
      avgSpentPerCampaign: totalCampaigns > 0 ? Math.round(totalSpent / totalCampaigns) : 0,
      conversionRate: totalApplications > 0
        ? ((approvedApplications / totalApplications) * 100).toFixed(1)
        : 0,
    });
  } catch (error) {
    console.error('Brand analytics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
