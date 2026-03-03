import { apiSlice } from "../base-query";
import type {
  MateriListItem,
  MateriDetail,
  MateriQuizItem,
  MateriQuizListResponse,
} from "@/types/programs/programs";

interface GetMateriQuizzesParams {
  programId: number;
  materiId: number;
  level?: number;
  paginate?: number;
  page?: number;
}

export const materiApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET list materis per program
    getMateris: builder.query<MateriListItem[], number>({
      query: (programId) => ({
        url: `/program/programs/${programId}/materis`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: MateriListItem[];
      }) => response.data,
    }),

    // GET detail materi + quiz summary
    getMateriDetail: builder.query<
      MateriDetail,
      { programId: number; materiId: number }
    >({
      query: ({ programId, materiId }) => ({
        url: `/program/programs/${programId}/materis/${materiId}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: MateriDetail;
      }) => response.data,
    }),

    // GET list quizzes per materi
    getMateriQuizzes: builder.query<MateriQuizListResponse, GetMateriQuizzesParams>({
      query: ({ programId, materiId, level, paginate = 10, page = 1 }) => {
        const params: Record<string, string | number> = { paginate, page };
        if (level != null) params.level = level;
        return {
          url: `/program/programs/${programId}/materis/${materiId}/quizzes`,
          method: "GET",
          params,
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: MateriQuizItem[];
          last_page: number;
          per_page: number;
          total: number;
        };
      }) => ({
        data: response.data.data,
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMaterisQuery,
  useGetMateriDetailQuery,
  useGetMateriQuizzesQuery,
  useLazyGetMateriQuizzesQuery,
} = materiApi;
