import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  const isAdminHost = host.startsWith("admin.");
  const isDriverHost = host.startsWith("driver.");
  const isApi = pathname.startsWith("/api");
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/brand") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp");

  let protectedPath = pathname;

  if (!isApi && !isStatic && isAdminHost && !pathname.startsWith("/admin")) {
    protectedPath = pathname === "/" ? "/admin" : `/admin${pathname}`;
    const url = request.nextUrl.clone();
    url.pathname = protectedPath;
    return NextResponse.rewrite(url);
  }

  if (!isApi && !isStatic && isDriverHost && !pathname.startsWith("/driver")) {
    protectedPath = pathname === "/" ? "/driver" : `/driver${pathname}`;
    const url = request.nextUrl.clone();
    url.pathname = protectedPath;
    return NextResponse.rewrite(url);
  }

  if (protectedPath.startsWith("/admin") && !protectedPath.startsWith("/admin/login")) {
    const id = request.cookies.get("wazir-admin")?.value;
    if (!id) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const user = await prisma.adminUser.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (protectedPath.startsWith("/driver") && !protectedPath.startsWith("/driver/login")) {
    const id = request.cookies.get("wazir-driver")?.value;
    if (!id) {
      return NextResponse.redirect(new URL("/driver/login", request.url));
    }
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) {
      return NextResponse.redirect(new URL("/driver/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
