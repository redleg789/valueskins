import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { isStrongPassword, verifyToken } from '@/lib/auth';
import { resetPassword } from '@/lib/passwordReset';
import { validateInput } from '@/lib/validation';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResetPasswordResponse>
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
    const validationResult = await validateInput(resetPasswordSchema, req.body);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
      });
    }

    const { userId, token, newPassword } = validationResult.data as ResetPasswordRequest;

    // Validate password strength
    const passwordCheck = isStrongPassword(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        success: false,
        error: 'Password is not strong enough',
      });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Reset password
    const result = await resetPassword(userId, token, newPassword, ipAddress);

    if (!result.success) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'password_reset_failed',
          entityType: 'auth',
          entityId: userId,
          ipAddress,
          userAgent,
          changes: { error: result.error },
        },
      }).catch((e: any) => console.error('Failed to log error:', e));

      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to reset password',
      });
    }

    // Log successful password reset
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'password_reset_successful',
        entityType: 'auth',
        entityId: userId,
        ipAddress,
        userAgent,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);

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
      error: 'Failed to reset password',
    });
  }
}
