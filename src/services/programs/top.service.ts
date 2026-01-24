import { apiSlice } from "../base-query";
import type { TopProgram, TopProgramResponse, CreateTopProgramPayload, UpdateTopProgramPayload } from "@/types/programs/top";

interface GetTopProgramsParams {
  page: number;
  paginate: number;
}

export const topProgramsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET all top programs (paginated)
    getTopPrograms: builder.query<TopProgramResponse, GetTopProgramsParams>({
      query: ({ page, paginate }) => ({
        url: "/program/top-programs",
        method: "GET",
        params: { page, paginate },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: TopProgram[];
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
    getTopProgramById: builder.query<TopProgram, number>({
      query: (id) => ({
        url: `/program/top-programs/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: TopProgram;
      }) => response.data,
    }),

    // ✅ CREATE
    createTopProgram: builder.mutation<TopProgram, CreateTopProgramPayload>({
      query: (payload) => ({
        url: "/program/top-programs",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: TopProgram;
      }) => response.data,
    }),

    // ✅ UPDATE
    updateTopProgram: builder.mutation<TopProgram, { id: number; payload: UpdateTopProgramPayload }>({
      query: ({ id, payload }) => ({
        url: `/program/top-programs/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: TopProgram;
      }) => response.data,
    }),

    // ✅ DELETE
    deleteTopProgram: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({
        url: `/program/top-programs/${id}`,
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
  useGetTopProgramsQuery,
  useGetTopProgramByIdQuery,
  useCreateTopProgramMutation,
  useUpdateTopProgramMutation,
  useDeleteTopProgramMutation,
} = topProgramsApi;
