import { apiSlice } from "../base-query";
import type {
  PackageRegistrationLog,
  PackageRegistrationLogListResponse,
  PackageRegistrationLogStorePayload,
  PackageRegistrationLogUpdatePayload,
} from "@/types/package/registration-log";

interface GetPackageRegistrationLogsParams {
  page: number;
  paginate: number;
  search?: string;
  package_registration_id?: number | null;
  orderBy?: string;
  order?: string;
}

const transformListResponse = (response: {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: PackageRegistrationLog[];
    last_page: number;
    total: number;
    per_page: number;
  };
}): PackageRegistrationLogListResponse => ({
  data: response.data.data,
  last_page: response.data.last_page,
  current_page: response.data.current_page,
  total: response.data.total,
  per_page: response.data.per_page,
});

export const packageRegistrationLogApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPackageRegistrationLogs: builder.query<
      PackageRegistrationLogListResponse,
      GetPackageRegistrationLogsParams
    >({
      query: ({
        page,
        paginate,
        search = "",
        package_registration_id,
        orderBy,
        order,
      }) => {
        const params: Record<string, string | number | undefined> = {
          page,
          paginate,
          search,
        };
        if (package_registration_id != null)
          params.package_registration_id = package_registration_id;
        if (orderBy != null) params.orderBy = orderBy;
        if (order != null) params.order = order;
        return { url: "/package/registration-logs", method: "GET", params };
      },
      transformResponse: transformListResponse,
    }),

    getPackageRegistrationLogById: builder.query<
      PackageRegistrationLog,
      number
    >({
      query: (id) => ({
        url: `/package/registration-logs/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PackageRegistrationLog;
      }) => response.data,
    }),

    createPackageRegistrationLog: builder.mutation<
      PackageRegistrationLog,
      PackageRegistrationLogStorePayload
    >({
      query: (body) => ({
        url: "/package/registration-logs",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PackageRegistrationLog;
      }) => response.data,
    }),

    updatePackageRegistrationLog: builder.mutation<
      PackageRegistrationLog,
      { id: number; payload: PackageRegistrationLogUpdatePayload }
    >({
      query: ({ id, payload }) => ({
        url: `/package/registration-logs/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PackageRegistrationLog;
      }) => response.data,
    }),

    deletePackageRegistrationLog: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/package/registration-logs/${id}`,
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
  useGetPackageRegistrationLogsQuery,
  useGetPackageRegistrationLogByIdQuery,
  useCreatePackageRegistrationLogMutation,
  useUpdatePackageRegistrationLogMutation,
  useDeletePackageRegistrationLogMutation,
} = packageRegistrationLogApi;
