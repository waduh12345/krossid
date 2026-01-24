import { apiSlice } from "../base-query";
import type { TopSale, TopSaleResponse, CreateTopSalePayload, UpdateTopSalePayload } from "@/types/programs/top-sales";

interface GetTopSalesParams {
  page: number;
  paginate: number;
}

export const topSalesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET all top sales (paginated)
    getTopSales: builder.query<TopSaleResponse, GetTopSalesParams>({
      query: ({ page, paginate }) => ({
        url: "/program/top-sales",
        method: "GET",
        params: { page, paginate },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: TopSale[];
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

    // ✅ GET by ID
    getTopSaleById: builder.query<TopSale, number>({
      query: (id) => ({
        url: `/program/top-sales/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: TopSale;
      }) => response.data,
    }),

    // ✅ CREATE
    createTopSale: builder.mutation<TopSale, CreateTopSalePayload>({
      query: (payload) => ({
        url: "/program/top-sales",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: TopSale;
      }) => response.data,
    }),

    // ✅ UPDATE
    updateTopSale: builder.mutation<TopSale, { id: number; payload: UpdateTopSalePayload }>({
      query: ({ id, payload }) => ({
        url: `/program/top-sales/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: TopSale;
      }) => response.data,
    }),

    // ✅ DELETE
    deleteTopSale: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({
        url: `/program/top-sales/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTopSalesQuery,
  useGetTopSaleByIdQuery,
  useCreateTopSaleMutation,
  useUpdateTopSaleMutation,
  useDeleteTopSaleMutation,
} = topSalesApi;
