import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyPassword, generateToken, isValidEmail } from '@/lib/auth';
import { validateInput } from '@/lib/validation';
import { z } from 'zod';
import { checkRateLimit, recordFailedAttempt } from '@/lib/rateLimit';

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
  _debug?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';

    // Check rate limiting (20 login attempts per hour per IP)
    const rateLimitKey = `login:${ipAddress}`;
    const isAllowed = await checkRateLimit(rateLimitKey, 20, 3600);
    if (!isAllowed) {
      return res.status(429).json({
        success: false,
        error: 'Too many login attempts. Try again in 15 minutes.',
      });
    }

    const validationResult = await validateInput(loginSchema, req.body);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validationResult.errors,
      });
    }

    const { emailOrHandle, password } = validationResult.data as LoginRequest;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      throw new Error('Firebase config missing');
    }

    // Query indexed by email OR handle (use structured query, not scan all)
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

    const query = {
      structuredQuery: {
        from: [{ collectionId: 'users' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'email' },
            op: 'EQUAL',
            value: { stringValue: emailOrHandle.toLowerCase() },
          },
        },
        limit: 1,
      },
    };

    let response = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'X-Goog-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new Error(`Firestore query failed: ${response.status}`);
    }

    let data = await response.json();
    let user = null;

    if (data.document) {
      user = data.document;
    } else if (!user) {
      // Fallback: try handle query
      const handleQuery = {
        structuredQuery: {
          from: [{ collectionId: 'users' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'handle' },
              op: 'EQUAL',
              value: { stringValue: emailOrHandle.toLowerCase() },
            },
          },
          limit: 1,
        },
      };

      response = await fetch(queryUrl, {
        method: 'POST',
        headers: {
          'X-Goog-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(handleQuery),
      });

      if (response.ok) {
        data = await response.json();
        user = data.document;
      }
    }

    if (!user) {
      await recordFailedAttempt(`login:${ipAddress}:failed`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const userData = user.fields;
    const userId = user.name.split('/').pop();
    const userEmail = userData.email?.stringValue;
    const userName = userData.name?.stringValue;
    const userHandle = userData.handle?.stringValue;
    const userType = userData.userType?.stringValue;
    const userAvatar = userData.avatar?.stringValue;
    const userStatus = userData.status?.stringValue;
    const passwordHash = userData.passwordHash?.stringValue;

    if (userStatus === 'DELETED' || userStatus === 'SUSPENDED') {
      await recordFailedAttempt(`login:${ipAddress}:failed`);
      return res.status(403).json({
        success: false,
        error: userStatus === 'DELETED' ? 'Account has been deleted' : 'Account has been suspended',
      });
    }

    const passwordValid = await verifyPassword(password, passwordHash || '');
    if (!passwordValid) {
      await recordFailedAttempt(`login:${ipAddress}:failed`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const token = generateToken(userId, userEmail);

    return res.status(200).json({
      success: true,
      data: {
        userId,
        email: userEmail,
        name: userName,
        handle: userHandle,
        userType: userType,
        avatar: userAvatar,
        token,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Login error:', errorMessage);

    return res.status(500).json({
      success: false,
      error: 'Connection error. Please try again.',
      _debug: process.env.NODE_ENV === 'development' ? { message: errorMessage } : undefined,
    });
  }
}
