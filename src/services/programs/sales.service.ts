import { apiSlice } from "@/services/base-query";
import type { Sales } from "@/types/programs/sales";


export const salesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all (paginated + optional search)
    getSalesList: builder.query<
      {
        data: Sales[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string; program_id?: number; owner_id?: number }
    >({
      query: ({ page, paginate, search, program_id, owner_id }) => {
        const s =
          search && search.trim()
            ? `&search=${encodeURIComponent(search.trim())}`
            : "";

        // Only include owner_id if program_id is NOT provided
        const ownerParam =
          program_id == null && owner_id != null ? `&owner_id=${owner_id}` : "";

        return {
          url: `/program/sales?page=${page}&paginate=${paginate}${s}${program_id ? `&program_id=${program_id}` : ""}${ownerParam}`,
          method: "GET",
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: Sales[];
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

    // ✅ Get by ID
    getSalesById: builder.query<Sales, number>({
      query: (id) => ({
        url: `/program/sales/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Sales;
      }) => response.data,
    }),

    // ✅ Create
    createSales: builder.mutation<Sales, Partial<Sales>>({
      query: (payload) => ({
        url: `/program/sales`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Sales;
      }) => response.data,
    }),

    // ✅ Update
    updateSales: builder.mutation<
      Sales,
      { id: number; payload: Partial<Sales> }
    >({
      query: ({ id, payload }) => ({
        url: `/program/sales/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Sales;
      }) => response.data,
    }),

    // ✅ Delete
    deleteSales: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({
        url: `/program/sales/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => ({ code: response.code, message: response.message }),
    }),

    // ✅ Export Sales (body can be empty or contain program_id, from, to)
    // services/programs/sales.service.ts

    exportSales: builder.mutation<Blob, { program_id?: number; from?: string; to?: string } | void>({
      query: (payload) => ({
        url: `/program/sales/export`,
        method: "POST",
        body: payload,
        // Gunakan responseHandler yang lebih aman
        responseHandler: async (response) => {
          if (!response.ok) {
            // Jika error, ambil teksnya untuk dilempar ke catch
            const errorData = await response.json();
            throw errorData; 
          }
          return response.blob();
        },
        cache: "no-cache",
      }),
    }),

    // ✅ Import Sales (POST form-data file)
    importSales: builder.mutation<
      { code: number; message: string; data: unknown },
      FormData
    >({
      query: (formData) => ({
        url: `/program/sales/import`,
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: unknown;
      }) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSalesListQuery,
  useGetSalesByIdQuery,
  useCreateSalesMutation,
  useUpdateSalesMutation,
  useDeleteSalesMutation,
  useExportSalesMutation,
  useImportSalesMutation,
} = salesApi;