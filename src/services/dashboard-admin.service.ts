import { apiSlice } from "./base-query";
import type { 
  DashboardAdmin, 
  MonthlyUserGrowth, 
  TopProgramsResponse, 
  TopSale,
  ProgramViewsListParams,
  ProgramViewsListResponse,
  ProgramSharesListParams,
  ProgramSharesListResponse,
  ProgramRegistrationsListParams,
  ProgramRegistrationsListResponse
} from "@/types/dashboard";

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

    // 4b. Total Program Shares
    getTotalProgramShares: builder.query<number, void>({
      query: () => ({
        url: "/dashboard/total-program-shares",
        method: "GET",
      }),
      transformResponse: (response: DashboardCountResponse) => response.data,
      providesTags: ["DashboardAdmin"],
    }),

    // 4c. Total Sales
    getTotalSales: builder.query<number, void>({
      query: () => ({
        url: "/dashboard/total-sales",
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

    // 8. List Program Views
    getListProgramViews: builder.query<ProgramViewsListResponse, ProgramViewsListParams>({
      query: (params) => ({
        url: "/dashboard/list-program-views",
        method: "GET",
        params: {
          program_id: params.program_id,
          from: params.from,
          to: params.to,
          search: params.search,
          paginate: params.paginate ?? 10,
          page: params.page ?? 1,
          orderBy: params.orderBy,
          order: params.order,
        },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramViewsListResponse;
      }) => response.data,
      providesTags: ["DashboardAdmin"],
    }),

    // 9. List Program Shares
    getListProgramShares: builder.query<ProgramSharesListResponse, ProgramSharesListParams>({
      query: (params) => ({
        url: "/dashboard/list-program-shares",
        method: "GET",
        params: {
          program_id: params.program_id,
          from: params.from,
          to: params.to,
          search: params.search,
          paginate: params.paginate ?? 10,
          page: params.page ?? 1,
          orderBy: params.orderBy,
          order: params.order,
        },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramSharesListResponse;
      }) => response.data,
      providesTags: ["DashboardAdmin"],
    }),

    // 10. List Program Registrations
    getListProgramRegistrations: builder.query<ProgramRegistrationsListResponse, ProgramRegistrationsListParams>({
      query: (params) => ({
        url: "/dashboard/list-program-registrations",
        method: "GET",
        params: {
          program_id: params.program_id,
          sales_id: params.sales_id,
          from: params.from,
          to: params.to,
          search: params.search,
          paginate: params.paginate ?? 10,
          page: params.page ?? 1,
          orderBy: params.orderBy,
          order: params.order,
        },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramRegistrationsListResponse;
      }) => response.data,
      providesTags: ["DashboardAdmin"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetDashboardAdminQuery,
  useGetTotalOwnersQuery,
  useGetTotalProgramsQuery,
  useGetTotalProgramRegistrationsQuery,
  useGetTotalProgramViewsQuery,
  useGetTotalProgramSharesQuery,
  useGetTotalSalesQuery,
  useGetMonthlyUserGrowthQuery,
  useGetTop5ProgramsQuery,
  useGetTopSalesQuery,
  useGetListProgramViewsQuery,
  useGetListProgramSharesQuery,
  useGetListProgramRegistrationsQuery,
} = dashboardAdminApi;