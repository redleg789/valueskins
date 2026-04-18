import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL_RAW = process.env.BACKEND_URL || 'http://localhost:8080';
const TIMEOUT_MS = 15_000;
const TRANSIENT_STATUS = new Set([502, 503, 504]);

function getBackendBaseUrl(): string {
  let url: URL;
  try {
    url = new URL(BACKEND_URL_RAW);
  } catch {
    throw new Error('BACKEND_URL must be a valid absolute URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('BACKEND_URL must use http or https');
  }
  return url.toString();
}

const BACKEND_URL = getBackendBaseUrl();

function isSafeRetryMethod(method: string): boolean {
  return method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
}

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const backendPath = '/' + path.join('/');
  const url = new URL(backendPath, BACKEND_URL);

  // Forward query params
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const headers = new Headers();
  const contentType = req.headers.get('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  const auth = req.headers.get('authorization');
  if (auth) headers.set('Authorization', auth);

  const cookie = req.headers.get('cookie');
  if (cookie) headers.set('Cookie', cookie);

  const idempotency = req.headers.get('idempotency-key');
  if (idempotency) headers.set('Idempotency-Key', idempotency);

  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
  headers.set('X-Correlation-ID', correlationId);
  headers.set('X-Forwarded-Host', req.headers.get('host') || '');
  headers.set('X-Forwarded-Proto', req.nextUrl.protocol.replace(':', ''));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const body = req.method !== 'GET' && req.method !== 'HEAD'
      ? await req.text()
      : undefined;

    let response = await fetch(url.toString(), {
      method: req.method,
      headers,
      body,
      signal: controller.signal,
    });
    if (isSafeRetryMethod(req.method) && TRANSIENT_STATUS.has(response.status)) {
      await new Promise((resolve) => setTimeout(resolve, 120));
      response = await fetch(url.toString(), {
        method: req.method,
        headers,
        body,
        signal: controller.signal,
      });
    }

    clearTimeout(timeout);

    const responseBody = await response.text();
    const responseHeaders = new Headers();

    const forwardHeaders = ['content-type', 'set-cookie', 'x-request-id', 'x-correlation-id'];
    for (const h of forwardHeaders) {
      const val = response.headers.get(h);
      if (val) responseHeaders.set(h, val);
    }
    responseHeaders.set('Cache-Control', 'no-store');

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof DOMException && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Backend timeout' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
