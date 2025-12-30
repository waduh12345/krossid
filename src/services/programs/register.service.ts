import { apiSlice } from "@/services/base-query";
import type { Register } from "@/types/programs/register";


export const registerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all (paginated + optional search)
    getRegisterList: builder.query<
      {
      data: Register[];
      last_page: number;
      current_page: number;
      total: number;
      per_page: number;
      },
      { page: number; paginate: number; search?: string; program_id?: number; owner_id?: number }
    >({
      query: ({ page, paginate, search, program_id, owner_id }) => {
      const params = [
        `page=${page}`,
        `paginate=${paginate}`,
        search && search.trim() ? `search=${encodeURIComponent(search.trim())}` : "",
        program_id ? `program_id=${program_id}` : "",
        owner_id !== undefined && owner_id !== null ? `owner_id=${owner_id}` : "",
      ]
        .filter(Boolean)
        .join("&");

      return {
        url: `/program/registrations?${params}`,
        method: "GET",
      };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: Register[];
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
    getRegisterById: builder.query<Register, number>({
      query: (id) => ({
        url: `/program/registrations/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Register;
      }) => response.data,
    }),

    // ✅ Create
    createRegister: builder.mutation<Register, Partial<Register>>({
      query: (payload) => ({
        url: `/program/registrations`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Register;
      }) => response.data,
    }),

    // ✅ Update
    updateRegister: builder.mutation<
      Register,
      { id: number; payload: Partial<Register> }
    >({
      query: ({ id, payload }) => ({
        url: `/program/registrations/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Register;
      }) => response.data,
    }),

    // ✅ Delete
    deleteRegister: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({
        url: `/program/registrations/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => ({ code: response.code, message: response.message }),
    }),

    exportSales: builder.mutation<
      Blob, // Assuming you want to download a file, use Blob
      { program_id?: number; from?: string; to?: string } | void
    >({
      query: (payload) => ({
        url: `/program/registrations/export`,
        method: "POST",
        body: payload && Object.keys(payload).length > 0 ? payload : undefined,
        responseHandler: (response) => response.blob(), // handle file download
      }),
      // No transformResponse needed if returning Blob
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRegisterListQuery,
  useGetRegisterByIdQuery,
  useCreateRegisterMutation,
  useUpdateRegisterMutation,
  useDeleteRegisterMutation,
} = registerApi;