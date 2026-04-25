import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken, isValidEmail, extractToken } from '@/lib/auth';
import { validateInput } from '@/lib/validation';
import { checkRateLimit, getResetTimeString } from '@/lib/rateLimit';
import { checkAccountLockout, recordFailedLogin, recordSuccessfulLogin } from '@/lib/accountLockout';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

type LoginRequest = z.infer<typeof loginSchema>;

interface LoginResponse {
  success: boolean;
  data?: {
    userId: string;
    email: string;
    name: string;
    handle: string;
    userType: string;
    avatar?: string;
    token: string;
  };
  error?: string;
  errors?: Record<string, string>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
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
    const validationResult = await validateInput(loginSchema, req.body);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validationResult.errors,
      });
    }

    const { email, password } = validationResult.data as LoginRequest;

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check rate limit by IP + email
    const rateLimitResult = await checkRateLimit(email, 'login');
    if (!rateLimitResult.allowed) {
      const resetTime = getResetTimeString(rateLimitResult.resetTime);
      return res.status(429).json({
        success: false,
        error: `Too many login attempts. Try again in ${resetTime}.`,
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Log failed login attempt
      await prisma.auditLog.create({
        data: {
          action: 'login_failed_user_not_found',
          entityType: 'auth',
          ipAddress,
          userAgent,
        },
      }).catch((e: any) => console.error('Failed to log error:', e));

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check account lockout status
    const lockoutStatus = await checkAccountLockout(user.id);
    if (lockoutStatus.isLocked) {
      const resetTime = getResetTimeString(lockoutStatus.lockedUntil!);
      return res.status(403).json({
        success: false,
        error: `Account is locked due to too many failed login attempts. Try again in ${resetTime}.`,
      });
    }

    // Check if account is active
    if (user.status === 'DELETED') {
      return res.status(403).json({
        success: false,
        error: 'Account has been deleted',
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: 'Account has been suspended',
      });
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      // Record failed login and check for lockout
      await recordFailedLogin(user.id);

      // Log failed login attempt
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'login_failed_invalid_password',
          entityType: 'auth',
          entityId: user.id,
          ipAddress,
          userAgent,
        },
      }).catch((e: any) => console.error('Failed to log error:', e));

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Invalidate existing sessions (one active session per user)
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Generate new token
    const token = generateToken(user.id, user.email);

    // Create new session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        ipAddress,
        userAgent,
      },
    });

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Record successful login and clear lockout
    await recordSuccessfulLogin(user.id);

    // Log successful login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user_login',
        entityType: 'user',
        entityId: user.id,
        ipAddress,
        userAgent,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        handle: user.handle,
        userType: user.userType,
        avatar: user.avatar || undefined,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    // Log error
    await prisma.auditLog.create({
      data: {
        action: 'login_error',
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
      error: 'Login failed. Please try again.',
    });
  }
}
