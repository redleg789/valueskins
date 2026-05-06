import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    projectId: process.env.FIREBASE_PROJECT_ID ? 'SET' : 'MISSING',
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID ? 'SET' : 'MISSING',
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? 'SET (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : 'MISSING',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'MISSING',
    clientId: process.env.FIREBASE_CLIENT_ID ? 'SET' : 'MISSING',
  });
}
