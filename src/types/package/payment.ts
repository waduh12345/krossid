import type { PackageRegistration } from "./registration";

export type PackagePaymentStatus = "pending" | "approved" | "rejected";

/** Minimal user shape for approved_by relation */
export interface PackagePaymentApprovedBy {
  id: number;
  name?: string;
  email?: string;
}

export interface PackagePayment {
  id: number;
  package_registration_id: number;
  amount: number;
  payment_method: string | null;
  proof_file: string | null;
  status: PackagePaymentStatus;
  notes: string | null;
  paid_at: string | null;
  approved_at: string | null;
  approved_by: number | null;
  package_registration?: PackageRegistration & {
    package?: { id: number; name: string } | null;
    user?: { id: number; name?: string; email?: string } | null;
  } | null;
  approvedByUser?: PackagePaymentApprovedBy | null;
  created_at?: string;
  updated_at?: string;
}

export interface PackagePaymentListResponse {
  data: PackagePayment[];
  last_page: number;
  current_page: number;
  total: number;
  per_page: number;
}

export type PackagePaymentStorePayload = Pick<
  PackagePayment,
  "package_registration_id" | "amount" | "payment_method" | "proof_file" | "notes" | "paid_at"
> & { paid_at?: string | null };

export interface PackagePaymentApprovePayload {
  status: "approved" | "rejected";
  notes?: string | null;
}
