import { apiSlice } from "../base-query";
import type {
  ProgramLearning,
  ProgramLearningListResponse,
} from "@/types/programs/learning";

interface GetProgramLearningsParams {
  page: number;
  paginate: number;
  search?: string;
  program_id?: number | null;
  program_learning_category_id?: number | null;
}

const transformListResponse = (response: {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: ProgramLearning[];
    last_page: number;
    total: number;
    per_page: number;
  };
}): ProgramLearningListResponse => ({
  data: response.data.data,
  last_page: response.data.last_page,
  current_page: response.data.current_page,
  total: response.data.total,
  per_page: response.data.per_page,
});

export const programLearningApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProgramLearnings: builder.query<
      ProgramLearningListResponse,
      GetProgramLearningsParams
    >({
      query: ({
        page,
        paginate,
        search = "",
        program_id,
        program_learning_category_id,
      }) => {
        const params: Record<string, string | number | undefined> = {
          page,
          paginate,
          search,
        };
        if (program_id != null) params.program_id = program_id;
        if (program_learning_category_id != null)
          params.program_learning_category_id = program_learning_category_id;
        return { url: "/program/learnings", method: "GET", params };
      },
      transformResponse: transformListResponse,
    }),

    getProgramLearningById: builder.query<ProgramLearning, number>({
      query: (id) => ({ url: `/program/learnings/${id}`, method: "GET" }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramLearning;
      }) => response.data,
    }),

    createProgramLearning: builder.mutation<
      ProgramLearning,
      Partial<ProgramLearning>
    >({
      query: (body) => ({
        url: "/program/learnings",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramLearning;
      }) => response.data,
    }),

    updateProgramLearning: builder.mutation<
      ProgramLearning,
      { id: number; payload: Partial<ProgramLearning> }
    >({
      query: ({ id, payload }) => ({
        url: `/program/learnings/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramLearning;
      }) => response.data,
    }),

    deleteProgramLearning: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/program/learnings/${id}`,
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
  useGetProgramLearningsQuery,
  useGetProgramLearningByIdQuery,
  useCreateProgramLearningMutation,
  useUpdateProgramLearningMutation,
  useDeleteProgramLearningMutation,
} = programLearningApi;
