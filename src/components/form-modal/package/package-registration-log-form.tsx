"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  useCreatePackageRegistrationLogMutation,
  useGetPackageRegistrationLogByIdQuery,
  useUpdatePackageRegistrationLogMutation,
} from "@/services/package/registration-log.service";
import { useGetPackageRegistrationsQuery } from "@/services/package/registration.service";
import type {
  PackageRegistrationLogStorePayload,
  PackageRegistrationLogUpdatePayload,
} from "@/types/package/registration-log";
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
  action: string;
  delta_users: string;
  delta_campaigns: string;
  notes: string;
};

interface ApiError {
  data?: { message?: string };
}

export default function PackageRegistrationLogForm({
  open,
  mode,
  id,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  const { data: detail, isFetching: fetchingDetail } =
    useGetPackageRegistrationLogByIdQuery(id ?? 0, {
      skip: !isEdit || !id,
    });

  const [createLog, { isLoading: creating }] =
    useCreatePackageRegistrationLogMutation();
  const [updateLog, { isLoading: updating }] =
    useUpdatePackageRegistrationLogMutation();

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
      action: detail?.action ?? "",
      delta_users: detail ? "" : "",
      delta_campaigns: detail ? "" : "",
      notes: detail?.notes ?? "",
    }),
    [detail]
  );

  const [form, setForm] = useState<FormState>({
    ...initial,
    delta_users: "",
    delta_campaigns: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        package_registration_id: detail?.package_registration_id ?? null,
        action: detail?.action ?? "",
        delta_users: "",
        delta_campaigns: "",
        notes: detail?.notes ?? "",
      });
    }
  }, [open, detail, isEdit]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((s) => ({ ...s, [k]: v }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit && id) {
      const payload: PackageRegistrationLogUpdatePayload = {
        action: form.action.trim() || null,
        notes: form.notes.trim() || null,
      };
      try {
        await updateLog({ id, payload }).unwrap();
        await Swal.fire({ icon: "success", title: "Log Updated" });
        onSuccess();
      } catch (err: unknown) {
        const error = err as ApiError;
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.data?.message ?? "Request failed",
        });
      }
      return;
    }

    if (form.package_registration_id == null || form.package_registration_id === 0) {
      await Swal.fire({ icon: "warning", title: "Registration is required" });
      return;
    }

    const payload: PackageRegistrationLogStorePayload = {
      package_registration_id: form.package_registration_id,
      action: form.action.trim() || null,
      delta_users: form.delta_users ? Number(form.delta_users) : undefined,
      delta_campaigns: form.delta_campaigns ? Number(form.delta_campaigns) : undefined,
      notes: form.notes.trim() || null,
    };

    try {
      await createLog(payload).unwrap();
      await Swal.fire({ icon: "success", title: "Log Created" });
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
            {isEdit ? "Edit Registration Log" : "Create Registration Log"}
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
                required={!isEdit}
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
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                value={form.action}
                onChange={(e) => set("action", e.target.value)}
                placeholder="e.g. usage_update"
                className="rounded-xl"
              />
            </div>
            {!isEdit && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="delta_users">Delta Users</Label>
                  <Input
                    id="delta_users"
                    type="number"
                    value={form.delta_users}
                    onChange={(e) => set("delta_users", e.target.value)}
                    placeholder="Optional"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delta_campaigns">Delta Campaigns</Label>
                  <Input
                    id="delta_campaigns"
                    type="number"
                    value={form.delta_campaigns}
                    onChange={(e) => set("delta_campaigns", e.target.value)}
                    placeholder="Optional"
                    className="rounded-xl"
                  />
                </div>
              </>
            )}
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
