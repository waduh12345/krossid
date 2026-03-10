"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, User, LogOut, Mail, Facebook, Twitter, Instagram, Linkedin, Youtube, Phone, MapPin, X, Menu } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useI18n } from "@/contexts/i18n-context";
import { LanguageSwitcher } from "@/components/language-switcher";

// Footer Component
function FooterComponent() {
  const { t } = useI18n();

  return (
    <footer className="bg-black/40 backdrop-blur-md border-t border-white/5 pt-16 pb-10 relative z-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#367CC0] to-[#DF9B35] rounded-lg flex items-center justify-center">
                <Image
                  src="/kross-id.png"
                  alt="Kross ID Logo"
                  width={40}
                  height={40}
                />
              </div>
              <span className="font-black text-white tracking-tight text-xl">
                KROSS<span className="text-[#DF9B35]">.ID</span>
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              {t.footer.companyDescription}
            </p>
            
            {/* Social Media */}
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-[#367CC0]/20 border border-white/10 flex items-center justify-center transition-all group"
                aria-label="Facebook"
              >
                <Facebook size={16} className="text-white/60 group-hover:text-[#367CC0]" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-[#367CC0]/20 border border-white/10 flex items-center justify-center transition-all group"
                aria-label="Twitter"
              >
                <Twitter size={16} className="text-white/60 group-hover:text-[#367CC0]" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-[#367CC0]/20 border border-white/10 flex items-center justify-center transition-all group"
                aria-label="Instagram"
              >
                <Instagram size={16} className="text-white/60 group-hover:text-[#367CC0]" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-[#367CC0]/20 border border-white/10 flex items-center justify-center transition-all group"
                aria-label="LinkedIn"
              >
                <Linkedin size={16} className="text-white/60 group-hover:text-[#367CC0]" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-[#367CC0]/20 border border-white/10 flex items-center justify-center transition-all group"
                aria-label="YouTube"
              >
                <Youtube size={16} className="text-white/60 group-hover:text-[#367CC0]" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] font-black text-[#DF9B35] uppercase tracking-[0.2em] mb-6">{t.footer.quickLinks}</h4>
            <ul className="space-y-3">
              {[
                { label: t.nav.home, href: "/home" },
                { label: t.nav.aboutUs, href: "/about-us" },
                { label: t.nav.pricing, href: "/pricing" },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-white/60 hover:text-[#367CC0] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-[#367CC0] transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[10px] font-black text-[#DF9B35] uppercase tracking-[0.2em] mb-6">{t.footer.support}</h4>
            <ul className="space-y-3">
              {[
                { label: t.footer.privacyPolicy, href: "/privacy-policy" },
                { label: t.footer.termsOfService, href: "/terms-of-service" },
                { label: t.footer.faq, href: "/faq" },
                { label: t.footer.contactUs, href: "/contact-us" },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-white/60 hover:text-[#367CC0] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-[#367CC0] transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-[10px] font-black text-[#DF9B35] uppercase tracking-[0.2em] mb-6">{t.footer.contactUs}</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#367CC0]/20 flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-[#367CC0]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-0.5">{t.footer.email}</p>
                  <p className="text-sm text-white/80">support@kross.id</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black">
            {t.footer.copyright}
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <div className="w-1.5 h-1.5 rounded-full bg-[#7ED321] animate-pulse"></div>
              <span>{t.footer.systemSecure}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <div className="w-1.5 h-1.5 rounded-full bg-[#367CC0]"></div>
              <span>{t.footer.sslEncrypted}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { t } = useI18n();

  // Search state
  const [searchValue, setSearchValue] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHomePage = pathname === "/home";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Sync search input with URL params when on home page
  useEffect(() => {
    if (isHomePage) {
      const urlSearch = searchParams.get("search") || "";
      setSearchValue(urlSearch);
    }
  }, [isHomePage, searchParams]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    // Only trigger search if value is >= 2 characters or empty (to clear)
    if (value.length >= 2 || value.length === 0) {
      if (isHomePage) {
        // Update URL params on home page
        const params = new URLSearchParams(searchParams.toString());
        if (value.length >= 2) {
          params.set("search", value);
        } else {
          params.delete("search");
        }
        router.push(`/home?${params.toString()}`, { scroll: false });
      }
    }
  };

  // Handle search on Enter key (for redirect from other pages)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.length >= 2) {
      if (!isHomePage) {
        // Redirect to home with search param
        router.push(`/home?search=${encodeURIComponent(searchValue)}`);
      }
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchValue("");
    if (isHomePage) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("search");
      const newUrl = params.toString() ? `/home?${params.toString()}` : "/home";
      router.push(newUrl, { scroll: false });
    }
  };

  // 1. Tentukan route auth (tanpa Header & Footer)
  const authRoutes = [
    "/signin", 
    "/signup", 
    "/forgot-password", 
    "/reset-password", 
    "/verify-email", 
    "/verify-reset"
  ];
  const isAuthPage = authRoutes.some(route => pathname?.startsWith(route));

  // 2. Helper style navigasi aktif (Glass Style)
  const getLinkClass = (path: string) => {
    const activeStyle = "text-white bg-white/10 shadow-[0_0_15px_rgba(54,124,192,0.3)] border-b-2 border-[#367CC0]";
    const inactiveStyle = "text-white/60 hover:text-white hover:bg-white/5 transition-all";

    return pathname === path || pathname?.startsWith(`${path}/`)
      ? `${activeStyle} px-4 py-2 rounded-lg`
      : `${inactiveStyle} px-4 py-2 rounded-lg`;
  };

  return (
    // PERBAIKAN: Hapus 'overflow-hidden' di sini agar sticky sidebar berfungsi
    <section className="bg-[#0f172a] min-h-screen flex flex-col font-sans text-white relative">
      
      {/* --- GLOBAL BACKGROUND DECOR --- */}
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#367CC0]/20 via-[#0f172a] to-[#DF9B35]/10 pointer-events-none z-0"></div>
      
      {/* Grid Pattern: Dibungkus div dengan overflow-hidden agar tidak bocor, tapi tetap fixed */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 overflow-hidden">
        <div 
          className="w-full h-full"
          style={{ 
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }}
        ></div>
      </div>

      {/* --- NAVBAR (Glassmorphism) --- */}
      {!isAuthPage && (
        <>
          <nav className="sticky top-0 z-[100] bg-white/5 backdrop-blur-xl border-b border-white/10 h-20">
            <div className="container mx-auto px-6 h-full flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <Link href="/home" className="flex items-center gap-3">
                  <Image
                    src="/kross-id.png"
                    alt="Kross ID Logo"
                    width={40}
                    height={40}
                  />
                  <span className="font-black text-2xl tracking-tighter text-white">
                    KROSS<span className="text-[#DF9B35]">.ID</span>
                  </span>
                </Link>
              </div>

              {/* Desktop: Search, Auth, Language */}
              <div className="hidden md:flex items-center gap-4">
                <div className="relative mr-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                  <input 
                    type="text" 
                    value={searchValue}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={t.nav.searchPlaceholder} 
                    className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 transition-all w-48 lg:w-64"
                  />
                  {searchValue && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                      title={t.search?.clearSearch || "Clear search"}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {status === "loading" ? (
                  <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse"></div>
                ) : session ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/my-account"
                      className="flex items-center gap-2 text-[10px] font-black text-white/70 hover:text-white transition-colors uppercase tracking-widest bg-white/5 px-4 py-2.5 rounded-full border border-white/10"
                    >
                      <User className="w-3.5 h-3.5" />
                      {t.nav.account}
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/signin" })}
                      className="p-2.5 rounded-full bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all border border-red-600/20"
                      title={t.nav.signOut}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/signin" className="text-[10px] font-black text-white/70 uppercase tracking-widest hover:text-white">{t.nav.signIn}</Link>
                    <Link href="/signup" className="text-[10px] font-black bg-[#367CC0] text-white px-5 py-2.5 rounded-full hover:bg-[#2d6699] transition-all uppercase tracking-widest shadow-lg shadow-[#367CC0]/20">{t.nav.joinNow}</Link>
                  </div>
                )}
                <LanguageSwitcher />
              </div>

              {/* Mobile: Menu button */}
              <div className="flex items-center gap-2 md:hidden">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((o) => !o)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </nav>

          {/* Mobile menu panel */}
          <div
            className={`md:hidden fixed inset-x-0 top-20 z-[99] bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300 ease-out ${
              mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
            }`}
          >
            <div className="container mx-auto px-6 py-6 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                <input 
                  type="text" 
                  value={searchValue}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={t.nav.searchPlaceholder} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 transition-all"
                />
                {searchValue && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    title={t.search?.clearSearch || "Clear search"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Language */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Language</span>
                <LanguageSwitcher />
              </div>

              {/* Auth: Sign In / Join Now or Account + Logout */}
              <div className="pt-2 border-t border-white/10">
                {status === "loading" ? (
                  <div className="h-12 rounded-xl bg-white/10 animate-pulse" />
                ) : session ? (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/my-account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 text-sm font-black text-white bg-white/10 py-3 px-4 rounded-xl border border-white/10"
                    >
                      <User className="w-4 h-4" />
                      {t.nav.account}
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut({ callbackUrl: "/signin" });
                      }}
                      className="flex items-center justify-center gap-2 text-sm font-black text-red-400 bg-red-600/20 py-3 px-4 rounded-xl border border-red-500/20"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.nav.signOut}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/signin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center text-sm font-black text-white/90 py-3 px-4 rounded-xl border border-white/20 hover:bg-white/5 transition-colors"
                    >
                      {t.nav.signIn}
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center text-sm font-black bg-[#367CC0] text-white py-3 px-4 rounded-xl hover:bg-[#2d6699] transition-all shadow-lg shadow-[#367CC0]/20"
                    >
                      {t.nav.joinNow}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- MAIN CONTENT --- */}
      {/* Z-index ditinggikan agar di atas background decor, tapi biarkan overflow natural */}
      <main className="flex-grow relative z-10">
        {children}
      </main>

      {/* --- FOOTER --- */}
      {!isAuthPage && <FooterComponent />}
    </section>
  );
}