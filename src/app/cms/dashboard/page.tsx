"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { 
  Users, 
  Wallet, 
  ShieldAlert, 
  TrendingUp, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight,
  Globe,
  Zap
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar
} from 'recharts';

// --- DUMMY DATA UNTUK GRAFIK ---
const PERFORMANCE_DATA = [
  { name: '00:00', traffic: 400, fraud: 24 },
  { name: '04:00', traffic: 300, fraud: 18 },
  { name: '08:00', traffic: 900, fraud: 45 },
  { name: '12:00', traffic: 1200, fraud: 90 },
  { name: '16:00', traffic: 1500, fraud: 120 },
  { name: '20:00', traffic: 2100, fraud: 150 },
  { name: '23:59', traffic: 1800, fraud: 80 },
];

const COMMISSION_DATA = [
  { name: 'Mon', flat: 4000, dynamic: 2400 },
  { name: 'Tue', flat: 3000, dynamic: 1398 },
  { name: 'Wed', flat: 2000, dynamic: 9800 },
  { name: 'Thu', flat: 2780, dynamic: 3908 },
  { name: 'Fri', flat: 1890, dynamic: 4800 },
  { name: 'Sat', flat: 2390, dynamic: 3800 },
  { name: 'Sun', flat: 3490, dynamic: 4300 },
];

const nf = new Intl.NumberFormat("id-ID");

export default function SuperadminDashboard() {
  
  const stats = useMemo(() => [
    {
      label: "Total Active Agents",
      value: 12840,
      icon: Users,
      trend: "+12%",
      trendUp: true,
      color: "#4A90E2", // Corporate Blue
    },
    {
      label: "Total Revenue",
      value: 450200000,
      icon: Wallet,
      trend: "+8.5%",
      trendUp: true,
      color: "#7ED321", // Success Green
    },
    {
      label: "Pending Payouts",
      value: 12400000,
      icon: Zap,
      trend: "-2%",
      trendUp: false,
      color: "#F2A93B", // Energy Orange
    },
    {
      label: "Security Alerts",
      value: 142,
      icon: ShieldAlert,
      trend: "Fraud Check",
      trendUp: false,
      color: "#8E8E8E", // Neutral Grey
    },
  ], []);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#FAFBFC] dark:bg-neutral-950">
      
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4A90E2]/5 to-transparent" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-[#F2A93B]/5 blur-[120px] rounded-full" />
      </div>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-8 md:py-10">
        
        {/* HEADER SECTION */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#4A90E2] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Superadmin</span>
              <span className="text-[10px] text-[#8E8E8E] font-bold uppercase tracking-widest">Network Status: <span className="text-[#7ED321]">Stable</span></span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-neutral-900 dark:text-white md:text-4xl">
              Affiliate<span className="text-[#F2A93B]">Core</span> Analytics
            </h1>
            <p className="text-sm text-[#8E8E8E]">Global performance and traffic harvester monitor.</p>
          </div>

          <button className="flex items-center gap-2 rounded-xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 px-4 py-2.5 text-sm font-bold shadow-sm hover:bg-gray-50 transition-all">
            <RefreshCw className="h-4 w-4 text-[#4A90E2]" />
            Refresh Live Data
          </button>
        </div>

        {/* KPI CARDS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6 mb-8">
          {stats.map((item) => (
            <div key={item.label} className="group relative overflow-hidden rounded-[2rem] border border-white bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-neutral-900/60 dark:border-neutral-800">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-neutral-800 text-[#4A90E2] group-hover:bg-[#4A90E2] group-hover:text-white transition-colors">
                  <item.icon size={24} />
                </div>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${item.trendUp ? 'bg-green-50 text-[#7ED321]' : 'bg-gray-100 text-[#8E8E8E]'}`}>
                  {item.trendUp ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                  {item.trend}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#8E8E8E] uppercase tracking-widest mb-1">{item.label}</p>
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                  {typeof item.value === 'number' && item.label.includes('Revenue') ? `Rp ${nf.format(item.value)}` : nf.format(item.value as number)}
                </h3>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 text-[#4A90E2] group-hover:scale-110 transition-transform">
                <item.icon size={120} />
              </div>
            </div>
          ))}
        </section>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Main Traffic vs Fraud Chart */}
          <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-neutral-900 dark:text-white">Traffic Harvester</h3>
                <p className="text-xs text-[#8E8E8E]">Live Traffic (Green) vs Fraud Attempts (Grey)</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl">
                 <Globe className="text-[#4A90E2]" size={20} />
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PERFORMANCE_DATA}>
                  <defs>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7ED321" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7ED321" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="traffic" stroke="#7ED321" strokeWidth={4} fillOpacity={1} fill="url(#colorTraffic)" />
                  <Area type="monotone" dataKey="fraud" stroke="#8E8E8E" strokeWidth={2} fill="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Commission Distribution Chart */}
          <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-neutral-900 dark:text-white">Commission Distribution</h3>
                <p className="text-xs text-[#8E8E8E]">Flat-Based (Blue) vs Dynamic-Based (Orange)</p>
              </div>
              <TrendingUp className="text-[#F2A93B]" size={24} />
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COMMISSION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                  <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{ borderRadius: '15px' }} />
                  <Bar dataKey="flat" fill="#4A90E2" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="dynamic" fill="#F2A93B" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* RECENT AGENT ACTIVITY TABLE */}
        <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter">Recent Network Activity</h3>
            <button className="text-xs font-bold text-[#4A90E2] hover:underline">View All Network</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] font-black text-[#8E8E8E] uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Agent Identity</th>
                  <th className="px-8 py-4">Domain</th>
                  <th className="px-8 py-4">Action</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Earning Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {[
                  { name: "an***a", domain: "bsi.ac.id", action: "Referral Lead", status: "Verified", amount: "+ Rp 250.000" },
                  { name: "bu***12", domain: "gmail.com", action: "Bulk Invitation", status: "Filtered", amount: "Rp 0" },
                  { name: "re***an", domain: "bsi.ac.id", action: "Payout Request", status: "Pending", amount: "- Rp 1.500.000" },
                  { name: "sy***fa", domain: "corporate.io", action: "Traffic Spike", status: "Fraud Check", amount: "Blocked" },
                ].map((row, i) => (
                  <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 font-bold text-[#1A1A1A] dark:text-white uppercase tracking-tighter">{row.name}</td>
                    <td className="px-8 py-5 text-[#8E8E8E] font-medium italic">@{row.domain}</td>
                    <td className="px-8 py-5 text-[#4A90E2] font-bold">{row.action}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        row.status === 'Verified' ? 'bg-[#7ED321]/10 text-[#7ED321]' : 
                        row.status === 'Pending' ? 'bg-[#F2A93B]/10 text-[#F2A93B]' : 
                        'bg-gray-100 text-[#8E8E8E]'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className={`px-8 py-5 text-right font-black ${row.amount.includes('+') ? 'text-[#7ED321]' : 'text-[#8E8E8E]'}`}>
                      {row.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}