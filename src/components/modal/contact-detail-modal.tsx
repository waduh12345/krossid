"use client";

import { Button } from "@/components/ui/button";
import { useGetContactByIdQuery } from "@/services/contact.service";
import { X, Loader2, User, Mail, Phone, FileText, MessageSquare, Calendar } from "lucide-react";

type Props = {
  open: boolean;
  id: number;
  onClose: () => void;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ContactDetailModal({ open, id, onClose }: Props) {
  const { data: contact, isFetching } = useGetContactByIdQuery(id, {
    skip: !open,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Detail Contact</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {isFetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : contact ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
              <User className="mt-0.5 h-5 w-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">Nama</p>
                <p className="text-sm font-semibold text-gray-800">
                  {contact.name}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                <Mail className="mt-0.5 h-5 w-5 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500">Email</p>
                  <p className="text-sm font-semibold text-gray-800 break-all">
                    {contact.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                <Phone className="mt-0.5 h-5 w-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Telepon</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {contact.phone || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
              <FileText className="mt-0.5 h-5 w-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">Subject</p>
                <p className="text-sm font-semibold text-gray-800">
                  {contact.subject}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
              <MessageSquare className="mt-0.5 h-5 w-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">Pesan</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {contact.message}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
              <Calendar className="mt-0.5 h-5 w-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">Tanggal Masuk</p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatDate(contact.created_at)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-lg"
              >
                Tutup
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Data tidak ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
