import { apiSlice } from "../base-query";
import type {
  MateriQuizStartResponse,
  MateriQuizStartPayload,
  MateriQuizAnswerResponse,
  MateriQuizAnswerPayload,
  MateriQuizFinishResponse,
  MateriQuizFinishPayload,
  MateriQuizResultResponse,
  MateriQuizResultParams,
  MateriQuizRankingEntry,
  MateriQuizRankingParams,
  MateriQuizExplainResponse,
  MateriQuizExplainParams,
} from "@/types/programs/materi-quiz-sales";

export const materiQuizSalesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // START - Mulai mengerjakan quiz
    startMateriQuiz: builder.mutation<MateriQuizStartResponse, MateriQuizStartPayload>({
      query: (body) => ({
        url: "/program/materi-quiz-sales/start",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: MateriQuizStartResponse;
      }) => response.data,
    }),

    // ANSWER - Jawab per soal
    answerMateriQuiz: builder.mutation<MateriQuizAnswerResponse, MateriQuizAnswerPayload>({
      query: (body) => ({
        url: "/program/materi-quiz-sales/answer",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: MateriQuizAnswerResponse;
      }) => response.data,
    }),

    // FINISH - Selesaikan quiz & hitung skor
    finishMateriQuiz: builder.mutation<MateriQuizFinishResponse, MateriQuizFinishPayload>({
      query: (body) => ({
        url: "/program/materi-quiz-sales/finish",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: MateriQuizFinishResponse;
      }) => response.data,
    }),

    // RESULT - Lihat hasil + ranking
    getMateriQuizResult: builder.query<MateriQuizResultResponse, MateriQuizResultParams>({
      query: ({ program_materi_id, level, sales_id }) => {
        const params: Record<string, number> = { program_materi_id, level };
        if (sales_id != null) params.sales_id = sales_id;
        return {
          url: "/program/materi-quiz-sales/result",
          method: "GET",
          params,
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: MateriQuizResultResponse;
      }) => response.data,
    }),

    // EXPLAIN - Per-question feedback
    getMateriQuizExplain: builder.query<MateriQuizExplainResponse, MateriQuizExplainParams>({
      query: ({ program_materi_id, nomor, sales_id }) => {
        const params: Record<string, number> = { program_materi_id, nomor };
        if (sales_id != null) params.sales_id = sales_id;
        return {
          url: "/program/materi-quiz-sales/explain",
          method: "GET",
          params,
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: MateriQuizExplainResponse;
      }) => response.data,
    }),

    // RANKING - Leaderboard per program
    getMateriQuizRanking: builder.query<MateriQuizRankingEntry[], MateriQuizRankingParams>({
      query: ({ program_id, program_materi_id, level }) => {
        const params: Record<string, number> = { program_id };
        if (program_materi_id != null) params.program_materi_id = program_materi_id;
        if (level != null) params.level = level;
        return {
          url: "/program/materi-quiz-sales/ranking",
          method: "GET",
          params,
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: MateriQuizRankingEntry[];
      }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useStartMateriQuizMutation,
  useAnswerMateriQuizMutation,
  useFinishMateriQuizMutation,
  useGetMateriQuizResultQuery,
  useLazyGetMateriQuizResultQuery,
  useGetMateriQuizRankingQuery,
  useLazyGetMateriQuizExplainQuery,
} = materiQuizSalesApi;
