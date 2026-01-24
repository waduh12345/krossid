import { apiSlice } from "./base-query";
import type { DashboardAdmin, MonthlyUserGrowth, TopProgramsResponse, TopSale } from "@/types/dashboard";

// Tipe response standar untuk endpoint count (angka)
type DashboardCountResponse = {
  code: number;
  message: string;
  data: number;
};

export const dashboardAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoint Existing
    getDashboardAdmin: builder.query<DashboardAdmin, void>({
      query: () => ({
        url: "/dashboard",
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: DashboardAdmin;
      }) => response.data,
      providesTags: ["DashboardAdmin"],
    }),

    // 1. Total Owners
    getTotalOwners: builder.query<number, void>({
      query: () => ({
        url: "/dashboard/total-owners",
        method: "GET",
      }),
      transformResponse: (response: DashboardCountResponse) => response.data,
      providesTags: ["DashboardAdmin"],
    }),

    // 2. Total Programs
    getTotalPrograms: builder.query<number, void>({
      query: () => ({
        url: "/dashboard/total-programs",
        method: "GET",
      }),
      transformResponse: (response: DashboardCountResponse) => response.data,
      providesTags: ["DashboardAdmin"],
    }),

    // 3. Total Program Registrations
    getTotalProgramRegistrations: builder.query<number, void>({
      query: () => ({
        url: "/dashboard/total-program-registrations",
        method: "GET",
      }),
      transformResponse: (response: DashboardCountResponse) => response.data,
      providesTags: ["DashboardAdmin"],
    }),

    // 4. Total Program Views
    getTotalProgramViews: builder.query<number, void>({
      query: () => ({
        url: "/dashboard/total-program-views",
        method: "GET",
      }),
      transformResponse: (response: DashboardCountResponse) => response.data,
      providesTags: ["DashboardAdmin"],
    }),

    // 5. Monthly User Growth
    getMonthlyUserGrowth: builder.query<MonthlyUserGrowth[], { year: number }>({
      query: ({ year }) => ({
        url: "/dashboard/monthly-user-growth",
        method: "GET",
        params: { year },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: MonthlyUserGrowth[];
      }) => response.data,
      providesTags: ["DashboardAdmin"],
    }),

    // 6. Top 5 Programs
    getTop5Programs: builder.query<TopProgramsResponse, { period: string; top: number }>({
      query: ({ period, top }) => ({
        url: "/dashboard/top-5-program",
        method: "GET",
        params: { period, top },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: TopProgramsResponse;
      }) => response.data,
      providesTags: ["DashboardAdmin"],
    }),

    // 7. Top Sales
    getTopSales: builder.query<TopSale[], { top: number }>({
      query: ({ top }) => ({
        url: "/dashboard/top-sales",
        method: "GET",
        params: { top },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: TopSale[];
      }) => response.data,
      providesTags: ["DashboardAdmin"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardAdminQuery,
  useGetTotalOwnersQuery,
  useGetTotalProgramsQuery,
  useGetTotalProgramRegistrationsQuery,
  useGetTotalProgramViewsQuery,
  useGetMonthlyUserGrowthQuery,
  useGetTop5ProgramsQuery,
  useGetTopSalesQuery,
} = dashboardAdminApi;