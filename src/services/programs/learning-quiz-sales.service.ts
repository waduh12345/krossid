import { apiSlice } from "../base-query";
import type {
  ProgramLearningQuizSale,
  ProgramLearningQuizSaleListResponse,
  SubmitQuizPayload,
} from "@/types/programs/learning-quiz-sales";

interface GetProgramLearningQuizSalesParams {
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
    data: ProgramLearningQuizSale[];
    last_page: number;
    total: number;
    per_page: number;
  };
}): ProgramLearningQuizSaleListResponse => ({
  data: response.data.data,
  last_page: response.data.last_page,
  current_page: response.data.current_page,
  total: response.data.total,
  per_page: response.data.per_page,
});

export const programLearningQuizSaleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProgramLearningQuizSales: builder.query<
      ProgramLearningQuizSaleListResponse,
      GetProgramLearningQuizSalesParams
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
        return {
          url: "/program/learning-quiz-sales",
          method: "GET",
          params,
        };
      },
      transformResponse: transformListResponse,
    }),

    getProgramLearningQuizSaleById: builder.query<
      ProgramLearningQuizSale,
      number
    >({
      query: (id) => ({
        url: `/program/learning-quiz-sales/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramLearningQuizSale;
      }) => response.data,
    }),

    submitProgramLearningQuiz: builder.mutation<
      ProgramLearningQuizSale,
      SubmitQuizPayload
    >({
      query: (body) => ({
        url: "/program/learning-quiz-sales",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramLearningQuizSale;
      }) => response.data,
    }),

    updateProgramLearningQuizSale: builder.mutation<
      ProgramLearningQuizSale,
      {
        id: number;
        payload: Partial<{
          score: number;
          total_questions: number;
          passed: boolean;
          completed_at: string | null;
        }>;
      }
    >({
      query: ({ id, payload }) => ({
        url: `/program/learning-quiz-sales/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramLearningQuizSale;
      }) => response.data,
    }),

    deleteProgramLearningQuizSale: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/program/learning-quiz-sales/${id}`,
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
  useGetProgramLearningQuizSalesQuery,
  useGetProgramLearningQuizSaleByIdQuery,
  useSubmitProgramLearningQuizMutation,
  useUpdateProgramLearningQuizSaleMutation,
  useDeleteProgramLearningQuizSaleMutation,
} = programLearningQuizSaleApi;
