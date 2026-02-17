"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetProgramLearningSaleByIdQuery,
  useCreateProgramLearningSaleMutation,
  useUpdateProgramLearningSaleMutation,
} from "@/services/programs/learning-sales.service";
import { useGetProgramLearningsQuery } from "@/services/programs/learning.service";
import { useGetUsersListQuery } from "@/services/users-management.service";
import Swal from "sweetalert2";
import { X, Loader2, BookOpen, User } from "lucide-react";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  id?: number;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  program_learning_id: number | null;
  sales_id: number | null;
  started_at: string;
  completed_at: string;
  status: boolean;
};

function toInputDateTime(d: string | null): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function LearningSalesForm({
  open,
  mode,
  id,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  const { data: detail, isFetching } = useGetProgramLearningSaleByIdQuery(
    id ?? 0,
    { skip: !isEdit || !id }
  );

  const { data: learningsResp } = useGetProgramLearningsQuery({
    page: 1,
    paginate: 500,
  });
  const learnings = useMemo(() => learningsResp?.data ?? [], [learningsResp]);

  const { data: usersResp } = useGetUsersListQuery({
    page: 1,
    paginate: 500,
    role_id: 3, // sales role
  });
  const salesUsers = useMemo(() => usersResp?.data ?? [], [usersResp]);

  const [createItem, { isLoading: creating }] =
    useCreateProgramLearningSaleMutation();
  const [updateItem, { isLoading: updating }] =
    useUpdateProgramLearningSaleMutation();

  const initial: FormState = useMemo(
    () => ({
      program_learning_id: detail?.program_learning_id ?? null,
      sales_id: detail?.sales_id ?? null,
      started_at: toInputDateTime(detail?.started_at ?? null),
      completed_at: toInputDateTime(detail?.completed_at ?? null),
      status: detail?.status === 1 || detail?.status === true || !isEdit,
    }),
    [detail, isEdit]
  );

  const [form, setForm] = useState<FormState>(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [initial, open]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.program_learning_id == null) {
      await Swal.fire({
        icon: "warning",
        title: "Learning is required",
      });
      return;
    }

    if (form.sales_id == null) {
      await Swal.fire({
        icon: "warning",
        title: "Sales is required",
      });
      return;
    }

    try {
      if (isEdit && id) {
        await updateItem({
          id,
          payload: {
            started_at: form.started_at || null,
            completed_at: form.completed_at || null,
            status: form.status ? 1 : 0,
          },
        }).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Learning sales updated successfully",
        });
      } else {
        await createItem({
          program_learning_id: form.program_learning_id,
          sales_id: form.sales_id,
          started_at: form.started_at || undefined,
          completed_at: form.completed_at || undefined,
        }).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Learning sales created successfully",
        });
      }
      onSuccess();
    } catch (err: unknown) {
      let errorMessage = "Failed to process the request.";
      if (
        err &&
        typeof err === "object" &&
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "message" in err.data
      ) {
        errorMessage =
          (err.data as { message?: string }).message || errorMessage;
      }
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Assignment" : "Assign Sales to Learning"}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-6 py-4">
          {isFetching && isEdit ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="mt-2">Loading...</p>
            </div>
          ) : (
            <form
              id="learning-sales-form"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-semibold text-gray-700">
                  <BookOpen className="h-4 w-4 text-sky-600" />
                  Learning <span className="text-red-500">*</span>
                </Label>
                <select
                  value={form.program_learning_id ?? ""}
                  onChange={(e) =>
                    set(
                      "program_learning_id",
                      e.target.value === ""
                        ? null
                        : Number(e.target.value)
                    )
                  }
                  disabled={isEdit}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-70"
                >
                  <option value="">— Pilih Learning —</option>
                  {learnings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-semibold text-gray-700">
                  <User className="h-4 w-4 text-sky-600" />
                  Sales <span className="text-red-500">*</span>
                </Label>
                <select
                  value={form.sales_id ?? ""}
                  onChange={(e) =>
                    set(
                      "sales_id",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  disabled={isEdit}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-70"
                >
                  <option value="">— Pilih Sales —</option>
                  {salesUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                {salesUsers.length === 0 && (
                  <p className="text-xs text-amber-600">
                    Tidak ada user dengan role Sales. Tambah user sales terlebih dahulu.
                  </p>
                )}
              </div>

              {(isEdit || form.started_at || form.completed_at) && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">
                      Started At
                    </Label>
                    <Input
                      type="datetime-local"
                      value={form.started_at}
                      onChange={(e) => set("started_at", e.target.value)}
                      className="focus-visible:ring-sky-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">
                      Completed At
                    </Label>
                    <Input
                      type="datetime-local"
                      value={form.completed_at}
                      onChange={(e) => set("completed_at", e.target.value)}
                      className="focus-visible:ring-sky-500"
                    />
                  </div>
                </div>
              )}

              {isEdit && (
                <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3">
                  <input
                    id="ls-status"
                    type="checkbox"
                    className="h-5 w-5 cursor-pointer rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    checked={form.status}
                    onChange={(e) => set("status", e.target.checked)}
                  />
                  <Label
                    htmlFor="ls-status"
                    className="cursor-pointer font-bold text-gray-700"
                  >
                    Active
                  </Label>
                </div>
              )}
            </form>
          )}
        </div>

        {!isFetching && (
          <div className="flex justify-end gap-3 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              form="learning-sales-form"
              type="submit"
              className="bg-sky-600 hover:bg-sky-700"
              disabled={creating || updating}
            >
              {creating || updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Assign"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
