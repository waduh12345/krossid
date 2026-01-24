"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Eye, FileText, Users, Database, AlertCircle } from "lucide-react";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: FileText,
      title: "Information We Collect",
      content: [
        "We collect information that you provide directly to us, including:",
        "• Personal identification information (name, email, phone number)",
        "• Account credentials and authentication data",
        "• Profile information and preferences",
        "• Program registration and participation data",
        "• Communication records and support interactions",
      ],
    },
    {
      icon: Database,
      title: "How We Use Your Information",
      content: [
        "Your information is used to:",
        "• Provide and maintain our affiliate platform services",
        "• Process program registrations and manage your account",
        "• Enable communication between users and program owners",
        "• Improve our services and develop new features",
        "• Send important updates and notifications",
        "• Ensure platform security and prevent fraud",
      ],
    },
    {
      icon: ShieldCheck,
      title: "Masked Identity System",
      content: [
        "Kross.id employs advanced identity masking technology to protect your privacy:",
        "• Personal information is encrypted and stored securely",
        "• Identity masking prevents direct exposure of sensitive data",
        "• Program owners see only necessary information for verification",
        "• Your real identity remains protected throughout transactions",
        "• We never share your personal data with third parties without consent",
      ],
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        "We implement industry-standard security measures:",
        "• SSL/TLS encryption for all data transmissions",
        "• Secure server infrastructure with regular security audits",
        "• Access controls and authentication protocols",
        "• Regular backups and disaster recovery procedures",
        "• Compliance with data protection regulations",
      ],
    },
    {
      icon: Users,
      title: "Data Sharing",
      content: [
        "We respect your privacy and limit data sharing:",
        "• We do not sell your personal information",
        "• Data is shared only with program owners for verification purposes",
        "• Third-party services are used only for essential platform functions",
        "• We may share data if required by law or to protect our rights",
        "• Aggregated, anonymized data may be used for analytics",
      ],
    },
    {
      icon: Eye,
      title: "Your Rights",
      content: [
        "You have the right to:",
        "• Access and review your personal information",
        "• Request corrections to inaccurate data",
        "• Request deletion of your account and data",
        "• Opt-out of marketing communications",
        "• Export your data in a portable format",
        "• Withdraw consent for data processing",
      ],
    },
    {
      icon: AlertCircle,
      title: "Cookies and Tracking",
      content: [
        "We use cookies and similar technologies to:",
        "• Maintain your session and authentication state",
        "• Remember your preferences and settings",
        "• Analyze platform usage and performance",
        "• Provide personalized content and recommendations",
        "• You can manage cookie preferences in your browser settings",
      ],
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
              <ShieldCheck size={14} className="text-[#367CC0]" />
              <span className="text-xs font-black text-white/80 uppercase tracking-widest">
                Privacy Policy
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
              Your Privacy is Our
              <br />
              <span className="bg-gradient-to-r from-[#367CC0] to-[#DF9B35] bg-clip-text text-transparent">
                Priority
              </span>
            </h1>

            <p className="text-xl text-white/60 mb-4">
              Last Updated: January 23, 2026
            </p>
            <p className="text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
              At Kross.id, we are committed to protecting your privacy and ensuring the security 
              of your personal information. This policy explains how we collect, use, and safeguard 
              your data when you use our platform.
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
                    <section.icon size={24} className="text-[#367CC0]" />
                  </div>
                  <h2 className="text-2xl font-black text-white">{section.title}</h2>
                </div>
                <div className="space-y-2 text-white/70 leading-relaxed pl-16">
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
            <h2 className="text-3xl font-black text-white mb-4">Questions About Privacy?</h2>
            <p className="text-white/70 mb-6">
              If you have any questions or concerns about this Privacy Policy or our data practices, 
              please contact us at:
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <a
                href="mailto:privacy@kross.id"
                className="text-[#367CC0] hover:text-[#DF9B35] font-bold transition-colors"
              >
                privacy@kross.id
              </a>
              <span className="text-white/30">•</span>
              <a
                href="/contact-us"
                className="text-[#367CC0] hover:text-[#DF9B35] font-bold transition-colors"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
