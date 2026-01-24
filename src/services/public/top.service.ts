import { apiSlice } from "../base-query";
import type { TopPrograms } from "@/types/programs/programs";

interface GetTopParams {
  paginate: number;
}

export const publicTopApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET top programs from public endpoint
    getTopPrograms: builder.query<
      {
        data: TopPrograms[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      GetTopParams
    >({
      query: ({ paginate }) => ({
        url: "/public/top-programs",
        method: "GET",
        params: { paginate },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: TopPrograms[];
          last_page: number;
          total: number;
          per_page: number;
        };
      }) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // ✅ GET top sales from public endpoint
    getTopSales: builder.query<
      {
        data: any[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      GetTopParams
    >({
      query: ({ paginate }) => ({
        url: "/public/top-sales",
        method: "GET",
        params: { paginate },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: any[];
          last_page: number;
          total: number;
          per_page: number;
        };
      }) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTopProgramsQuery,
  useGetTopSalesQuery,
} = publicTopApi;