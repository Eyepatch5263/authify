import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET(request: Request) {
    const session = await getSession();

    // if session does not exist, redirect to home page
    if (!session) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // if session exists, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
}
