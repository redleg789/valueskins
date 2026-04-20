import type { NextApiRequest, NextApiResponse } from 'next';
import { isDemoModeEnabled } from '@/lib/demoMode';
import { issueDemoToken } from '@/lib/server/demoAuth';

type DemoSessionResponse =
  | { token: string }
  | { error: string };

export default function handler(req: NextApiRequest, res: NextApiResponse<DemoSessionResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isDemoModeEnabled()) {
    return res.status(403).json({ error: 'Demo mode disabled' });
  }

  const { userType } = req.body ?? {};
  if (userType !== 'creator' && userType !== 'brand') {
    return res.status(400).json({ error: 'Invalid user type' });
  }

  const token = issueDemoToken(userType);
  if (!token) {
    return res.status(503).json({ error: 'Demo auth is unavailable' });
  }

  return res.status(200).json({ token });
}
