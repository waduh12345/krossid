import { apiSlice } from "../base-query";
import type {
  PackageFeature,
  PackageFeatureListResponse,
} from "@/types/package/feature";

interface GetPackageFeaturesParams {
  page: number;
  paginate: number;
  package_id: number;
  search?: string;
  orderBy?: string;
  order?: string;
}

const transformListResponse = (response: {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: PackageFeature[];
    last_page: number;
    total: number;
    per_page: number;
  };
}): PackageFeatureListResponse => ({
  data: response.data.data,
  last_page: response.data.last_page,
  current_page: response.data.current_page,
  total: response.data.total,
  per_page: response.data.per_page,
});

export const packageFeatureApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPackageFeatures: builder.query<
      PackageFeatureListResponse,
      GetPackageFeaturesParams
    >({
      query: ({ page, paginate, package_id, search = "", orderBy, order }) => {
        const params: Record<string, string | number | undefined> = {
          page,
          paginate,
          package_id,
          search,
        };
        if (orderBy != null) params.orderBy = orderBy;
        if (order != null) params.order = order;
        return { url: "/package/features", method: "GET", params };
      },
      transformResponse: transformListResponse,
    }),

    getPackageFeatureById: builder.query<PackageFeature, number>({
      query: (id) => ({ url: `/package/features/${id}`, method: "GET" }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PackageFeature;
      }) => response.data,
    }),

    createPackageFeature: builder.mutation<
      PackageFeature,
      { package_id: number; label: string; value?: string | null; nomor?: number }
    >({
      query: (body) => ({
        url: "/package/features",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PackageFeature;
      }) => response.data,
    }),

    updatePackageFeature: builder.mutation<
      PackageFeature,
      {
        id: number;
        payload: {
          package_id: number;
          label: string;
          value?: string | null;
          nomor?: number;
        };
      }
    >({
      query: ({ id, payload }) => ({
        url: `/package/features/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PackageFeature;
      }) => response.data,
    }),

    deletePackageFeature: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/package/features/${id}`,
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
  useGetPackageFeaturesQuery,
  useGetPackageFeatureByIdQuery,
  useCreatePackageFeatureMutation,
  useUpdatePackageFeatureMutation,
  useDeletePackageFeatureMutation,
} = packageFeatureApi;
