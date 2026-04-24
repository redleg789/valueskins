import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = token ? verifyToken(token) : null;
  const userId = decoded && typeof decoded !== 'string' ? decoded.sub : null;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // SSE - Real-time deal updates
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let lastCheck = new Date();

    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    // Poll for new deals every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        const newDeals = await prisma.deal.findMany({
          where: {
            state: { in: ['PUBLISHED', 'ACTIVE'] },
            createdAt: { gt: lastCheck },
            visibility: 'PUBLIC',
          },
          include: {
            brand: { select: { name: true, avatar: true, verified: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        lastCheck = new Date();

        if (newDeals.length > 0) {
          newDeals.forEach(deal => {
            res.write(`data: ${JSON.stringify({
              type: 'new_deal',
              deal: {
                id: deal.id,
                title: deal.title,
                budget: deal.budget,
                currency: deal.currency,
                brand: deal.brand.name,
                brandVerified: deal.brand.verified,
                niche: deal.niche,
                deadline: deal.applicationDeadline,
              },
            })}\n\n`);
          });
        }
      } catch (error) {
        console.error('Deal poll error:', error);
      }
    }, 3000);

    // Poll for deal applicant count updates every 5 seconds
    const applicantsInterval = setInterval(async () => {
      try {
        const deals = await prisma.deal.findMany({
          where: {
            state: { in: ['PUBLISHED', 'ACTIVE'] },
            updatedAt: { gt: lastCheck },
          },
          select: { id: true, applicantsCount: true },
        });

        if (deals.length > 0) {
          deals.forEach(deal => {
            res.write(`data: ${JSON.stringify({
              type: 'deal_updated',
              deal: {
                id: deal.id,
                applicants: deal.applicantsCount,
              },
            })}\n\n`);
          });
        }
      } catch (error) {
        console.error('Applicants poll error:', error);
      }
    }, 5000);

    req.on('close', () => {
      clearInterval(heartbeat);
      clearInterval(pollInterval);
      clearInterval(applicantsInterval);
      res.end();
    });
  }
}
