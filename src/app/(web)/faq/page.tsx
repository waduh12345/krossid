"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  Users,
  DollarSign,
  Settings,
  Lock,
  TrendingUp,
  Mail,
  Phone,
  MessageCircle
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/contexts/i18n-context";

export default function FAQPage() {
  const { t, language } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqCategories = [
    {
      title: t.faq.categories.gettingStarted.title,
      icon: Users,
      questions: [
        t.faq.categories.gettingStarted.questions.createAccount,
        t.faq.categories.gettingStarted.questions.roles,
        t.faq.categories.gettingStarted.questions.freeToUse,
      ],
    },
    {
      title: t.faq.categories.securityPrivacy.title,
      icon: ShieldCheck,
      questions: [
        t.faq.categories.securityPrivacy.questions.maskedIdentity,
        t.faq.categories.securityPrivacy.questions.dataSecure,
        t.faq.categories.securityPrivacy.questions.deleteAccount,
      ],
    },
    {
      title: t.faq.categories.programsParticipation.title,
      icon: TrendingUp,
      questions: [
        t.faq.categories.programsParticipation.questions.registerProgram,
        t.faq.categories.programsParticipation.questions.ownerSeeInfo,
        t.faq.categories.programsParticipation.questions.multiplePrograms,
        t.faq.categories.programsParticipation.questions.trackPerformance,
      ],
    },
    {
      title: t.faq.categories.affiliateSales.title,
      icon: DollarSign,
      questions: [
        t.faq.categories.affiliateSales.questions.becomeAffiliate,
        t.faq.categories.affiliateSales.questions.getReferralCode,
        t.faq.categories.affiliateSales.questions.shareReferralLink,
        t.faq.categories.affiliateSales.questions.commissionCalculation,
      ],
    },
    {
      title: t.faq.categories.accountSettings.title,
      icon: Settings,
      questions: [
        t.faq.categories.accountSettings.questions.updateProfile,
        t.faq.categories.accountSettings.questions.changePassword,
        t.faq.categories.accountSettings.questions.forgotPassword,
        t.faq.categories.accountSettings.questions.changeRole,
      ],
    },
    {
      title: t.faq.categories.technicalSupport.title,
      icon: Lock,
      questions: [
        t.faq.categories.technicalSupport.questions.platformNotLoading,
        t.faq.categories.technicalSupport.questions.registrationTrouble,
        t.faq.categories.technicalSupport.questions.reportBug,
      ],
    },
  ];

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen relative py-12 md:py-20">
      {/* Hero Section */}
      <section className="relative mb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 mb-6">
              <HelpCircle size={14} className="text-[#7ED321]" />
              <span className="text-xs font-black text-white/80 uppercase tracking-widest">
                {t.faq.badge}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
              {t.faq.heroTitle}
              <br />
              <span className="bg-gradient-to-r from-[#367CC0] to-[#DF9B35] bg-clip-text text-transparent">
                {t.faq.heroTitleHighlight}
              </span>
            </h1>

            <p className="text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
              {t.faq.heroDescription}
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {faqCategories.map((category, catIndex) => (
              <motion.div
                key={catIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#367CC0]/20 to-[#DF9B35]/20 flex items-center justify-center">
                      <category.icon size={20} className="text-[#367CC0]" />
                    </div>
                    <h2 className="text-xl font-black text-white">{category.title}</h2>
                  </div>
                </div>

                <div className="divide-y divide-white/5">
                  {category.questions.map((faq, qIndex) => {
                    const globalIndex = catIndex * 100 + qIndex;
                    const isOpen = openIndex === globalIndex;

                    return (
                      <div key={qIndex} className="overflow-hidden">
                        <button
                          onClick={() => toggleQuestion(globalIndex)}
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-all group"
                        >
                          <span className="text-white font-bold pr-4 flex-1">{faq.q}</span>
                          {isOpen ? (
                            <ChevronUp size={20} className="text-[#367CC0] flex-shrink-0" />
                          ) : (
                            <ChevronDown size={20} className="text-white/40 group-hover:text-[#367CC0] flex-shrink-0 transition-colors" />
                          )}
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6 text-white/70 leading-relaxed">
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="relative mt-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto bg-gradient-to-br from-[#367CC0]/10 to-[#DF9B35]/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 text-center"
          >
            <MessageCircle size={48} className="text-[#367CC0] mx-auto mb-6" />
            <h2 className="text-3xl font-black text-white mb-4">{t.faq.stillHaveQuestions}</h2>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              {t.faq.stillHaveQuestionsDesc}
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#367CC0] to-[#DF9B35] hover:from-[#2d6699] hover:to-[#c7892a] text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-[#367CC0]/20"
              >
                <Mail size={18} />
                {t.faq.contactSupport}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
