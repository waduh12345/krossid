"use client";

// --- Tipe Data Earnings ---
type Transaction = {
  id: string;
  programName: string;
  type: "Flat" | "Dynamic";
  amount: number;
  date: string;
  status: "Success" | "Pending" | "Flagged"; // Flagged = Terdeteksi Fraud Prevention
  referralId: string; // Masked Identity
};

export default function EarningsPage() {
  // --- Mockup Data Saldo ---
  const balance = {
    total: 12450000,
    pending: 1200000,
    withdrawn: 8500000,
    lastMonthGrowth: "+12.5%"
  };

  // --- Mockup Riwayat Transaksi ---
  const TRANSACTIONS: Transaction[] = [
    { id: "TX-9901", programName: "Corporate Growth BSI", type: "Flat", amount: 250000, date: "2025-12-23 14:20", status: "Success", referralId: "USR***92" },
    { id: "TX-9902", programName: "Global Harvester", type: "Dynamic", amount: 125500, date: "2025-12-23 11:05", status: "Pending", referralId: "USR***11" },
    { id: "TX-9903", programName: "Digital Asset Accel", type: "Flat", amount: 500000, date: "2025-12-22 09:15", status: "Flagged", referralId: "USR***55" },
    { id: "TX-9904", programName: "Global Harvester", type: "Dynamic", amount: 89000, date: "2025-12-21 20:45", status: "Success", referralId: "USR***02" },
  ];

  return (
    <div className="bg-[#FAFBFC] min-h-screen pb-24">
      {/* --- SALDO HEADER (BLUE THEME) --- */}
      <section className="bg-[#4A90E2] pt-12 pb-28 px-6 relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1 uppercase tracking-widest">Available Balance</p>
              <h1 className="text-5xl font-black text-white">
                IDR {balance.total.toLocaleString('id-ID')}
              </h1>
            </div>
            <button className="bg-[#F2A93B] hover:bg-[#D48A2D] text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-orange-900/20 transition-all flex items-center gap-3 active:scale-95">
              <i className="fas fa-wallet"></i> WITHDRAW FUNDS
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-white/60 text-[10px] font-bold uppercase mb-1">On Hold / Pending</p>
              <p className="text-xl font-bold text-white">IDR {balance.pending.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <p className="text-white/60 text-[10px] font-bold uppercase mb-1">Total Withdrawn</p>
              <p className="text-xl font-bold text-white">IDR {balance.withdrawn.toLocaleString('id-ID')}</p>
            </div>
            <div className="hidden lg:block bg-[#7ED321]/20 backdrop-blur-md p-4 rounded-2xl border border-[#7ED321]/30">
              <p className="text-[#7ED321] text-[10px] font-bold uppercase mb-1">Growth Performance</p>
              <p className="text-xl font-bold text-[#7ED321]">{balance.lastMonthGrowth} <i className="fas fa-chart-line ml-1"></i></p>
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <div className="container mx-auto px-6 mt-12 space-y-8">
        
        {/* --- COMMISSION TYPES INFO (FIXED UI) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        {/* Card Flat-Based */}
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-lg border border-gray-100 flex items-start gap-4 transition-all hover:border-[#7ED321]/30">
            {/* Icon: shrink-0 memastikan ikon tidak gepeng */}
            <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 bg-[#7ED321]/10 text-[#7ED321] rounded-2xl flex items-center justify-center text-xl md:text-2xl">
            <i className="fas fa-tags"></i>
            </div>
            {/* Text Area: flex-1 & min-w-0 agar teks bisa wrap ke bawah */}
            <div className="flex-1 min-w-0 pt-1">
            <h4 className="font-black text-[#1A1A1A] text-sm md:text-base leading-tight mb-1">
                Flat-Based Earnings
            </h4>
            <p className="text-[11px] md:text-xs text-[#8E8E8E] leading-relaxed">
                Pendapatan tetap per lead yang berhasil divalidasi sistem.
            </p>
            </div>
        </div>

        {/* Card Dynamic-Based */}
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-lg border border-gray-100 flex items-start gap-4 transition-all hover:border-[#4A90E2]/30">
            {/* Icon: shrink-0 */}
            <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 bg-[#4A90E2]/10 text-[#4A90E2] rounded-2xl flex items-center justify-center text-xl md:text-2xl">
            <i className="fas fa-chart-pie"></i>
            </div>
            {/* Text Area */}
            <div className="flex-1 min-w-0 pt-1">
            <h4 className="font-black text-[#1A1A1A] text-sm md:text-base leading-tight mb-1">
                Dynamic-Based Revenue
            </h4>
            <p className="text-[11px] md:text-xs text-[#8E8E8E] leading-relaxed">
                Komisi variabel berdasarkan kualitas trafik dan konversi.
            </p>
            </div>
        </div>

        </div>

        {/* --- TRANSACTION HISTORY --- */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-black text-[#1A1A1A] uppercase tracking-tighter">Earnings History</h3>
            <div className="flex gap-2">
               <button className="text-xs font-bold text-[#4A90E2] px-3 py-1 bg-blue-50 rounded-lg">All</button>
               <button className="text-xs font-bold text-[#8E8E8E] px-3 py-1 hover:bg-gray-50 rounded-lg">Success</button>
               <button className="text-xs font-bold text-[#8E8E8E] px-3 py-1 hover:bg-gray-50 rounded-lg">Fraud Check</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-[#8E8E8E] uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Transaction Details</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Security Status</th>
                  <th className="px-6 py-4">Referral ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TRANSACTIONS.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-[#1A1A1A]">{tx.programName}</p>
                        <p className="text-[10px] text-[#8E8E8E]">{tx.date}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${tx.type === 'Flat' ? 'bg-blue-50 text-[#4A90E2]' : 'bg-orange-50 text-[#F2A93B]'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-[#1A1A1A]">IDR {tx.amount.toLocaleString('id-ID')}</p>
                    </td>
                    <td className="px-6 py-4">
                      {tx.status === 'Success' && (
                        <span className="text-[10px] font-bold text-[#7ED321] flex items-center gap-1">
                          <i className="fas fa-shield-alt"></i> VERIFIED
                        </span>
                      )}
                      {tx.status === 'Pending' && (
                        <span className="text-[10px] font-bold text-[#F2A93B] flex items-center gap-1 animate-pulse">
                          <i className="fas fa-clock"></i> ON PROCESS
                        </span>
                      )}
                      {tx.status === 'Flagged' && (
                        <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                          <i className="fas fa-exclamation-triangle"></i> FRAUD DETECTED
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                       <code className="text-[10px] font-bold text-[#8E8E8E] bg-gray-100 px-2 py-1 rounded">
                         {tx.referralId}
                       </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- PERFORMANCE INSIGHT (MOBILE VIEW ONLY) --- */}
        <div className="lg:hidden bg-[#1A1A1A] p-8 rounded-3xl text-white relative overflow-hidden">
           <div className="relative z-10">
              <h4 className="text-lg font-black mb-2">Performance Boost</h4>
              <p className="text-xs text-white/60 mb-6 leading-relaxed">
                Trafik Anda meningkat 20% minggu ini. Bagikan program **Global Harvester** untuk mendapatkan komisi dinamis yang lebih tinggi.
              </p>
              <button className="w-full bg-[#7ED321] text-white py-3 rounded-xl font-bold text-sm">
                 Lihat Analitik Lengkap
              </button>
           </div>
           <i className="fas fa-rocket absolute -bottom-4 -right-4 text-white/5 text-[12rem]"></i>
        </div>
      </div>

      {/* --- BOTTOM FLOATING NAVIGATION (Consistent) --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:hidden z-50">
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 p-2 rounded-2xl shadow-2xl flex justify-around items-center">
           <button className="flex flex-col items-center p-2 text-[#8E8E8E]">
              <i className="fas fa-th-large text-xl"></i>
              <span className="text-[10px] font-bold mt-1">Explore</span>
           </button>
           <button className="flex flex-col items-center p-2 text-[#8E8E8E]">
              <i className="fas fa-users text-xl"></i>
              <span className="text-[10px] font-bold mt-1">Network</span>
           </button>
           <button className="w-12 h-12 bg-[#F2A93B] rounded-full flex items-center justify-center text-white shadow-lg -mt-8 border-4 border-[#FAFBFC]">
              <i className="fas fa-plus"></i>
           </button>
           <button className="flex flex-col items-center p-2 text-[#4A90E2]">
              <i className="fas fa-wallet text-xl"></i>
              <span className="text-[10px] font-bold mt-1">Earnings</span>
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