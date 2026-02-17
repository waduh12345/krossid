"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreatePackagePaymentMutation,
  useGetPackagePaymentByIdQuery,
  useUpdatePackagePaymentMutation,
} from "@/services/package/payment.service";
import { useGetPackageRegistrationsQuery } from "@/services/package/registration.service";
import type { PackagePaymentStorePayload } from "@/types/package/payment";
import type { PackageRegistration } from "@/types/package/registration";
import Swal from "sweetalert2";
import { X, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  id?: number;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  package_registration_id: number | null;
  amount: string;
  payment_method: string;
  proof_file: string;
  notes: string;
  paid_at: string;
};

interface ApiError {
  data?: { message?: string };
}

export default function PackagePaymentForm({
  open,
  mode,
  id,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  const { data: detail, isFetching: fetchingDetail } =
    useGetPackagePaymentByIdQuery(id ?? 0, {
      skip: !isEdit || !id,
    });

  const [createPayment, { isLoading: creating }] =
    useCreatePackagePaymentMutation();
  const [updatePayment, { isLoading: updating }] =
    useUpdatePackagePaymentMutation();

  const { data: regsResp } = useGetPackageRegistrationsQuery({
    page: 1,
    paginate: 200,
    search: "",
  });
  const registrations: PackageRegistration[] = useMemo(
    () => (regsResp?.data ?? []) as PackageRegistration[],
    [regsResp]
  );

  const initial: FormState = useMemo(
    () => ({
      package_registration_id: detail?.package_registration_id ?? null,
      amount: detail?.amount != null ? String(detail.amount) : "",
      payment_method: detail?.payment_method ?? "",
      proof_file: detail?.proof_file ?? "",
      notes: detail?.notes ?? "",
      paid_at: detail?.paid_at
        ? detail.paid_at.slice(0, 16)
        : "",
    }),
    [detail]
  );

  const [form, setForm] = useState<FormState>(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [initial, open]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((s) => ({ ...s, [k]: v }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.package_registration_id == null || form.package_registration_id === 0) {
      await Swal.fire({ icon: "warning", title: "Registration is required" });
      return;
    }
    const amountNum = Number(form.amount);
    if (Number.isNaN(amountNum) || amountNum < 0) {
      await Swal.fire({ icon: "warning", title: "Amount must be a valid number" });
      return;
    }

    const payload: PackagePaymentStorePayload = {
      package_registration_id: form.package_registration_id,
      amount: amountNum,
      payment_method: form.payment_method.trim() || null,
      proof_file: form.proof_file.trim() || null,
      notes: form.notes.trim() || null,
      paid_at: form.paid_at.trim() || null,
    };

    try {
      if (isEdit && id) {
        await updatePayment({ id, payload }).unwrap();
        await Swal.fire({ icon: "success", title: "Payment Updated" });
      } else {
        await createPayment(payload).unwrap();
        await Swal.fire({ icon: "success", title: "Payment Created" });
      }
      onSuccess();
    } catch (err: unknown) {
      const error = err as ApiError;
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.data?.message ?? "Request failed",
      });
    }
  }

  if (!open) return null;

  const loading = creating || updating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl max-h-[98vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Payment" : "Create Payment"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {fetchingDetail ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="package_registration_id">Registration *</Label>
              <select
                id="package_registration_id"
                value={form.package_registration_id ?? ""}
                onChange={(e) =>
                  set(
                    "package_registration_id",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="h-9 w-full rounded-xl border bg-background px-3 text-sm"
                required
                disabled={isEdit}
              >
                <option value="">Select registration</option>
                {registrations.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.package?.name ?? `#${reg.package_id}`} –{" "}
                    {reg.user
                      ? reg.user.name ?? reg.user.email ?? `#${reg.user_id}`
                      : "-"}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step="any"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="0"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Input
                id="payment_method"
                value={form.payment_method}
                onChange={(e) => set("payment_method", e.target.value)}
                placeholder="e.g. bank_transfer"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proof_file">Proof File (URL)</Label>
              <Input
                id="proof_file"
                value={form.proof_file}
                onChange={(e) => set("proof_file", e.target.value)}
                placeholder="URL or path"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paid_at">Paid At</Label>
              <Input
                id="paid_at"
                type="datetime-local"
                value={form.paid_at}
                onChange={(e) => set("paid_at", e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Optional"
                className="rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEdit ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
