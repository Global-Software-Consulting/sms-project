"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  X,
  ArrowRight,
  Zap,
  Shield,
  Users,
  Crown,
  Star,
  CreditCard,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

// Pricing tiers
const pricingTiers = [
  {
    name: "Free",
    description: "Perfect for trying out the service",
    monthlyPrice: 0,
    annualPrice: 0,
    icon: Zap,
    features: [
      { name: "10 active numbers", included: true },
      { name: "Basic support (48h response)", included: true },
      { name: "Standard routing", included: true },
      { name: "API access (30 req/min)", included: true },
      { name: "Wallet deposits", included: true },
      { name: "Priority support", included: false },
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Basic",
    description: "For casual users",
    monthlyPrice: 9.99,
    annualPrice: 7.99,
    icon: Shield,
    features: [
      { name: "25 active numbers", included: true },
      { name: "Email support (24h response)", included: true },
      { name: "Standard routing", included: true },
      { name: "API access (60 req/min)", included: true },
      { name: "Wallet deposits", included: true },
      { name: "3% discount on purchases", included: true },
    ],
    cta: "Choose Plan",
    popular: false,
  },
  {
    name: "Standard",
    description: "Most popular choice",
    monthlyPrice: 19.99,
    annualPrice: 15.99,
    icon: Users,
    features: [
      { name: "50 active numbers", included: true },
      { name: "Priority support (12h response)", included: true },
      { name: "Faster routing", included: true },
      { name: "API access (120 req/min)", included: true },
      { name: "Wallet deposits", included: true },
      { name: "5% discount on purchases", included: true },
    ],
    cta: "Choose Plan",
    popular: true,
  },
  {
    name: "Pro",
    description: "For power users",
    monthlyPrice: 49.99,
    annualPrice: 39.99,
    icon: Star,
    features: [
      { name: "200 active numbers", included: true },
      { name: "Premium support (4h response)", included: true },
      { name: "Priority routing", included: true },
      { name: "API access (240 req/min)", included: true },
      { name: "Wallet deposits", included: true },
      { name: "10% discount on purchases", included: true },
    ],
    cta: "Choose Plan",
    popular: false,
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    monthlyPrice: 99.99,
    annualPrice: 79.99,
    icon: Crown,
    features: [
      { name: "Unlimited active numbers", included: true },
      { name: "24/7 dedicated support", included: true },
      { name: "Highest priority routing", included: true },
      { name: "API access (600 req/min)", included: true },
      { name: "Wallet deposits", included: true },
      { name: "15% discount on purchases", included: true },
    ],
    cta: "Choose Plan",
    popular: false,
  },
];

// Payment methods
const paymentMethods = [
  { name: "Bitcoin", icon: "₿" },
  { name: "Ethereum", icon: "Ξ" },
  { name: "USDT", icon: "₮" },
  { name: "Visa/MC", icon: "💳" },
  { name: "PayPal", icon: "P" },
];

// FAQ data
const faqData = [
  {
    question: "Can I change my plan later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept cryptocurrency (Bitcoin, Ethereum, USDT), credit/debit cards (Visa, Mastercard), and various e-wallets including PayPal.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! Our Free tier is available forever with no credit card required. You can use it to test our service before upgrading.",
  },
  {
    question: "What happens if I exceed my limits?",
    answer: "You'll receive a notification when approaching your limits. You can either upgrade your plan or wait for the next billing cycle.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 7-day money-back guarantee on all paid plans. If you're not satisfied, contact support for a full refund.",
  },
];

export default function PricingPublicPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
              <CreditCard className="w-4 h-4" />
              <span>Pricing Plans</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary leading-[1.1] mb-6 heading-uppercase animate-slide-up">
              Simple, <span className="text-gold-gradient glow-gold-text">Transparent</span> Pricing
            </h1>

            {/* Tagline */}
            <p className="tagline-italic text-lg lg:text-xl max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Choose the plan that fits your needs. All plans include access to our full platform 
              with 190+ countries and 1000+ services.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  !isAnnual
                    ? "bg-gold-gradient text-bg-primary shadow-gold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
                  isAnnual
                    ? "bg-gold-gradient text-bg-primary shadow-gold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Annual
                <span className="px-2 py-0.5 text-xs bg-success text-white rounded-full">Save 20%</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          PRICING CARDS SECTION
          ============================================ */}
      <section className="py-16 relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`glass-card p-6 card-lift relative flex flex-col ${
                  tier.popular ? "ring-2 ring-accent-gold animate-border-glow lg:scale-105" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gold-gradient text-bg-primary text-xs font-bold rounded-full uppercase tracking-wider shadow-gold whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-accent-gold/10 flex items-center justify-center mb-4 glow-gold">
                  <tier.icon className="w-7 h-7 text-accent-gold" />
                </div>

                {/* Plan Name */}
                <h3 className="text-xl font-bold text-text-primary uppercase mb-1">{tier.name}</h3>
                <p className="text-sm text-text-muted mb-4">{tier.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gold-gradient">
                      ${isAnnual ? tier.annualPrice : tier.monthlyPrice}
                    </span>
                    <span className="text-text-muted">/mo</span>
                  </div>
                  {isAnnual && tier.monthlyPrice > 0 && (
                    <p className="text-xs text-success mt-1">
                      Save ${((tier.monthlyPrice - tier.annualPrice) * 12).toFixed(0)}/year
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-2">
                      {feature.included ? (
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? "text-text-secondary" : "text-text-muted"}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href="/register" className="block mt-auto">
                  <button
                    className={`btn-pill w-full ${
                      tier.popular ? "btn-pill-primary" : "btn-pill-secondary"
                    }`}
                  >
                    {tier.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          PAYMENT METHODS SECTION
          ============================================ */}
      <section className="py-16 bg-bg-secondary relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-4 heading-uppercase">
              Accepted Payment Methods
            </h2>
            <p className="text-text-secondary">
              Pay securely with your preferred method
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="glass-card px-6 py-4 flex items-center gap-3 card-lift"
              >
                <span className="text-2xl">{method.icon}</span>
                <span className="font-medium text-text-primary">{method.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES COMPARISON SECTION
          ============================================ */}
      <section className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="badge-premium mb-6">All Plans Include</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4 heading-uppercase">
              Premium <span className="text-gold-gradient">Features</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Zap, title: "Instant Activation", description: "Numbers ready in seconds" },
              { icon: Shield, title: "Privacy Protected", description: "No KYC required" },
              { icon: Users, title: "190+ Countries", description: "Global coverage" },
              { icon: Star, title: "99.9% Uptime", description: "Reliable service" },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-6 text-center card-lift">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-accent-gold/10 flex items-center justify-center mb-4 glow-gold">
                  <feature.icon className="w-7 h-7 text-accent-gold" />
                </div>
                <h3 className="font-bold text-text-primary mb-2 uppercase">{feature.title}</h3>
                <p className="text-sm text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FAQ SECTION
          ============================================ */}
      <section className="py-20 lg:py-28 bg-bg-secondary relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="badge-premium mb-6">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4 heading-uppercase">
              Pricing <span className="text-gold-gradient">Questions</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="glass-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-bg-hover/50 transition-colors"
                >
                  <span className="font-semibold text-text-primary pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-accent-gold flex-shrink-0 transition-transform duration-300 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-text-secondary animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/faq" className="text-accent-gold hover:underline font-medium">
              View all FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/10 via-bg-primary to-bg-primary" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-gold/15 rounded-full blur-[120px]" />
        
        {/* Geometric Shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 border border-accent-gold/20 rotate-45" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border border-accent-gold/10 rotate-12" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-6 heading-uppercase">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-text-secondary mb-10">
              Join 50,000+ users who trust BestSMSHQ. Start free today, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="btn-pill btn-pill-primary flex items-center gap-2 justify-center">
                  Start Free Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="btn-pill btn-pill-secondary">
                  Contact Sales
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
