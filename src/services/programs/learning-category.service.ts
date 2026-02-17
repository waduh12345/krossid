import { apiSlice } from "../base-query";
import type {
  ProgramLearningCategory,
  ProgramLearningCategoryListResponse,
} from "@/types/programs/learning-category";

interface GetProgramLearningCategoriesParams {
  page: number;
  paginate: number;
  search?: string;
  program_id?: number | null;
}

const transformListResponse = (response: {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: ProgramLearningCategory[];
    last_page: number;
    total: number;
    per_page: number;
  };
}): ProgramLearningCategoryListResponse => ({
  data: response.data.data,
  last_page: response.data.last_page,
  current_page: response.data.current_page,
  total: response.data.total,
  per_page: response.data.per_page,
});

export const programLearningCategoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProgramLearningCategories: builder.query<
      ProgramLearningCategoryListResponse,
      GetProgramLearningCategoriesParams
    >({
      query: ({ page, paginate, search = "", program_id }) => {
        const params: Record<string, string | number | undefined> = {
          page,
          paginate,
          search,
        };
        if (program_id != null) params.program_id = program_id;
        return { url: "/program/learning-categories", method: "GET", params };
      },
      transformResponse: transformListResponse,
    }),

    getProgramLearningCategoryById: builder.query<
      ProgramLearningCategory,
      number
    >({
      query: (id) => ({ url: `/program/learning-categories/${id}`, method: "GET" }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramLearningCategory;
      }) => response.data,
    }),

    createProgramLearningCategory: builder.mutation<
      ProgramLearningCategory,
      Partial<ProgramLearningCategory>
    >({
      query: (body) => ({
        url: "/program/learning-categories",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramLearningCategory;
      }) => response.data,
    }),

    updateProgramLearningCategory: builder.mutation<
      ProgramLearningCategory,
      { id: number; payload: Partial<ProgramLearningCategory> }
    >({
      query: ({ id, payload }) => ({
        url: `/program/learning-categories/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ProgramLearningCategory;
      }) => response.data,
    }),

    deleteProgramLearningCategory: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/program/learning-categories/${id}`,
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
  useGetProgramLearningCategoriesQuery,
  useGetProgramLearningCategoryByIdQuery,
  useCreateProgramLearningCategoryMutation,
  useUpdateProgramLearningCategoryMutation,
  useDeleteProgramLearningCategoryMutation,
} = programLearningCategoryApi;
