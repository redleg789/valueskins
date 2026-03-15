import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const TIMEOUT_MS = 15_000;

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const backendPath = '/' + path.join('/');
  const url = new URL(backendPath, BACKEND_URL);

  // Forward query params
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const headers: Record<string, string> = {
    'Content-Type': req.headers.get('content-type') || 'application/json',
  };

  // Forward auth headers
  const auth = req.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  // Forward cookies for httpOnly session
  const cookie = req.headers.get('cookie');
  if (cookie) headers['Cookie'] = cookie;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const body = req.method !== 'GET' && req.method !== 'HEAD'
      ? await req.text()
      : undefined;

    const response = await fetch(url.toString(), {
      method: req.method,
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseBody = await response.text();
    const responseHeaders = new Headers();

    // Forward relevant response headers
    const forwardHeaders = ['content-type', 'set-cookie', 'x-request-id'];
    for (const h of forwardHeaders) {
      const val = response.headers.get(h);
      if (val) responseHeaders.set(h, val);
    }

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof DOMException && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Backend timeout' }, { status: 504 });
    }
    return NextResponse.json(
      { error: 'Backend unreachable', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
