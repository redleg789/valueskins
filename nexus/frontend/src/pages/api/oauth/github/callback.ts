import { NextApiRequest, NextApiResponse } from 'next';
import { exchangeGitHubCode, getGitHubUserInfo } from '@/lib/oauth';
import { generateToken } from '../../auth';
import { checkDDoSProtection } from '@/lib/security/ddos-protection';
import { injectionPrevention } from '@/lib/security/injection-prevention';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  checkDDoSProtection(req, res, () => {});
  injectionPrevention(req, res, () => {});

  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    const tokens = await exchangeGitHubCode(code);
    const userInfo = await getGitHubUserInfo(tokens.access_token);

    const userId = `github_${userInfo.id}`;
    const token = generateToken(userId, 'user');

    res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`);

    return res.redirect(302, '/');
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
