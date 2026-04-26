import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase-server';
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
  requiresEmailVerification?: boolean;
  verificationTokenExpiresAt?: Date;
  error?: string;
  errors?: Record<string, string>;
  _devToken?: string;
  action?: string;
  entityType?: string;
  ipAddress?: string | string[];
  userAgent?: string;
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
    const { data: existingEmails } = await supabase
      .from('User')
      .select('id')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (existingEmails && existingEmails.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
        errors: { email: 'Email already registered' },
      });
    }

    // Check if handle already exists
    const { data: existingHandles } = await supabase
      .from('User')
      .select('id')
      .eq('handle', handle.toLowerCase())
      .limit(1);

    if (existingHandles && existingHandles.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Handle already taken',
        errors: { handle: 'Handle already taken' },
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate user ID and tokens
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionToken = generateToken(userId, email);

    // Create user in Supabase
    const { error: createError } = await supabase
      .from('User')
      .insert([{
        id: userId,
        email: email.toLowerCase(),
        passwordHash,
        name,
        handle: handle.toLowerCase(),
        userType: userType as 'CREATOR' | 'BRAND',
        emailVerified: false,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      }]);

    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    // Create email verification token
    const { token: verificationToken, expiresAt } = await createEmailVerificationToken(userId, email);

    return res.status(201).json({
      success: true,
      data: {
        userId,
        email,
        name,
        handle,
        userType,
        token: sessionToken,
      },
      requiresEmailVerification: true,
      verificationTokenExpiresAt: expiresAt,
      _devToken: verificationToken,
    });
  } catch (error) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return res.status(500).json({
      success: false,
      error: 'Failed to create account. Report a problem at valueskinsfounder@gmail.com',
    });

    return res.status(500).json({
      success: false,
      error: 'Failed to create account. Report a problem at valueskinsfounder@gmail.com',
    });
  }
}
