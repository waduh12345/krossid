"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageCircle, 
  Clock,
  CheckCircle2,
  Loader2
} from "lucide-react";
import Swal from "sweetalert2";
import { useI18n } from "@/contexts/i18n-context";

export default function ContactUsPage() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      Swal.fire({
        icon: "success",
        title: t.contactUs.messages.messageSent,
        text: t.contactUs.messages.messageSentText,
        background: "#1e293b",
        color: "#fff",
        confirmButtonColor: "#367CC0",
      });
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: t.contactUs.contactInfo.email,
      value: "support@kross.id",
      href: "mailto:support@kross.id",
      color: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-400",
    },
    {
      icon: Phone,
      label: t.contactUs.contactInfo.phone,
      value: "+62 21 000 000",
      href: "tel:+6221000000",
      color: "from-yellow-500/20 to-yellow-600/20",
      iconColor: "text-yellow-400",
    },
    {
      icon: MapPin,
      label: t.contactUs.contactInfo.address,
      value: "Niaga Tower, Jakarta, Indonesia",
      href: "#",
      color: "from-green-500/20 to-green-600/20",
      iconColor: "text-green-400",
    },
    {
      icon: Clock,
      label: t.contactUs.contactInfo.businessHours,
      value: "Monday - Friday: 9:00 AM - 6:00 PM WIB",
      href: "#",
      color: "from-purple-500/20 to-purple-600/20",
      iconColor: "text-purple-400",
    },
  ];

  const subjects = [
    t.contactUs.form.subjects.generalInquiry,
    t.contactUs.form.subjects.technicalSupport,
    t.contactUs.form.subjects.accountIssues,
    t.contactUs.form.subjects.programQuestions,
    t.contactUs.form.subjects.billingPayments,
    t.contactUs.form.subjects.privacySecurity,
    t.contactUs.form.subjects.partnershipOpportunities,
    t.contactUs.form.subjects.other,
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
              <MessageCircle size={14} className="text-[#367CC0]" />
              <span className="text-xs font-black text-white/80 uppercase tracking-widest">
                {t.contactUs.badge}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
              {t.contactUs.heroTitle}
              <br />
              <span className="bg-gradient-to-r from-[#367CC0] to-[#DF9B35] bg-clip-text text-transparent">
                {t.contactUs.heroTitleHighlight}
              </span>
            </h1>

            <p className="text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
              {t.contactUs.heroDescription}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="relative mb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {contactInfo.map((info, index) => (
              <motion.a
                key={index}
                href={info.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-gradient-to-br ${info.color} backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all group`}
              >
                <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <info.icon size={24} className={info.iconColor} />
                </div>
                <h3 className="text-xs font-black text-white/60 uppercase tracking-wider mb-2">
                  {info.label}
                </h3>
                <p className="text-white font-bold">{info.value}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
                >
                  <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                    <Send size={24} className="text-[#367CC0]" />
                    {t.contactUs.form.title}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-white/60 uppercase tracking-wider mb-2">
                          {t.contactUs.form.fullName}
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 focus:border-[#367CC0]/50 transition-all"
                          placeholder={t.contactUs.form.fullNamePlaceholder}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-white/60 uppercase tracking-wider mb-2">
                          {t.contactUs.form.email}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 focus:border-[#367CC0]/50 transition-all"
                          placeholder={t.contactUs.form.emailPlaceholder}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-white/60 uppercase tracking-wider mb-2">
                          {t.contactUs.form.phone}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 focus:border-[#367CC0]/50 transition-all"
                          placeholder={t.contactUs.form.phonePlaceholder}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-white/60 uppercase tracking-wider mb-2">
                          {t.contactUs.form.subject}
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 focus:border-[#367CC0]/50 transition-all"
                        >
                          <option value="" className="bg-[#0f172a]">{t.contactUs.form.subjectPlaceholder}</option>
                          {subjects.map((subject) => (
                            <option key={subject} value={subject} className="bg-[#0f172a]">
                              {subject}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-white/60 uppercase tracking-wider mb-2">
                        {t.contactUs.form.message}
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#367CC0]/50 focus:border-[#367CC0]/50 transition-all resize-none"
                        placeholder={t.contactUs.form.messagePlaceholder}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[#367CC0] to-[#DF9B35] hover:from-[#2d6699] hover:to-[#c7892a] text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#367CC0]/20"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>{t.contactUs.form.sending}</span>
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          <span>{t.contactUs.form.sendMessage}</span>
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              </div>

              {/* Info Sidebar */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-gradient-to-br from-[#367CC0]/10 to-[#DF9B35]/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6 sticky top-24"
                >
                  <div>
                    <h3 className="text-lg font-black text-white mb-4">{t.contactUs.sidebar.whyContactUs}</h3>
                    <ul className="space-y-3 text-sm text-white/70">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-[#7ED321] mt-0.5 flex-shrink-0" />
                        <span>{t.contactUs.sidebar.reason1}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-[#7ED321] mt-0.5 flex-shrink-0" />
                        <span>{t.contactUs.sidebar.reason2}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-[#7ED321] mt-0.5 flex-shrink-0" />
                        <span>{t.contactUs.sidebar.reason3}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-[#7ED321] mt-0.5 flex-shrink-0" />
                        <span>{t.contactUs.sidebar.reason4}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-[#7ED321] mt-0.5 flex-shrink-0" />
                        <span>{t.contactUs.sidebar.reason5}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <p className="text-xs text-white/50 leading-relaxed">
                      {t.contactUs.sidebar.responseTime}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
