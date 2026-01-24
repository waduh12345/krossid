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

export default function AboutUsPage() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Masked Identity System",
      description: "Protect your privacy while building your affiliate network. Our advanced identity masking ensures your personal information stays secure.",
      color: "from-blue-500/20 to-blue-600/20",
      borderColor: "border-blue-400/30",
      iconColor: "text-blue-400",
    },
    {
      icon: Zap,
      title: "Lightning Fast Performance",
      description: "Experience seamless program management with our optimized platform. Real-time updates and instant notifications keep you ahead.",
      color: "from-yellow-500/20 to-yellow-600/20",
      borderColor: "border-yellow-400/30",
      iconColor: "text-yellow-400",
    },
    {
      icon: TrendingUp,
      title: "Growth Analytics",
      description: "Track your performance with comprehensive analytics. Monitor registrations, shares, and conversions to optimize your strategy.",
      color: "from-green-500/20 to-green-600/20",
      borderColor: "border-green-400/30",
      iconColor: "text-green-400",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Bank-level encryption and security protocols protect your data. SSL encrypted connections ensure safe transactions.",
      color: "from-purple-500/20 to-purple-600/20",
      borderColor: "border-purple-400/30",
      iconColor: "text-purple-400",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with programs and affiliates worldwide. Expand your network beyond borders with our international platform.",
      color: "from-cyan-500/20 to-cyan-600/20",
      borderColor: "border-cyan-400/30",
      iconColor: "text-cyan-400",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join a thriving community of affiliates, owners, and sales professionals. Collaborate and grow together.",
      color: "from-pink-500/20 to-pink-600/20",
      borderColor: "border-pink-400/30",
      iconColor: "text-pink-400",
    },
  ];

  const values = [
    {
      icon: Eye,
      title: "Transparency",
      description: "Clear, honest communication and open data sharing.",
    },
    {
      icon: Heart,
      title: "Trust",
      description: "Building lasting relationships through reliability and integrity.",
    },
    {
      icon: Target,
      title: "Excellence",
      description: "Delivering exceptional value and continuous improvement.",
    },
    {
      icon: Award,
      title: "Innovation",
      description: "Pushing boundaries with cutting-edge technology and solutions.",
    },
  ];

  const stats = [
    { label: "Active Programs", value: "500+", icon: BarChart3 },
    { label: "Registered Users", value: "10K+", icon: Users },
    { label: "Total Registrations", value: "50K+", icon: CheckCircle2 },
    { label: "Success Rate", value: "95%", icon: TrendingUp },
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
                About Kross.id
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Professional Affiliate
              <br />
              <span className="bg-gradient-to-r from-[#367CC0] to-[#DF9B35] bg-clip-text text-transparent">
                Platform
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/60 mb-8 leading-relaxed max-w-2xl mx-auto">
              Empowering affiliates, owners, and sales professionals with a secure, 
              privacy-focused platform that connects, grows, and succeeds together.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#367CC0] to-[#DF9B35] hover:from-[#2d6699] hover:to-[#c7892a] text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-[#367CC0]/20 group"
              >
                Explore Programs
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-full transition-all backdrop-blur-md"
              >
                Join Now
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
                  Who We Are
                </h2>
                <div className="space-y-4 text-white/70 leading-relaxed">
                  <p className="text-lg">
                    <strong className="text-white">Kross.id</strong> is a cutting-edge affiliate 
                    marketing platform designed for professionals who value privacy, security, and 
                    performance. We've built a revolutionary system that combines the power of 
                    affiliate marketing with advanced identity protection.
                  </p>
                  <p>
                    Our platform serves as a bridge between program owners and affiliate sales 
                    professionals, creating opportunities for growth while maintaining the highest 
                    standards of data protection and user privacy.
                  </p>
                  <p>
                    With our masked identity system, you can build your network and grow your 
                    business without compromising your personal information. We believe that 
                    success should come with security.
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
                      <h3 className="text-xl font-black text-white mb-2">Our Mission</h3>
                      <p className="text-white/70">
                        To empower professionals with a secure, transparent, and efficient 
                        affiliate marketing platform that drives growth while protecting privacy.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#DF9B35]/30 flex items-center justify-center flex-shrink-0">
                      <Eye size={24} className="text-[#DF9B35]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white mb-2">Our Vision</h3>
                      <p className="text-white/70">
                        To become the leading affiliate platform in Indonesia and beyond, 
                        recognized for innovation, security, and community excellence.
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
              Our Core <span className="text-[#DF9B35]">Values</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              The principles that guide everything we do
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
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who trust Kross.id for their affiliate marketing needs. 
              Start building your network today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#367CC0] to-[#DF9B35] hover:from-[#2d6699] hover:to-[#c7892a] text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-[#367CC0]/20 group"
              >
                Create Account
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-full transition-all backdrop-blur-md"
              >
                Browse Programs
                <Sparkles size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
