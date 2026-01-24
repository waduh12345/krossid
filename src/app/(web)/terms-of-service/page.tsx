"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Scale, AlertTriangle, CheckCircle2, XCircle, Shield, Gavel, Users } from "lucide-react";

export default function TermsOfServicePage() {
  const sections = [
    {
      icon: FileText,
      title: "Acceptance of Terms",
      content: [
        "By accessing and using Kross.id, you agree to be bound by these Terms of Service.",
        "If you do not agree with any part of these terms, you must not use our platform.",
        "We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of changes.",
        "It is your responsibility to review these terms periodically for updates.",
      ],
    },
    {
      icon: Users,
      title: "User Accounts",
      content: [
        "You must be at least 18 years old to create an account on Kross.id.",
        "You are responsible for maintaining the confidentiality of your account credentials.",
        "You agree to provide accurate, current, and complete information during registration.",
        "You are responsible for all activities that occur under your account.",
        "You must notify us immediately of any unauthorized use of your account.",
        "We reserve the right to suspend or terminate accounts that violate these terms.",
      ],
    },
    {
      icon: Shield,
      title: "Platform Usage",
      content: [
        "You agree to use Kross.id only for lawful purposes and in accordance with these terms.",
        "You will not use the platform to:",
        "• Violate any applicable laws or regulations",
        "• Infringe upon the rights of others",
        "• Transmit harmful, offensive, or illegal content",
        "• Attempt to gain unauthorized access to the platform",
        "• Interfere with or disrupt the platform's operation",
        "• Use automated systems to scrape or collect data without permission",
      ],
    },
    {
      icon: Scale,
      title: "Program Participation",
      content: [
        "Program owners are responsible for the accuracy of their program listings.",
        "Affiliates must comply with program terms and guidelines.",
        "We do not guarantee the success or profitability of any program.",
        "Disputes between program owners and affiliates should be resolved directly.",
        "Kross.id acts as a platform facilitator and is not a party to program agreements.",
        "We reserve the right to remove programs that violate our policies.",
      ],
    },
    {
      icon: Gavel,
      title: "Intellectual Property",
      content: [
        "All content on Kross.id, including logos, text, graphics, and software, is the property of Kross.id or its licensors.",
        "You may not reproduce, distribute, or create derivative works without permission.",
        "User-generated content remains the property of the user but grants us a license to use it on the platform.",
        "You retain ownership of your program content but grant us rights to display and promote it.",
      ],
    },
    {
      icon: AlertTriangle,
      title: "Limitation of Liability",
      content: [
        "Kross.id is provided 'as is' without warranties of any kind.",
        "We do not guarantee uninterrupted or error-free service.",
        "We are not liable for any indirect, incidental, or consequential damages.",
        "Our total liability is limited to the amount you paid for our services in the past 12 months.",
        "We are not responsible for the actions of third parties or program owners.",
      ],
    },
    {
      icon: CheckCircle2,
      title: "Payment and Fees",
      content: [
        "Program owners may charge fees for program participation as disclosed in program listings.",
        "All payments are processed securely through our payment system.",
        "Refund policies are determined by individual program owners.",
        "We may charge platform fees as disclosed in our pricing information.",
        "You are responsible for any taxes applicable to your transactions.",
      ],
    },
    {
      icon: XCircle,
      title: "Termination",
      content: [
        "We may terminate or suspend your account at any time for violations of these terms.",
        "You may terminate your account at any time through your account settings.",
        "Upon termination, your right to use the platform immediately ceases.",
        "We may retain your data as required by law or for legitimate business purposes.",
        "Provisions that should survive termination will remain in effect.",
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
              <Scale size={14} className="text-[#DF9B35]" />
              <span className="text-xs font-black text-white/80 uppercase tracking-widest">
                Terms of Service
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
              Terms of
              <br />
              <span className="bg-gradient-to-r from-[#367CC0] to-[#DF9B35] bg-clip-text text-transparent">
                Service
              </span>
            </h1>

            <p className="text-xl text-white/60 mb-4">
              Last Updated: January 23, 2026
            </p>
            <p className="text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
              Please read these Terms of Service carefully before using Kross.id. 
              These terms govern your access to and use of our affiliate marketing platform.
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
            <h2 className="text-3xl font-black text-white mb-4">Questions About Terms?</h2>
            <p className="text-white/70 mb-6">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <a
                href="mailto:legal@kross.id"
                className="text-[#367CC0] hover:text-[#DF9B35] font-bold transition-colors"
              >
                legal@kross.id
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
