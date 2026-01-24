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

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqCategories = [
    {
      title: "Getting Started",
      icon: Users,
      questions: [
        {
          q: "How do I create an account on Kross.id?",
          a: "Click the 'Join Now' or 'Sign Up' button on our homepage. Fill in your name, email, phone number, and create a secure password. After email verification, you'll be able to access all platform features.",
        },
        {
          q: "What roles are available on the platform?",
          a: "Kross.id supports multiple roles: Owner (create and manage programs), Sales/Affiliate (promote programs and earn commissions), Director, Manager, and regular Users. Your role determines the features you can access.",
        },
        {
          q: "Is Kross.id free to use?",
          a: "Yes, creating an account and browsing programs is free. Program owners may charge fees for specific programs, and platform fees may apply for certain premium features. All costs are clearly disclosed before participation.",
        },
      ],
    },
    {
      title: "Security & Privacy",
      icon: ShieldCheck,
      questions: [
        {
          q: "How does the masked identity system work?",
          a: "Our advanced identity masking technology encrypts and protects your personal information. Program owners see only necessary verification data, while your real identity remains secure. This allows you to build your network without compromising privacy.",
        },
        {
          q: "Is my data secure on Kross.id?",
          a: "Absolutely. We use SSL/TLS encryption, secure server infrastructure, and industry-standard security protocols. Your data is protected with bank-level security measures and regular security audits.",
        },
        {
          q: "Can I delete my account and data?",
          a: "Yes, you can request account deletion at any time through your account settings. We will delete your personal data in accordance with our Privacy Policy, except where we are required to retain it by law.",
        },
      ],
    },
    {
      title: "Programs & Participation",
      icon: TrendingUp,
      questions: [
        {
          q: "How do I register for a program?",
          a: "Browse available programs on the Programs page, click on a program that interests you, review the details, and click 'Register' or 'Join Program'. Fill in any required parameters and submit your registration.",
        },
        {
          q: "What information do program owners see?",
          a: "Program owners see only the information necessary for verification and program management, thanks to our masked identity system. Your personal details remain protected while still allowing program participation.",
        },
        {
          q: "Can I participate in multiple programs?",
          a: "Yes, you can register for and participate in multiple programs simultaneously. Each program maintains its own registration and tracking system.",
        },
        {
          q: "How do I track my program performance?",
          a: "Access your 'My Account' dashboard to view all your registered programs, track registrations, shares, views, and other performance metrics. Program owners have access to detailed analytics in the CMS dashboard.",
        },
      ],
    },
    {
      title: "Affiliate & Sales",
      icon: DollarSign,
      questions: [
        {
          q: "How do I become an affiliate or sales agent?",
          a: "If you have the Sales or Affiliate role, you can join programs as an affiliate. Use your unique referral code to share programs and earn commissions when people register through your links.",
        },
        {
          q: "How do I get my referral code?",
          a: "Your referral code is automatically generated when you create an account with a Sales or Affiliate role. You can find it in your 'My Account' dashboard under the Affiliate section.",
        },
        {
          q: "How do I share programs with my referral link?",
          a: "In your Affiliate dashboard, you'll see all programs you're promoting. Each program has a unique referral link that includes your referral code. Copy the link or use the WhatsApp share button to share with your network.",
        },
        {
          q: "How are commissions calculated?",
          a: "Commission structures vary by program. Some programs offer percentage-based commissions, while others may have fixed amounts. Check individual program details for specific commission information.",
        },
      ],
    },
    {
      title: "Account & Settings",
      icon: Settings,
      questions: [
        {
          q: "How do I update my profile information?",
          a: "Go to 'My Account' → 'Edit Profile'. You can update your name, email, phone number, and profile picture. Changes are saved immediately after you click 'Save Changes'.",
        },
        {
          q: "How do I change my password?",
          a: "Navigate to 'My Account' → 'Security'. Enter your new password and confirm it. Make sure your password is at least 6 characters long and matches the confirmation field.",
        },
        {
          q: "What should I do if I forgot my password?",
          a: "Click 'Forgot Password' on the login page. Enter your email address, and we'll send you instructions to reset your password. Check your email for the reset link.",
        },
        {
          q: "Can I change my role?",
          a: "Role changes typically require approval from platform administrators. Contact support if you need to change your role or upgrade your account type.",
        },
      ],
    },
    {
      title: "Technical Support",
      icon: Lock,
      questions: [
        {
          q: "The platform is not loading properly. What should I do?",
          a: "Try clearing your browser cache, disabling browser extensions, or using a different browser. If the issue persists, contact our support team with details about the problem.",
        },
        {
          q: "I'm having trouble with program registration. What can I do?",
          a: "Ensure all required fields are filled correctly. Check that your account is verified and active. If problems continue, contact the program owner or our support team for assistance.",
        },
        {
          q: "How do I report a bug or issue?",
          a: "Contact our support team through the Contact Us page or email support@kross.id. Please include details about the issue, your browser, device, and any error messages you've seen.",
        },
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
                Frequently Asked Questions
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
              How Can We
              <br />
              <span className="bg-gradient-to-r from-[#367CC0] to-[#DF9B35] bg-clip-text text-transparent">
                Help You?
              </span>
            </h1>

            <p className="text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
              Find answers to common questions about Kross.id. Can't find what you're looking for? 
              Contact our support team.
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
            <h2 className="text-3xl font-black text-white mb-4">Still Have Questions?</h2>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              Our support team is here to help. Get in touch with us through any of the following channels.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#367CC0] to-[#DF9B35] hover:from-[#2d6699] hover:to-[#c7892a] text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-[#367CC0]/20"
              >
                <Mail size={18} />
                Contact Support
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
