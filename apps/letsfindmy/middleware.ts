import { auth } from '#/auth';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';

// Or like this if you need to do something here.
// export default auth((req) => {
//   console.log(req.auth) //  { session: { user: { ... } } }
// })

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export const middleware = async (req: NextRequest, ev: NextFetchEvent) => {
  // Check Edge Config to see if the maintenance page should be shown
  // If in maintenance mode, point the url pathname to the maintenance page

  const isInMaintenanceMode = await get('isInMaintenanceMode');
  if (isInMaintenanceMode && process.env.NODE_ENV !== 'development') {
    req.nextUrl.pathname = `/maintenance`;
    return NextResponse.rewrite(req.nextUrl);
  }
};

export default auth((req: NextRequest) => {
  console.log('Auth', req.auth);
  return middleware(req, {} as NextFetchEvent);
});
