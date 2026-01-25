"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, LogOut, Mail, Send, Facebook, Twitter, Instagram, Linkedin, Youtube, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Swal from "sweetalert2";
import { useI18n } from "@/contexts/i18n-context";
import { LanguageSwitcher } from "@/components/language-switcher";

// Footer Component with Subscribe
function FooterComponent() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      Swal.fire({
        icon: "error",
        title: t.alerts.invalidEmail,
        text: t.alerts.invalidEmailText,
        background: "#1e293b",
        color: "#fff",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail("");
      Swal.fire({
        icon: "success",
        title: t.alerts.subscribed,
        text: t.alerts.subscribedText,
        background: "#1e293b",
        color: "#fff",
        timer: 3000,
        showConfirmButton: false,
      });
    }, 1000);
  };

  return (
    <footer className="bg-black/40 backdrop-blur-md border-t border-white/5 pt-16 pb-10 relative z-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#367CC0] to-[#DF9B35] rounded-lg flex items-center justify-center">
                <span className="font-black text-white text-sm">K</span>
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
                { label: t.nav.programs, href: "/programs" },
                { label: t.nav.myAccount, href: "/my-account" },
                { label: t.nav.aboutUs, href: "/about-us" },
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
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Service", href: "/terms-of-service" },
                { label: "FAQ", href: "/faq" },
                { label: "Contact Us", href: "/contact-us" },
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

          {/* Subscribe Section */}
          <div>
            <h4 className="text-[10px] font-black text-[#DF9B35] uppercase tracking-[0.2em] mb-6">{t.footer.subscribe}</h4>
            <p className="text-sm text-white/60 mb-4">
              {t.footer.subscribeDescription}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.footer.enterEmail}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 focus:border-[#367CC0]/50 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#367CC0] to-[#DF9B35] hover:from-[#2d6699] hover:to-[#c7892a] text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#367CC0]/20"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t.footer.subscribing}</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>{t.footer.subscribeButton}</span>
                  </>
                )}
              </button>
            </form>
            <div className="mt-4 flex items-start gap-2 text-xs text-white/40">
              <CheckCircle2 size={14} className="text-[#7ED321] mt-0.5 flex-shrink-0" />
              <span>{t.footer.privacyNote}</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 pt-8 border-t border-white/5">
          <div className="flex items-center gap-3 text-sm text-white/60">
            <div className="w-10 h-10 rounded-lg bg-[#367CC0]/20 flex items-center justify-center">
              <Mail size={18} className="text-[#367CC0]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1">{t.footer.email}</p>
              <p className="text-white/80">support@kross.id</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <div className="w-10 h-10 rounded-lg bg-[#DF9B35]/20 flex items-center justify-center">
              <Phone size={18} className="text-[#DF9B35]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1">{t.footer.phone}</p>
              <p className="text-white/80">+62 21 000 000</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <div className="w-10 h-10 rounded-lg bg-[#7ED321]/20 flex items-center justify-center">
              <MapPin size={18} className="text-[#7ED321]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1">{t.footer.location}</p>
              <p className="text-white/80">Niaga Tower, Jakarta</p>
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
  const { data: session, status } = useSession();
  const { t } = useI18n();

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

            {/* Main Navigation - Hidden for now */}
            {/* <div className="hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <Link href="/home" className={getLinkClass("/home")}>Feed</Link>
              <Link href="/programs" className={getLinkClass("/programs")}>Marketplace</Link>
              <Link href="/network" className={getLinkClass("/network")}>Network</Link>
            </div> */}

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
               <div className="hidden md:flex relative mr-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder={t.nav.searchPlaceholder} 
                    className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 transition-all w-48 lg:w-64"
                  />
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
               
               {/* Language Switcher - Paling Kanan */}
               <LanguageSwitcher />
            </div>
          </div>
        </nav>
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