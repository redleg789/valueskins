import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { verifyEmailToken } from '@/lib/emailVerification';
import { validateInput } from '@/lib/validation';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  token: z.string().min(1, 'Verification token is required'),
});

type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;

interface VerifyEmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyEmailResponse>
) {
  // Security headers
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] as string || '';

    // Validate input
    const validationResult = await validateInput(verifyEmailSchema, req.body);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
      });
    }

    const { userId, token } = validationResult.data as VerifyEmailRequest;

    // Verify token
    const verified = await verifyEmailToken(userId, token);

    if (!verified) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'email_verification_failed',
          entityType: 'auth',
          entityId: userId,
          ipAddress,
          userAgent,
        },
      }).catch((e: any) => console.error('Failed to log error:', e));

      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token',
      });
    }

    // Log successful verification
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'email_verified',
        entityType: 'user',
        entityId: userId,
        ipAddress,
        userAgent,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);

    await prisma.auditLog.create({
      data: {
        action: 'email_verification_error',
        entityType: 'auth',
        ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        changes: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
    }).catch((e: any) => console.error('Failed to log error:', e));

    return res.status(500).json({
      success: false,
      error: 'Failed to verify email',
    });
  }
}
