"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Zap,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { usePublicAffiliateSalesMutation } from "@/services/public/register.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  programTitle: string;
  programId?: number;
  email?: string;
};

export default function AffiliateRegisterModal({
  isOpen,
  onClose,
  programTitle,
  programId,
  email,
}: Props) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [createRegister] = usePublicAffiliateSalesMutation();

  const [formData, setFormData] = useState({
    program_id: Number(programId) || 0,
    email: "",
    is_corporate: 0,
  });

  /** Sync email from session if logged in */
  useEffect(() => {
    if (isLoggedIn && session?.user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: session.user.email!,
      }));
    }
  }, [isLoggedIn, session]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.email) {
        Swal.fire({
          icon: "error",
          title: "Email Required",
          text: "Please provide a valid email address.",
        });
        setIsLoading(false);
        return;
      }

      const emailDomain = formData.email.split("@")[1]?.toLowerCase();
      const sessionEmailDomain = session?.user?.email?.split("@")[1]?.toLowerCase();

      const is_corporate =
        emailDomain && sessionEmailDomain && emailDomain === sessionEmailDomain;
    

      formData.is_corporate = is_corporate ? 1 : 0;

      await createRegister(formData).unwrap();

      await Swal.fire({
        icon: "success",
        title: "Application Sent!",
        text: `Permohonan affiliasi Anda untuk "${programTitle}" sedang ditinjau oleh Owner.`,
        confirmButtonColor: "#4A90E2",
      });

      onClose();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="relative bg-[#4A90E2] p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-[#F2A93B]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
              Affiliate Application
            </span>
          </div>

          <h2 className="text-2xl font-black">
            Apply for {programTitle}
          </h2>
          <p className="text-blue-100 text-xs mt-2 italic">
            Step {step} of 2:{" "}
            {step === 1 ? "Verify Email" : "Marketing Strategy"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            {isLoggedIn ? (
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="w-5 h-5 text-green-500" />
                  <h4 className="font-black text-gray-900 dark:text-white">
                    Logged in account
                  </h4>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-[10px] font-black uppercase text-gray-400">
                    Email
                  </span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {session?.user?.email}
                  </span>
                </div>

                <p className="mt-4 text-[10px] text-center text-blue-400 font-bold italic">
                  * Email will be used for this application
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="name@email.com"
                    className="pl-11 h-12 rounded-xl bg-gray-50 border-gray-100"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              onClick={() => step === 1 && setStep(2)}
              className={`flex-1 h-12 rounded-xl font-black uppercase tracking-widest bg-[#F2A93B]`}
            >
              Submit Application
            </Button>
          </div>

          <p className="text-[10px] text-center text-gray-400 mt-6">
            {isLoggedIn
              ? "You are applying using your logged-in email."
              : "You will apply using the email above."}
          </p>
        </form>
      </div>
    </div>
  );
}
