import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { createEmailVerificationToken } from '@/lib/emailVerification';
import { checkRateLimit, getResetTimeString } from '@/lib/rateLimit';
import { validateInput } from '@/lib/validation';
import { z } from 'zod';

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
});

type ResendVerificationRequest = z.infer<typeof resendVerificationSchema>;

interface ResendVerificationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResendVerificationResponse>
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
    const validationResult = await validateInput(resendVerificationSchema, req.body);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    const { email } = validationResult.data as ResendVerificationRequest;

    // Check rate limit (prevent spam)
    const rateLimitResult = await checkRateLimit(email, 'resendVerification');
    if (!rateLimitResult.allowed) {
      const resetTime = getResetTimeString(rateLimitResult.resetTime);
      return res.status(429).json({
        success: false,
        error: `Too many verification requests. Try again in ${resetTime}.`,
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified',
      });
    }

    // Create new verification token
    const { token, expiresAt } = await createEmailVerificationToken(user.id, user.email);

    // Log request
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'verification_email_resent',
        entityType: 'auth',
        entityId: user.id,
        ipAddress,
        userAgent,
      },
    });

    // NOTE: In production, send email with verification token here
    const isDevelopment = process.env.NODE_ENV === 'development';

    return res.status(200).json({
      success: true,
      message: 'Verification email sent',
      // ONLY in development:
      ...(isDevelopment && {
        _devToken: token,
        _devExpiresAt: expiresAt,
      }),
    });
  } catch (error) {
    console.error('Resend verification error:', error);

    await prisma.auditLog.create({
      data: {
        action: 'resend_verification_error',
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
      error: 'Failed to resend verification email',
    });
  }
}
