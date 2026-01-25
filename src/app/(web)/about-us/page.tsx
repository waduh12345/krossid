"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Zap,
  TrendingUp,
  Lock,
  Globe,
  Target,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Heart,
  Eye,
  BarChart3,
} from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";

export default function AboutUsPage() {
  const { t } = useI18n();

  const features = [
    {
      icon: ShieldCheck,
      title: t.aboutUs.features.maskedIdentity.title,
      description: t.aboutUs.features.maskedIdentity.description,
      color: "from-blue-500/20 to-blue-600/20",
      borderColor: "border-blue-400/30",
      iconColor: "text-blue-400",
    },
    {
      icon: Zap,
      title: t.aboutUs.features.lightningFast.title,
      description: t.aboutUs.features.lightningFast.description,
      color: "from-yellow-500/20 to-yellow-600/20",
      borderColor: "border-yellow-400/30",
      iconColor: "text-yellow-400",
    },
    {
      icon: TrendingUp,
      title: t.aboutUs.features.growthAnalytics.title,
      description: t.aboutUs.features.growthAnalytics.description,
      color: "from-green-500/20 to-green-600/20",
      borderColor: "border-green-400/30",
      iconColor: "text-green-400",
    },
    {
      icon: Lock,
      title: t.aboutUs.features.enterpriseSecurity.title,
      description: t.aboutUs.features.enterpriseSecurity.description,
      color: "from-purple-500/20 to-purple-600/20",
      borderColor: "border-purple-400/30",
      iconColor: "text-purple-400",
    },
    {
      icon: Globe,
      title: t.aboutUs.features.globalReach.title,
      description: t.aboutUs.features.globalReach.description,
      color: "from-cyan-500/20 to-cyan-600/20",
      borderColor: "border-cyan-400/30",
      iconColor: "text-cyan-400",
    },
    {
      icon: Users,
      title: t.aboutUs.features.communityDriven.title,
      description: t.aboutUs.features.communityDriven.description,
      color: "from-pink-500/20 to-pink-600/20",
      borderColor: "border-pink-400/30",
      iconColor: "text-pink-400",
    },
  ];

  const values = [
    {
      icon: Eye,
      title: t.aboutUs.values.transparency.title,
      description: t.aboutUs.values.transparency.description,
    },
    {
      icon: Heart,
      title: t.aboutUs.values.trust.title,
      description: t.aboutUs.values.trust.description,
    },
    {
      icon: Target,
      title: t.aboutUs.values.excellence.title,
      description: t.aboutUs.values.excellence.description,
    },
    {
      icon: Award,
      title: t.aboutUs.values.innovation.title,
      description: t.aboutUs.values.innovation.description,
    },
  ];

  const stats = [
    { label: t.aboutUs.stats.activePrograms, value: "500+", icon: BarChart3 },
    { label: t.aboutUs.stats.registeredUsers, value: "10K+", icon: Users },
    { label: t.aboutUs.stats.totalRegistrations, value: "50K+", icon: CheckCircle2 },
    { label: t.aboutUs.stats.successRate, value: "95%", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#367CC0]/10 via-transparent to-[#DF9B35]/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#367CC0]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#DF9B35]/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 mb-6">
              <Sparkles size={14} className="text-[#DF9B35]" />
              <span className="text-xs font-black text-white/80 uppercase tracking-widest">
                {t.aboutUs.badge}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              {t.aboutUs.heroTitle}
              <br />
              <span className="bg-gradient-to-r from-[#367CC0] to-[#DF9B35] bg-clip-text text-transparent">
                {t.aboutUs.heroTitleHighlight}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/60 mb-8 leading-relaxed max-w-2xl mx-auto">
              {t.aboutUs.heroDescription}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#367CC0] to-[#DF9B35] hover:from-[#2d6699] hover:to-[#c7892a] text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-[#367CC0]/20 group"
              >
                {t.aboutUs.explorePrograms}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-full transition-all backdrop-blur-md"
              >
                {t.aboutUs.joinNow}
                <Users size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  {t.aboutUs.whoWeAre}
                </h2>
                <div className="space-y-4 text-white/70 leading-relaxed">
                  <p className="text-lg">
                    <strong className="text-white">Kross.id</strong> {t.aboutUs.whoWeAreDesc1}
                  </p>
                  <p>
                    {t.aboutUs.whoWeAreDesc2}
                  </p>
                  <p>
                    {t.aboutUs.whoWeAreDesc3}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#367CC0]/20 to-[#DF9B35]/20 rounded-3xl p-8 md:p-12 border border-white/10 backdrop-blur-xl">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#367CC0]/30 flex items-center justify-center flex-shrink-0">
                      <Target size={24} className="text-[#367CC0]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white mb-2">{t.aboutUs.ourMission}</h3>
                      <p className="text-white/70">
                        {t.aboutUs.ourMissionDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#DF9B35]/30 flex items-center justify-center flex-shrink-0">
                      <Eye size={24} className="text-[#DF9B35]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white mb-2">{t.aboutUs.ourVision}</h3>
                      <p className="text-white/70">
                        {t.aboutUs.ourVisionDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Why Choose <span className="text-[#367CC0]">Kross.id</span>?
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Discover the features that make us the preferred choice for affiliate professionals
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-gradient-to-br ${feature.color} backdrop-blur-xl border ${feature.borderColor} rounded-2xl p-6 hover:scale-105 transition-all duration-300 group`}
              >
                <div className={`w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={28} className={feature.iconColor} />
                </div>
                <h3 className="text-xl font-black text-white mb-3">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-[#367CC0]/10 to-[#DF9B35]/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <stat.icon size={32} className="text-[#367CC0]" />
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/60 font-bold uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              {t.aboutUs.ourCoreValues} <span className="text-[#DF9B35]">{t.aboutUs.ourCoreValuesHighlight}</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              {t.aboutUs.ourCoreValuesDesc}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#367CC0]/20 to-[#DF9B35]/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <value.icon size={32} className="text-[#367CC0]" />
                </div>
                <h3 className="text-xl font-black text-white mb-3">{value.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-[#367CC0]/20 via-[#DF9B35]/20 to-[#367CC0]/20 backdrop-blur-xl border border-white/10 rounded-3xl p-12 md:p-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              {t.aboutUs.readyToGetStarted}
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              {t.aboutUs.readyToGetStartedDesc}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#367CC0] to-[#DF9B35] hover:from-[#2d6699] hover:to-[#c7892a] text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-[#367CC0]/20 group"
              >
                {t.aboutUs.createAccount}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-full transition-all backdrop-blur-md"
              >
                {t.aboutUs.browsePrograms}
                <Sparkles size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
