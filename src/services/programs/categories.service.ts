import { apiSlice } from "@/services/base-query";
import type { Categories } from "@/types/programs/categories";


export const categoriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all (paginated + optional search)
    getCategoriesList: builder.query<
      {
        data: Categories[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string }
    >({
      query: ({ page, paginate, search }) => {
        const s =
          search && search.trim()
            ? `&search=${encodeURIComponent(search.trim())}`
            : "";
        return {
          url: `/program/categories?page=${page}&paginate=${paginate}${s}`,
          method: "GET",
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: Categories[];
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

    // ✅ Get by ID
    getCategoriesById: builder.query<Categories, number>({
      query: (id) => ({
        url: `/program/categories/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Categories;
      }) => response.data,
    }),

    // ✅ Create
    createCategories: builder.mutation<Categories, Partial<Categories>>({
      query: (payload) => ({
        url: `/program/categories`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Categories;
      }) => response.data,
    }),

    // ✅ Update
    updateCategories: builder.mutation<
      Categories,
      { id: number; payload: Partial<Categories> }
    >({
      query: ({ id, payload }) => ({
        url: `/program/categories/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Categories;
      }) => response.data,
    }),

    // ✅ Delete
    deleteCategories: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({
        url: `/program/categories/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => ({ code: response.code, message: response.message }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCategoriesListQuery,
  useGetCategoriesByIdQuery,
  useCreateCategoriesMutation,
  useUpdateCategoriesMutation,
  useDeleteCategoriesMutation,
} = categoriesApi;