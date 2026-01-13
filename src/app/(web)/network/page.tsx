"use client";

import Image from "next/image";
import { 
  Users, 
  TrendingUp, 
  Building2, 
  Crown, 
  Search,
  ArrowUpRight,
  Globe,
  Briefcase,
  Bell,
  Zap,
  MoreHorizontal,
  ShieldCheck,
  ChevronRight,
  UserPlus
} from "lucide-react";
import { motion } from "framer-motion";

export default function UnifiedNetworkPage() {
  // --- Data Simulasi ---
  const myCorporate = {
    name: "Naditechno Digital Solutions",
    logo: "N",
    owner: { name: "Raden Wijaya", role: "Corporate Owner", avatar: "https://i.pravatar.cc/150?u=owner" },
    colleaguesCount: 24,
  };

  const colleagues = [
    { id: 1, name: "Siska Amanda", role: "Marketing Lead", avatar: "https://i.pravatar.cc/150?u=s1" },
    { id: 2, name: "Budi Santoso", role: "Fullstack Dev", avatar: "https://i.pravatar.cc/150?u=s2" },
  ];

  const externalPros = [
    { id: 101, name: "Jessica Lim", role: "Top Affiliator", company: "Global Tech", impact: "2.4k Leads", avatar: "https://i.pravatar.cc/150?u=e1" },
    { id: 102, name: "Andri Tech", role: "Product Owner", company: "Gadget Hub", impact: "IDR 1.2B Paid", avatar: "https://i.pravatar.cc/150?u=e2" },
  ];

  return (
    <div className="relative min-h-screen text-white">
      {/* --- CONTENT LAYOUT --- */}
      <div className="container mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* --- LEFT SIDEBAR: Personal & Corporate Context --- */}
        <aside className="lg:col-span-3 space-y-6">
          {/* Profile Glass Card */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
            <div className="h-16 bg-gradient-to-r from-[#367CC0] to-[#DF9B35] opacity-80"></div>
            <div className="px-6 pb-6 text-center">
              <div className="relative w-20 h-20 -mt-10 mx-auto group">
                <div className="absolute inset-0 bg-[#367CC0] rounded-2xl rotate-45 group-hover:rotate-90 transition-transform duration-500 shadow-lg shadow-[#367CC0]/30"></div>
                <div className="absolute inset-1 bg-[#0f172a] rounded-2xl rotate-45 overflow-hidden flex items-center justify-center border border-white/10">
                  <Image src="https://i.pravatar.cc/150?u=me" alt="Me" width={80} height={80} className="-rotate-45 scale-125" />
                </div>
              </div>
              <h3 className="font-black text-xl text-white mt-4 tracking-tight">Nadi Techno</h3>
              <p className="text-[10px] text-[#367CC0] font-black uppercase tracking-[0.2em] mb-4">Senior Partner</p>
              
              <div className="flex items-center justify-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 group cursor-pointer hover:bg-white/10 transition-all">
                <Building2 className="w-4 h-4 text-[#DF9B35]" />
                <span className="text-[10px] font-black text-white/70 uppercase truncate tracking-widest">{myCorporate.name}</span>
              </div>
            </div>
          </div>

          {/* Owner Spotlight (Hierarchy) */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] group hover:bg-white/10 transition-all cursor-pointer shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <Crown className="w-4 h-4 text-[#DF9B35]" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Asset Authority</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 shrink-0">
                <div className="absolute inset-0 bg-[#DF9B35] rounded-xl rotate-12 opacity-20 group-hover:rotate-45 transition-transform"></div>
                <Image src={myCorporate.owner.avatar} alt="Owner" fill className="rounded-xl object-cover border border-white/10 shadow-sm" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white group-hover:text-[#DF9B35] transition-colors truncate tracking-tighter">{myCorporate.owner.name}</p>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest truncate">{myCorporate.owner.role}</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-white/20 ml-auto group-hover:text-white transition-all" />
            </div>
          </div>
        </aside>

        {/* --- CENTER COLUMN: Unified Feed --- */}
        <main className="lg:col-span-6 space-y-8">
          
          {/* 1. CORPORATE HUB (INTERNAL GLASS) */}
          <section className="bg-white/5 backdrop-blur-3xl border border-[#367CC0]/30 rounded-[40px] shadow-2xl overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-[#367CC0]/10 to-transparent flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-[#367CC0] text-white rounded-2xl rotate-12 flex items-center justify-center font-black shadow-lg shadow-[#367CC0]/20">
                   <span className="-rotate-12 text-xl italic">{myCorporate.logo}</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Internal Corporate Hub</h2>
                  <p className="text-[10px] text-[#7ED321] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#7ED321] rounded-full animate-pulse"></span>
                    {myCorporate.colleaguesCount} Nodes Online
                  </p>
                </div>
              </div>
              <button className="text-[10px] font-black text-white uppercase bg-[#367CC0] px-6 py-2.5 rounded-full hover:bg-[#2d6699] transition-all shadow-lg shadow-[#367CC0]/20">Dashboard</button>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {colleagues.map(person => (
                <div key={person.id} className="flex items-center gap-4 p-4 rounded-[24px] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group">
                  <div className="w-11 h-11 rounded-full overflow-hidden relative border-2 border-[#367CC0]/30">
                    <Image src={person.avatar} alt={person.name} fill />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black text-white group-hover:text-[#367CC0] transition-colors truncate">{person.name}</h4>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{person.role}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white" />
                </div>
              ))}
              <div className="col-span-full text-center pt-4 border-t border-white/5">
                <button className="text-[10px] font-black text-white/40 hover:text-[#367CC0] uppercase tracking-[0.3em] transition-colors">View Unified Directory</button>
              </div>
            </div>
          </section>

          {/* 2. GLOBAL DISCOVERY (EXTERNAL GLASS) */}
          <section className="space-y-6">
            <div className="flex items-center gap-6 px-4">
               <div className="h-[1px] flex-1 bg-white/5"></div>
               <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] flex items-center gap-3">
                 <Globe className="w-4 h-4 text-[#DF9B35]" /> Discover Global Assets
               </span>
               <div className="h-[1px] flex-1 bg-white/5"></div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
              <h3 className="text-lg font-black text-white mb-8 tracking-tighter">Professionals You May Authorize</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {externalPros.map(pro => (
                  <motion.div whileHover={{ y: -5 }} key={pro.id} className="flex flex-col bg-black/40 border border-white/5 rounded-[32px] overflow-hidden group hover:border-[#367CC0]/50 transition-all">
                    <div className="h-14 bg-gradient-to-r from-white/5 to-transparent"></div>
                    <div className="px-6 pb-6 text-center">
                      <div className="relative w-16 h-16 -mt-8 mx-auto">
                        <div className="absolute inset-0 bg-[#367CC0] rounded-2xl rotate-45 opacity-20 group-hover:rotate-90 transition-transform"></div>
                        <Image src={pro.avatar} alt={pro.name} fill className="rounded-2xl object-cover border-2 border-white/10 shadow-xl" />
                      </div>
                      <h4 className="font-black text-sm text-white mt-4 tracking-tight">{pro.name}</h4>
                      <p className="text-[10px] text-[#367CC0] font-black uppercase tracking-widest mt-1">{pro.role}</p>
                      <p className="text-[9px] text-white/20 font-bold uppercase mt-1">Authorized @{pro.company}</p>
                      
                      <div className="mt-4 mb-6 bg-[#7ED321]/10 rounded-xl py-2 flex items-center justify-center gap-2 border border-[#7ED321]/20">
                        <TrendingUp className="w-3.5 h-3.5 text-[#7ED321]" />
                        <span className="text-[10px] font-black text-[#7ED321] uppercase tracking-widest">{pro.impact}</span>
                      </div>
                      
                      <button className="w-full py-3 bg-white/5 border border-white/10 text-white hover:bg-[#367CC0] hover:border-[#367CC0] rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                        <UserPlus size={14} /> Connect Node
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* --- RIGHT SIDEBAR: Connectivity & Trends --- */}
        <aside className="lg:col-span-3 space-y-6">
          {/* Manage Network Glass Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-xl">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Node Connectivity</h3>
            </div>
            <div className="p-6 space-y-5">
               {[
                 { label: "Active Connections", count: "1,240", icon: Users, color: "#367CC0" },
                 { label: "Pending Requests", count: "2", icon: Briefcase, color: "#DF9B35", alert: true },
               ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all">
                        <item.icon className="w-4 h-4" style={{ color: item.color }} />
                      </div>
                      <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">{item.label}</span>
                    </div>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${item.alert ? "bg-[#DF9B35] text-black" : "text-[#367CC0] bg-[#367CC0]/10"}`}>{item.count}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Trending with Concave Notch */}
          <div 
            className="bg-[#0a0a0a] p-8 rounded-[40px] relative overflow-hidden shadow-2xl border border-white/5"
            style={{ WebkitMaskImage: 'radial-gradient(circle 50px at 100% 0%, transparent 100%, black 101%)' }}
          >
             <h4 className="text-[10px] font-black text-[#DF9B35] uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
               <Zap className="w-4 h-4 fill-[#DF9B35]" /> Network Pulse
             </h4>
             <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-4 items-start group cursor-pointer">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 shrink-0 flex items-center justify-center font-black text-[#367CC0] group-hover:bg-[#367CC0] group-hover:text-white transition-all shadow-lg">
                       {i === 1 ? "S" : "E"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-white/80 leading-tight group-hover:text-[#367CC0] transition-colors truncate">Enterprise SaaS Node</p>
                      <p className="text-[10px] text-[#7ED321] font-black uppercase mt-1 tracking-widest italic">5M+ Authorization</p>
                    </div>
                  </div>
                ))}
             </div>
             <button className="w-full mt-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white hover:bg-white/10 transition-all">Explore Global Index</button>
          </div>
        </aside>

      </div>
    </div>
  );
}