"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  LayoutDashboard, User, Lock, Briefcase, TrendingUp, 
  Wallet, Camera, Eye, EyeOff, Loader2, 
  Save, ShieldCheck, ExternalLink, ArrowRight, Users, Copy, Share2, Trophy, UserPlus,
  BookOpen, ChevronDown, ChevronRight, ChevronLeft, Award, X, CheckCircle2, Clock, AlertTriangle
} from "lucide-react";
import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMeQuery, useUpdateProfileMutation } from "@/services/auth.service";
import { useGetRegisterListQuery } from "@/services/programs/register.service";
import Swal from "sweetalert2";
import Link from "next/link";
import Image from "next/image";
import { useGetSalesListQuery } from "@/services/programs/sales.service";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/contexts/i18n-context";
import {
  useGetTotalProgramsQuery,
  useGetTotalProgramRegistrationsQuery,
  useGetTotalProgramViewsQuery,
  useGetTop5ProgramsQuery,
  useGetTopSalesQuery,
} from "@/services/dashboard-admin.service";
import { useGetProgramsQuery } from "@/services/programs/programs.service";
import { useGetProgramLearningsQuery, useGetProgramLearningByIdQuery } from "@/services/programs/learning.service";
import {
  useGetProgramLearningSalesQuery,
  useCreateProgramLearningSaleMutation,
  useUpdateProgramLearningSaleMutation,
} from "@/services/programs/learning-sales.service";
import { useGetProgramLearningQuizzesQuery } from "@/services/programs/learning-quiz.service";
import {
  useGetProgramLearningQuizSalesQuery,
  useSubmitProgramLearningQuizMutation,
} from "@/services/programs/learning-quiz-sales.service";
import type { ProgramLearning } from "@/types/programs/learning";
import type { ProgramLearningSale } from "@/types/programs/learning-sales";
import type { ProgramLearningQuiz } from "@/types/programs/learning-quiz";
import type { SubmitQuizAnswer } from "@/types/programs/learning-quiz-sales";
import { 
  XAxis, 
  YAxis,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart,
  Line,
  Legend
} from 'recharts';

// --- UTILS (Tetap di luar) ---
/** Strip HTML tags from rich text (e.g. from SunRichText) and return plain text for display */
const stripHtml = (html: string | null | undefined): string => {
  if (!html || typeof html !== "string") return "";
  const withNewlines = html
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n");
  return withNewlines
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\n{2,}/g, "\n\n")
    .trim();
};

const formatPhoneNumber = (value: string) => {
  const phoneNumber = value.replace(/\D/g, '');
  if (phoneNumber.length <= 4) return phoneNumber;
  if (phoneNumber.length <= 8) return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4)}`;
  if (phoneNumber.length <= 12) return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4, 8)}-${phoneNumber.slice(8)}`;
  return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4, 8)}-${phoneNumber.slice(8, 12)}`;
};

const unformatPhoneNumber = (value: string) => value.replace(/\D/g, '');
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// --- SUB-COMPONENTS (Pindahkan ke luar komponen utama) ---

// Dashboard View Component - Role-based
const DashboardView = ({ userData, myProgramsData, userRole, userId }: any) => {
  const { t } = useI18n();
  const nf = new Intl.NumberFormat("id-ID");
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();

  // Owner Dashboard Data
  const { data: totalPrograms } = useGetTotalProgramsQuery(undefined, { skip: userRole !== 'owner' });
  const { data: totalRegistrations } = useGetTotalProgramRegistrationsQuery(undefined, { skip: userRole !== 'owner' });
  const { data: totalViews } = useGetTotalProgramViewsQuery(undefined, { skip: userRole !== 'owner' });
  const { data: ownerPrograms } = useGetProgramsQuery(
    { page: 1, paginate: 10, owner_id: userId },
    { skip: userRole !== 'owner' || !userId }
  );

  // Sales Dashboard Data
  const { data: topSalesData, isLoading: isLoadingTopSales } = useGetTopSalesQuery(
    { top: 5 },
    { skip: userRole !== 'sales' }
  );
  const { data: topProgramsData, isLoading: isLoadingTopPrograms } = useGetTop5ProgramsQuery(
    { period: "month", top: 5 },
    { skip: userRole !== 'sales' }
  );

  // Transform top sales data for ranking (guard: API may return non-array)
  const SALES_RANKING = useMemo(() => {
    if (!topSalesData || userRole !== 'sales') return [];
    const list = Array.isArray(topSalesData) ? topSalesData : [];
    return list.map((sale: any, index: number) => ({
      rank: index + 1,
      name: sale.name,
      registrations: sale.program_registrations_count,
      shares: sale.program_shares_count,
      isCurrentUser: userId === sale.id,
    }));
  }, [topSalesData, userId, userRole]);

  // Transform top programs data
  const TOP_PROGRAMS = useMemo(() => {
    if (!topProgramsData || userRole !== 'sales') return [];
    return Object.values(topProgramsData).map((program: any) => {
      const totalRegistrations = program.performance.reduce((sum: number, p: any) => sum + p.registrations, 0);
      const totalShares = program.performance.reduce((sum: number, p: any) => sum + p.shares, 0);
      const totalViews = program.performance.reduce((sum: number, p: any) => sum + Number(p.views || 0), 0);
      return {
        id: program.id,
        name: program.title,
        registrations: totalRegistrations,
        shares: totalShares,
        views: totalViews,
      };
    });
  }, [topProgramsData, userRole]);

  // Owner Dashboard
  if (userRole === 'owner') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-400/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="h-8 w-8 text-blue-400" />
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">{t.myAccount.dashboard.totalPrograms}</p>
            <p className="text-3xl font-black text-white">{totalPrograms || 0}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-400/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <UserPlus className="h-8 w-8 text-green-400" />
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">{t.myAccount.dashboard.totalRegistrations}</p>
            <p className="text-3xl font-black text-white">{nf.format(totalRegistrations || 0)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-400/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Eye className="h-8 w-8 text-purple-400" />
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">{t.myAccount.dashboard.totalViews}</p>
            <p className="text-3xl font-black text-white">{nf.format(totalViews || 0)}</p>
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            {t.myAccount.dashboard.quickAccess}
          </h3>
          <Link 
            href="/cms/dashboard"
            className="inline-flex items-center gap-2 bg-[#367CC0] hover:bg-[#367CC0]/90 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all"
          >
            <ExternalLink size={16} />
            {t.myAccount.dashboard.goToOwnerDashboard}
          </Link>
        </div>

        {/* Recent Programs */}
        {ownerPrograms && ownerPrograms.data && ownerPrograms.data.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">{t.myAccount.dashboard.recentPrograms}</h3>
            <div className="space-y-3">
              {ownerPrograms.data.slice(0, 5).map((program: any) => (
                <Link
                  key={program.id}
                  href={`/programs/${program.id}`}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div>
                    <p className="text-white font-semibold">{program.title}</p>
                    <p className="text-white/50 text-xs">{program.sub_title || t.myAccount.myPrograms.noSubtitle}</p>
                  </div>
                  <ExternalLink size={16} className="text-white/40" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // Sales Dashboard
  if (userRole === 'sales') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Ranking Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-6 w-6 text-[#F2A93B]" />
            <h3 className="text-white font-bold text-lg">{t.myAccount.dashboard.yourRanking}</h3>
          </div>
          
          {isLoadingTopSales ? (
            <div className="text-center py-8 text-white/60">{t.myAccount.dashboard.loadingRanking}</div>
          ) : SALES_RANKING.length === 0 ? (
            <div className="text-center py-8 text-white/60">{t.myAccount.dashboard.noRankingData}</div>
          ) : (
            <div className="space-y-3">
              {SALES_RANKING.map((sale: any) => (
                <div
                  key={sale.rank}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    sale.isCurrentUser 
                      ? 'bg-gradient-to-r from-[#367CC0]/30 to-[#7ED321]/30 border-2 border-[#367CC0]' 
                      : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-black ${
                      sale.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                      sale.rank === 2 ? 'bg-gray-500/20 text-gray-400' :
                      sale.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-white/10 text-white/60'
                    }`}>
                      #{sale.rank}
                    </div>
                    <div>
                      <p className="text-white font-bold">
                        {sale.name}
                        {sale.isCurrentUser && (
                          <span className="ml-2 text-xs bg-[#367CC0] text-white px-2 py-0.5 rounded-full">{t.myAccount.dashboard.you}</span>
                        )}
                      </p>
                      <p className="text-white/50 text-xs">
                        {sale.registrations} {t.myAccount.dashboard.registrations} • {sale.shares} {t.myAccount.dashboard.shares}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-[#367CC0]">{nf.format(sale.registrations)}</p>
                    <p className="text-white/50 text-xs">{t.myAccount.dashboard.registrations}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Program */}
        {isLoadingTopPrograms ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="text-center py-8 text-white/60">Loading top program...</div>
          </div>
        ) : TOP_PROGRAMS.length > 0 ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">{t.myAccount.dashboard.yourTopProgram}</h3>
            {TOP_PROGRAMS.slice(0, 1).map((program: any) => (
              <div key={program.id} className="space-y-4">
                <div>
                  <h4 className="text-xl font-black text-white mb-2">{program.name}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-400/30">
                      <p className="text-white/60 text-xs mb-1">{t.myAccount.dashboard.views}</p>
                      <p className="text-xl font-black text-white">{nf.format(program.views)}</p>
                    </div>
                    <div className="bg-green-500/20 rounded-lg p-3 border border-green-400/30">
                      <p className="text-white/60 text-xs mb-1">{t.myAccount.dashboard.shares}</p>
                      <p className="text-xl font-black text-white">{nf.format(program.shares)}</p>
                    </div>
                    <div className="bg-orange-500/20 rounded-lg p-3 border border-orange-400/30">
                      <p className="text-white/60 text-xs mb-1">{t.myAccount.dashboard.registrations}</p>
                      <p className="text-xl font-black text-white">{nf.format(program.registrations)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </motion.div>
    );
  }

  // Default Dashboard (for other roles)
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">{t.myAccount.dashboard.analyticsOverview}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: t.myAccount.dashboard.myPrograms, val: myProgramsData?.total?.toString() || "0", icon: Briefcase },
            { label: t.myAccount.dashboard.status, val: userData?.status ? t.myAccount.dashboard.active : t.myAccount.dashboard.inactive, icon: TrendingUp },
            { label: t.myAccount.dashboard.memberSince, val: userData?.created_at ? new Date(userData.created_at).getFullYear().toString() : "-", icon: Wallet },
          ].map((s, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider">{s.label}</span>
              <span className="text-2xl font-black text-white mt-1">{s.val}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
         <h3 className="text-white font-bold mb-2">{t.myAccount.dashboard.accountInfo}</h3>
         <p className="text-white/60 text-sm italic">{t.myAccount.dashboard.welcomeBack}, {userData?.name || "User"}!</p>
      </div>
    </motion.div>
  );
};

const ProfileView = ({ 
  profileForm, handleProfileChange, handleProfileUpdate, 
  isUpdatingProfile, profileErrors, getAvatarUrl, 
  fileInputRef, handleImageChange, selectedImage, userData 
}: any) => {
  const { t } = useI18n();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 space-y-6">
       <h3 className="text-xl font-bold text-white">{t.myAccount.profile.editProfile}</h3>
       <div className="flex items-center gap-6">
         <div className="relative">
           <img src={getAvatarUrl()} className="w-24 h-24 rounded-xl border-4 border-white/10 object-cover" alt="Avatar" />
           <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-[#367CC0] rounded-lg flex items-center justify-center hover:brightness-110 shadow-lg">
             <Camera size={14} className="text-white" />
           </button>
           <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
         </div>
         <div>
           <p className="text-white font-bold">{userData?.name}</p>
           {selectedImage && <p className="text-[#7ED321] text-xs mt-1">{t.myAccount.profile.newPhotoSelected}</p>}
         </div>
       </div>

       <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="group">
            <label className="text-white/40 text-[10px] font-black uppercase ml-2 mb-1 block">{t.myAccount.profile.fullName}</label>
            <input 
              type="text" value={profileForm.name}
              onChange={(e) => handleProfileChange("name", e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-6 text-white text-sm focus:border-[#367CC0] focus:outline-none"
              required
            />
          </div>
          <div className="group">
            <label className="text-white/40 text-[10px] font-black uppercase ml-2 mb-1 block">{t.myAccount.profile.emailAddress}</label>
            <input 
              type="email" value={profileForm.email}
              onChange={(e) => handleProfileChange("email", e.target.value)}
              className={`w-full bg-black/30 border rounded-xl py-3 px-6 text-white text-sm focus:outline-none ${profileErrors.email ? "border-red-500" : "border-white/10 focus:border-[#367CC0]"}`}
              required
            />
          </div>
          <div className="group">
            <label className="text-white/40 text-[10px] font-black uppercase ml-2 mb-1 block">{t.myAccount.profile.phoneNumber}</label>
            <input 
              type="tel" value={profileForm.phone}
              onChange={(e) => handleProfileChange("phone", e.target.value)}
              className={`w-full bg-black/30 border rounded-xl py-3 px-6 text-white text-sm focus:outline-none ${profileErrors.phone ? "border-red-500" : "border-white/10 focus:border-[#367CC0]"}`}
              required
            />
          </div>
          <button type="submit" disabled={isUpdatingProfile} className="bg-[#367CC0] text-white px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-2">
            {isUpdatingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {t.myAccount.profile.saveChanges}
          </button>
       </form>
    </motion.div>
  );
};

const SecurityView = ({ 
  securityForm, handleSecurityChange, handleSecurityUpdate, 
  isUpdatingProfile, showPassword, setShowPassword, 
  showConfirmPassword, setShowConfirmPassword, 
  passwordsMatch, passwordMinLength, canSubmitSecurity 
}: any) => {
  const { t } = useI18n();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 space-y-6">
       <div className="flex items-center gap-3"><Lock className="text-[#DF9B35]" size={24} /><h3 className="text-xl font-bold text-white">{t.myAccount.security.changePassword}</h3></div>
       <form onSubmit={handleSecurityUpdate} className="space-y-4">
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} value={securityForm.password}
              onChange={(e) => handleSecurityChange("password", e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-6 text-white text-sm focus:outline-none focus:border-[#367CC0]"
              placeholder={t.myAccount.security.newPassword} required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} value={securityForm.password_confirmation}
              onChange={(e) => handleSecurityChange("password_confirmation", e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-6 text-white text-sm focus:outline-none"
              placeholder={t.myAccount.security.confirmPassword} required
            />
          </div>
          <button type="submit" disabled={!canSubmitSecurity || isUpdatingProfile} className="bg-[#DF9B35] text-white px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-2">
            {isUpdatingProfile ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} {t.myAccount.security.updatePassword}
          </button>
       </form>
    </motion.div>
  );
};

const MyProgramsView = ({ myProgramsData, isLoadingPrograms }: any) => {
  const { t } = useI18n();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="text-[#367CC0]" size={24} />
          <h3 className="text-xl font-bold text-white">{t.myAccount.myPrograms.myPrograms}</h3>
        </div>
        <span className="text-xs text-white/50">{myProgramsData?.total || 0} {t.myAccount.myPrograms.programs}</span>
      </div>

    {isLoadingPrograms ? (
      // Loading Skeleton
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] overflow-hidden animate-pulse">
            <div className="w-full h-40 bg-white/10"></div>
            <div className="p-6 space-y-3">
              <div className="h-5 bg-white/10 rounded w-3/4"></div>
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
              <div className="h-3 bg-white/10 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    ) : !myProgramsData?.data || myProgramsData.data.length === 0 ? (
      // Empty State
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-12 text-center">
        <div className="w-20 h-20 mx-auto bg-white/5 rounded-3xl flex items-center justify-center mb-6">
          <Briefcase size={40} className="text-white/20" />
        </div>
        <h3 className="text-xl font-black text-white mb-2">{t.myAccount.myPrograms.noProgramsYet}</h3>
        <p className="text-white/40 text-sm mb-6">{t.myAccount.myPrograms.noProgramsDesc}</p>
        <Link 
          href="/programs" 
          className="inline-flex items-center gap-2 bg-[#367CC0] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#367CC0]/30"
        >
          {t.myAccount.myPrograms.browsePrograms} <ArrowRight size={14} />
        </Link>
      </div>
    ) : (
      // Program Cards - Landscape Layout
      <div className="space-y-4">
        {myProgramsData.data.map((program: any) => (
          <motion.div 
            key={program.id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] overflow-hidden group hover:bg-white/[0.08] transition-all shadow-xl"
          >
            {/* Landscape Image Banner - Full Width */}
            <div className="relative w-full h-40 overflow-hidden">
              {program.avif || program.original ? (
                <Image 
                  src={program.avif || program.original} 
                  alt={program.program_name || "Program"} 
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#367CC0]/30 to-[#DF9B35]/30 flex items-center justify-center">
                  <Briefcase size={48} className="text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>
              
              {/* Status Badge */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                program.status ? 'bg-[#7ED321]/20 text-[#7ED321] border border-[#7ED321]/30' : 'bg-[#DF9B35]/20 text-[#DF9B35] border border-[#DF9B35]/30'
              }`}>
                {program.status ? t.myAccount.myPrograms.active : t.myAccount.myPrograms.pending}
              </div>
            </div>

            {/* Program Info */}
            <div className="p-6">
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white leading-tight">
                  {program.program_name || `Program #${program.program_id}`}
                </h4>
                {program.program_sub_title && (
                  <p className="text-xs text-white/40">{program.program_sub_title}</p>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <ShieldCheck size={14} className="text-[#7ED321]" />
                  <span>{t.myAccount.myPrograms.registered}</span>
                </div>
                {program.parameter_value && (
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <span className="text-[#367CC0]">{t.myAccount.myPrograms.ref}</span>
                    <span className="font-mono">{program.parameter_value}</span>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                <div className="text-xs text-white/30">
                  ID: {program.id}
                </div>
                <Link 
                  href={`/programs/${program.program_id}`}
                  className="flex items-center gap-2 text-[#367CC0] hover:text-white transition-colors text-xs font-bold"
                >
                  {t.myAccount.myPrograms.viewProgram} <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </motion.div>
  );
};

// Learning by Program View - For Sales Role
const LearningByProgramView = ({ mySalesData, isLoadingSales, userId }: any) => {
  const { t } = useI18n();
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [readModalLearningId, setReadModalLearningId] = useState<number | null>(null);
  const [quizModalLearningId, setQuizModalLearningId] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);

  const selectedProgram = useMemo(
    () => (mySalesData?.data || []).find((p: any) => p.program_id === selectedProgramId),
    [mySalesData, selectedProgramId]
  );
  // Use logged-in user id from session as sales_id for learning/quiz APIs
  const selectedSalesId = userId ?? null;

  const { data: learningsData } = useGetProgramLearningsQuery(
    { page: 1, paginate: 50, program_id: selectedProgramId ?? undefined },
    { skip: !selectedProgramId }
  );
  const learnings = useMemo(() => learningsData?.data ?? [], [learningsData]);

  const { data: learningSalesData, refetch: refetchLearningSales } = useGetProgramLearningSalesQuery(
    { page: 1, paginate: 100, sales_id: selectedSalesId ?? undefined },
    { skip: !selectedSalesId }
  );
  const learningSalesMap = useMemo(() => {
    const map: Record<number, ProgramLearningSale> = {};
    (learningSalesData?.data ?? []).forEach((s: ProgramLearningSale) => {
      map[s.program_learning_id] = s;
    });
    return map;
  }, [learningSalesData]);

  const { data: quizSalesData, refetch: refetchQuizSales } = useGetProgramLearningQuizSalesQuery(
    { page: 1, paginate: 100, sales_id: selectedSalesId ?? undefined },
    { skip: !selectedSalesId }
  );
  const quizSalesMap = useMemo(() => {
    const map: Record<number, { score: number; total_questions: number; passed: boolean }> = {};
    (quizSalesData?.data ?? []).forEach((q: any) => {
      map[q.program_learning_id] = {
        score: q.score,
        total_questions: q.total_questions,
        passed: q.passed,
      };
    });
    return map;
  }, [quizSalesData]);

  const [createLearningSale, { isLoading: creatingLearningSale }] = useCreateProgramLearningSaleMutation();
  const [updateLearningSale, { isLoading: updatingLearningSale }] = useUpdateProgramLearningSaleMutation();
  const [submitQuiz, { isLoading: submittingQuiz }] = useSubmitProgramLearningQuizMutation();

  const programs = useMemo(() => mySalesData?.data ?? [], [mySalesData]);

  const handleMarkComplete = async (programLearningId: number) => {
    if (!selectedSalesId) return;
    const existing = learningSalesMap[programLearningId];
    try {
      if (existing) {
        await updateLearningSale({
          id: existing.id,
          payload: { completed_at: new Date().toISOString(), status: 1 },
        }).unwrap();
      } else {
        await createLearningSale({
          program_learning_id: programLearningId,
          sales_id: selectedSalesId,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        }).unwrap();
      }
      refetchLearningSales();
      setReadModalLearningId(null);
      await Swal.fire({
        icon: "success",
        title: t.myAccount.learning.completed,
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        background: "#0f172a",
        color: "#fff",
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: t.myAccount.messages.updateFailed,
        text: err?.data?.message || "Failed",
        background: "#1e293b",
        color: "#fff",
      });
    }
  };

  const handleSubmitQuizAnswers = async (programLearningId: number, answers: SubmitQuizAnswer[]) => {
    if (!selectedSalesId) return;
    try {
      const result = await submitQuiz({
        program_learning_id: programLearningId,
        sales_id: selectedSalesId,
        answers,
      }).unwrap();
      setQuizResult({
        score: result.score,
        total: result.total_questions,
        passed: result.passed,
      });
      refetchQuizSales();
      await Swal.fire({
        icon: "success",
        title: t.myAccount.learning.quizSubmitted,
        text: t.myAccount.learning.quizSubmittedText,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
        background: "#0f172a",
        color: "#fff",
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: t.myAccount.messages.updateFailed,
        text: err?.data?.message || "Failed",
        background: "#1e293b",
        color: "#fff",
      });
    }
  };

  if (isLoadingSales) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center text-white/60">
          {t.myAccount.messages.loading}
        </div>
      </motion.div>
    );
  }

  if (!programs.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="text-[#367CC0]" size={24} />
          <h3 className="text-xl font-bold text-white">{t.myAccount.learning.title}</h3>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-12 text-center">
          <BookOpen size={48} className="text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-black text-white mb-2">{t.myAccount.learning.noPrograms}</h3>
          <p className="text-white/40 text-sm">{t.myAccount.learning.noProgramsDesc}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="text-[#367CC0]" size={24} />
        <div>
          <h3 className="text-xl font-bold text-white">{t.myAccount.learning.title}</h3>
          <p className="text-white/50 text-sm">{t.myAccount.learning.description}</p>
        </div>
      </div>

      {/* Program selector */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">{t.myAccount.learning.byProgram}</p>
        <div className="flex flex-wrap gap-2">
          {programs.map((program: any) => (
            <button
              key={program.id}
              onClick={() => {
                setSelectedProgramId(program.program_id);
                setQuizResult(null);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedProgramId === program.program_id
                  ? "bg-[#367CC0] text-white"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {program.program_name || `Program #${program.program_id}`}
            </button>
          ))}
        </div>
      </div>

      {/* Learnings list */}
      {selectedProgramId && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          {!learnings.length ? (
            <div className="py-8 text-center text-white/50">
              <p>{t.myAccount.learning.noLearnings}</p>
              <p className="text-sm mt-1">{t.myAccount.learning.noLearningsDesc}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {learnings.map((learning: ProgramLearning) => {
                const learningSale = learningSalesMap[learning.id];
                const quizResultForLearning = quizSalesMap[learning.id];
                const completedRead = !!(learningSale?.completed_at);
                const canTakeQuiz = completedRead;

                return (
                  <div
                    key={learning.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate">{learning.title}</p>
                      {learning.description && (
                        <p className="text-white/50 text-xs mt-1 line-clamp-2">{stripHtml(learning.description)}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {!learningSale && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                            {t.myAccount.learning.notStarted}
                          </span>
                        )}
                        {learningSale && !completedRead && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                            {t.myAccount.learning.inProgress}
                          </span>
                        )}
                        {completedRead && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                            <CheckCircle2 size={12} /> {t.myAccount.learning.completed}
                          </span>
                        )}
                        {quizResultForLearning && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${quizResultForLearning.passed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            <Award size={12} /> {t.myAccount.learning.yourScore}: {quizResultForLearning.score}/{quizResultForLearning.total_questions} ({quizResultForLearning.passed ? t.myAccount.learning.passed : t.myAccount.learning.failed})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setReadModalLearningId(learning.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#367CC0]/20 text-[#367CC0] text-xs font-bold hover:bg-[#367CC0]/30 transition-all flex items-center gap-1"
                      >
                        <BookOpen size={14} /> {t.myAccount.learning.read}
                      </button>
                      {canTakeQuiz && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuizModalLearningId(learning.id);
                            setQuizResult(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#7ED321]/20 text-[#7ED321] text-xs font-bold hover:bg-[#7ED321]/30 transition-all flex items-center gap-1"
                        >
                          <Award size={14} /> {t.myAccount.learning.takeQuiz}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Read Learning Modal */}
      {readModalLearningId != null && (
        <ReadLearningModal
          learningId={readModalLearningId}
          selectedSalesId={selectedSalesId}
          learningSale={learningSalesMap[readModalLearningId] ?? null}
          onClose={() => setReadModalLearningId(null)}
          onMarkComplete={() => handleMarkComplete(readModalLearningId)}
          isUpdating={creatingLearningSale || updatingLearningSale}
        />
      )}

      {/* Quiz Modal */}
      {quizModalLearningId != null && (
        <QuizModal
          learningId={quizModalLearningId}
          salesId={selectedSalesId}
          quizResult={quizResult}
          timeLimitMinutes={
            learnings.find((l: ProgramLearning) => l.id === quizModalLearningId)
              ?.quiz_time_limit_minutes ?? null
          }
          onSubmit={handleSubmitQuizAnswers}
          onClose={() => {
            setQuizModalLearningId(null);
            setQuizResult(null);
          }}
          isSubmitting={submittingQuiz}
        />
      )}
    </motion.div>
  );
};

// Read Learning Modal
const ReadLearningModal = ({
  learningId,
  selectedSalesId,
  learningSale,
  onClose,
  onMarkComplete,
  isUpdating,
}: {
  learningId: number | null;
  selectedSalesId: number | null;
  learningSale: ProgramLearningSale | null;
  onClose: () => void;
  onMarkComplete: () => void;
  isUpdating: boolean;
}) => {
  const { t } = useI18n();
  const { data: learning, isFetching } = useGetProgramLearningByIdQuery(learningId ?? 0, {
    skip: !learningId,
  });

  if (!learningId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-[#1e293b] border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-lg font-bold text-white">{learning?.title ?? "—"}</h3>
            <button type="button" onClick={onClose} className="p-2 text-white/60 hover:text-white rounded-lg">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            {isFetching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-white/60" />
              </div>
            ) : learning ? (
              <div className="space-y-4 text-white/90 text-sm">
                {learning.description && (
                  <div className="whitespace-pre-wrap">{stripHtml(learning.description)}</div>
                )}
                {learning.file_pdf && (
                  <a
                    href={learning.file_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#367CC0] hover:underline"
                  >
                    <ExternalLink size={14} /> PDF
                  </a>
                )}
                {learning.link_youtube && (
                  <a
                    href={learning.link_youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#367CC0] hover:underline"
                  >
                    <ExternalLink size={14} /> YouTube
                  </a>
                )}
              </div>
            ) : null}
          </div>
          <div className="p-4 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-white/80 hover:bg-white/10 text-sm font-bold"
            >
              {t.myAccount.learning.close}
            </button>
            {selectedSalesId && (
              <button
                type="button"
                onClick={onMarkComplete}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl bg-[#367CC0] text-white text-sm font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {t.myAccount.learning.markComplete}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Quiz Modal – full-screen, timer, next/prev, numbered navigation
const quizTimerStore: Record<string, number> = {}; // persists remaining seconds across open/close

const QuizModal = ({
  learningId,
  salesId,
  quizResult,
  timeLimitMinutes,
  onSubmit,
  onClose,
  isSubmitting,
}: {
  learningId: number | null;
  salesId: number | null;
  quizResult: { score: number; total: number; passed: boolean } | null;
  timeLimitMinutes?: number | null;
  onSubmit: (programLearningId: number, answers: SubmitQuizAnswer[]) => void;
  onClose: () => void;
  isSubmitting: boolean;
}) => {
  const { t } = useI18n();
  const { data: quizzesData } = useGetProgramLearningQuizzesQuery(
    { page: 1, paginate: 50, program_learning_id: learningId ?? undefined },
    { skip: !learningId }
  );
  const quizzes: ProgramLearningQuiz[] = useMemo(() => quizzesData?.data ?? [], [quizzesData]);
  const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  // --- Timer ---
  const timerKey = `quiz-${learningId}-${salesId}`;
  const hasTimeLimit = timeLimitMinutes != null && timeLimitMinutes > 0;
  const initialSeconds = hasTimeLimit
    ? (quizTimerStore[timerKey] ?? timeLimitMinutes! * 60)
    : 0;
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSubmittedRef = useRef(false);

  // Start / resume timer
  useEffect(() => {
    if (!hasTimeLimit || submitted) return;
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = prev - 1;
        quizTimerStore[timerKey] = next;
        return next;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasTimeLimit, submitted, timerKey]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (hasTimeLimit && remainingSeconds <= 0 && !submitted && !autoSubmittedRef.current && quizzes.length > 0) {
      autoSubmittedRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      doSubmit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, hasTimeLimit, submitted, quizzes.length]);

  const formatTime = (sec: number) => {
    const m = Math.max(0, Math.floor(sec / 60));
    const s = Math.max(0, sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const answeredCount = useMemo(
    () => quizzes.filter((q) => answers[q.id] != null).length,
    [quizzes, answers]
  );

  const doSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (!learningId || !salesId) return;
      const answerList: SubmitQuizAnswer[] = quizzes.map((q) => ({
        quiz_id: q.id,
        selected_option: answers[q.id] ?? "A", // fallback for unanswered on auto-submit
      }));

      if (!isAutoSubmit && answeredCount < quizzes.length) {
        const unanswered = quizzes.length - answeredCount;
        const result = await Swal.fire({
          icon: "warning",
          title: t.myAccount.learning.confirmSubmit,
          text: t.myAccount.learning.confirmSubmitUnanswered
            .replace("{unanswered}", String(unanswered)),
          showCancelButton: true,
          confirmButtonText: t.myAccount.learning.submitQuiz,
          cancelButtonText: t.myAccount.learning.close,
          background: "#1e293b",
          color: "#fff",
          confirmButtonColor: "#7ED321",
        });
        if (!result.isConfirmed) return;
      }

      setSubmitted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      delete quizTimerStore[timerKey];
      onSubmit(learningId, answerList);

      if (isAutoSubmit) {
        Swal.fire({
          icon: "info",
          title: t.myAccount.learning.timeUp,
          text: t.myAccount.learning.timeUpText,
          background: "#1e293b",
          color: "#fff",
          confirmButtonColor: "#367CC0",
        });
      }
    },
    [learningId, salesId, quizzes, answers, answeredCount, timerKey, onSubmit, t]
  );

  const handleClose = () => {
    if (!submitted && hasTimeLimit) {
      quizTimerStore[timerKey] = remainingSeconds;
    }
    if (submitted) {
      delete quizTimerStore[timerKey];
    }
    setAnswers({});
    setSubmitted(false);
    setActiveIdx(0);
    autoSubmittedRef.current = false;
    onClose();
  };

  if (!learningId) return null;

  const showResult = quizResult !== null && submitted;
  const currentQuiz = quizzes[activeIdx];
  const timerDanger = hasTimeLimit && remainingSeconds <= 60;
  const timerWarning = hasTimeLimit && remainingSeconds <= 180 && !timerDanger;
  const progressPercent = quizzes.length > 0 ? Math.round((answeredCount / quizzes.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[10000000000000]">
      {/* Backdrop – NOT clickable to close */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal container – 90% of viewport */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="absolute inset-0 flex items-center justify-center p-3 sm:p-6"
      >
        <div className="relative bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-white/10 rounded-2xl w-[70vw] h-[70vh] flex flex-col overflow-hidden shadow-2xl shadow-black/50">

          {/* ============ HEADER ============ */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#367CC0]/20">
                <Award size={18} className="text-[#367CC0]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {showResult ? t.myAccount.learning.quizResult : t.myAccount.learning.takeQuiz}
                </h3>
                {!showResult && quizzes.length > 0 && (
                  <p className="text-[10px] text-white/40">
                    {answeredCount} {t.myAccount.learning.answered} / {quizzes.length} {t.myAccount.learning.totalQuestions}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer badge */}
              {hasTimeLimit && !showResult && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-mono font-bold transition-all ${
                  timerDanger
                    ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                    : timerWarning
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-white/10 text-white/80 border border-white/10"
                }`}>
                  <Clock size={14} />
                  {formatTime(remainingSeconds)}
                </div>
              )}
              {!hasTimeLimit && !showResult && quizzes.length > 0 && (
                <span className="text-xs text-white/30 hidden sm:inline">{t.myAccount.learning.noTimeLimit}</span>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ============ BODY ============ */}
          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">

            {/* === LEFT SIDEBAR: question navigator === */}
            {!showResult && quizzes.length > 0 && (
              <div className="sm:w-56 shrink-0 border-b sm:border-b-0 sm:border-r border-white/10 bg-white/[0.02]">
                <div className="p-3 sm:p-4">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">{t.myAccount.learning.quizOverview}</p>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-[#367CC0] to-[#7ED321] rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-24 sm:max-h-none overflow-y-auto pb-1">
                    {quizzes.map((q, idx) => {
                      const isActive = idx === activeIdx;
                      const isAnswered = answers[q.id] != null;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setActiveIdx(idx)}
                          className={`
                            w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs font-bold transition-all relative
                            ${isActive
                              ? "bg-[#367CC0] text-white shadow-lg shadow-[#367CC0]/30 scale-110"
                              : isAnswered
                              ? "bg-[#7ED321]/20 text-[#7ED321] border border-[#7ED321]/30 hover:bg-[#7ED321]/30"
                              : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/80"
                            }
                          `}
                        >
                          {idx + 1}
                          {isAnswered && !isActive && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#7ED321] rounded-full border border-[#0f172a]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* === MAIN CONTENT AREA === */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {showResult && quizResult ? (
                  /* ---- RESULT SCREEN ---- */
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-6 max-w-sm">
                      <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${quizResult.passed ? "bg-green-500/20" : "bg-red-500/20"}`}>
                        {quizResult.passed ? (
                          <CheckCircle2 size={48} className="text-green-400" />
                        ) : (
                          <AlertTriangle size={48} className="text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-4xl font-black text-white mb-1">
                          {quizResult.score} / {quizResult.total}
                        </p>
                        <p className="text-white/50 text-sm">{t.myAccount.learning.yourScore}</p>
                      </div>
                      <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold ${
                        quizResult.passed
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}>
                        {quizResult.passed ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                        {quizResult.passed ? t.myAccount.learning.passed : t.myAccount.learning.failed}
                      </div>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="block mx-auto px-8 py-3 rounded-xl bg-[#367CC0] hover:bg-[#367CC0]/90 text-white text-sm font-bold transition-all"
                      >
                        {t.myAccount.learning.close}
                      </button>
                    </div>
                  </div>
                ) : quizzes.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-3">
                      <BookOpen size={48} className="text-white/20 mx-auto" />
                      <p className="text-white/50">No questions for this learning.</p>
                    </div>
                  </div>
                ) : currentQuiz ? (
                  /* ---- SINGLE QUESTION VIEW ---- */
                  <div className="max-w-2xl mx-auto">
                    {/* Question header */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#367CC0]/20 text-[#367CC0] font-black text-sm">
                        {activeIdx + 1}
                      </span>
                      <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                          {t.myAccount.learning.question} {activeIdx + 1} {t.myAccount.learning.of} {quizzes.length}
                        </p>
                      </div>
                    </div>

                    {/* Question text */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 mb-6">
                      <p className="text-white text-base sm:text-lg font-medium leading-relaxed">
                        {stripHtml(currentQuiz.question)}
                      </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      {(["A", "B", "C", "D"] as const).map((opt) => {
                        const label = currentQuiz[`option_${opt.toLowerCase()}` as keyof ProgramLearningQuiz];
                        if (label == null || label === "") return null;
                        const isSelected = answers[currentQuiz.id] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setAnswers((prev) => ({
                                ...prev,
                                [currentQuiz.id]: opt,
                              }))
                            }
                            className={`
                              w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all group
                              ${isSelected
                                ? "bg-[#367CC0]/15 border-[#367CC0]/50 shadow-lg shadow-[#367CC0]/10"
                                : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                              }
                            `}
                          >
                            <span className={`
                              flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold shrink-0 transition-all
                              ${isSelected
                                ? "bg-[#367CC0] text-white"
                                : "bg-white/10 text-white/50 group-hover:bg-white/15 group-hover:text-white/70"
                              }
                            `}>
                              {opt}
                            </span>
                            <span className={`text-sm ${isSelected ? "text-white font-medium" : "text-white/70"}`}>
                              {stripHtml(String(label))}
                            </span>
                            {isSelected && (
                              <CheckCircle2 size={18} className="text-[#367CC0] ml-auto shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* ============ FOOTER NAV ============ */}
              {!showResult && quizzes.length > 0 && (
                <div className="border-t border-white/10 bg-white/[0.03] px-4 sm:px-6 py-3">
                  <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {/* Prev */}
                    <button
                      type="button"
                      onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                      disabled={activeIdx === 0}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} /> {t.myAccount.learning.prev}
                    </button>

                    {/* Submit or Next */}
                    <div className="flex items-center gap-2">
                      {activeIdx === quizzes.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => doSubmit(false)}
                          disabled={isSubmitting}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7ED321] to-[#5BB318] hover:brightness-110 text-white text-sm font-bold disabled:opacity-50 transition-all shadow-lg shadow-[#7ED321]/20"
                        >
                          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Award size={16} />}
                          {t.myAccount.learning.submitQuiz}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveIdx((i) => Math.min(quizzes.length - 1, i + 1))}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#367CC0] hover:bg-[#367CC0]/90 text-white text-sm font-bold transition-all"
                        >
                          {t.myAccount.learning.next} <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Affiliate View Component - For Sales Role
const AffiliateView = ({ mySalesData, isLoadingSales, userData }: any) => {
  const { t } = useI18n();
  const userReferralCode = userData?.referral || '';

  const handleCopyLink = (programId: number) => {
    const link = `https://krossid.vercel.app/programs/${programId}?reff=${userReferralCode}`;
    navigator.clipboard.writeText(link);
    Swal.fire({
      icon: 'success',
      title: t.myAccount.messages.linkCopied,
      text: t.myAccount.messages.linkCopiedText,
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      background: '#0f172a',
      color: '#fff',
      iconColor: '#7ED321'
    });
  };

  const shareToWhatsApp = (programId: number, programName: string) => {
    const link = `https://krossid.vercel.app/programs/${programId}?reff=${userReferralCode}`;
    const text = `🔥 Cek program keren ini: ${programName}\n\nDaftar sekarang: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="text-[#DF9B35]" size={24} />
          <h3 className="text-xl font-bold text-white">{t.myAccount.affiliate.myAffiliatePrograms}</h3>
        </div>
        <span className="text-xs text-white/50">{mySalesData?.total || 0} {t.myAccount.myPrograms.programs}</span>
      </div>

      {/* Referral Code Card */}
      {userReferralCode && (
        <div className="bg-gradient-to-r from-[#DF9B35]/20 to-[#7ED321]/20 border border-[#DF9B35]/30 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t.myAccount.affiliate.yourReferralCode}</p>
              <p className="text-xl md:text-3xl font-black text-[#DF9B35] tracking-tighter">{userReferralCode}</p>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(userReferralCode);
                Swal.fire({
                  icon: 'success',
                  title: t.myAccount.messages.codeCopied,
                  timer: 1500,
                  showConfirmButton: false,
                  toast: true,
                  position: 'top-end',
                  background: '#0f172a',
                  color: '#fff',
                });
              }}
              className="bg-[#DF9B35] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:brightness-110 transition-all"
            >
              <Copy size={14} /> {t.myAccount.affiliate.copy}
            </button>
          </div>
        </div>
      )}

      {isLoadingSales ? (
        // Loading Skeleton
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-white/10 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : !mySalesData?.data || mySalesData.data.length === 0 ? (
        // Empty State
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-white/5 rounded-3xl flex items-center justify-center mb-6">
            <Users size={40} className="text-white/20" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">{t.myAccount.affiliate.noAffiliateProgramsYet}</h3>
          <p className="text-white/40 text-sm mb-6">{t.myAccount.affiliate.noAffiliateProgramsDesc}</p>
          <Link 
            href="/programs" 
            className="inline-flex items-center gap-2 bg-[#DF9B35] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#DF9B35]/30"
          >
            {t.myAccount.myPrograms.browsePrograms} <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        // Affiliate Program Cards
        <div className="space-y-4">
          {mySalesData.data.map((program: any) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] overflow-hidden group hover:bg-white/[0.08] transition-all shadow-xl"
            >
              {/* Program Image Banner - Full Width */}
              <div className="relative w-full h-48 overflow-hidden">
                {program.avif || program.original ? (
                  <Image
                    src={program.avif || program.original}
                    alt={program.program_name || "Program"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#DF9B35]/20 to-[#367CC0]/20 flex items-center justify-center">
                    <Briefcase size={48} className="text-white/20" />
                  </div>
                )}
                {/* Status Badge Overlay */}
                <div className="absolute top-4 right-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                    program.status
                      ? 'bg-[#7ED321]/80 text-white border border-[#7ED321]'
                      : 'bg-red-500/80 text-white border border-red-500'
                  }`}>
                    {program.status ? t.myAccount.dashboard.active : t.myAccount.dashboard.inactive}
                  </div>
                </div>
              </div>

              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-[#DF9B35]/20 to-[#367CC0]/20 p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white leading-tight">
                      {program.program_name || `Program #${program.program_id}`}
                    </h4>
                    {program.program_sub_title && (
                      <p className="text-xs text-white/40">{program.program_sub_title}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Program Info */}
              <div className="p-6 space-y-4">
                {/* Info Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full text-xs text-white/60">
                    <ShieldCheck size={14} className="text-[#7ED321]" />
                    <span>{t.myAccount.affiliate.verifiedSales}</span>
                  </div>
                  {program.is_corporate && (
                    <div className="flex items-center gap-2 bg-[#367CC0]/20 px-3 py-1.5 rounded-full text-xs text-[#367CC0]">
                      <Briefcase size={14} />
                      <span>{t.myAccount.affiliate.corporate}</span>
                    </div>
                  )}
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3 text-center">
                    <Eye size={16} className="text-blue-400 mx-auto mb-1" />
                    <p className="text-lg font-black text-white">{program.total_views ?? 0}</p>
                    <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Views</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-3 text-center">
                    <Share2 size={16} className="text-green-400 mx-auto mb-1" />
                    <p className="text-lg font-black text-white">{program.total_shares ?? 0}</p>
                    <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Shares</p>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-400/20 rounded-xl p-3 text-center">
                    <UserPlus size={16} className="text-orange-400 mx-auto mb-1" />
                    <p className="text-lg font-black text-white">{program.total_registrations ?? 0}</p>
                    <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Registrations</p>
                  </div>
                </div>

                {/* Referral Link */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t.myAccount.affiliate.linkReferral}</p>
                  <div className="flex gap-2 p-1.5 bg-black/40 border border-white/5 rounded-xl">
                    <div className="flex-1 px-3 py-2 text-[10px] font-mono text-white/60 truncate">
                      https://krossid.vercel.app/programs/{program.program_id}?reff={userReferralCode}
                    </div>
                    <button 
                      onClick={() => handleCopyLink(program.program_id)}
                      className="bg-[#DF9B35] text-white w-9 h-9 rounded-lg flex items-center justify-center hover:scale-105 transition-all"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t.myAccount.affiliate.share}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* WhatsApp Share Button - Enlarged and Prominent */}
                    <button
                      onClick={() => shareToWhatsApp(program.program_id, program.program_name)}
                      className="flex-1 flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-white px-6 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-[#25D366]/20"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="text-base">{t.myAccount.affiliate.whatsapp}</span>
                    </button>

                    {/* View Program Link */}
                    <Link
                      href={`/programs/${program.program_id}`}
                      className="flex items-center justify-center gap-2 bg-[#367CC0]/20 hover:bg-[#367CC0]/30 border border-[#367CC0]/30 text-[#367CC0] px-6 py-4 rounded-xl font-bold transition-all hover:scale-105"
                    >
                      <ExternalLink size={18} />
                      <span className="text-base">{t.myAccount.affiliate.view}</span>
                    </Link>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-white/30">
                  <span>ID: {program.id}</span>
                  <span>{t.myAccount.affiliate.joined} {new Date(program.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
const MyAccountLinkedInUI = () => {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "dashboard");
  const { data: userData, isLoading: isLoadingUser, refetch: refetchUser } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const { data: myProgramsData, isLoading: isLoadingPrograms } = useGetRegisterListQuery(
    { page: 1, paginate: 100, email: userData?.email || "" },
    { skip: !userData?.email }
  );

  // Check user roles
  const userRole = userData?.roles?.[0]?.name?.toLowerCase();
  const isOwnerRole = userRole === 'owner';
  const isSalesRole = userRole === 'sales' || userData?.roles?.some(
    (role: any) => role.name.toLowerCase() === 'sales' || role.name.toLowerCase() === 'affiliate'
  );
  const userId = userData?.id;

  const { data: mySalesData, isLoading: isLoadingSales } = useGetSalesListQuery(
    { page: 1, paginate: 100, email: userData?.email || "" },
    { skip: !userData?.email || !isSalesRole }
  );

  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [profileErrors, setProfileErrors] = useState({ email: "", phone: "" });
  const [securityForm, setSecurityForm] = useState({ password: "", password_confirmation: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userData) {
      setProfileForm({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone ? formatPhoneNumber(userData.phone) : "",
      });
    }
  }, [userData]);

  const handleProfileChange = (field: string, value: string) => {
    if (field === "phone") {
      const formatted = formatPhoneNumber(unformatPhoneNumber(value));
      setProfileForm(prev => ({ ...prev, phone: formatted }));
    } else {
      setProfileForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSecurityChange = (field: string, value: string) => {
    setSecurityForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getAvatarUrl = () => {
    if (imagePreview) return imagePreview;
    if (userData?.image) return userData.image;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || "User")}&background=367CC0&color=fff`;
  };

  const passwordsMatch = securityForm.password === securityForm.password_confirmation;
  const passwordMinLength = securityForm.password.length >= 6;
  const canSubmitSecurity = securityForm.password && securityForm.password_confirmation && passwordsMatch && passwordMinLength;

  // Handle Profile Update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!isValidEmail(profileForm.email)) {
      setProfileErrors(prev => ({ ...prev, email: t.myAccount.messages.invalidEmailFormat }));
      Swal.fire({
        icon: "error",
        title: t.myAccount.messages.validationError,
        text: t.myAccount.messages.invalidEmailText,
        background: "#1e293b",
        color: "#fff",
      });
      return;
    }
    
    // Validate phone (minimum 10 digits)
    const phoneDigits = unformatPhoneNumber(profileForm.phone);
    if (phoneDigits.length < 10) {
      setProfileErrors(prev => ({ ...prev, phone: t.myAccount.messages.phoneTooShort }));
      Swal.fire({
        icon: "error",
        title: t.myAccount.messages.validationError,
        text: t.myAccount.messages.phoneTooShortText,
        background: "#1e293b",
        color: "#fff",
      });
      return;
    }
    
    setProfileErrors({ email: "", phone: "" });

    try {
      await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        phone: phoneDigits,
        image: selectedImage,
      }).unwrap();

      Swal.fire({
        icon: "success",
        title: t.myAccount.messages.profileUpdated,
        text: t.myAccount.messages.profileUpdatedText,
        background: "#1e293b",
        color: "#fff",
      });
      
      // Reset image selection after successful update
      setSelectedImage(null);
      setImagePreview(null);
      
      // Refetch user data
      refetchUser();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: t.myAccount.messages.updateFailed,
        text: error?.data?.message || t.myAccount.messages.updateFailedText,
        background: "#1e293b",
        color: "#fff",
      });
    }
  };

  // Handle Security/Password Update
  const handleSecurityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordMinLength) {
      Swal.fire({
        icon: "error",
        title: t.myAccount.messages.validationError,
        text: t.myAccount.messages.passwordTooShort,
        background: "#1e293b",
        color: "#fff",
      });
      return;
    }
    
    if (!passwordsMatch) {
      Swal.fire({
        icon: "error",
        title: t.myAccount.messages.validationError,
        text: t.myAccount.messages.passwordsNotMatch,
        background: "#1e293b",
        color: "#fff",
      });
      return;
    }

    try {
      await updateProfile({
        name: userData?.name || "",
        email: userData?.email || "",
        phone: userData?.phone || "",
        password: securityForm.password,
        password_confirmation: securityForm.password_confirmation,
      }).unwrap();

      Swal.fire({
        icon: "success",
        title: t.myAccount.messages.passwordUpdated,
        text: t.myAccount.messages.passwordUpdatedText,
        background: "#1e293b",
        color: "#fff",
      });
      
      // Reset form
      setSecurityForm({ password: "", password_confirmation: "" });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: t.myAccount.messages.updateFailed,
        text: error?.data?.message || t.myAccount.messages.passwordUpdateFailed,
        background: "#1e293b",
        color: "#fff",
      });
    }
  };

  // Render Logic
  if (isLoadingUser) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">{t.myAccount.messages.loading}</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative">
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* SIDEBAR */}
        <aside className="lg:col-span-3 space-y-4">
           <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-2">
             {[
               { id: "dashboard", label: t.myAccount.tabs.dashboard, icon: LayoutDashboard },
               { id: "myPrograms", label: t.myAccount.tabs.myPrograms, icon: Briefcase },
               ...(isSalesRole ? [{ id: "affiliate", label: t.myAccount.tabs.affiliate, icon: Users }] : []),
               ...(isSalesRole ? [{ id: "learning", label: t.myAccount.tabs.learning, icon: BookOpen }] : []),
               { id: "profile", label: t.myAccount.tabs.editProfile, icon: User },
               { id: "security", label: t.myAccount.tabs.security, icon: Lock },
               ...(isOwnerRole ? [{ id: "ownerDashboard", label: t.myAccount.tabs.ownerDashboard, icon: LayoutDashboard, external: true, href: "/cms/dashboard" }] : [])
             ].map((tab) => (
               tab.external ? (
                 <Link
                   key={tab.id}
                   href={tab.href || "#"}
                   className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all hover:bg-white/5 text-white"
                 >
                   <tab.icon size={16} /> {tab.label}
                   <ExternalLink size={14} className="ml-auto" />
                 </Link>
               ) : (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeTab === tab.id ? "bg-[#367CC0]" : "hover:bg-white/5"}`}
                 >
                   <tab.icon size={16} /> {tab.label}
                 </button>
               )
             ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="lg:col-span-9">
           <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <DashboardView 
                  key="dash" 
                  userData={userData} 
                  myProgramsData={myProgramsData}
                  userRole={userRole}
                  userId={userId}
                />
              )}
              {activeTab === "myPrograms" && (
                <MyProgramsView 
                  key="myprogs" 
                  myProgramsData={myProgramsData}
                  isLoadingPrograms={isLoadingPrograms}
                />
              )}
              {activeTab === "affiliate" && isSalesRole && (
                <AffiliateView 
                  key="affiliate" 
                  mySalesData={mySalesData}
                  isLoadingSales={isLoadingSales}
                  userData={userData}
                />
              )}
              {activeTab === "learning" && isSalesRole && (
                <LearningByProgramView
                  key="learning"
                  mySalesData={mySalesData}
                  isLoadingSales={isLoadingSales}
                  userId={userId}
                />
              )}
              {activeTab === "profile" && (
                <ProfileView 
                  key="prof" 
                  profileForm={profileForm} 
                  handleProfileChange={handleProfileChange}
                  handleProfileUpdate={handleProfileUpdate}
                  userData={userData}
                  isUpdatingProfile={isUpdatingProfile}
                  profileErrors={profileErrors}
                  getAvatarUrl={getAvatarUrl}
                  fileInputRef={fileInputRef}
                  handleImageChange={handleImageChange}
                  selectedImage={selectedImage}
                />
              )}
              {activeTab === "security" && (
                <SecurityView 
                  key="sec"
                  securityForm={securityForm}
                  handleSecurityChange={handleSecurityChange}
                  handleSecurityUpdate={handleSecurityUpdate}
                  isUpdatingProfile={isUpdatingProfile}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                  passwordsMatch={passwordsMatch}
                  passwordMinLength={passwordMinLength}
                  canSubmitSecurity={canSubmitSecurity}
                />
              )}
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MyAccountLinkedInUI;