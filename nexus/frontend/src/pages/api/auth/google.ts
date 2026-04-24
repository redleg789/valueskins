import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

interface GoogleLoginResponse {
  token?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GoogleLoginResponse>
) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userType } = req.body;

    if (!userType || !['creator', 'brand'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // In production, validate Google token here
    // For now, create/update user with mock Google data
    const email = `user_${Date.now()}@google.nexus`;
    const name = `${userType === 'creator' ? 'Creator' : 'Brand'} ${Date.now()}`;

    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          userType: userType as 'CREATOR' | 'BRAND',
          handle: `${userType}_${Date.now()}`,
          oauthProvider: 'google',
          passwordHash: null
        }
      });
    }

    const token = generateToken(user.id, user.email);

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}
