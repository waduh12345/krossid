import { apiSlice } from "../base-query";
import type { Programs } from "@/types/programs/programs";

interface GetProgramsParams {
  page: number;
  paginate: number;
}

interface GetProgramSalesParams {
  id: number;
  page: number;
  paginate: number;
}

export const publicProgramApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET all programs from public endpoint
    getPublicPrograms: builder.query<
      {
        data: Programs[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      GetProgramsParams
    >({
      query: ({ page, paginate }) => ({
        url: "/public/programs",
        method: "GET",
        params: { page, paginate },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: Programs[];
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

    // ✅ GET program by ID from public endpoint
    getPublicProgramById: builder.query<Programs, number>({
      query: (id) => ({
        url: `/public/programs/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Programs;
      }) => response.data,
    }),

    // ✅ GET program sales by ID from public endpoint
    getPublicProgramSales: builder.query<
      {
        data: any[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      GetProgramSalesParams
    >({
      query: ({ id, page, paginate }) => ({
        url: `/public/programs/${id}/sales`,
        method: "GET",
        params: { page, paginate },
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
  useGetPublicProgramsQuery,
  useGetPublicProgramByIdQuery,
  useGetPublicProgramSalesQuery,
} = publicProgramApi;