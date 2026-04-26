import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyPassword, generateToken } from '@/lib/auth';
import { validateInput } from '@/lib/validation';
import { z } from 'zod';

const loginSchema = z.object({
  emailOrHandle: z.string().min(1, 'Email or username is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

type LoginRequest = z.infer<typeof loginSchema>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
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

    // Query using Firestore REST API
    const restUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users`;

    let response;
    try {
      response = await fetch(restUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
        },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'users' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'email' },
                op: 'EQUAL',
                value: { stringValue: emailOrHandle.toLowerCase() },
              },
            },
          },
        }),
      });
    } catch (fetchErr) {
      console.error('Fetch error:', fetchErr);
      throw new Error(`REST API fetch failed: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firestore REST error:', response.status, errorText);
      throw new Error(`Firestore REST error: ${response.status} ${errorText.substring(0, 100)}`);
    }

    const data = await response.json();

    if (!data.document && (!data.documents || data.documents.length === 0)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const doc = data.document || data.documents?.[0];
    const userData = doc.fields;
    const user = {
      id: doc.name.split('/').pop(),
      email: userData.email?.stringValue,
      name: userData.name?.stringValue,
      handle: userData.handle?.stringValue,
      userType: userData.userType?.stringValue,
      avatar: userData.avatar?.stringValue,
      passwordHash: userData.passwordHash?.stringValue,
      status: userData.status?.stringValue,
    };

    if (user.status === 'DELETED' || user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: `Account has been ${user.status.toLowerCase()}`,
      });
    }

    const passwordValid = await verifyPassword(password, user.passwordHash || '');
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const token = generateToken(user.id, user.email);
    return res.status(200).json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        handle: user.handle,
        userType: user.userType,
        avatar: user.avatar,
        token,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Login REST error:', errorMessage);

    return res.status(500).json({
      success: false,
      error: 'Connection error. Please try again. Report a problem at valueskinsfounder@gmail.com',
      _debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
}
