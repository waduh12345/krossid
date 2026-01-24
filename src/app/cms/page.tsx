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
  BarChart3,
  X
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
import {
  useGetMonthlyUserGrowthQuery,
  useGetTop5ProgramsQuery,
  useGetTopSalesQuery,
} from "@/services/dashboard-admin.service";

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

  // SUPERADMIN STATS
  const superadminStats = [
    {
      label: "Total Owner",
      value: 56,
      icon: Store,
      trend: "+12%",
      trendUp: true,
      color: "#4A90E2",
    },
    {
      label: "Total Sales",
      value: 178,
      icon: Target,
      trend: "+18%",
      trendUp: true,
      color: "#7ED321",
    },
    {
      label: "Total User",
      value: 3450,
      icon: Users,
      trend: "+24%",
      trendUp: true,
      color: "#F2A93B",
    },
    {
      label: "Revenue",
      value: 450200000,
      icon: Wallet,
      trend: "+15%",
      trendUp: true,
      color: "#9013FE",
    },
  ];

  // OWNER STATS
  const ownerStats = [
    {
      label: "Total Sales",
      value: 12,
      icon: Target,
      trend: "+8%",
      trendUp: true,
      color: "#4A90E2",
    },
    {
      label: "Total User",
      value: 542,
      icon: Users,
      trend: "+15%",
      trendUp: true,
      color: "#7ED321",
    },
    {
      label: "Revenue",
      value: 24300000,
      icon: Wallet,
      trend: "+12%",
      trendUp: true,
      color: "#F2A93B",
    },
    {
      label: "Conversion Rate",
      value: "4.35%",
      icon: TrendingUp,
      trend: "+0.5%",
      trendUp: true,
      color: "#9013FE",
    },
  ];

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
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                              {currentStats.map((stat, idx) => (
                  <div 
                    key={stat.label} 
                    className="group relative overflow-hidden rounded-3xl border border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-700 group-hover:scale-110 transition-transform duration-300">
                        <stat.icon size={24} className="text-[#4A90E2]" />
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black ${
                        stat.trendUp 
                          ? 'bg-green-50 dark:bg-green-900/20 text-[#7ED321]' 
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {stat.trendUp ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                        {stat.trend}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-2">
                        {stat.label}
                      </p>
                      <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                        {typeof stat.value === 'number' && stat.label.toLowerCase().includes('revenue') 
                          ? `Rp ${nf.format(stat.value)}` 
                          : typeof stat.value === 'string'
                          ? stat.value
                          : nf.format(stat.value)}
                      </h3>
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
                              {nf.format(program.registrations)}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-bold">Total Registrations</p>
                          </div>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 md:p-8 bg-gray-50/50 dark:bg-neutral-800/50">
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-gray-200 dark:border-neutral-700">
                          <Eye className="h-5 w-5 text-[#4A90E2] mb-2" />
                          <p className="text-2xl font-black text-neutral-900 dark:text-white">
                            {nf.format(program.views)}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                            Total Views
                          </p>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-gray-200 dark:border-neutral-700">
                          <Share2 className="h-5 w-5 text-[#7ED321] mb-2" />
                          <p className="text-2xl font-black text-neutral-900 dark:text-white">
                            {nf.format(program.shares)}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                            Total Shares
                          </p>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-gray-200 dark:border-neutral-700">
                          <UserPlus className="h-5 w-5 text-[#F2A93B] mb-2" />
                          <p className="text-2xl font-black text-neutral-900 dark:text-white">
                            {nf.format(program.registrations)}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                            Registrations
                          </p>
                        </div>

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
    </>
  );
}