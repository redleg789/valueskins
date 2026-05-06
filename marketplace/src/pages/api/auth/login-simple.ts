import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Test if Supabase import works
    const { supabase } = await import('@/lib/supabase-server');

    // Try simple query
    const { data, error } = await supabase
      .from('User')
      .select('id')
      .limit(1);

    if (error) {
      return res.status(500).json({
        status: 'error',
        error: error.message,
        details: error,
      });
    }

    return res.status(200).json({
      status: 'ok',
      message: 'Supabase connection works',
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
