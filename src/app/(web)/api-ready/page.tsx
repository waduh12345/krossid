"use client";

import { useState } from "react";

// --- Tipe Data ---
type SalesTeam = {
  id: number;
  email: string;
  invitedAt: string;
  status: "Active" | "Inactive";
  isDomainValid: boolean;
};

export default function ManagementDashboard() {
  const [activeDomain] = useState("bsi.ac.id");
  const [filterActive, setFilterActive] = useState(true);

  // --- Mockup Tim Sales ---
  const SALES_TEAM: SalesTeam[] = [
    { id: 1, email: "manager.one@bsi.ac.id", invitedAt: "2025-12-20", status: "Active", isDomainValid: true },
    { id: 2, email: "staff.finance@bsi.ac.id", invitedAt: "2025-12-21", status: "Inactive", isDomainValid: true },
    { id: 3, email: "external.user@gmail.com", invitedAt: "2025-12-22", status: "Active", isDomainValid: false },
    { id: 4, email: "lead.sales@bsi.ac.id", invitedAt: "2025-12-23", status: "Active", isDomainValid: true },
    { id: 5, email: "guest.agent@yahoo.com", invitedAt: "2025-12-23", status: "Inactive", isDomainValid: false },
  ];

  // Logic Filter Domain
  const filteredTeam = filterActive 
    ? SALES_TEAM.filter(member => member.email.endsWith(`@${activeDomain}`))
    : SALES_TEAM;

  return (
    <div className="bg-[#FAFBFC] min-h-screen pb-24 font-sans">
      
      {/* --- TOP BAR: API STATUS --- */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-[#4A90E2] tracking-tighter">MANAGEMENT<span className="text-[#F2A93B]">HUB</span></h2>
            <span className="hidden md:inline-block bg-gray-100 text-[#8E8E8E] text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">v2.0</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#7ED321]/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-[#7ED321] rounded-full animate-ping"></span>
              <span className="text-[10px] font-bold text-[#7ED321] uppercase">API Ready</span>
            </div>
            <div className="w-8 h-8 bg-[#4A90E2] rounded-full flex items-center justify-center text-white">
              <i className="fas fa-user-tie text-xs"></i>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 space-y-8">
        
        {/* --- REAL-TIME STATS: PERFORMANCE VS FRAUD --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Performance Graph Placeholder */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-black text-[#1A1A1A] text-xl">Real-time Performance</h3>
                <p className="text-xs text-[#8E8E8E]">Live traffic vs Security threats</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#7ED321] uppercase">
                  <span className="w-3 h-3 bg-[#7ED321] rounded-sm"></span> Success
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#8E8E8E] uppercase">
                  <span className="w-3 h-3 bg-[#8E8E8E] rounded-sm"></span> Fraud Attempt
                </div>
              </div>
            </div>
            
            {/* Visualisasi Grafik (Mockup CSS) */}
            <div className="h-48 flex items-end gap-2 px-2">
              {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60, 75, 55].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-8 bg-[#1A1A1A] text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {h}%
                  </div>
                  {/* Fraud Part (Grey) */}
                  <div className="w-full bg-gray-100 rounded-t-sm" style={{ height: `${h * 0.2}%` }}></div>
                  {/* Performance Part (Green) */}
                  <div className="w-full bg-[#7ED321] rounded-sm transition-all group-hover:bg-[#F2A93B]" style={{ height: `${h}%` }}></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[9px] font-bold text-[#8E8E8E] uppercase tracking-widest border-t pt-4">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
            </div>
          </div>

          {/* Security Summary Card */}
          <div className="bg-[#1A1A1A] p-8 rounded-3xl text-white flex flex-col justify-between shadow-xl">
            <div>
              <i className="fas fa-shield-virus text-4xl text-[#8E8E8E] mb-6"></i>
              <h4 className="text-2xl font-black mb-2 tracking-tight">Fraud Prevention</h4>
              <p className="text-xs text-white/50 leading-relaxed mb-6">Sistem mendeteksi 12 percobaan trafik ilegal dari domain luar dalam 24 jam terakhir.</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-[10px] font-bold uppercase text-white/40">Blocked IPs</span>
                <span className="font-bold">142</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase text-white/40">Security Level</span>
                <span className="text-[#F2A93B] font-black uppercase text-[10px]">High / Strict</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- SALES TEAM VIEW & DOMAIN FILTER --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-black text-[#1A1A1A]">Sales Team Management</h3>
              <p className="text-xs text-[#8E8E8E]">Daftar email tim yang diundang ke program</p>
            </div>
            
            {/* Domain Filter Toggle */}
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 items-center">
              <button 
                onClick={() => setFilterActive(true)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterActive ? 'bg-white shadow-sm text-[#4A90E2]' : 'text-[#8E8E8E]'}`}
              >
                @{activeDomain}
              </button>
              <button 
                onClick={() => setFilterActive(false)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!filterActive ? 'bg-white shadow-sm text-[#4A90E2]' : 'text-[#8E8E8E]'}`}
              >
                Show All
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-[#8E8E8E] uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Invited Email</th>
                  <th className="px-8 py-4">Status Login</th>
                  <th className="px-8 py-4">Invitation Date</th>
                  <th className="px-8 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTeam.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${member.isDomainValid ? 'bg-[#4A90E2]' : 'bg-[#8E8E8E]'}`}></div>
                        <span className="text-sm font-bold text-[#1A1A1A]">{member.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        {/* Indikator Lampu Sesuai Permintaan */}
                        <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${member.status === 'Active' ? 'bg-[#7ED321]' : 'bg-[#8E8E8E]'}`}></div>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-gray-500">
                          {member.status === 'Active' ? 'Aktif' : 'Belum Login'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs text-[#8E8E8E] font-medium">{member.invitedAt}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 text-[#4A90E2] hover:bg-blue-50 rounded-lg"><i className="fas fa-paper-plane"></i></button>
                         <button className="p-2 text-[#8E8E8E] hover:bg-gray-100 rounded-lg"><i className="fas fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Empty State if filter doesn't match */}
          {filteredTeam.length === 0 && (
            <div className="py-20 text-center">
               <i className="fas fa-folder-open text-4xl text-gray-100 mb-4"></i>
               <p className="text-sm text-[#8E8E8E]">Tidak ada tim sales yang cocok dengan domain ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MOBILE DASHBOARD CTA --- */}
      <div className="fixed bottom-6 right-6 lg:hidden z-50">
         <button className="bg-[#4A90E2] w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center text-xl">
            <i className="fas fa-plus"></i>
         </button>
      </div>
    </div>
  );
}