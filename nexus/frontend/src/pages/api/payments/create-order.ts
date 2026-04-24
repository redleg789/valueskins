import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth';
import { createOrder } from '@/lib/razorpay';
import { validateInput } from '@/lib/validation';
import { z } from 'zod';

const createOrderSchema = z.object({
  dealApplicationId: z.string().cuid('Invalid deal application ID'),
  amount: z.number().int().positive('Amount must be positive'),
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

    const validationResult = await validateInput(createOrderSchema, req.body);
    if (!validationResult.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validationResult.errors });
    }

    const { dealApplicationId, amount } = validationResult.data;

    const dealApp = await prisma.dealApplication.findUnique({
      where: { id: dealApplicationId },
      include: { deal: true },
    });

    if (!dealApp) {
      return res.status(404).json({ error: 'Deal application not found' });
    }

    if (dealApp.deal.brandId !== decoded.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const serviceFee = Math.round(amount * 0.1); // 10% platform fee
    const tax = Math.round((amount + serviceFee) * 0.18); // 18% GST
    const netAmount = amount - serviceFee - tax;

    const razorpayOrder = await createOrder({
      amount,
      currency: 'INR',
      receipt: dealApplicationId,
      notes: {
        dealApplicationId,
        payerId: decoded.userId,
        payeeId: dealApp.creatorId,
      },
    });

    if (!razorpayOrder.success) {
      return res.status(500).json({ error: 'Failed to create order' });
    }

    const payment = await prisma.payment.create({
      data: {
        payerId: decoded.userId,
        payeeId: dealApp.creatorId,
        dealApplicationId,
        amount,
        currency: 'INR',
        serviceFee,
        tax,
        netAmount,
        razorpayOrderId: razorpayOrder.data.id,
        status: 'INITIATED',
      },
    });

    return res.status(201).json({
      orderId: razorpayOrder.data.id,
      paymentId: payment.id,
      amount,
      serviceFee,
      tax,
      netAmount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
