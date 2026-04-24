import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const data = req.body.payload.payment;

    if (event === 'payment.authorized') {
      const payment = await prisma.payment.findUnique({
        where: { razorpayPaymentId: data.entity.id },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        // Update deal application
        await prisma.dealApplication.updateMany({
          where: { id: payment.dealApplicationId || '' },
          data: { status: 'APPROVED' },
        });
      }
    }

    if (event === 'payment.failed') {
      const payment = await prisma.payment.findUnique({
        where: { razorpayPaymentId: data.entity.id },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
          },
        });
      }
    }

    if (event === 'payout.processed') {
      const payout = await prisma.payout.findUnique({
        where: { razorpayPayoutId: data.entity.id },
      });

      if (payout) {
        await prisma.payout.update({
          where: { id: payout.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });
      }
    }

    if (event === 'payout.failed') {
      const payout = await prisma.payout.findUnique({
        where: { razorpayPayoutId: data.entity.id },
      });

      if (payout) {
        await prisma.payout.update({
          where: { id: payout.id },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
            failureReason: data.entity.failure_reason,
          },
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
