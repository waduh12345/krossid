import { apiSlice } from "@/services/base-query";

export const registerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Public Register
    publicRegister: builder.mutation<
      { code: number; message: string; data: unknown },
      {
        program_id: number;
        name: string;
        email: string;
        phone: string;
        parameter_value?: string;
        referral?: string;
      }
    >({
      query: (payload) => ({
        url: `/public/programs/register`,
        method: "POST",
        body: payload,
      }),
    }),

    // ✅ Public Affiliate Sales
    publicAffiliateSales: builder.mutation<
      { code: number; message: string; data: unknown },
      {
        program_id: number;
        email: string;
        is_corporate?: number;
      }
    >({
      query: (payload) => ({
        url: `/public/programs/sales`,
        method: "POST",
        body: payload,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  usePublicRegisterMutation,
  usePublicAffiliateSalesMutation,
} = registerApi;