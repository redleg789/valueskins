import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

interface HealthResponse {
  status: string;
  timestamp: string;
  database?: {
    connected: boolean;
    error?: string;
  };
  environment?: {
    databaseUrl?: string;
    nodeEnv?: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
      },
    });
  }
}
