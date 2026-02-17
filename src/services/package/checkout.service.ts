import { apiSlice } from "../base-query";
import type {
  PackageCheckoutPayload,
  PackageCheckoutResponse,
  PackageCheckoutPayloadWithFile,
} from "@/types/package/checkout";

function isFormDataPayload(
  body: PackageCheckoutPayloadWithFile
): body is PackageCheckoutPayloadWithFile & { proof_file: File } {
  return body.proof_file != null && typeof body.proof_file === "object" && "name" in body.proof_file;
}

/**
 * Checkout API: payload gabungan (form daftar + package + payment) dikirim ke Laravel.
 * Jika proof_file berupa File, request dikirim sebagai multipart/form-data.
 * Laravel: POST /package/checkout
 * Body: JSON (PackageCheckoutPayload) atau FormData (dengan proof_file = file upload)
 */
export const packageCheckoutApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    submitCheckout: builder.mutation<
      PackageCheckoutResponse,
      PackageCheckoutPayloadWithFile
    >({
      query: (body) => {
        if (isFormDataPayload(body)) {
          const formData = new FormData();
          formData.append("name", body.name);
          formData.append("email", body.email);
          formData.append("phone", body.phone);
          formData.append("office", body.office);
          formData.append("address", body.address);
          if (body.user_id != null) formData.append("user_id", String(body.user_id));
          formData.append("package_id", String(body.package_id));
          formData.append("billing_period", body.billing_period);
          formData.append("amount", String(body.amount));
          formData.append("payment_method", body.payment_method ?? "");
          formData.append("notes", body.notes ?? "");
          formData.append("paid_at", body.paid_at ?? "");
          formData.append("proof_file", body.proof_file);
          return {
            url: "/package/checkout",
            method: "POST",
            body: formData,
          };
        }
        const { proof_file, ...rest } = body;
        const jsonBody: PackageCheckoutPayload = {
          ...rest,
          proof_file: typeof proof_file === "string" ? proof_file : null,
        };
        return {
          url: "/package/checkout",
          method: "POST",
          body: jsonBody,
        };
      },
      transformResponse: (response: PackageCheckoutResponse) => response,
    }),
  }),
  overrideExisting: false,
});

export const { useSubmitCheckoutMutation } = packageCheckoutApi;
