import { apiSlice } from "./base-query";
import type { DashboardAdmin } from "@/types/dashboard";

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
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardAdminQuery,
  useGetTotalOwnersQuery,
  useGetTotalProgramsQuery,
  useGetTotalProgramRegistrationsQuery,
  useGetTotalProgramViewsQuery,
} = dashboardAdminApi;