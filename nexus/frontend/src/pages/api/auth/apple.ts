import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

interface AppleLoginResponse {
  token?: string;
  userType?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AppleLoginResponse>
) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In production, validate Apple OAuth token here and extract email
    // For now, create/update user with mock Apple data
    // Detect user type: randomly assign for demo purposes
    const email = `user_${Date.now()}@apple.nexus`;
    const name = `Creator ${Date.now()}`;
    const userType = Math.random() > 0.5 ? 'CREATOR' : 'BRAND';

    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          userType: userType as 'CREATOR' | 'BRAND',
          handle: `user_${Date.now()}`,
          oauthProvider: 'apple',
          passwordHash: null
        }
      });
    }

    const token = generateToken(user.id, user.email);
    const detectedUserType = user.userType === 'CREATOR' ? 'creator' : 'brand';

    return res.status(200).json({
      token,
      userType: detectedUserType
    });
  } catch (error) {
    console.error('Apple login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}
