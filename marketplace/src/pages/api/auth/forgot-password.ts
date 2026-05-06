import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { isValidEmail } from '@/lib/auth';
import { createPasswordResetToken } from '@/lib/passwordReset';
import { checkRateLimit, getResetTimeString } from '@/lib/rateLimit';
import { validateInput } from '@/lib/validation';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
});

type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ForgotPasswordResponse>
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
    const validationResult = await validateInput(forgotPasswordSchema, req.body);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    const { email } = validationResult.data as ForgotPasswordRequest;

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Check rate limit (prevent password reset spam)
    const rateLimitResult = await checkRateLimit(email, 'passwordReset');
    if (!rateLimitResult.allowed) {
      const resetTime = getResetTimeString(rateLimitResult.resetTime);
      return res.status(429).json({
        success: false,
        error: `Too many password reset requests. Try again in ${resetTime}.`,
      });
    }

    // Find user by email (don't reveal if email exists or not)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Return success anyway (don't reveal if email exists)
      await prisma.auditLog.create({
        data: {
          action: 'password_reset_attempt_user_not_found',
          entityType: 'auth',
          ipAddress,
          userAgent,
        },
      }).catch((e: any) => console.error('Failed to log error:', e));

      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      });
    }

    // Create reset token
    const { token, expiresAt } = await createPasswordResetToken(user.id, ipAddress);

    // Log reset request
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'password_reset_requested',
        entityType: 'auth',
        entityId: user.id,
        ipAddress,
        userAgent,
      },
    });

    // NOTE: In production, send email with reset token here
    // For now, return the token in development (obviously, don't do this in prod!)
    const isDevelopment = process.env.NODE_ENV === 'development';

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
      // ONLY in development:
      ...(isDevelopment && {
        _devToken: token,
        _devExpiresAt: expiresAt,
      }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);

    await prisma.auditLog.create({
      data: {
        action: 'password_reset_error',
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
      error: 'Failed to process password reset request',
    });
  }
}
