import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyPassword, generateToken, isValidEmail } from '@/lib/auth';
import { validateInput } from '@/lib/validation';
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
  _debug?: any;
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
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      throw new Error('Firebase config missing');
    }

    // Query using Firestore REST API
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?pageSize=1`;

    let response;
    try {
      response = await fetch(queryUrl, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': apiKey,
        },
      });
    } catch (fetchErr) {
      console.error('Fetch error:', fetchErr);
      throw new Error(`REST API fetch failed: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firestore REST error:', response.status, errorText);
      throw new Error(`Firestore query failed: ${response.status}`);
    }

    const data = await response.json();
    let user = null;

    // Search in documents for matching email or handle
    if (data.documents && Array.isArray(data.documents)) {
      user = data.documents.find((doc: any) => {
        const fields = doc.fields || {};
        const docEmail = fields.email?.stringValue || '';
        const docHandle = fields.handle?.stringValue || '';
        return docEmail.toLowerCase() === emailOrHandle.toLowerCase() ||
               docHandle.toLowerCase() === emailOrHandle.toLowerCase();
      });
    }

    if (!user) {
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

    // Check if account is active
    if (userStatus === 'DELETED') {
      return res.status(403).json({
        success: false,
        error: 'Account has been deleted',
      });
    }

    if (userStatus === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: 'Account has been suspended',
      });
    }

    // Verify password
    const passwordValid = await verifyPassword(password, passwordHash || '');

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Generate new token
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
    const errorCode = (error as any)?.code || 'unknown';
    const errorDetails = {
      message: errorMessage,
      code: errorCode,
      stack: error instanceof Error ? error.stack : null,
      type: error instanceof Error ? error.constructor.name : typeof error,
    };

    console.error('Login error - Details:', errorDetails);

    return res.status(500).json({
      success: false,
      error: 'Connection error. Please try again. Report a problem at valueskinsfounder@gmail.com',
      _debug: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
    });
  }
}
