import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedExact = ["/activities", "/coach", "/performance", "/settings"];

export function middleware(request: NextRequest) {
  const session = request.cookies.get("sweat_user_id")?.value;
  const { pathname } = request.nextUrl;
  if (protectedExact.includes(pathname) && !session) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/activities", "/coach", "/performance", "/settings"],
};
