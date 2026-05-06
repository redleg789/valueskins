import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { verifySignature } from '@/lib/razorpay';
import { validateInput } from '@/lib/validation';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  paymentId: z.string().cuid('Invalid payment ID'),
  razorpayPaymentId: z.string(),
  razorpayOrderId: z.string(),
  razorpaySignature: z.string(),
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

    const validationResult = await validateInput(verifyPaymentSchema, req.body);
    if (!validationResult.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validationResult.errors });
    }

    const { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = validationResult.data;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.payerId !== decoded.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const isValid = await verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'FAILED', failedAt: new Date() },
      });

      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        razorpayPaymentId,
        razorpaySignature,
        completedAt: new Date(),
      },
    });

    // Update deal application status to approved
    await prisma.dealApplication.update({
      where: { id: updatedPayment.dealApplicationId! },
      data: { status: 'APPROVED' },
    });

    // Create notification for creator
    const dealApp = await prisma.dealApplication.findUnique({
      where: { id: updatedPayment.dealApplicationId! },
      include: { deal: { include: { brand: true } } },
    });

    if (dealApp) {
      await prisma.notification.create({
        data: {
          userId: dealApp.creatorId,
          type: 'DEAL_APPROVED',
          actorId: dealApp.deal.brandId,
          actorName: dealApp.deal.brand.name,
          title: 'Deal Approved',
          message: `${dealApp.deal.brand.name} approved your application for "${dealApp.deal.title}"`,
          metadata: {
            dealId: dealApp.deal.id,
            dealApplicationId: dealApp.id,
            paymentId,
          },
        },
      });
    }

    return res.status(200).json({
      success: true,
      payment: updatedPayment,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
