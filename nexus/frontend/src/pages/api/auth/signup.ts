import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken, isValidEmail, isStrongPassword, isValidHandle } from '@/lib/auth';
import { validateInput } from '@/lib/validation';
import { checkRateLimit, getResetTimeString } from '@/lib/rateLimit';
import { createEmailVerificationToken } from '@/lib/emailVerification';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  handle: z.string().min(3, 'Handle must be at least 3 characters').max(30),
  userType: z.enum(['CREATOR', 'BRAND'], {
    errorMap: () => ({ message: 'User type must be CREATOR or BRAND' }),
  }),
});

type SignupRequest = z.infer<typeof signupSchema>;

interface SignupResponse {
  success: boolean;
  data?: {
    userId: string;
    email: string;
    name: string;
    handle: string;
    userType: string;
    token: string;
  };
  error?: string;
  errors?: Record<string, string>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignupResponse>
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

    // Validate input schema
    const validationResult = await validateInput(signupSchema, req.body);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validationResult.errors,
      });
    }

    const { email, password, name, handle, userType } = validationResult.data as SignupRequest;

    // Check rate limit by IP (prevent bot signup spam)
    const rateLimitResult = await checkRateLimit(ipAddress, 'signup');
    if (!rateLimitResult.allowed) {
      const resetTime = getResetTimeString(rateLimitResult.resetTime);
      return res.status(429).json({
        success: false,
        error: `Too many signup attempts from this IP. Try again in ${resetTime}.`,
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Validate password strength
    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        success: false,
        error: 'Password is not strong enough',
        errors: { password: passwordCheck.errors.join('; ') },
      });
    }

    // Validate handle format
    const handleCheck = isValidHandle(handle);
    if (!handleCheck.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid handle',
        errors: { handle: handleCheck.errors.join('; ') },
      });
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
      });
    }

    // Check if handle already exists
    const existingHandle = await prisma.user.findUnique({
      where: { handle: handle.toLowerCase() },
    });

    if (existingHandle) {
      return res.status(409).json({
        success: false,
        error: 'Handle already taken',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        handle: handle.toLowerCase(),
        userType: userType as 'CREATOR' | 'BRAND',
        emailVerified: false,
        status: 'ACTIVE',
      },
    });

    // Create user preferences
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
      },
    });

    // Create email verification token
    const { token: verificationToken, expiresAt } = await createEmailVerificationToken(user.id, user.email);

    // Generate session token
    const sessionToken = generateToken(user.id, user.email);

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        ipAddress,
        userAgent,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user_signup',
        entityType: 'user',
        entityId: user.id,
        ipAddress,
        userAgent,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        handle: user.handle,
        userType: user.userType,
        token: sessionToken,
      },
      requiresEmailVerification: true,
      verificationTokenExpiresAt: expiresAt,
    });
  } catch (error) {
    console.error('Signup error:', error);

    // Log error
    await prisma.auditLog.create({
      data: {
        action: 'signup_error',
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
      error: 'Failed to create account. Please try again.',
    });
  }
}
