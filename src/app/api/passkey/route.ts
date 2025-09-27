// app/api/login/route.ts
import { NextResponse } from 'next/server';
import {sign} from '@/lib/auth'

export async function POST(req: Request) {
    const body = await req.json();
    const passkey = body?.passkey;


    if (passkey != process.env.PASSKEY) {
        return NextResponse.json({ error: 'Invalid passkey' }, { status: 401 });
    }

    const token = await sign(process.env.ENC_KEY!, {key:process.env.PASSKEY!} )

    const res = NextResponse.json({ success: true });

    res.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30
    });

    return res;
}
