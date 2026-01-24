import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// --- Types kecil untuk aman tanpa `any`
type RoleObj = {
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
};

type TokenLike = {
  role?: string;
  roles?: (string | RoleObj)[];
  user?: { roles?: (string | RoleObj)[] };
};

// --- Helper
const PUBLIC_PATHS = ["/login", "/home", "/programs", "/api-ready", "/forgot-password", "/register-owner", "/my-account", "/about-us", "/privacy-policy", "/terms-of-service", "/faq", "/contact-us"];
const PUBLIC_PATH_PREFIXES = ["/programs/"];
const ALWAYS_ALLOW_PREFIX = ["/api/auth", "/_next", "/static", "/images"];
const ALWAYS_ALLOW_EXACT = ["/favicon.ico", "/robots.txt", "/sitemap.xml"];

const isPublic = (pathname: string) =>
  PUBLIC_PATHS.includes(pathname) || 
  PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p)) ||
  pathname.startsWith("/api/auth");

const isAssetLike = (pathname: string) =>
  ALWAYS_ALLOW_EXACT.includes(pathname) ||
  ALWAYS_ALLOW_PREFIX.some((p) => pathname.startsWith(p));

function hasRole(token: TokenLike | null, roleName: string): boolean {
  if (!token) return false;

  const ok = (r: unknown) => {
    if (typeof r === "string") return r === roleName;
    if (r && typeof r === "object" && "name" in r)
      return (r as RoleObj).name === roleName;
    return false;
  };

  if (typeof token.role === "string" && token.role === roleName) return true;
  if (Array.isArray(token.roles) && token.roles.some(ok)) return true;
  if (Array.isArray(token.user?.roles) && token.user!.roles!.some(ok))
    return true;

  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bebaskan asset & route publik
  if (isAssetLike(pathname) || isPublic(pathname)) {
    return NextResponse.next();
  }

  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as TokenLike | null;

  // if (!token) {
  //   return NextResponse.redirect(new URL("/home", req.url));
  // }

  const isSuperAdmin = hasRole(token, "superadmin");
  const isOwner = hasRole(token, "owner");
  const isDirector = hasRole(token, "director");
  const isManager = hasRole(token, "manager");
  const isSales = hasRole(token, "sales") || hasRole(token, "affiliate");
  const isUser = hasRole(token, "user");
  
  const isCmsPath = pathname.startsWith("/cms");
  const isMyAccountPath = pathname.startsWith("/my-account");

  // Aturan akses
  if (isSuperAdmin || isDirector || isManager) {
    // superadmin, director, manager: hanya /cms*
    if (!isCmsPath) {
      return NextResponse.redirect(new URL("/cms", req.url));
    }
    return NextResponse.next();
  }

  if (isOwner) {
    // owner: bisa akses /cms* dan /my-account*
    if (isCmsPath || isMyAccountPath) {
      return NextResponse.next();
    }
    // Jika bukan keduanya, redirect ke /cms
    return NextResponse.redirect(new URL("/cms", req.url));
  }

  if (isSales || isUser) {
    // sales dan user: bisa akses /my-account*
    if (isMyAccountPath) {
      return NextResponse.next();
    }
    // Jika bukan my-account, redirect ke /my-account
    return NextResponse.redirect(new URL("/my-account", req.url));
  }

  // Role tidak dikenali atau tidak ada token
  // Allow access to public paths (already handled above)
  return NextResponse.next();
}

// Terapkan ke semua route kecuali asset umum & next internals
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};