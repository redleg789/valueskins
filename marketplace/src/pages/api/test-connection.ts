import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import * as https from 'https';

interface TestResponse {
  status: string;
  tests: {
    dns?: {
      resolved: boolean;
      ip?: string;
      error?: string;
    };
    tcp?: {
      connected: boolean;
      error?: string;
    };
    prisma?: {
      connected: boolean;
      error?: string;
    };
  };
  timestamp: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  const tests: TestResponse['tests'] = {};

  // Test 1: DNS resolution
  try {
    const dns = require('dns').promises;
    const addresses = await dns.resolve4('db.vmmnihicgqtaestbdrkw.supabase.co');
    tests.dns = { resolved: true, ip: addresses[0] };
  } catch (error) {
    tests.dns = {
      resolved: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Test 2: TCP connection
  try {
    const net = require('net');
    const socket = net.createConnection({ host: 'db.vmmnihicgqtaestbdrkw.supabase.co', port: 5432, timeout: 5000 });
    await new Promise((resolve, reject) => {
      socket.on('connect', () => {
        tests.tcp = { connected: true };
        socket.destroy();
        resolve(true);
      });
      socket.on('error', (err: any) => {
        tests.tcp = { connected: false, error: err.message };
        reject(err);
      });
    }).catch(() => {});
  } catch (error) {
    if (!tests.tcp) {
      tests.tcp = {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test 3: Prisma connection
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    tests.prisma = { connected: true };
  } catch (error) {
    tests.prisma = {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  return res.status(200).json({
    status: Object.values(tests).every((t: any) => t.connected || t.resolved) ? 'success' : 'partial',
    tests,
    timestamp: new Date().toISOString(),
  });
}
