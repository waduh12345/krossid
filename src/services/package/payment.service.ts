import { apiSlice } from "../base-query";
import type {
  PackagePayment,
  PackagePaymentListResponse,
  PackagePaymentStorePayload,
  PackagePaymentApprovePayload,
} from "@/types/package/payment";

interface GetPackagePaymentsParams {
  page: number;
  paginate: number;
  search?: string;
  package_registration_id?: number | null;
  status?: string | null;
  orderBy?: string;
  order?: string;
}

const transformListResponse = (response: {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: PackagePayment[];
    last_page: number;
    total: number;
    per_page: number;
  };
}): PackagePaymentListResponse => ({
  data: response.data.data,
  last_page: response.data.last_page,
  current_page: response.data.current_page,
  total: response.data.total,
  per_page: response.data.per_page,
});

export const packagePaymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPackagePayments: builder.query<
      PackagePaymentListResponse,
      GetPackagePaymentsParams
    >({
      query: ({
        page,
        paginate,
        search = "",
        package_registration_id,
        status,
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
        if (status != null) params.status = status;
        if (orderBy != null) params.orderBy = orderBy;
        if (order != null) params.order = order;
        return { url: "/package/payments", method: "GET", params };
      },
      transformResponse: transformListResponse,
      providesTags: (result, _error, arg) =>
        result
          ? [
              {
                type: "PackagePayment" as const,
                id: `list-${arg.package_registration_id ?? "all"}`,
              },
            ]
          : [],
    }),

    getPackagePaymentById: builder.query<PackagePayment, number>({
      query: (id) => ({ url: `/package/payments/${id}`, method: "GET" }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PackagePayment;
      }) => response.data,
    }),

    createPackagePayment: builder.mutation<
      PackagePayment,
      PackagePaymentStorePayload
    >({
      query: (body) => ({
        url: "/package/payments",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PackagePayment;
      }) => response.data,
    }),

    updatePackagePayment: builder.mutation<
      PackagePayment,
      { id: number; payload: Partial<PackagePaymentStorePayload> }
    >({
      query: ({ id, payload }) => ({
        url: `/package/payments/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PackagePayment;
      }) => response.data,
    }),

    deletePackagePayment: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/package/payments/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: unknown;
      }) => ({ code: response.code, message: response.message }),
    }),

    approvePackagePayment: builder.mutation<
      PackagePayment,
      { id: number; payload: PackagePaymentApprovePayload }
    >({
      query: ({ id, payload }) => ({
        url: `/package/payments/${id}/approve`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: PackagePayment;
      }) => response.data,
      invalidatesTags: () => [{ type: "PackagePayment" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPackagePaymentsQuery,
  useGetPackagePaymentByIdQuery,
  useCreatePackagePaymentMutation,
  useUpdatePackagePaymentMutation,
  useDeletePackagePaymentMutation,
  useApprovePackagePaymentMutation,
} = packagePaymentApi;
