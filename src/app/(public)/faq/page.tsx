"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ArrowRight,
  MessageSquare,
  CreditCard,
  Shield,
  Zap,
  Globe,
  Users,
  Settings,
  Code,
} from "lucide-react";

// FAQ categories
const categories = [
  { id: "general", name: "General", icon: HelpCircle },
  { id: "payments", name: "Payments", icon: CreditCard },
  { id: "privacy", name: "Privacy & Security", icon: Shield },
  { id: "technical", name: "Technical", icon: Code },
  { id: "account", name: "Account", icon: Users },
];

// FAQ data organized by category
const faqData: Record<string, Array<{ question: string; answer: string }>> = {
  general: [
    {
      question: "What is BestSMSHQ?",
      answer: "BestSMSHQ is a premium SMS verification platform that provides virtual phone numbers from 190+ countries for instant verification on any service. We offer fast, secure, and anonymous SMS verification solutions.",
    },
    {
      question: "How does SMS verification work?",
      answer: "Simply select the service you need verification for, choose a country, and we'll provide you with a virtual phone number. Use this number for verification, and we'll deliver the SMS code to your dashboard in seconds.",
    },
    {
      question: "How many services do you support?",
      answer: "We support over 1000+ services including WhatsApp, Telegram, Google, Instagram, Twitter, Discord, Facebook, and many more. Our list is constantly expanding.",
    },
    {
      question: "What countries are available?",
      answer: "We offer phone numbers from 190+ countries worldwide, including USA, UK, Canada, Germany, France, Russia, India, and many more. Coverage varies by service.",
    },
    {
      question: "How fast will I receive my SMS code?",
      answer: "Most SMS codes are delivered within 3-30 seconds. Our advanced infrastructure ensures the fastest possible delivery times in the industry.",
    },
  ],
  payments: [
    {
      question: "What payment methods do you accept?",
      answer: "We accept multiple payment methods including cryptocurrency (Bitcoin, Ethereum, USDT, and more), credit/debit cards (Visa, Mastercard), and various e-wallets. All payments are processed securely.",
    },
    {
      question: "Is there a minimum deposit amount?",
      answer: "Yes, the minimum deposit is $2 USD. There's no maximum limit for deposits, making it easy to fund your account according to your needs.",
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 7-day money-back guarantee on all paid plans. For individual number purchases, refunds are available if no SMS was received within the validity period.",
    },
    {
      question: "How do membership discounts work?",
      answer: "Paid membership plans offer discounts on all purchases. For example, Standard members get 5% off, Pro members get 10% off, and Enterprise members get 15% off all number purchases.",
    },
    {
      question: "Are there any hidden fees?",
      answer: "No, we believe in transparent pricing. The price you see is the price you pay. There are no hidden fees, setup costs, or surprise charges.",
    },
  ],
  privacy: [
    {
      question: "Is my privacy protected?",
      answer: "Absolutely. We don't require any personal information or KYC verification. You can pay with cryptocurrency for complete anonymity. We don't store or share your data with third parties.",
    },
    {
      question: "Do you store my verification codes?",
      answer: "Verification codes are only stored temporarily for delivery purposes and are automatically deleted after 24 hours. We never share or sell this data.",
    },
    {
      question: "Can anyone else see my numbers?",
      answer: "No. Each number is exclusively assigned to you during the rental period. No one else can access or see the SMS codes sent to your number.",
    },
    {
      question: "Is BestSMSHQ legal to use?",
      answer: "Yes, using virtual numbers for verification is legal. However, users are responsible for complying with the terms of service of the platforms they're verifying on.",
    },
    {
      question: "How do you protect my account?",
      answer: "We use enterprise-grade security including AES-256 encryption, DDoS protection, and secure authentication. We also support two-factor authentication for additional security.",
    },
  ],
  technical: [
    {
      question: "Do you have an API?",
      answer: "Yes, we offer a comprehensive REST API for developers. It includes full documentation, SDKs for popular languages (Python, Node.js, PHP, Go), and webhook support for real-time notifications.",
    },
    {
      question: "What are the API rate limits?",
      answer: "Rate limits depend on your membership tier: Free (30 req/min), Basic (60 req/min), Standard (120 req/min), Pro (240 req/min), and Enterprise (600 req/min).",
    },
    {
      question: "What happens if SMS delivery fails?",
      answer: "Our system automatically retries failed deliveries. If a number doesn't receive the SMS within the validity period, you can request a replacement number or refund.",
    },
    {
      question: "Can I use the same number multiple times?",
      answer: "For one-time activations, numbers are typically single-use. However, we also offer number rental options for extended use cases where you need to receive multiple SMS on the same number.",
    },
    {
      question: "What's the success rate?",
      answer: "We maintain a 99%+ success rate across all services. Our intelligent routing system automatically selects the best numbers for each service to maximize success.",
    },
  ],
  account: [
    {
      question: "How do I create an account?",
      answer: "Simply click 'Get Started' and provide an email address. No personal information or KYC is required. You can start using the service immediately after registration.",
    },
    {
      question: "Can I change my membership plan?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences in billing.",
    },
    {
      question: "How do I check my balance?",
      answer: "Your current balance is always visible in your dashboard. You can also view detailed transaction history and usage statistics.",
    },
    {
      question: "What if I forget my password?",
      answer: "Use the 'Forgot Password' link on the login page. We'll send a password reset link to your registered email address.",
    },
    {
      question: "Can I delete my account?",
      answer: "Yes, you can request account deletion at any time through your account settings or by contacting support. All your data will be permanently removed.",
    },
  ],
};

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [openItems, setOpenItems] = useState<Record<string, number | null>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const toggleItem = (category: string, index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [category]: prev[category] === index ? null : index,
    }));
  };

  // Filter FAQs based on search
  const getFilteredFAQs = () => {
    if (!searchQuery.trim()) {
      return { [activeCategory]: faqData[activeCategory] };
    }

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, typeof faqData.general> = {};

    Object.entries(faqData).forEach(([category, faqs]) => {
      const matchingFaqs = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
      if (matchingFaqs.length > 0) {
        filtered[category] = matchingFaqs;
      }
    });

    return filtered;
  };

  const filteredFAQs = getFilteredFAQs();
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="relative overflow-hidden">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative hero-bg-overlay" style={{ paddingTop: '160px', paddingBottom: '60px' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        
        {/* Geometric Shapes */}
        <div className="absolute top-32 left-10 w-32 h-32 border-2 border-accent-gold/20 rotate-45 animate-float" />
        <div className="absolute top-60 right-20 w-24 h-24 border-2 border-accent-gold/10 rotate-12" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent-gold/10 rounded-full blur-[150px]" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="badge-premium mb-8 animate-fade-in">
              <HelpCircle className="w-4 h-4" />
              <span>Help Center</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary leading-[1.1] mb-6 heading-uppercase animate-slide-up">
              Frequently Asked
              <br />
              <span className="text-gold-gradient glow-gold-text">Questions</span>
            </h1>

            {/* Tagline */}
            <p className="tagline-italic text-lg lg:text-xl max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Find answers to common questions about our SMS verification service.
              Can&apos;t find what you&apos;re looking for? Contact our support team.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="glass-card p-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for answers..."
                    className="w-full h-14 pl-12 pr-4 bg-bg-secondary/50 border border-border-default rounded-full text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FAQ CONTENT SECTION
          ============================================ */}
      <section className="py-16 lg:py-20 relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            {!isSearching && (
              <div className="lg:col-span-1">
                <div className="glass-card p-4 sticky top-24">
                  <h3 className="font-bold text-text-primary mb-4 uppercase tracking-wide px-2">
                    Categories
                  </h3>
                  <nav className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          activeCategory === category.id
                            ? "bg-accent-gold/10 text-accent-gold"
                            : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                        }`}
                      >
                        <category.icon className="w-5 h-5" />
                        <span className="font-medium">{category.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* FAQ List */}
            <div className={isSearching ? "lg:col-span-4" : "lg:col-span-3"}>
              {isSearching && Object.keys(filteredFAQs).length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <HelpCircle className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-text-primary mb-2">No Results Found</h3>
                  <p className="text-text-secondary mb-6">
                    We couldn&apos;t find any FAQs matching your search. Try different keywords or browse by category.
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="btn-pill btn-pill-secondary"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                Object.entries(filteredFAQs).map(([category, faqs]) => (
                  <div key={category} className="mb-8">
                    {isSearching && (
                      <h3 className="text-lg font-bold text-text-primary mb-4 uppercase tracking-wide flex items-center gap-2">
                        {categories.find((c) => c.id === category)?.icon && (
                          <span className="w-8 h-8 rounded-lg bg-accent-gold/10 flex items-center justify-center">
                            {React.createElement(
                              categories.find((c) => c.id === category)!.icon,
                              { className: "w-4 h-4 text-accent-gold" }
                            )}
                          </span>
                        )}
                        {categories.find((c) => c.id === category)?.name}
                      </h3>
                    )}
                    <div className="space-y-4">
                      {faqs.map((faq, index) => (
                        <div key={index} className="glass-card overflow-hidden">
                          <button
                            onClick={() => toggleItem(category, index)}
                            className="w-full p-6 flex items-center justify-between text-left hover:bg-bg-hover/50 transition-colors"
                          >
                            <span className="font-semibold text-text-primary pr-4">
                              {faq.question}
                            </span>
                            <ChevronDown
                              className={`w-5 h-5 text-accent-gold flex-shrink-0 transition-transform duration-300 ${
                                openItems[category] === index ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {openItems[category] === index && (
                            <div className="px-6 pb-6 text-text-secondary animate-fade-in leading-relaxed">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CONTACT CTA SECTION
          ============================================ */}
      <section className="py-20 lg:py-28 bg-bg-secondary relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/10 via-bg-secondary to-bg-secondary" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-gold/15 rounded-full blur-[120px]" />
        
        {/* Geometric Shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 border border-accent-gold/20 rotate-45" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border border-accent-gold/10 rotate-12" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gold-gradient flex items-center justify-center mb-8 shadow-gold-lg">
              <MessageSquare className="w-10 h-10 text-bg-primary" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-6 heading-uppercase">
              Still Have Questions?
            </h2>
            <p className="text-xl text-text-secondary mb-10">
              Our support team is here to help. Get in touch and we&apos;ll respond as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="btn-pill btn-pill-primary flex items-center gap-2 justify-center">
                  Contact Support
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/status">
                <button className="btn-pill btn-pill-secondary">
                  Check System Status
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
