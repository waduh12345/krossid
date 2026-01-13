// services/auth.service.ts
import { apiSlice } from "./base-query";
import type {
  RegisterPayload,
  User,
  ValidateOtpPayload,
  AuthTokenResponse,
  ForgotPasswordPayload, // ✅ Import baru
  ResetPasswordPayload, // ✅ Import baru
} from "@/types/user";

// Helper type untuk response standar
type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /login
    login: builder.mutation<
      | { token: string; user: User }
      | ApiEnvelope<{ token: string; user: User }>,
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    // POST /logout
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    // GET /me
    getMe: builder.query<User, void>({
      query: () => ({
        url: "/me?forceRefresh=1",
        method: "GET",
      }),
      transformResponse: (res: User | ApiEnvelope<User>) =>
        "data" in res ? res.data : res,
      keepUnusedDataFor: 300,
      providesTags: (res) =>
        res?.id != null
          ? [
              { type: "User" as const, id: "ME" },
              { type: "User" as const, id: res.id },
            ]
          : [{ type: "User" as const, id: "ME" }],
    }),

    // POST /register
    register: builder.mutation<ApiEnvelope<AuthTokenResponse>, RegisterPayload>(
      {
        query: (payload) => ({
          url: "/register",
          method: "POST",
          body: payload,
        }),
      }
    ),

    // POST /register/resend-otp (Resend OTP Register - Pakai Token Header)
    resendOtp: builder.mutation<ApiEnvelope<string>, string>({
      query: (token) => ({
        url: "/register/resend-otp",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),

    // PUT /register (Validate OTP Register)
    validateOtp: builder.mutation<
      ApiEnvelope<string>,
      ValidateOtpPayload & { token: string }
    >({
      query: ({ token, ...body }) => ({
        url: "/register",
        method: "PUT",
        body: body,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    // ✅ POST /password/reset (Request Forgot Password)
    forgotPassword: builder.mutation<
      ApiEnvelope<string>,
      ForgotPasswordPayload
    >({
      query: (payload) => ({
        url: "/password/reset",
        method: "POST",
        body: payload,
      }),
    }),

    // ✅ POST /password/resend-otp (Resend OTP Forgot Password)
    resendForgotPasswordOtp: builder.mutation<
      ApiEnvelope<string>,
      ForgotPasswordPayload
    >({
      query: (payload) => ({
        url: "/password/resend-otp",
        method: "POST",
        body: payload,
      }),
    }),

    // ✅ PUT /password/reset (Validate OTP & Set New Password)
    resetPassword: builder.mutation<ApiEnvelope<string>, ResetPasswordPayload>({
      query: (payload) => ({
        url: "/password/reset",
        method: "PUT",
        body: payload,
      }),
    }),

    // ✅ POST /me?_method=PUT (Update Profile with FormData)
    updateProfile: builder.mutation<
      ApiEnvelope<User>,
      {
        name: string;
        email: string;
        phone: string;
        image?: File | null;
        password?: string | null;
        password_confirmation?: string | null;
      }
    >({
      query: (payload) => {
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("email", payload.email);
        formData.append("phone", payload.phone);
        
        if (payload.image) {
          formData.append("image", payload.image);
        }
        if (payload.password) {
          formData.append("password", payload.password);
        }
        if (payload.password_confirmation) {
          formData.append("password_confirmation", payload.password_confirmation);
        }

        return {
          url: "/me?_method=PUT",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useRegisterMutation,
  useResendOtpMutation,
  useValidateOtpMutation,
  useForgotPasswordMutation,
  useResendForgotPasswordOtpMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
} = authApi;