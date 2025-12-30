"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  TrendingUp, 
  Building2, 
  Crown, 
  Search,
  ArrowUpRight,
  ShieldCheck,
  Globe,
  Briefcase,
  MoreHorizontal,
  Bell,
  Zap
} from "lucide-react";

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
    <div className="bg-[#F4F2EE] min-h-screen font-sans pb-12">
      {/* --- STICKY HEADER --- */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4A90E2] rounded flex items-center justify-center font-black text-white italic">A</div>
            <span className="font-black text-xl tracking-tighter text-[#4A90E2]">Affiliate<span className="text-[#F2A93B]">Core</span></span>
          </div>
          <div className="flex-1 max-w-md mx-10 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input placeholder="Search network..." className="w-full bg-[#EDF3F8] border-none rounded-md py-2 pl-10 text-sm focus:ring-1 focus:ring-blue-400" />
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Bell className="w-5 h-5 text-gray-500 cursor-pointer" />
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border">
              <Image src="https://i.pravatar.cc/150?u=me" alt="Me" width={32} height={32} />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT SIDEBAR: Personal & Corporate Context --- */}
        <aside className="lg:col-span-3 space-y-4">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-14 bg-[#4A90E2]"></div>
            <div className="px-4 pb-4 text-center">
              <div className="w-16 h-16 bg-white border-4 border-white rounded-full -mt-8 mx-auto shadow-md overflow-hidden relative">
                <Image src="https://i.pravatar.cc/150?u=me" alt="Me" fill />
              </div>
              <h3 className="font-black text-gray-900 mt-2">Nadi Techno</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-3">Senior Partner</p>
              
              <div className="flex items-center justify-center gap-1.5 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <Building2 className="w-3.5 h-3.5 text-[#4A90E2]" />
                <span className="text-[10px] font-black text-[#4A90E2] uppercase truncate">{myCorporate.name}</span>
              </div>
            </div>
          </div>

          {/* Owner Spotlight (Hierarki Corporate) */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm group hover:border-[#F2A93B] transition-all cursor-pointer">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-[#F2A93B]" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Our Corporate Owner</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-orange-100 overflow-hidden relative">
                <Image src={myCorporate.owner.avatar} alt="Owner" fill />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-gray-900 group-hover:text-[#F2A93B] transition-colors truncate">{myCorporate.owner.name}</p>
                <p className="text-[9px] text-gray-500 font-bold truncate">{myCorporate.owner.role}</p>
              </div>
              <ArrowUpRight className="w-3 h-3 text-gray-300 ml-auto group-hover:text-[#F2A93B]" />
            </div>
          </div>
        </aside>

        {/* --- CENTER COLUMN: Unified Feed (Internal & External) --- */}
        <main className="lg:col-span-6 space-y-6">
          
          {/* 1. CORPORATE HUB (INTERNAL) */}
          <section className="bg-white rounded-xl border-2 border-blue-100 shadow-sm overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-50/50 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4A90E2] text-white rounded-lg flex items-center justify-center font-black">{myCorporate.logo}</div>
                <div>
                  <h2 className="text-sm font-black text-gray-900">Your Corporate Hub</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{myCorporate.colleaguesCount} Colleagues Online</p>
                </div>
              </div>
              <button className="text-[10px] font-black text-[#4A90E2] uppercase border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-all">Dashboard</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {colleagues.map(person => (
                <div key={person.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all border border-gray-50">
                  <div className="w-9 h-9 rounded-full overflow-hidden relative border border-white">
                    <Image src={person.avatar} alt={person.name} fill />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-gray-900 truncate">{person.name}</h4>
                    <p className="text-[9px] text-gray-400 font-bold leading-none">{person.role}</p>
                  </div>
                </div>
              ))}
              <div className="col-span-2 text-center pt-2">
                <button className="text-[10px] font-black text-gray-400 hover:text-[#4A90E2] uppercase">View All Team Members</button>
              </div>
            </div>
          </section>

          {/* 2. GLOBAL DISCOVERY (EXTERNAL) */}
          <section className="space-y-4">
            <div className="flex items-center gap-4">
               <div className="h-[1px] flex-1 bg-gray-200"></div>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <Globe className="w-3 h-3" /> Expand Global Reach
               </span>
               <div className="h-[1px] flex-1 bg-gray-200"></div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 mb-6">Professionals You May Know</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {externalPros.map(pro => (
                  <div key={pro.id} className="flex flex-col border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                    <div className="h-12 bg-gray-50"></div>
                    <div className="px-4 pb-4 text-center">
                      <div className="w-14 h-14 bg-white border-4 border-white rounded-full -mt-7 mx-auto shadow-sm overflow-hidden relative">
                        <Image src={pro.avatar} alt={pro.name} fill />
                      </div>
                      <h4 className="font-black text-xs text-gray-900 mt-2">{pro.name}</h4>
                      <p className="text-[10px] text-[#4A90E2] font-black uppercase tracking-tighter">{pro.role}</p>
                      <p className="text-[9px] text-gray-400 font-bold mt-1">@{pro.company}</p>
                      
                      <div className="mt-3 mb-4 bg-green-50 rounded-lg py-1.5 flex items-center justify-center gap-2">
                        <TrendingUp className="w-3 h-3 text-[#7ED321]" />
                        <span className="text-[9px] font-black text-gray-700">{pro.impact}</span>
                      </div>
                      
                      <button className="w-full py-2 border-2 border-[#4A90E2] text-[#4A90E2] hover:bg-[#4A90E2] hover:text-white rounded-full text-[10px] font-black transition-all">
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* --- RIGHT SIDEBAR: Connectivity & Trends --- */}
        <aside className="lg:col-span-3 space-y-4">
          {/* Invitations */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h3 className="text-xs font-black text-gray-900 uppercase">Manage Network</h3>
            </div>
            <div className="p-4 space-y-4">
               <div className="flex justify-between items-center group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-400 group-hover:text-[#4A90E2]" />
                    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">Connections</span>
                  </div>
                  <span className="text-xs font-black text-[#4A90E2]">1,240</span>
               </div>
               <div className="flex justify-between items-center group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-gray-400 group-hover:text-[#4A90E2]" />
                    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">Pending Requests</span>
                  </div>
                  <span className="text-xs font-black text-red-400 bg-red-50 px-2 rounded">2</span>
               </div>
            </div>
          </div>

          {/* Trending Global Programs */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Zap className="w-3.5 h-3.5 text-[#F2A93B] fill-[#F2A93B]" /> Trending Global
             </h4>
             <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-3 items-start group cursor-pointer">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0"></div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-gray-800 leading-tight group-hover:text-[#4A90E2] truncate">High-Ticket SaaS Offer</p>
                      <p className="text-[9px] text-[#7ED321] font-bold uppercase mt-1">IDR 5M+ Payouts</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </aside>

      </div>
    </div>
  );
}