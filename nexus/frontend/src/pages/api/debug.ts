import type { NextApiRequest, NextApiResponse } from 'next';

interface DebugResponse {
  status: string;
  environment: {
    nodeEnv?: string;
    databaseUrl?: string;
  };
  timestamp: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DebugResponse>
) {
  try {
    const dbUrl = process.env.DATABASE_URL;

    return res.status(200).json({
      status: 'ok',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: dbUrl ? `${dbUrl.substring(0, 50)}...` : 'NOT SET',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      environment: {
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
