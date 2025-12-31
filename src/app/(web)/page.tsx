"use client";

import Image from "next/image";
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  Search,
  Zap,
} from "lucide-react";

import Link from "next/link";

export default function AffiliateHome() {
  const liveActivity = [
    { id: 1, user: "Budi S.", role: "Affiliator", action: "Earned", amount: "IDR 250k", time: "2m" },
    { id: 2, user: "TechStore", role: "Owner", action: "Paid out", amount: "IDR 1.2M", time: "5m" },
    { id: 3, user: "Siska W.", role: "Affiliator", action: "Earned", amount: "IDR 450k", time: "8m" },
  ];

  const PROGRAMS = [
    {
      id: 1,
      owner: "EduTech Global",
      code: "ED-2025",
      title: "Digital Skill Bootcamp 2025",
      sub: "Education Service",
      desc: "Promosikan kursus pemrograman bersertifikat dengan tingkat konversi tinggi di kalangan mahasiswa.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500",
      status: "Verified",
      commission: "15% / Sale",
      slots: "12 spots left"
    },
    {
      id: 2,
      owner: "IndoGadget",
      code: "GADGET-XP",
      title: "Electronic Master Affiliate",
      sub: "Physical Goods",
      desc: "Dapatkan komisi dari setiap penjualan smartphone dan aksesoris melalui link unik Anda.",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500",
      status: "Hot",
      commission: "Flat IDR 50k",
      slots: "Unlimited"
    }
  ];

  return (
    <div>
      {/* --- MAIN CONTENT LAYOUT --- */}
      <div className="container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: User Focus Selection */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="h-16 bg-[#4A90E2]"></div>
            <div className="px-4 pb-4">
              <div className="w-16 h-16 bg-white border-4 border-white rounded-full -mt-8 mx-auto flex items-center justify-center shadow-md">
                <Users className="text-[#4A90E2]" />
              </div>
              <div className="text-center mt-3">
                <h3 className="font-bold text-lg leading-tight">Welcome to AffiliateCore</h3>
                <p className="text-xs text-gray-500 mt-1">Select your path to continue</p>
              </div>
              <div className="mt-6 space-y-2">
                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all group">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-gray-400 group-hover:text-[#4A90E2]" />
                    <span className="text-sm font-bold text-gray-600 group-hover:text-[#4A90E2]">Product Owner</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#4A90E2]" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-orange-50 hover:border-orange-200 transition-all group">
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-gray-400 group-hover:text-[#F2A93B]" />
                    <span className="text-sm font-bold text-gray-600 group-hover:text-[#F2A93B]">Affiliator</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#F2A93B]" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hidden lg:block">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Trending Tags</h4>
            <div className="flex flex-wrap gap-2">
              {["#SaaS", "#EduTech", "#HighCommission", "#Verified", "#PassiveIncome"].map(tag => (
                <span key={tag} className="text-[11px] font-bold text-gray-500 hover:text-[#4A90E2] cursor-pointer">{tag}</span>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: The Program Feed */}
        <main className="lg:col-span-6 space-y-6">
          {/* Post/Search Box Simulating Social Media */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input 
                placeholder="Find high-converting programs..." 
                className="w-full bg-gray-50 border border-gray-100 rounded-full px-6 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all"
              />
            </div>
          </div>

          {/* Feed Filter */}
          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-gray-300"></div>
            <span className="text-xs text-gray-500 font-medium">Sort by: <span className="text-gray-900 font-bold cursor-pointer">Most Recent ▼</span></span>
          </div>

          {/* Active Programs as "Posts" */}
          {PROGRAMS.map((prog) => (
            <div key={prog.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-[#4A90E2] font-black text-xl border border-gray-50 overflow-hidden relative">
                    <Image src={prog.image} alt="owner" fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm hover:text-[#4A90E2] cursor-pointer transition-colors">{prog.owner}</h4>
                    <p className="text-[11px] text-gray-400 uppercase font-bold tracking-tighter">{prog.sub} • {prog.code}</p>
                  </div>
                </div>
                <div className="bg-green-50 text-[#7ED321] text-[10px] font-black px-2 py-1 rounded-md flex items-center gap-1 border border-green-100">
                  <ShieldCheck className="w-3 h-3" /> {prog.status}
                </div>
              </div>

              <div className="px-4 pb-2">
                <h3 className="text-lg font-black text-gray-900 group-hover:text-[#4A90E2] transition-colors mb-2">{prog.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {prog.desc}
                </p>
              </div>

              <div className="p-4 flex items-center justify-between border-t border-gray-50 mt-2">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-none mb-1">Commission</span>
                    <span className="text-sm font-black text-[#F2A93B]">{prog.commission}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-none mb-1">Availability</span>
                    <span className="text-sm font-bold text-[#4A90E2]">{prog.slots}</span>
                  </div>
                </div>
                <Link href={`/programs/${prog.title}`} className="bg-gray-100 text-gray-600 hover:bg-[#4A90E2] hover:text-white px-5 py-2 rounded-lg text-sm font-black transition-all">
                  Join Program
                </Link>
              </div>
            </div>
          ))}

          <div className="text-center py-4">
            <button className="text-sm font-bold text-[#4A90E2] hover:underline">View all active programs...</button>
          </div>
        </main>

        {/* RIGHT COLUMN: Live Activity & Stats */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#7ED321]" /> Live Network Pulse
            </h4>
            <div className="space-y-4">
              {liveActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3 items-start border-b border-gray-50 pb-3 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-[#4A90E2]/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-[#4A90E2]">
                    {activity.user.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[11px] leading-tight font-medium">
                      <span className="font-bold text-gray-900">{activity.user}</span> ({activity.role})
                    </p>
                    <p className="text-xs font-black text-[#7ED321] mt-0.5">{activity.action} {activity.amount}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{activity.time} ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#4A90E2] to-[#357ABD] rounded-xl p-5 text-white shadow-lg">
            <h4 className="font-black text-lg mb-2">Are you a Product Owner?</h4>
            <p className="text-xs opacity-80 mb-4 leading-relaxed">Dapatkan traffic berkualitas dari ribuan agen yang siap mempromosikan produk Anda.</p>
            <button className="w-full bg-[#F2A93B] hover:bg-white hover:text-[#F2A93B] text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all">
              List Your Program
            </button>
          </div>

          {/* Footer simulation */}
          <div className="px-4 text-[11px] text-gray-400 text-center space-y-1">
            <p>© 2025 AffiliateCore System • Privacy • Terms</p>
            <p>Made with ❤️ for Indonesia Digital Assets</p>
          </div>
        </aside>

      </div>
    </div>
  );
}