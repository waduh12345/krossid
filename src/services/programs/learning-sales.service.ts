import { apiSlice } from "../base-query";
import type {
  ProgramLearningSale,
  ProgramLearningSaleListResponse,
} from "@/types/programs/learning-sales";

interface GetProgramLearningSalesParams {
  page: number;
  paginate: number;
  search?: string;
  program_learning_id?: number | null;
  sales_id?: number | null;
}

const transformListResponse = (response: {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: ProgramLearningSale[];
    last_page: number;
    total: number;
    per_page: number;
  };
}): ProgramLearningSaleListResponse => ({
  data: response.data.data,
  last_page: response.data.last_page,
  current_page: response.data.current_page,
  total: response.data.total,
  per_page: response.data.per_page,
});

export const programLearningSaleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProgramLearningSales: builder.query<
      ProgramLearningSaleListResponse,
      GetProgramLearningSalesParams
    >({
      query: ({
        page,
        paginate,
        search = "",
        program_learning_id,
        sales_id,
      }) => {
        const params: Record<string, string | number | undefined> = {
          page,
          paginate,
          search,
        };
        if (program_learning_id != null)
          params.program_learning_id = program_learning_id;
        if (sales_id != null) params.sales_id = sales_id;
        return { url: "/program/learning-sales", method: "GET", params };
      },
      transformResponse: transformListResponse,
    }),

    getProgramLearningSaleById: builder.query<ProgramLearningSale, number>({
      query: (id) => ({
        url: `/program/learning-sales/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramLearningSale;
      }) => response.data,
    }),

    createProgramLearningSale: builder.mutation<
      ProgramLearningSale,
      {
        program_learning_id: number;
        sales_id: number;
        started_at?: string;
        completed_at?: string;
      }
    >({
      query: (body) => ({
        url: "/program/learning-sales",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramLearningSale;
      }) => response.data,
    }),

    updateProgramLearningSale: builder.mutation<
      ProgramLearningSale,
      {
        id: number;
        payload: Partial<{
          started_at: string | null;
          completed_at: string | null;
          status: boolean | number;
        }>;
      }
    >({
      query: ({ id, payload }) => ({
        url: `/program/learning-sales/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramLearningSale;
      }) => response.data,
    }),

    deleteProgramLearningSale: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/program/learning-sales/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: unknown;
      }) => ({ code: response.code, message: response.message }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProgramLearningSalesQuery,
  useGetProgramLearningSaleByIdQuery,
  useCreateProgramLearningSaleMutation,
  useUpdateProgramLearningSaleMutation,
  useDeleteProgramLearningSaleMutation,
} = programLearningSaleApi;
