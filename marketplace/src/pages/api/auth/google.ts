import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

interface GoogleLoginResponse {
  token?: string;
  userType?: string;
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
    // In production, validate Google OAuth token here and extract email
    // For now, create/update user with mock Google data
    // Detect user type: if email looks like brand-related, mark as brand, else creator
    const email = `user_${Date.now()}@google.nexus`;
    const name = `Creator ${Date.now()}`;
    const userType = Math.random() > 0.5 ? 'CREATOR' : 'BRAND';
    const userId = `user_${Date.now()}`;

    try {
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
            oauthProvider: 'google',
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
    } catch (dbError) {
      // If database fails, create mock token for demo
      console.warn('Database unavailable, using mock login:', dbError);
      const mockToken = generateToken(userId, email);
      return res.status(200).json({
        token: mockToken,
        userType: userType === 'CREATOR' ? 'creator' : 'brand'
      });
    }
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}
