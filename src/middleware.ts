import { getToken } from 'next-auth/jwt';
import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

interface AppRole {
  app: string;
  roles: string[];
}

export default async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret, cookieName: 'next-auth.session-token.contract' });
  const { pathname } = req.nextUrl;

  // // If user is on login page and has a valid token, redirect to home
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  try {

    // Allow access to public paths and API routes
    if (pathname.includes('api/auth') || pathname === '/' || pathname === '/login') {
      return NextResponse.next();
    }

    // Redirect to login if no token found
    // Check if token exists and if it has an error flag
    if (!token || !token.accessToken || token.error === "RefreshAccessTokenError") {
      // Redirect to login page
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const accessToken = token.accessToken;
    const secretKey = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

    // Decode and verify JWT token
    const { payload } = await jwtVerify(accessToken as string, secretKey);
    const userPayload = payload as { userID: string; username: string; name: string; appRoles: AppRole[] };

    // Check if the user has the required role for the 'Contract' app
    const hasContractRole = userPayload.appRoles.some((role) => role.app === 'Contract');
    if (!hasContractRole) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Allow the request to proceed
    return NextResponse.next();

  } catch (error) {

    console.error('Error validating token:', error);

  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|target.svg|.*\\.xlsx|icon.svg|access-denied.svg|bg-login.jpg|public/*|node_modules).*)',
  ],
};