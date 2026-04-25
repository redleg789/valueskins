import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase-server';
import { verifyPassword, generateToken, isValidEmail, extractToken } from '@/lib/auth';
import { validateInput } from '@/lib/validation';
import { checkRateLimit, getResetTimeString } from '@/lib/rateLimit';
import { z } from 'zod';

const loginSchema = z.object({
  emailOrHandle: z.string().min(1, 'Email or username is required').toLowerCase(),
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

    const { emailOrHandle, password } = validationResult.data as LoginRequest;

    // Find user by email or handle
    const { data: users, error: queryError } = await supabase
      .from('User')
      .select('*')
      .or(`email.eq.${emailOrHandle.toLowerCase()},handle.eq.${emailOrHandle.toLowerCase()}`)
      .limit(1);

    if (queryError || !users || users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const user = users[0];


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
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Generate new token
    const token = generateToken(user.id, user.email);

    // Update last login time
    await supabase
      .from('User')
      .update({ lastLoginAt: new Date().toISOString() })
      .eq('id', user.id)
      .catch((e: any) => console.error('Failed to update lastLoginAt:', e));

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
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Login error - Details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : null,
      type: error instanceof Error ? error.constructor.name : typeof error,
    });

    return res.status(500).json({
      success: false,
      error: 'Connection error. Please try again. Report a problem at valueskinsfounder@gmail.com',
    });
  }
}
