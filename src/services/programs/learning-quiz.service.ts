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

export interface ProgramLearningQuizPayload {
  program_learning_id: number;
  nomor: number;
  question: string;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  option_e: string | null;
  correct_option: string;
  status: number;
  question_image?: File | null;
  option_a_image?: File | null;
  option_b_image?: File | null;
  option_c_image?: File | null;
  option_d_image?: File | null;
  option_e_image?: File | null;
  question_image_remove?: boolean;
  option_a_image_remove?: boolean;
  option_b_image_remove?: boolean;
  option_c_image_remove?: boolean;
  option_d_image_remove?: boolean;
  option_e_image_remove?: boolean;
}

function buildQuizFormData(payload: ProgramLearningQuizPayload): FormData {
  const fd = new FormData();
  fd.append("program_learning_id", String(payload.program_learning_id));
  fd.append("nomor", String(payload.nomor));
  fd.append("question", payload.question);
  fd.append("correct_option", payload.correct_option);
  fd.append("status", String(payload.status));

  const textFields = ["option_a", "option_b", "option_c", "option_d", "option_e"] as const;
  for (const key of textFields) {
    if (payload[key] != null) fd.append(key, payload[key]);
  }

  const imageFields = [
    "question_image",
    "option_a_image",
    "option_b_image",
    "option_c_image",
    "option_d_image",
    "option_e_image",
  ] as const;
  for (const key of imageFields) {
    if (payload[key] instanceof File) {
      fd.append(key, payload[key]);
    }
  }

  const removeFields = [
    "question_image_remove",
    "option_a_image_remove",
    "option_b_image_remove",
    "option_c_image_remove",
    "option_d_image_remove",
    "option_e_image_remove",
  ] as const;
  for (const key of removeFields) {
    if (payload[key]) fd.append(key, "1");
  }

  return fd;
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
      ProgramLearningQuizPayload
    >({
      query: (body) => ({
        url: "/program/learning-quizzes",
        method: "POST",
        body: buildQuizFormData(body),
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramLearningQuiz;
      }) => response.data,
    }),

    updateProgramLearningQuiz: builder.mutation<
      ProgramLearningQuiz,
      { id: number; payload: ProgramLearningQuizPayload }
    >({
      query: ({ id, payload }) => {
        const fd = buildQuizFormData(payload);
        fd.append("_method", "PUT");
        return {
          url: `/program/learning-quizzes/${id}`,
          method: "POST",
          body: fd,
        };
      },
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
