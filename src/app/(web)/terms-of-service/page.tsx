"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Scale, AlertTriangle, CheckCircle2, XCircle, Shield, Gavel, Users } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";

export default function TermsOfServicePage() {
  const { t } = useI18n();

  const sections = [
    {
      icon: FileText,
      title: t.termsOfService.sections.acceptanceOfTerms.title,
      content: t.termsOfService.sections.acceptanceOfTerms.content,
    },
    {
      icon: Users,
      title: t.termsOfService.sections.userAccounts.title,
      content: t.termsOfService.sections.userAccounts.content,
    },
    {
      icon: Shield,
      title: t.termsOfService.sections.platformUsage.title,
      content: t.termsOfService.sections.platformUsage.content,
    },
    {
      icon: Scale,
      title: t.termsOfService.sections.programParticipation.title,
      content: t.termsOfService.sections.programParticipation.content,
    },
    {
      icon: Gavel,
      title: t.termsOfService.sections.intellectualProperty.title,
      content: t.termsOfService.sections.intellectualProperty.content,
    },
    {
      icon: AlertTriangle,
      title: t.termsOfService.sections.limitationOfLiability.title,
      content: t.termsOfService.sections.limitationOfLiability.content,
    },
    {
      icon: CheckCircle2,
      title: t.termsOfService.sections.paymentAndFees.title,
      content: t.termsOfService.sections.paymentAndFees.content,
    },
    {
      icon: XCircle,
      title: t.termsOfService.sections.termination.title,
      content: t.termsOfService.sections.termination.content,
    },
  ];

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
              <Scale size={14} className="text-[#DF9B35]" />
              <span className="text-xs font-black text-white/80 uppercase tracking-widest">
                {t.termsOfService.badge}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
              {t.termsOfService.heroTitle}
              <br />
              <span className="bg-gradient-to-r from-[#367CC0] to-[#DF9B35] bg-clip-text text-transparent">
                {t.termsOfService.heroTitleHighlight}
              </span>
            </h1>

            <p className="text-xl text-white/60 mb-4">
              {t.termsOfService.lastUpdated}
            </p>
            <p className="text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
              {t.termsOfService.heroDescription}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#367CC0]/20 to-[#DF9B35]/20 flex items-center justify-center flex-shrink-0">
                    <section.icon size={24} className="text-[#DF9B35]" />
                  </div>
                  <h2 className="text-2xl font-black text-white">{section.title}</h2>
                </div>
                <div className="space-y-3 text-white/70 leading-relaxed pl-16">
                  {section.content.map((item, idx) => (
                    <p key={idx} className={item.startsWith("•") ? "pl-4" : ""}>
                      {item}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative mt-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto bg-gradient-to-br from-[#367CC0]/10 to-[#DF9B35]/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
          >
            <h2 className="text-3xl font-black text-white mb-4">{t.termsOfService.contact.title}</h2>
            <p className="text-white/70 mb-6">
              {t.termsOfService.contact.description}
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <a
                href={`mailto:${t.termsOfService.contact.email}`}
                className="text-[#367CC0] hover:text-[#DF9B35] font-bold transition-colors"
              >
                {t.termsOfService.contact.email}
              </a>
              <span className="text-white/30">•</span>
              <a
                href="/contact-us"
                className="text-[#367CC0] hover:text-[#DF9B35] font-bold transition-colors"
              >
                {t.termsOfService.contact.contactUs}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
