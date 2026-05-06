import type { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { hashPassword, generateToken } from '@/lib/auth';
import { validateInput } from '@/lib/validation';
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
    // Validate input
    const validationResult = await validateInput(signupSchema, req.body);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validationResult.errors,
      });
    }

    const { email, password, name, handle, userType } = validationResult.data as SignupRequest;

    // Check if email already exists in Firestore
    const existingEmail = await adminDb.collection('users').where('email', '==', email).limit(1).get();
    if (!existingEmail.empty) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
    }

    // Check if handle already exists in Firestore
    const existingHandle = await adminDb.collection('users').where('handle', '==', handle).limit(1).get();
    if (!existingHandle.empty) {
      return res.status(400).json({
        success: false,
        error: 'Handle already taken',
      });
    }

    // Create user in Firebase Authentication
    let firebaseUser;
    try {
      firebaseUser = await adminAuth.createUser({
        email,
        password,
        displayName: name,
      });
    } catch (authError: any) {
      console.error('Firebase Auth error:', authError.message);
      if (authError.code === 'auth/email-already-exists') {
        return res.status(400).json({
          success: false,
          error: 'Email already registered',
        });
      }
      throw authError;
    }

    // Hash password for Firestore (backup)
    const passwordHash = await hashPassword(password);

    // Create user document in Firestore
    await adminDb.collection('users').doc(firebaseUser.uid).set({
      email,
      name,
      handle,
      userType,
      passwordHash,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Generate JWT token
    const token = generateToken(firebaseUser.uid, email);

    return res.status(201).json({
      success: true,
      data: {
        userId: firebaseUser.uid,
        email,
        name,
        handle,
        userType,
        token,
      },
      requiresEmailVerification: true,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Signup error:', errorMessage);

    return res.status(500).json({
      success: false,
      error: 'Failed to create account. Please try again.',
    });
  }
}
