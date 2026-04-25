import type { NextApiRequest, NextApiResponse } from 'next';

interface TestResponse {
  status: string;
  environment: {
    supabaseUrl?: string;
    supabaseKey?: string;
  };
  test?: {
    imported: boolean;
    error?: string;
  };
  timestamp: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    let imported = false;
    let importError = '';

    try {
      const { supabase } = await import('@/lib/supabase-server');
      imported = true;
    } catch (e) {
      importError = e instanceof Error ? e.message : String(e);
    }

    return res.status(200).json({
      status: 'ok',
      environment: {
        supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET',
        supabaseKey: supabaseKey ? `${supabaseKey.substring(0, 30)}...` : 'NOT SET',
      },
      test: {
        imported,
        error: importError || undefined,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      environment: {},
      timestamp: new Date().toISOString(),
      test: {
        imported: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}
