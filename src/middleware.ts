// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from '@/lib/auth';

const PROTECTED_PATHS = ['/', '/generate', '/replies', '/history', '/api/reply'];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;


  // Check if the current route is protected
  const isProtected = PROTECTED_PATHS.some(path => pathname === path);
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    // For API route: return 401
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For UI route: redirect to login
    const loginUrl = new URL('/passkey', req.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload:any =await verify(process.env.ENC_KEY!,token)


    if(payload && payload.key==process.env.PASSKEY){

      return NextResponse.next();
    }
    throw new Error('Invalid passkey')

  } catch {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.redirect(new URL('/passkey', req.url));
  }
}


export const config = {
    matcher: ['/', '/api/:path*'],
  };







