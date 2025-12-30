import { apiSlice } from "../base-query";
import type { Programs } from "@/types/programs/programs";

interface GetProgramsParams {
  page: number;
  paginate: number;
  search?: string;
  owner_id?: number;
  program_category_id?: number;
}

export const lmsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET all LMS (paginated)
    getPrograms: builder.query<
      {
      data: Programs[];
      last_page: number;
      current_page: number;
      total: number;
      per_page: number;
      },
      GetProgramsParams
    >({
      query: ({ page, paginate, search = "", owner_id, program_category_id }) => {
      const params: Record<string, string | number | undefined> = { page, paginate, search, program_category_id };
      if (owner_id !== null && owner_id !== undefined) {
        params.owner_id = owner_id;
      }
      if (program_category_id !== null && program_category_id !== undefined) {
        params.program_category_id = program_category_id;
      }
      return {
        url: "/program/programs",
        method: "GET",
        params,
      };
      },
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

    // ✅ GET by ID
    getProgramsById: builder.query<Programs, number>({
      query: (id) => ({
        url: `/program/programs/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Programs;
      }) => response.data,
    }),

    // ✅ CREATE (pakai FormData karena ada field file "cover")
    createPrograms: builder.mutation<Programs, FormData>({
      query: (formData) => ({
        url: "/program/programs",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Programs;
      }) => response.data,
    }),

    // ✅ UPDATE (PUT via POST + _method=PUT)
    updatePrograms: builder.mutation<Programs, { id: number; payload: FormData }>({
      query: ({ id, payload }) => ({
        url: `/program/programs/${id}?_method=PUT`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Programs;
      }) => response.data,
    }),

    // ✅ DELETE
    deletePrograms: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({
        url: `/program/programs/${id}`,
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
  useGetProgramsQuery,
  useGetProgramsByIdQuery,
  useCreateProgramsMutation,
  useUpdateProgramsMutation,
  useDeleteProgramsMutation,
} = lmsApi;