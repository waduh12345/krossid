"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

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
                <div className="w-10 h-10 bg-[#367CC0] rounded-xl flex items-center justify-center font-black text-white text-xl italic shadow-lg shadow-[#367CC0]/20">
                  K
                </div>
                <span className="font-black text-2xl tracking-tighter text-white">
                  Kross<span className="text-[#DF9B35]">.id</span>
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
                    placeholder="Search program..." 
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
                     Account
                   </Link>
                   <button
                     onClick={() => signOut({ callbackUrl: "/signin" })}
                     className="p-2.5 rounded-full bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all border border-red-600/20"
                     title="Sign Out"
                   >
                     <LogOut className="w-4 h-4" />
                   </button>
                 </div>
               ) : (
                 <div className="flex items-center gap-3">
                   <Link href="/signin" className="text-[10px] font-black text-white/70 uppercase tracking-widest hover:text-white">Sign In</Link>
                   <Link href="/signup" className="text-[10px] font-black bg-[#367CC0] text-white px-5 py-2.5 rounded-full hover:bg-[#2d6699] transition-all uppercase tracking-widest shadow-lg shadow-[#367CC0]/20">Join Now</Link>
                 </div>
               )}
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
      {!isAuthPage && (
        <footer className="bg-black/40 backdrop-blur-md border-t border-white/5 pt-20 pb-10 relative z-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 space-y-6">
                <div className="flex items-center gap-2 opacity-80">
                  <div className="w-6 h-6 bg-[#367CC0] rounded-sm"></div>
                  <span className="font-bold text-white tracking-tight text-xl">Kross.id</span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed italic">
                  "Professional affiliate public platform with masked identity system."
                </p>
              </div>

              {[
                { title: "Network", links: ["Traffic Harvester", "Referral Engine", "API Docs"] },
                { title: "Company", links: ["Privacy Policy", "Fraud Prevention", "Support Center"] },
                { title: "Office", links: ["Niaga Tower, Jakarta", "support@kross.id", "+62 21 000 000"] }
              ].map((group, i) => (
                <div key={i}>
                  <h4 className="text-[10px] font-black text-[#DF9B35] uppercase tracking-[0.2em] mb-8">{group.title}</h4>
                  <ul className="space-y-4 text-sm text-white/50 font-medium">
                    {group.links.map((link, j) => (
                      <li key={j}>
                        <Link href="#" className="hover:text-[#367CC0] transition-colors">{link}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] text-white/30 uppercase tracking-[0.3em] font-black">
              <p>© 2026 KROSS ID TECHNOLOGY. ALL RIGHTS RESERVED.</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7ED321] animate-pulse"></div>
                  <span>System: Secure</span>
                </div>
                <span>API V2.4.0</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </section>
  );
}