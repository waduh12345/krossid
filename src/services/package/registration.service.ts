import { apiSlice } from "../base-query";
import type {
  PackageRegistration,
  PackageRegistrationListResponse,
  PackageRegistrationStorePayload,
//   PackageRegistrationUsageSummary,
} from "@/types/package/registration";

interface GetPackageRegistrationsParams {
  page: number;
  paginate: number;
  search?: string;
  package_id?: number | null;
  user_id?: number | null;
  orderBy?: string;
  order?: string;
}

const transformListResponse = (response: {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: PackageRegistration[];
    last_page: number;
    total: number;
    per_page: number;
  };
}): PackageRegistrationListResponse => ({
  data: response.data.data,
  last_page: response.data.last_page,
  current_page: response.data.current_page,
  total: response.data.total,
  per_page: response.data.per_page,
});

export const packageRegistrationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPackageRegistrations: builder.query<
      PackageRegistrationListResponse,
      GetPackageRegistrationsParams
    >({
      query: ({
        page,
        paginate,
        search = "",
        package_id,
        user_id,
        orderBy,
        order,
      }) => {
        const params: Record<string, string | number | undefined> = {
          page,
          paginate,
          search,
        };
        if (package_id != null) params.package_id = package_id;
        if (user_id != null) params.user_id = user_id;
        if (orderBy != null) params.orderBy = orderBy;
        if (order != null) params.order = order;
        return { url: "/package/registrations", method: "GET", params };
      },
      transformResponse: transformListResponse,
    }),

    getPackageRegistrationById: builder.query<PackageRegistration, number>({
      query: (id) => ({
        url: `/package/registrations/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PackageRegistration;
      }) => response.data,
    }),

    // getPackageRegistrationUsageSummary: builder.query<
    //   PackageRegistrationUsageSummary,
    //   number
    // >({
    //   query: (id) => ({
    //     url: `/package/registrations/${id}/usage-summary`,
    //     method: "GET",
    //   }),
    //   transformResponse: (response: {
    //     code: number;
    //     message: string;
    //     data: PackageRegistrationUsageSummary;
    //   }) => response.data,
    // }),

    createPackageRegistration: builder.mutation<
      PackageRegistration,
      PackageRegistrationStorePayload
    >({
      query: (body) => ({
        url: "/package/registrations",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PackageRegistration;
      }) => response.data,
    }),

    updatePackageRegistration: builder.mutation<
      PackageRegistration,
      { id: number; payload: Partial<PackageRegistrationStorePayload> }
    >({
      query: ({ id, payload }) => ({
        url: `/package/registrations/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PackageRegistration;
      }) => response.data,
    }),

    deletePackageRegistration: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/package/registrations/${id}`,
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
  useGetPackageRegistrationsQuery,
  useGetPackageRegistrationByIdQuery,
//   useGetPackageRegistrationUsageSummaryQuery,
  useCreatePackageRegistrationMutation,
  useUpdatePackageRegistrationMutation,
  useDeletePackageRegistrationMutation,
} = packageRegistrationApi;
