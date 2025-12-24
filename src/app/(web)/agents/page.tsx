"use client";

import { useState } from "react";

// --- Tipe Data ---
type Agent = {
  id: number;
  email: string; // Akan di-masking di UI
  domain: string;
  status: "Online" | "Offline";
  level: "Bronze" | "Silver" | "Gold";
  joinedAt: string;
  points: number;
};

export default function AgentNetworkPage() {
  const [inviteInput, setInviteInput] = useState("");
  const [ownerDomain] = useState("bsi.ac.id"); // Simulasi domain Owner
  const [activeTab, setActiveTab] = useState("all");

  // --- Mockup Data Agent (Identitas Asli di DB, Masking di UI) ---
  const AGENTS: Agent[] = [
    { id: 1, email: "andika.pratama@bsi.ac.id", domain: "bsi.ac.id", status: "Online", level: "Gold", joinedAt: "2025-10-12", points: 1250 },
    { id: 2, email: "sari.puspa@bsi.ac.id", domain: "bsi.ac.id", status: "Offline", level: "Silver", joinedAt: "2025-11-05", points: 850 },
    { id: 3, email: "budi.santoso@gmail.com", domain: "gmail.com", status: "Online", level: "Bronze", joinedAt: "2025-12-01", points: 120 },
    { id: 4, email: "reza.rahadian@bsi.ac.id", domain: "bsi.ac.id", status: "Online", level: "Gold", joinedAt: "2025-09-20", points: 2100 },
  ];

  // --- Fungsi Masking Identity ---
  const maskEmail = (email: string) => {
    const [name, domain] = email.split("@");
    const maskedName = name.substring(0, 2) + "***" + name.substring(name.length - 1);
    return `${maskedName}@${domain}`;
  };

  return (
    <div className="bg-[#FAFBFC] min-h-screen pb-24">
      {/* --- STATS HEADER --- */}
      <section className="bg-[#4A90E2] pt-12 pb-24 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2">Total Network</p>
              <h2 className="text-3xl font-black text-white">1,240 <span className="text-[10px] font-light">Agents</span></h2>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2">Active Now</p>
              <h2 className="text-3xl font-black text-[#7ED321]">856 <span className="text-[10px] text-white font-light">Online</span></h2>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-[#F2A93B]">
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2">Social Capital</p>
              <h2 className="text-3xl font-black">4.8M <span className="text-[10px] text-white font-light">Reach</span></h2>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2">Domain Guard</p>
              <h2 className="text-xl font-black text-white italic">@{ownerDomain}</h2>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 -mt-12 space-y-8">
        {/* --- INVITE SECTION (THE HARVESTER TOOL) --- */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#F2A93B]/10 text-[#F2A93B] rounded-full flex items-center justify-center">
              <i className="fas fa-user-plus"></i>
            </div>
            <div>
              <h3 className="text-lg font-black text-[#1A1A1A]">Invite Sales Team</h3>
              <p className="text-xs text-[#8E8E8E]">Pisahkan email dengan spasi. Hanya domain <span className="text-[#4A90E2] font-bold">@{ownerDomain}</span> yang akan diterima.</p>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4">
            <textarea 
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              placeholder="budi@bsi.ac.id ani@bsi.ac.id siska@gmail.com..."
              className="flex-grow p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#4A90E2] min-h-[100px] text-sm font-mono"
            />
            <button className="bg-[#4A90E2] hover:bg-[#357ABD] text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all flex flex-col items-center justify-center gap-1">
              <span>PROSES DATA</span>
              <span className="text-[9px] opacity-70">AUTO-FILTER READY</span>
            </button>
          </div>
        </div>

        {/* --- AGENT LIST (MANAGEMENT DASHBOARD) --- */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tab Filter */}
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'all' ? 'text-[#4A90E2] border-b-2 border-[#4A90E2]' : 'text-[#8E8E8E]'}`}
            >
              All Agents
            </button>
            <button 
              onClick={() => setActiveTab("internal")}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'internal' ? 'text-[#4A90E2] border-b-2 border-[#4A90E2]' : 'text-[#8E8E8E]'}`}
            >
              Corporate Domain
            </button>
            <button 
              onClick={() => setActiveTab("trash")}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'trash' ? 'text-[#D0021B] border-b-2 border-[#D0021B]' : 'text-[#8E8E8E]'}`}
            >
              Trash / Filtered
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-[#8E8E8E] uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Masked Identity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4">Social Capital</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {AGENTS.map((agent) => (
                  <tr key={agent.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-[#8E8E8E] text-xs">
                          {agent.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1A1A1A]">{maskEmail(agent.email)}</p>
                          <p className="text-[10px] text-[#4A90E2] font-medium">{agent.domain}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${agent.status === 'Online' ? 'bg-[#7ED321] animate-pulse' : 'bg-[#8E8E8E]'}`}></span>
                        <span className="text-xs font-medium text-gray-600">{agent.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                        agent.level === 'Gold' ? 'bg-[#F2A93B]/10 text-[#F2A93B]' : 
                        agent.level === 'Silver' ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-800'
                      }`}>
                        {agent.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-[#4A90E2]">
                      {agent.points.toLocaleString()} pts
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-[#8E8E8E] hover:text-[#4A90E2] p-2">
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MOBILE AGENT CARDS (Hanya tampil di Mobile) --- */}
      <div className="lg:hidden container mx-auto px-6 mt-8 space-y-4">
         <h4 className="text-xs font-black text-[#8E8E8E] uppercase tracking-widest px-2">Recent Activity</h4>
         {AGENTS.slice(0, 3).map((agent) => (
           <div key={agent.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#4A90E2] font-bold">
                       {agent.email.substring(0,2).toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white ${agent.status === 'Online' ? 'bg-[#7ED321]' : 'bg-[#8E8E8E]'}`}></div>
                 </div>
                 <div>
                    <h5 className="text-sm font-black text-[#1A1A1A]">{maskEmail(agent.email)}</h5>
                    <p className="text-[10px] text-[#8E8E8E]">Joined {agent.joinedAt}</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-xs font-black text-[#7ED321]">+{agent.points}</p>
                 <p className="text-[9px] uppercase font-bold text-[#8E8E8E] tracking-tighter">{agent.level}</p>
              </div>
           </div>
         ))}
      </div>

      {/* --- BOTTOM FLOATING NAVIGATION (Consistent) --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:hidden z-50">
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 p-2 rounded-2xl shadow-2xl flex justify-around items-center">
           <button className="flex flex-col items-center p-2 text-[#8E8E8E]">
              <i className="fas fa-th-large text-xl"></i>
              <span className="text-[10px] font-bold mt-1">Explore</span>
           </button>
           <button className="flex flex-col items-center p-2 text-[#4A90E2]">
              <i className="fas fa-users text-xl"></i>
              <span className="text-[10px] font-bold mt-1">Network</span>
           </button>
           <button className="w-12 h-12 bg-[#F2A93B] rounded-full flex items-center justify-center text-white shadow-lg -mt-8 border-4 border-[#FAFBFC]">
              <i className="fas fa-plus"></i>
           </button>
           <button className="flex flex-col items-center p-2 text-[#8E8E8E]">
              <i className="fas fa-chart-line text-xl"></i>
              <span className="text-[10px] font-bold mt-1">Analytics</span>
           </button>
           <button className="flex flex-col items-center p-2 text-[#8E8E8E]">
              <i className="fas fa-user-circle text-xl"></i>
              <span className="text-[10px] font-bold mt-1">Profile</span>
           </button>
        </div>
      </div>
    </div>
  );
}