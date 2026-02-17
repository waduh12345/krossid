import { apiSlice } from "../base-query";
import type {
  ProgramLearningQuiz,
  ProgramLearningQuizListResponse,
  ProgramLearningQuizWithSettings,
} from "@/types/programs/learning-quiz";

interface GetProgramLearningQuizzesParams {
  page: number;
  paginate: number;
  search?: string;
  program_learning_id?: number | null;
}

const transformListResponse = (response: {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: ProgramLearningQuiz[];
    last_page: number;
    total: number;
    per_page: number;
    quiz_time_limit_minutes?: number | null;
    quiz_minimum_score_percent?: number;
  };
}): ProgramLearningQuizListResponse => ({
  data: response.data.data,
  last_page: response.data.last_page,
  current_page: response.data.current_page,
  total: response.data.total,
  per_page: response.data.per_page,
  quiz_time_limit_minutes: response.data.quiz_time_limit_minutes,
  quiz_minimum_score_percent: response.data.quiz_minimum_score_percent,
});

export const programLearningQuizApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProgramLearningQuizzes: builder.query<
      ProgramLearningQuizListResponse,
      GetProgramLearningQuizzesParams
    >({
      query: ({ page, paginate, search = "", program_learning_id }) => {
        const params: Record<string, string | number | undefined> = {
          page,
          paginate,
          search,
        };
        if (program_learning_id != null)
          params.program_learning_id = program_learning_id;
        return { url: "/program/learning-quizzes", method: "GET", params };
      },
      transformResponse: transformListResponse,
    }),

    getProgramLearningQuizById: builder.query<
      ProgramLearningQuizWithSettings,
      number
    >({
      query: (id) => ({
        url: `/program/learning-quizzes/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramLearningQuizWithSettings;
      }) => response.data,
    }),

    createProgramLearningQuiz: builder.mutation<
      ProgramLearningQuiz,
      Partial<ProgramLearningQuiz>
    >({
      query: (body) => ({
        url: "/program/learning-quizzes",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramLearningQuiz;
      }) => response.data,
    }),

    updateProgramLearningQuiz: builder.mutation<
      ProgramLearningQuiz,
      { id: number; payload: Partial<ProgramLearningQuiz> }
    >({
      query: ({ id, payload }) => ({
        url: `/program/learning-quizzes/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramLearningQuiz;
      }) => response.data,
    }),

    deleteProgramLearningQuiz: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/program/learning-quizzes/${id}`,
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
  useGetProgramLearningQuizzesQuery,
  useGetProgramLearningQuizByIdQuery,
  useCreateProgramLearningQuizMutation,
  useUpdateProgramLearningQuizMutation,
  useDeleteProgramLearningQuizMutation,
} = programLearningQuizApi;
