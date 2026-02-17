import { apiSlice } from "../base-query";
import type {
  Package,
  PackageListResponse,
  PackageStorePayload,
} from "../../types/package/package";

interface GetPackagesParams {
  page: number;
  paginate: number;
  search?: string;
  orderBy?: string;
  order?: string;
}

const transformListResponse = (response: {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: Package[];
    last_page: number;
    total: number;
    per_page: number;
  };
}): PackageListResponse => ({
  data: response.data.data,
  last_page: response.data.last_page,
  current_page: response.data.current_page,
  total: response.data.total,
  per_page: response.data.per_page,
});

function buildPackageFormData(
  payload: Partial<PackageStorePayload>,
): FormData {
  const formData = new FormData();
  const { image, features, ...fields } = payload;

  Object.entries(fields).forEach(([key, value]) => {
    if (value != null) formData.append(key, String(value));
  });

  if (image) {
    formData.append("image", image);
  }

  if (features) {
    features.forEach((feature, index) => {
      formData.append(`features[${index}][label]`, feature.label);
      if (feature.value != null)
        formData.append(`features[${index}][value]`, feature.value);
      if (feature.nomor != null)
        formData.append(`features[${index}][nomor]`, String(feature.nomor));
    });
  }

  return formData;
}

export const packageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPackages: builder.query<PackageListResponse, GetPackagesParams>({
      query: ({ page, paginate, search = "", orderBy, order }) => {
        const params: Record<string, string | number | undefined> = {
          page,
          paginate,
          search,
        };
        if (orderBy != null) params.orderBy = orderBy;
        if (order != null) params.order = order;
        return { url: "/package/packages", method: "GET", params };
      },
      transformResponse: transformListResponse,
    }),

    getPackageById: builder.query<Package, number>({
      query: (id) => ({ url: `/package/packages/${id}`, method: "GET" }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Package;
      }) => response.data,
    }),

    createPackage: builder.mutation<Package, PackageStorePayload>({
      query: (body) => ({
        url: "/package/packages",
        method: "POST",
        body: buildPackageFormData(body),
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Package;
      }) => response.data,
    }),

    updatePackage: builder.mutation<
      Package,
      { id: number; payload: Partial<PackageStorePayload> }
    >({
      query: ({ id, payload }) => {
        const formData = buildPackageFormData(payload);
        formData.append("_method", "PUT");
        return {
          url: `/package/packages/${id}`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: Package;
      }) => response.data,
    }),

    deletePackage: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/package/packages/${id}`,
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
  useGetPackagesQuery,
  useGetPackageByIdQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} = packageApi;
