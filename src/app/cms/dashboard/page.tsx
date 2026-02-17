"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSession } from "next-auth/react";
import { 
  Users, 
  Wallet, 
  ShieldAlert, 
  TrendingUp, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight,
  Store,
  Target,
  Eye,
  Share2,
  UserPlus,
  Trophy,
  Filter,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  X,
  Search,
  Loader2,
  Globe,
  MapPin,
  Mail,
  Phone,
  ExternalLink
} from "lucide-react";
import { 
  XAxis, 
  YAxis,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetMonthlyUserGrowthQuery,
  useGetTop5ProgramsQuery,
  useGetTopSalesQuery,
  useGetListProgramViewsQuery,
  useGetListProgramSharesQuery,
  useGetListProgramRegistrationsQuery,
  useGetTotalOwnersQuery,
  useGetTotalProgramsQuery,
  useGetTotalProgramViewsQuery,
  useGetTotalProgramSharesQuery,
  useGetTotalProgramRegistrationsQuery,
  useGetTotalSalesQuery,
} from "@/services/dashboard-admin.service";
import type { 
  ProgramViewItem, 
  ProgramShareItem, 
  ProgramRegistrationItem 
} from "@/types/dashboard";

// Month names for display
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const nf = new Intl.NumberFormat("id-ID");

export default function AffiliateDashboard() {
  const [dateFilter, setDateFilter] = useState("thisMonth");
  const [compareDate, setCompareDate] = useState("lastMonth");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showComparePicker, setShowComparePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [expandedProgram, setExpandedProgram] = useState<number | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  
  // Date range states for Period
  const [periodStartDate, setPeriodStartDate] = useState<Date | null>(null);
  const [periodEndDate, setPeriodEndDate] = useState<Date | null>(null);
  const [showPeriodDateRange, setShowPeriodDateRange] = useState(false);
  
  // Date range states for Compare
  const [compareStartDate, setCompareStartDate] = useState<Date | null>(null);
  const [compareEndDate, setCompareEndDate] = useState<Date | null>(null);
  const [showCompareDateRange, setShowCompareDateRange] = useState(false);

  // Modal states for Views, Shares, Registrations
  const [modalType, setModalType] = useState<"views" | "shares" | "registrations" | null>(null);
  const [selectedProgramForModal, setSelectedProgramForModal] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [modalSearch, setModalSearch] = useState("");
  const [modalPage, setModalPage] = useState(1);
  const [modalPaginate] = useState(10);
  
  const { data: session } = useSession();
  const userRole = session?.user?.roles?.[0]?.name;

  // Get current year for monthly growth
  const currentYear = new Date().getFullYear();

  // Fetch API data
  const { data: monthlyGrowthData, isLoading: isLoadingGrowth } = useGetMonthlyUserGrowthQuery(
    { year: currentYear },
    { skip: !session }
  );

  const { data: topProgramsData, isLoading: isLoadingTopPrograms } = useGetTop5ProgramsQuery(
    { period: "month", top: 5 },
    { skip: !session }
  );

  const { data: topSalesData, isLoading: isLoadingTopSales } = useGetTopSalesQuery(
    { top: 5 },
    { skip: !session }
  );

  // Dashboard Stats API calls
  const { data: totalOwners, isLoading: isLoadingTotalOwners } = useGetTotalOwnersQuery(
    undefined,
    { skip: !session || userRole !== "superadmin" }
  );

  const { data: totalPrograms, isLoading: isLoadingTotalPrograms } = useGetTotalProgramsQuery(
    undefined,
    { skip: !session }
  );

  const { data: totalProgramViews, isLoading: isLoadingTotalViews } = useGetTotalProgramViewsQuery(
    undefined,
    { skip: !session }
  );

  const { data: totalProgramShares, isLoading: isLoadingTotalShares } = useGetTotalProgramSharesQuery(
    undefined,
    { skip: !session }
  );

  const { data: totalProgramRegistrations, isLoading: isLoadingTotalRegistrations } = useGetTotalProgramRegistrationsQuery(
    undefined,
    { skip: !session }
  );

  const { data: totalSales, isLoading: isLoadingTotalSales } = useGetTotalSalesQuery(
    undefined,
    { skip: !session }
  );

  const isLoadingStats = isLoadingTotalOwners || isLoadingTotalPrograms || isLoadingTotalViews || 
    isLoadingTotalShares || isLoadingTotalRegistrations || isLoadingTotalSales;

  // Fetch list data for modals
  const { data: viewsListData, isFetching: isFetchingViews } = useGetListProgramViewsQuery(
    {
      program_id: selectedProgramForModal?.id,
      search: modalSearch,
      page: modalPage,
      paginate: modalPaginate,
    },
    { skip: modalType !== "views" || !selectedProgramForModal }
  );

  const { data: sharesListData, isFetching: isFetchingShares } = useGetListProgramSharesQuery(
    {
      program_id: selectedProgramForModal?.id,
      search: modalSearch,
      page: modalPage,
      paginate: modalPaginate,
    },
    { skip: modalType !== "shares" || !selectedProgramForModal }
  );

  const { data: registrationsListData, isFetching: isFetchingRegistrations } = useGetListProgramRegistrationsQuery(
    {
      program_id: selectedProgramForModal?.id,
      search: modalSearch,
      page: modalPage,
      paginate: modalPaginate,
    },
    { skip: modalType !== "registrations" || !selectedProgramForModal }
  );

  // Transform monthly growth data for chart
  const MONTHLY_GROWTH_DATA = useMemo(() => {
    if (!monthlyGrowthData) return [];
    return monthlyGrowthData.map((item) => ({
      month: MONTH_NAMES[item.month - 1] || `Month ${item.month}`,
      owners: item.total_owners,
      sales: item.total_sales,
      users: item.total_users,
    }));
  }, [monthlyGrowthData]);

  // Transform top programs data
  const TOP_PROGRAMS = useMemo(() => {
    if (!topProgramsData) return [];
    return Object.values(topProgramsData).map((program) => {
      const totalRegistrations = program.performance.reduce((sum, p) => sum + p.registrations, 0);
      const totalShares = program.performance.reduce((sum, p) => sum + p.shares, 0);
      const totalViews = program.performance.reduce((sum, p) => sum + Number(p.views || 0), 0);
      const viewsCount = Number(program.visits_count || 0);
      
      // Calculate average conversion (simplified)
      const avgConversionStr = totalViews > 0 ? ((totalRegistrations / totalViews) * 100).toFixed(2) : "0";
      
      // Calculate trend (compare last month with previous month)
      const lastMonth = program.performance[program.performance.length - 1];
      const prevMonth = program.performance[program.performance.length - 2];
      const trendValue = prevMonth && prevMonth.registrations > 0
        ? (((lastMonth.registrations - prevMonth.registrations) / prevMonth.registrations) * 100).toFixed(0)
        : "0";
      const trendString = String(trendValue);
      
      return {
        id: program.id,
        name: program.title,
        sub_title: program.sub_title,
        owner: program.owner_id, // Will need to fetch owner name if needed
        sales: 0, // Not in API response
        views: viewsCount || totalViews,
        shares: totalShares,
        registrations: totalRegistrations,
        avgConversion: parseFloat(avgConversionStr),
        trend: `${trendString.startsWith('-') ? '' : '+'}${trendString}%`,
        monthlyData: program.performance.map((p, idx) => ({
          month: MONTH_NAMES[idx] || `Month ${p.month}`,
          sales: 0, // Not in API response
          views: Number(p.views || 0),
          registrations: p.registrations,
        })),
        performance: program.performance,
      };
    });
  }, [topProgramsData]);

  // Transform top sales data
  const SALES_RANKING = useMemo(() => {
    if (!topSalesData) return [];
    const currentUserId = session?.user?.id;
    return topSalesData.map((sale, index) => ({
      rank: index + 1,
      name: sale.name,
      sales: 0, // Not in API response, using registrations as proxy
      programs: sale.program_registrations_count,
      conversion: sale.program_registrations_count > 0 
        ? ((sale.program_registrations_count / (sale.program_registrations_count + sale.program_shares_count)) * 100).toFixed(1)
        : "0.0",
      isCurrentUser: currentUserId === sale.id,
      email: sale.email,
      phone: sale.phone,
      registrations: sale.program_registrations_count,
      shares: sale.program_shares_count,
    }));
  }, [topSalesData, session]);

  // Calculate date ranges based on selected options
  const getDateRange = (option: string) => {
    const today = new Date();
    const start = new Date();
    const end = new Date();

    switch (option) {
      case "today":
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      case "thisWeek":
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      case "thisMonth":
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(today.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      case "lastMonth":
        start.setMonth(today.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(today.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      case "thisYear":
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      default:
        return null;
    }
  };

  // Handle date filter change
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    if (value === "custom") {
      setShowPeriodDateRange(true);
      setShowDatePicker(false);
    } else {
      setShowPeriodDateRange(false);
      setShowDatePicker(false);
      const range = getDateRange(value);
      if (range) {
        setPeriodStartDate(range.start);
        setPeriodEndDate(range.end);
      }
    }
  };

  // Handle compare date change
  const handleCompareDateChange = (value: string) => {
    setCompareDate(value);
    if (value === "custom") {
      setShowCompareDateRange(true);
      setShowComparePicker(false);
    } else {
      setShowCompareDateRange(false);
      setShowComparePicker(false);
      const range = getDateRange(value);
      if (range) {
        setCompareStartDate(range.start);
        setCompareEndDate(range.end);
      }
    }
  };

  // Format date range display
  const formatDateRange = (start: Date | null, end: Date | null) => {
    if (!start || !end) return "Pilih Tanggal";
    const formatDate = (date: Date) => {
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  // Modal handlers
  const openMetricModal = (type: "views" | "shares" | "registrations", programId: number, programName: string) => {
    setModalType(type);
    setSelectedProgramForModal({ id: programId, name: programName });
    setModalSearch("");
    setModalPage(1);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedProgramForModal(null);
    setModalSearch("");
    setModalPage(1);
  };

  // Format datetime for table display
  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowCategoryPicker(false);
        setShowDatePicker(false);
        setShowComparePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dateOptions = [
    { value: "today", label: "Hari Ini" },
    { value: "thisWeek", label: "Minggu Ini" },
    { value: "thisMonth", label: "Bulan Ini" },
    { value: "lastMonth", label: "Bulan Kemarin" },
    { value: "thisYear", label: "Tahun Ini" },
    { value: "custom", label: "Custom Range" },
  ];

  const categoryOptions = [
    { value: "all", label: "Semua Kategori" },
    { value: "digital", label: "Digital Product" },
    { value: "physical", label: "Physical Product" },
    { value: "service", label: "Service" },
  ];

  // SUPERADMIN STATS (from API)
  const superadminStats = useMemo(() => [
    {
      label: "Total Owner",
      value: totalOwners ?? 0,
      icon: Store,
      trend: "-",
      trendUp: true,
      color: "#4A90E2",
      isLoading: isLoadingTotalOwners,
    },
    {
      label: "Total Program",
      value: totalPrograms ?? 0,
      icon: Target,
      trend: "-",
      trendUp: true,
      color: "#7ED321",
      isLoading: isLoadingTotalPrograms,
    },
    {
      label: "Total Views",
      value: totalProgramViews ?? 0,
      icon: Eye,
      trend: "-",
      trendUp: true,
      color: "#F2A93B",
      isLoading: isLoadingTotalViews,
    },
    {
      label: "Total Shares",
      value: totalProgramShares ?? 0,
      icon: Share2,
      trend: "-",
      trendUp: true,
      color: "#9013FE",
      isLoading: isLoadingTotalShares,
    },
    {
      label: "Total Registrations",
      value: totalProgramRegistrations ?? 0,
      icon: UserPlus,
      trend: "-",
      trendUp: true,
      color: "#4A90E2",
      isLoading: isLoadingTotalRegistrations,
    },
    {
      label: "Total Sales",
      value: totalSales ?? 0,
      icon: Users,
      trend: "-",
      trendUp: true,
      color: "#7ED321",
      isLoading: isLoadingTotalSales,
    },
  ], [totalOwners, totalPrograms, totalProgramViews, totalProgramShares, totalProgramRegistrations, totalSales, isLoadingTotalOwners, isLoadingTotalPrograms, isLoadingTotalViews, isLoadingTotalShares, isLoadingTotalRegistrations, isLoadingTotalSales]);

  // OWNER STATS (from API - no totalOwners for owner)
  const ownerStats = useMemo(() => [
    {
      label: "Total Program",
      value: totalPrograms ?? 0,
      icon: Target,
      trend: "-",
      trendUp: true,
      color: "#4A90E2",
      isLoading: isLoadingTotalPrograms,
    },
    {
      label: "Total Views",
      value: totalProgramViews ?? 0,
      icon: Eye,
      trend: "-",
      trendUp: true,
      color: "#7ED321",
      isLoading: isLoadingTotalViews,
    },
    {
      label: "Total Shares",
      value: totalProgramShares ?? 0,
      icon: Share2,
      trend: "-",
      trendUp: true,
      color: "#F2A93B",
      isLoading: isLoadingTotalShares,
    },
    {
      label: "Total Registrations",
      value: totalProgramRegistrations ?? 0,
      icon: UserPlus,
      trend: "-",
      trendUp: true,
      color: "#9013FE",
      isLoading: isLoadingTotalRegistrations,
    },
    {
      label: "Total Sales",
      value: totalSales ?? 0,
      icon: Users,
      trend: "-",
      trendUp: true,
      color: "#4A90E2",
      isLoading: isLoadingTotalSales,
    },
  ], [totalPrograms, totalProgramViews, totalProgramShares, totalProgramRegistrations, totalSales, isLoadingTotalPrograms, isLoadingTotalViews, isLoadingTotalShares, isLoadingTotalRegistrations, isLoadingTotalSales]);

  const currentStats = userRole === "superadmin" ? superadminStats : ownerStats;

  return (
    <>
    <SiteHeader title="Dashboard - Program Performance & User Analytics" />
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900">
      
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4A90E2]/5 via-transparent to-[#F2A93B]/5" />
        <div className="absolute right-0 top-0 h-[600px] w-[600px] bg-[#4A90E2]/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute left-0 bottom-0 h-[500px] w-[500px] bg-[#7ED321]/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-8 md:py-8">
        {/* HEADER */}
        <div className="mb-8">

          {/* FILTERS - Tampil untuk Superadmin dan Owner */}
          {(userRole === "superadmin" || userRole === "owner" || userRole === "sales") && (
            <div ref={filterRef} className="relative z-50 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 sm:p-6 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-lg">
              
              {/* Category Filter */}
              <div className="relative">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-2">
                  Kategori
                </label>
                <button
                  onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                  className="w-full flex items-center justify-between gap-2 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-4 py-3 text-sm font-bold hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[#4A90E2]" />
                    {categoryOptions.find(opt => opt.value === selectedCategory)?.label}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {showCategoryPicker && (
                  <div className="absolute z-[100] mt-2 w-full rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-xl overflow-hidden">
                    {categoryOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSelectedCategory(opt.value);
                          setShowCategoryPicker(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Filter */}
              <div className="relative">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-2">
                  Period
                </label>
                <button
                  onClick={() => {
                    setShowDatePicker(!showDatePicker);
                    setShowPeriodDateRange(false);
                  }}
                  className="w-full flex items-center justify-between gap-2 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-4 py-3 text-sm font-bold hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Calendar className="h-4 w-4 text-[#7ED321] flex-shrink-0" />
                    <span className="truncate">
                      {dateFilter === "custom" && periodStartDate && periodEndDate
                        ? formatDateRange(periodStartDate, periodEndDate)
                        : dateOptions.find(opt => opt.value === dateFilter)?.label}
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </button>
                {showDatePicker && !showPeriodDateRange && (
                  <div className="absolute z-[100] mt-2 w-full min-w-[200px] sm:min-w-[250px] rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-xl overflow-hidden">
                    {dateOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleDateFilterChange(opt.value)}
                        className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
                {showPeriodDateRange && (
                  <div className="absolute z-[100] mt-2 left-0 right-0 sm:left-auto sm:right-auto w-full sm:w-auto min-w-[280px] sm:min-w-[320px] max-w-[calc(100vw-2rem)] sm:max-w-none rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-black text-neutral-900 dark:text-white">
                        Pilih Range Tanggal
                      </h4>
                      <button
                        onClick={() => {
                          setShowPeriodDateRange(false);
                          setShowDatePicker(false);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                          Dari Tanggal
                        </label>
                        <DatePicker
                          selected={periodStartDate || undefined}
                          onChange={(date) => setPeriodStartDate(date)}
                          selectsStart
                          startDate={periodStartDate || undefined}
                          endDate={periodEndDate || undefined}
                          maxDate={periodEndDate || new Date()}
                          dateFormat="dd MMM yyyy"
                          className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-3 py-2 text-sm font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7ED321]"
                          placeholderText="Pilih tanggal mulai"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                          Sampai Tanggal
                        </label>
                        <DatePicker
                          selected={periodEndDate || undefined}
                          onChange={(date) => setPeriodEndDate(date)}
                          selectsEnd
                          startDate={periodStartDate || undefined}
                          endDate={periodEndDate || undefined}
                          minDate={periodStartDate || undefined}
                          maxDate={new Date()}
                          dateFormat="dd MMM yyyy"
                          className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-3 py-2 text-sm font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7ED321]"
                          placeholderText="Pilih tanggal akhir"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            setPeriodStartDate(null);
                            setPeriodEndDate(null);
                            setDateFilter("thisMonth");
                            setShowPeriodDateRange(false);
                            setShowDatePicker(false);
                          }}
                          className="flex-1 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => {
                            if (periodStartDate && periodEndDate) {
                              setDateFilter("custom");
                              setShowPeriodDateRange(false);
                              setShowDatePicker(false);
                            }
                          }}
                          disabled={!periodStartDate || !periodEndDate}
                          className="flex-1 px-4 py-2 text-sm font-bold bg-[#7ED321] text-white rounded-lg hover:bg-[#6BC11F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Terapkan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Compare Date */}
              <div className="relative">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-2">
                  Compare With
                </label>
                <button
                  onClick={() => {
                    setShowComparePicker(!showComparePicker);
                    setShowCompareDateRange(false);
                  }}
                  className="w-full flex items-center justify-between gap-2 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-4 py-3 text-sm font-bold hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all"
                >
                  <span className="flex items-center gap-2 truncate">
                    <BarChart3 className="h-4 w-4 text-[#F2A93B] flex-shrink-0" />
                    <span className="truncate">
                      {compareDate === "custom" && compareStartDate && compareEndDate
                        ? formatDateRange(compareStartDate, compareEndDate)
                        : dateOptions.find(opt => opt.value === compareDate)?.label}
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </button>
                {showComparePicker && !showCompareDateRange && (
                  <div className="absolute z-[100] mt-2 w-full min-w-[200px] sm:min-w-[250px] rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-xl overflow-hidden">
                    {dateOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleCompareDateChange(opt.value)}
                        className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
                {showCompareDateRange && (
                  <div className="absolute z-[100] mt-2 left-0 right-0 sm:left-auto sm:right-auto w-full sm:w-auto min-w-[280px] sm:min-w-[320px] max-w-[calc(100vw-2rem)] sm:max-w-none rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-black text-neutral-900 dark:text-white">
                        Pilih Range Tanggal
                      </h4>
                      <button
                        onClick={() => {
                          setShowCompareDateRange(false);
                          setShowComparePicker(false);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                          Dari Tanggal
                        </label>
                        <DatePicker
                          selected={compareStartDate || undefined}
                          onChange={(date) => setCompareStartDate(date)}
                          selectsStart
                          startDate={compareStartDate || undefined}
                          endDate={compareEndDate || undefined}
                          maxDate={compareEndDate || new Date()}
                          dateFormat="dd MMM yyyy"
                          className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-3 py-2 text-sm font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                          placeholderText="Pilih tanggal mulai"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                          Sampai Tanggal
                        </label>
                        <DatePicker
                          selected={compareEndDate || undefined}
                          onChange={(date) => setCompareEndDate(date)}
                          selectsEnd
                          startDate={compareStartDate || undefined}
                          endDate={compareEndDate || undefined}
                          minDate={compareStartDate || undefined}
                          maxDate={new Date()}
                          dateFormat="dd MMM yyyy"
                          className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-3 py-2 text-sm font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                          placeholderText="Pilih tanggal akhir"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            setCompareStartDate(null);
                            setCompareEndDate(null);
                            setCompareDate("lastMonth");
                            setShowCompareDateRange(false);
                            setShowComparePicker(false);
                          }}
                          className="flex-1 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => {
                            if (compareStartDate && compareEndDate) {
                              setCompareDate("custom");
                              setShowCompareDateRange(false);
                              setShowComparePicker(false);
                            }
                          }}
                          disabled={!compareStartDate || !compareEndDate}
                          className="flex-1 px-4 py-2 text-sm font-bold bg-[#F2A93B] text-white rounded-lg hover:bg-[#E0992A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Terapkan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SALES ROLE - Ranking & Top Program */}
        {userRole === "sales" && (
          <div className="space-y-8">
            
            {/* Sales Ranking */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="h-8 w-8 text-[#F2A93B]" />
                <h2 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white">
                  Your Ranking
                </h2>
              </div>

              <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-lg overflow-hidden">
                {isLoadingTopSales ? (
                  <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                    Loading ranking data...
                  </div>
                ) : SALES_RANKING.length === 0 ? (
                  <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                    No ranking data available
                  </div>
                ) : (
                  SALES_RANKING.map((sale, idx) => (
                  <div
                    key={sale.rank}
                    className={`flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-800 last:border-0 transition-all hover:bg-gray-50/50 dark:hover:bg-neutral-800/50 ${
                      sale.isCurrentUser ? 'bg-gradient-to-r from-[#4A90E2]/10 to-[#7ED321]/10 border-l-4 border-l-[#4A90E2]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-black text-lg ${
                        sale.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                        sale.rank === 2 ? 'bg-gray-100 text-gray-600' :
                        sale.rank === 3 ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        #{sale.rank}
                      </div>
                      <div>
                        <h3 className="font-black text-neutral-900 dark:text-white">
                          {sale.name}
                          {sale.isCurrentUser && (
                            <span className="ml-2 text-xs bg-[#4A90E2] text-white px-2 py-1 rounded-full">YOU</span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {sale.registrations} Registrations • {sale.shares} Shares
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-[#4A90E2]">
                        {nf.format(sale.registrations)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Registrations</p>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </section>

            {/* Top Program for Sales */}
            <section>
              <h2 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white mb-6">
                Your Top Program
              </h2>

              {isLoadingTopPrograms ? (
                <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-lg p-8 text-center text-gray-600 dark:text-gray-400">
                  Loading top program data...
                </div>
              ) : TOP_PROGRAMS.length === 0 ? (
                <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-lg p-8 text-center text-gray-600 dark:text-gray-400">
                  No top program data available
                </div>
              ) : (
                TOP_PROGRAMS.slice(0, 1).map(program => (
                <div key={program.id} className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-lg p-6 md:p-8">
                  
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-1">
                        {program.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Performance</span>
                        <span className="flex items-center gap-1 text-xs font-bold text-[#7ED321] bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                          <ArrowUpRight size={12} />
                          {program.trend}
                        </span>
                      </div>
                    </div>
                    <div className="text-3xl font-black bg-gradient-to-r from-[#4A90E2] to-[#7ED321] bg-clip-text text-transparent">
                      {nf.format(program.registrations)} Registrations
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
                      <Eye className="h-5 w-5 text-[#4A90E2] mb-2" />
                      <p className="text-2xl font-black text-neutral-900 dark:text-white">
                        {nf.format(program.views)}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                        Total Views
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-4 border border-green-200 dark:border-green-800">
                      <Share2 className="h-5 w-5 text-[#7ED321] mb-2" />
                      <p className="text-2xl font-black text-neutral-900 dark:text-white">
                        {nf.format(program.shares)}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                        Total Shares
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-4 border border-orange-200 dark:border-orange-800">
                      <UserPlus className="h-5 w-5 text-[#F2A93B] mb-2" />
                      <p className="text-2xl font-black text-neutral-900 dark:text-white">
                        {nf.format(program.registrations)}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                        Registrations
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-800">
                      <TrendingUp className="h-5 w-5 text-[#9013FE] mb-2" />
                      <p className="text-2xl font-black text-neutral-900 dark:text-white">
                        {program.avgConversion}%
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                        Avg Conversion
                      </p>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={program.monthlyData}>
                        <defs>
                          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#4A90E2" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                        <YAxis stroke="#6B7280" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                            fontWeight: 'bold'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="registrations" 
                          stroke="#4A90E2" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#salesGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                ))
              )}
            </section>
          </div>
        )}

        {/* SUPERADMIN & OWNER - Stats Cards */}
        {(userRole === "superadmin" || userRole === "owner") && (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                              {currentStats.map((stat, idx) => (
                  <div 
                    key={stat.label} 
                    className="group relative overflow-hidden rounded-3xl border border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-700 group-hover:scale-110 transition-transform duration-300">
                        <stat.icon size={24} style={{ color: stat.color }} />
                      </div>
                      {stat.trend !== "-" && (
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black ${
                          stat.trendUp 
                            ? 'bg-green-50 dark:bg-green-900/20 text-[#7ED321]' 
                            : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {stat.trendUp ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                          {stat.trend}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-2">
                        {stat.label}
                      </p>
                      {stat.isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                          <span className="text-gray-400">Loading...</span>
                        </div>
                      ) : (
                        <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                          {typeof stat.value === 'number' && stat.label.toLowerCase().includes('revenue') 
                            ? `Rp ${nf.format(stat.value)}` 
                            : typeof stat.value === 'string'
                            ? stat.value
                            : nf.format(stat.value)}
                        </h3>
                      )}
                    </div>
                    <div 
                      className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
                      style={{ color: stat.color }}
                    >
                      <stat.icon size={120} />
                    </div>
                  </div>
                ))}
              </section>

              {/* Monthly Growth Chart - Superadmin Only */}
              {userRole === "superadmin" && (
                <section className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white mb-6">
                    Monthly Growth Analytics
                  </h2>
                  
                  <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-lg p-6 md:p-8">
                    {isLoadingGrowth ? (
                      <div className="h-80 flex items-center justify-center text-gray-600 dark:text-gray-400">
                        Loading growth data...
                      </div>
                    ) : MONTHLY_GROWTH_DATA.length === 0 ? (
                      <div className="h-80 flex items-center justify-center text-gray-600 dark:text-gray-400">
                        No growth data available
                      </div>
                    ) : (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={MONTHLY_GROWTH_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis 
                              dataKey="month" 
                              stroke="#6B7280" 
                              style={{ fontSize: '12px', fontWeight: 'bold' }} 
                            />
                            <YAxis stroke="#6B7280" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                border: 'none', 
                                borderRadius: '16px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                fontWeight: 'bold',
                                padding: '12px'
                              }} 
                            />
                            <Legend 
                              wrapperStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="owners" 
                              stroke="#4A90E2" 
                              strokeWidth={3}
                              name="Owners"
                              dot={{ fill: '#4A90E2', r: 5 }}
                              activeDot={{ r: 7 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="sales" 
                              stroke="#7ED321" 
                              strokeWidth={3}
                              name="Sales"
                              dot={{ fill: '#7ED321', r: 5 }}
                              activeDot={{ r: 7 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="users" 
                              stroke="#F2A93B" 
                              strokeWidth={3}
                              name="Users"
                              dot={{ fill: '#F2A93B', r: 5 }}
                              activeDot={{ r: 7 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Owner Growth Chart */}
              {userRole === "owner" && (
                <section className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white mb-6">
                    Growth Analytics
                  </h2>
                  
                  <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-lg p-6 md:p-8">
                    {isLoadingGrowth ? (
                      <div className="h-80 flex items-center justify-center text-gray-600 dark:text-gray-400">
                        Loading growth data...
                      </div>
                    ) : MONTHLY_GROWTH_DATA.length === 0 ? (
                      <div className="h-80 flex items-center justify-center text-gray-600 dark:text-gray-400">
                        No growth data available
                      </div>
                    ) : (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={MONTHLY_GROWTH_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis 
                              dataKey="month" 
                              stroke="#6B7280" 
                              style={{ fontSize: '12px', fontWeight: 'bold' }} 
                            />
                            <YAxis stroke="#6B7280" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                border: 'none', 
                                borderRadius: '16px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                fontWeight: 'bold',
                                padding: '12px'
                              }} 
                            />
                            <Legend 
                              wrapperStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="sales" 
                              stroke="#4A90E2" 
                              strokeWidth={3}
                              name="Sales"
                              dot={{ fill: '#4A90E2', r: 5 }}
                              activeDot={{ r: 7 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="users" 
                              stroke="#7ED321" 
                              strokeWidth={3}
                              name="Users"
                              dot={{ fill: '#7ED321', r: 5 }}
                              activeDot={{ r: 7 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Top Programs */}
              <section>
                <h2 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white mb-6">
                  Top Programs
                  {userRole === "superadmin" && (
                    <span className="ml-3 text-sm font-bold text-gray-600 dark:text-gray-400">
                      (by sales & registrations)
                    </span>
                  )}
                </h2>

                <div className="space-y-6">
                  {isLoadingTopPrograms ? (
                    <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-lg p-8 text-center text-gray-600 dark:text-gray-400">
                      Loading top programs data...
                    </div>
                  ) : TOP_PROGRAMS.length === 0 ? (
                    <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-lg p-8 text-center text-gray-600 dark:text-gray-400">
                      No top programs data available
                    </div>
                  ) : (
                    TOP_PROGRAMS.map((program, idx) => (
                    <div 
                      key={program.id}
                      className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl"
                    >
                      {/* Header */}
                      <div className="p-6 md:p-8 border-b border-gray-100 dark:border-neutral-800">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A90E2] to-[#7ED321] text-white font-black text-xl shadow-lg">
                              #{idx + 1}
                            </div>
                            <div>
                              <h3 className="text-xl md:text-2xl font-black text-neutral-900 dark:text-white mb-1">
                                {program.name}
                              </h3>
                              {userRole === "superadmin" && program.owner && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                  <Users size={14} />
                                  Owner ID: <span className="font-bold">{program.owner}</span>
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400">Performance</span>
                                <span className="flex items-center gap-1 text-xs font-bold text-[#7ED321] bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                  <ArrowUpRight size={12} />
                                  {program.trend}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#4A90E2] to-[#7ED321] bg-clip-text text-transparent">
                              {nf.format(program.views)}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-bold">Total Views</p>
                          </div>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 md:p-8 bg-gray-50/50 dark:bg-neutral-800/50">
                        <button
                          onClick={() => openMetricModal("views", program.id, program.name)}
                          className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-gray-200 dark:border-neutral-700 text-left transition-all duration-200 hover:shadow-lg hover:border-[#4A90E2] hover:scale-[1.02] cursor-pointer group"
                        >
                          <Eye className="h-5 w-5 text-[#4A90E2] mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-2xl font-black text-neutral-900 dark:text-white">
                            {nf.format(program.views)}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                            Total Views
                          </p>
                          <p className="text-[9px] text-[#4A90E2] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to view details
                          </p>
                        </button>

                        <button
                          onClick={() => openMetricModal("shares", program.id, program.name)}
                          className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-gray-200 dark:border-neutral-700 text-left transition-all duration-200 hover:shadow-lg hover:border-[#7ED321] hover:scale-[1.02] cursor-pointer group"
                        >
                          <Share2 className="h-5 w-5 text-[#7ED321] mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-2xl font-black text-neutral-900 dark:text-white">
                            {nf.format(program.shares)}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                            Total Shares
                          </p>
                          <p className="text-[9px] text-[#7ED321] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to view details
                          </p>
                        </button>

                        <button
                          onClick={() => openMetricModal("registrations", program.id, program.name)}
                          className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-gray-200 dark:border-neutral-700 text-left transition-all duration-200 hover:shadow-lg hover:border-[#F2A93B] hover:scale-[1.02] cursor-pointer group"
                        >
                          <UserPlus className="h-5 w-5 text-[#F2A93B] mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-2xl font-black text-neutral-900 dark:text-white">
                            {nf.format(program.registrations)}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                            Registrations
                          </p>
                          <p className="text-[9px] text-[#F2A93B] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to view details
                          </p>
                        </button>

                        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-gray-200 dark:border-neutral-700">
                          <TrendingUp className="h-5 w-5 text-[#9013FE] mb-2" />
                          <p className="text-2xl font-black text-neutral-900 dark:text-white">
                            {program.avgConversion}%
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                            Avg Conversion
                          </p>
                        </div>
                      </div>

                      {/* Chart - Toggle */}
                      <div className="p-6 md:p-8">
                        <button
                          onClick={() => setExpandedProgram(expandedProgram === program.id ? null : program.id)}
                          className="w-full flex items-center justify-between text-sm font-black text-gray-600 dark:text-gray-400 hover:text-[#4A90E2] transition-colors mb-4"
                        >
                          <span className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Performance Chart
                          </span>
                          <ChevronDown 
                            className={`h-4 w-4 transition-transform ${expandedProgram === program.id ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {expandedProgram === program.id && (
                          <div className="h-64 animate-in fade-in duration-300">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={program.monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis 
                                  dataKey="month" 
                                  stroke="#6B7280" 
                                  style={{ fontSize: '12px', fontWeight: 'bold' }} 
                                />
                                <YAxis stroke="#6B7280" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                    border: 'none', 
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                    fontWeight: 'bold'
                                  }} 
                                />
                                <Legend wrapperStyle={{ fontWeight: 'bold', fontSize: '12px' }} />
                                <Bar dataKey="views" fill="#4A90E2" radius={[8, 8, 0, 0]} name="Views" />
                                <Bar dataKey="registrations" fill="#7ED321" radius={[8, 8, 0, 0]} name="Registrations" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </section>
            </>
          )}
      </main>
    </div>

    {/* Views Modal */}
    <Dialog open={modalType === "views"} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="!max-w-[95vw] sm:!max-w-[95vw] w-[95vw] h-[90vh] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-[#4A90E2]/10 rounded-xl">
              <Eye className="h-5 w-5 text-[#4A90E2]" />
            </div>
            <div>
              <span className="text-xl font-black">Program Views</span>
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                {selectedProgramForModal?.name}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by program title, IP, country, city, region..."
            value={modalSearch}
            onChange={(e) => {
              setModalSearch(e.target.value);
              setModalPage(1);
            }}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isFetchingViews ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#4A90E2]" />
            </div>
          ) : (viewsListData?.data?.length ?? 0) === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No views data found
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-neutral-800 sticky top-0">
                <tr>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">No</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">Program</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">Views</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">IP Address</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">Location</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">User Agent</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                {viewsListData?.data?.map((item: ProgramViewItem, idx: number) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                    <td className="p-3 text-gray-600 dark:text-gray-400">
                      {((modalPage - 1) * modalPaginate) + idx + 1}
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.program_title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.program_slug}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#4A90E2]/10 text-[#4A90E2] rounded-full text-xs font-bold">
                        <Eye className="h-3 w-3" />
                        {item.views}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-xs bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded">
                        {item.ip}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-start gap-2">
                        <Globe className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {item.city || "-"}, {item.region || "-"}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            {item.country} {item.country_code && `(${item.country_code})`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={item.user_agent}>
                        {item.user_agent || "-"}
                      </p>
                    </td>
                    <td className="p-3 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDateTime(item.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {viewsListData && viewsListData.last_page > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-neutral-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((modalPage - 1) * modalPaginate) + 1} to {Math.min(modalPage * modalPaginate, viewsListData.total)} of {viewsListData.total} entries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                disabled={modalPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium px-3">
                {modalPage} / {viewsListData.last_page}
              </span>
              <button
                onClick={() => setModalPage((p) => Math.min(viewsListData.last_page, p + 1))}
                disabled={modalPage === viewsListData.last_page}
                className="p-2 rounded-lg border border-gray-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Shares Modal */}
    <Dialog open={modalType === "shares"} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="!max-w-[95vw] sm:!max-w-[95vw] w-[95vw] h-[90vh] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-[#7ED321]/10 rounded-xl">
              <Share2 className="h-5 w-5 text-[#7ED321]" />
            </div>
            <div>
              <span className="text-xl font-black">Program Shares</span>
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                {selectedProgramForModal?.name}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by program title, shared to, shared by name/email..."
            value={modalSearch}
            onChange={(e) => {
              setModalSearch(e.target.value);
              setModalPage(1);
            }}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isFetchingShares ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#7ED321]" />
            </div>
          ) : (sharesListData?.data?.length ?? 0) === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No shares data found
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-neutral-800 sticky top-0">
                <tr>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">No</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">Program</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">Shared By</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">Shared To</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">Share Count</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">IP Address</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                {sharesListData?.data?.map((item: ProgramShareItem, idx: number) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                    <td className="p-3 text-gray-600 dark:text-gray-400">
                      {((modalPage - 1) * modalPaginate) + idx + 1}
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.program_title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.program_slug}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.shared_by_name || "-"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {item.shared_by_email || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#7ED321]/10 text-[#7ED321] rounded-full text-xs font-bold">
                        <ExternalLink className="h-3 w-3" />
                        {item.shared_to || "-"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-[#7ED321]/10 text-[#7ED321] rounded-full font-bold">
                        {item.share_count}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-xs bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded">
                        {item.ip || "-"}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDateTime(item.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {sharesListData && sharesListData.last_page > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-neutral-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((modalPage - 1) * modalPaginate) + 1} to {Math.min(modalPage * modalPaginate, sharesListData.total)} of {sharesListData.total} entries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                disabled={modalPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium px-3">
                {modalPage} / {sharesListData.last_page}
              </span>
              <button
                onClick={() => setModalPage((p) => Math.min(sharesListData.last_page, p + 1))}
                disabled={modalPage === sharesListData.last_page}
                className="p-2 rounded-lg border border-gray-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Registrations Modal */}
    <Dialog open={modalType === "registrations"} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="!max-w-[95vw] sm:!max-w-[95vw] w-[95vw] h-[90vh] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-[#F2A93B]/10 rounded-xl">
              <UserPlus className="h-5 w-5 text-[#F2A93B]" />
            </div>
            <div>
              <span className="text-xl font-black">Program Registrations</span>
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                {selectedProgramForModal?.name}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by program title, registrant name/email/phone, sales name/email..."
            value={modalSearch}
            onChange={(e) => {
              setModalSearch(e.target.value);
              setModalPage(1);
            }}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isFetchingRegistrations ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#F2A93B]" />
            </div>
          ) : (registrationsListData?.data?.length ?? 0) === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No registrations data found
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-neutral-800 sticky top-0">
                <tr>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">No</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">Program</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">Registrant</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">Sales</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">Parameter</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left p-3 font-bold text-gray-700 dark:text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                {registrationsListData?.data?.map((item: ProgramRegistrationItem, idx: number) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                    <td className="p-3 text-gray-600 dark:text-gray-400">
                      {((modalPage - 1) * modalPaginate) + idx + 1}
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.program_title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.program_slug}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {item.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {item.phone}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      {item.sales_name ? (
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.sales_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.sales_email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {item.parameter_value || "-"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                        item.status === 1 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {item.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDateTime(item.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {registrationsListData && registrationsListData.last_page > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-neutral-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((modalPage - 1) * modalPaginate) + 1} to {Math.min(modalPage * modalPaginate, registrationsListData.total)} of {registrationsListData.total} entries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                disabled={modalPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium px-3">
                {modalPage} / {registrationsListData.last_page}
              </span>
              <button
                onClick={() => setModalPage((p) => Math.min(registrationsListData.last_page, p + 1))}
                disabled={modalPage === registrationsListData.last_page}
                className="p-2 rounded-lg border border-gray-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}