"use client";

import React from "react";
import Link from "next/link";
import {
  Zap,
  Shield,
  Globe,
  CreditCard,
  Clock,
  Users,
  Code,
  Smartphone,
  Lock,
  RefreshCw,
  BarChart3,
  Headphones,
  CheckCircle,
  ArrowRight,
  Star,
  Server,
  Wifi,
  Database,
} from "lucide-react";

// Main features
const mainFeatures = [
  {
    icon: Zap,
    title: "Instant Number Activation",
    description: "Get your virtual phone number in under 3 seconds. Our advanced infrastructure ensures lightning-fast number allocation from our pool of 500,000+ numbers.",
    highlights: ["< 3 second activation", "500K+ number pool", "Auto-retry on failure"],
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Access phone numbers from 190+ countries worldwide. Whether you need a US, UK, or any other country number, we've got you covered.",
    highlights: ["190+ countries", "1000+ services", "Real local numbers"],
  },
  {
    icon: Shield,
    title: "Complete Privacy",
    description: "Your privacy is guaranteed. We don't store personal data, don't require KYC, and all transactions can be made anonymously with crypto.",
    highlights: ["No KYC required", "Anonymous payments", "Zero data retention"],
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description: "Pay your way with 7+ payment gateways. Accept crypto (BTC, ETH, USDT), credit cards, and various e-wallets for maximum convenience.",
    highlights: ["Crypto accepted", "Card payments", "E-wallet support"],
  },
  {
    icon: RefreshCw,
    title: "Auto-Retry System",
    description: "Never miss a verification code. Our intelligent system automatically retries failed deliveries and finds alternative numbers when needed.",
    highlights: ["Smart retry logic", "Alternative numbers", "99% success rate"],
  },
  {
    icon: BarChart3,
    title: "Real-Time Dashboard",
    description: "Monitor all your verifications in real-time. Track spending, view history, and manage your account from an intuitive dashboard.",
    highlights: ["Live monitoring", "Usage analytics", "Export reports"],
  },
];

// API features
const apiFeatures = [
  { icon: Code, title: "RESTful API", description: "Clean, well-documented REST API with JSON responses" },
  { icon: Wifi, title: "Webhooks", description: "Real-time notifications for SMS delivery events" },
  { icon: Server, title: "SDKs", description: "Official SDKs for Python, Node.js, PHP, and Go" },
  { icon: Database, title: "Rate Limits", description: "Up to 600 requests per minute for enterprise users" },
];

// Security features
const securityFeatures = [
  { icon: Lock, title: "End-to-End Encryption", description: "All data is encrypted in transit and at rest using AES-256" },
  { icon: Shield, title: "DDoS Protection", description: "Enterprise-grade protection against attacks" },
  { icon: Server, title: "99.9% Uptime", description: "Redundant infrastructure ensures maximum availability" },
  { icon: Users, title: "Role-Based Access", description: "Granular permissions for team management" },
];

// Comparison data
const comparisonData = [
  { feature: "Instant Activation", us: true, others: false },
  { feature: "190+ Countries", us: true, others: false },
  { feature: "Crypto Payments", us: true, others: false },
  { feature: "No KYC Required", us: true, others: false },
  { feature: "24/7 Support", us: true, others: false },
  { feature: "API Access", us: true, others: true },
  { feature: "Auto-Retry", us: true, others: false },
  { feature: "Real-Time Dashboard", us: true, others: false },
];

export default function FeaturesPage() {
  return (
    <div className="relative overflow-hidden">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative hero-bg-overlay" style={{ paddingTop: '160px', paddingBottom: '80px' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        
        {/* Geometric Shapes */}
        <div className="absolute top-32 left-10 w-32 h-32 border-2 border-accent-gold/20 rotate-45 animate-float" />
        <div className="absolute top-60 right-20 w-24 h-24 border-2 border-accent-gold/10 rotate-12" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent-gold/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 -right-20 w-80 h-80 bg-accent-gold/5 rounded-full blur-[120px]" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="badge-premium mb-8 animate-fade-in">
              <Zap className="w-4 h-4" />
              <span>Platform Features</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary leading-[1.1] mb-6 heading-uppercase animate-slide-up">
              Everything You Need for
              <br />
              <span className="text-gold-gradient glow-gold-text">SMS Verification</span>
            </h1>

            {/* Tagline */}
            <p className="tagline-italic text-lg lg:text-xl max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Discover why thousands of users choose BestSMSHQ for their verification needs.
              Powerful features, unmatched reliability.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link href="/register">
                <button className="btn-pill btn-pill-primary flex items-center gap-2 justify-center">
                  Start Free Today
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/api-docs">
                <button className="btn-pill btn-pill-secondary flex items-center gap-2 justify-center">
                  <Code className="w-5 h-5" />
                  View API Docs
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          MAIN FEATURES SECTION
          ============================================ */}
      <section className="py-20 lg:py-28 bg-bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-pattern opacity-50" />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <span className="badge-premium mb-6">Core Features</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4 heading-uppercase">
              Powerful <span className="text-gold-gradient">Capabilities</span>
            </h2>
            <div className="accent-line mx-auto mt-6" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {mainFeatures.map((feature, index) => (
              <div key={feature.title} className="glass-card glass-card-hover p-8 card-lift">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 flex-shrink-0 rounded-2xl bg-accent-gold/10 flex items-center justify-center glow-gold">
                    <feature.icon className="w-8 h-8 text-accent-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-text-primary mb-3 uppercase tracking-wide">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {feature.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="px-3 py-1 text-xs font-medium bg-accent-gold/10 text-accent-gold rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          API SECTION
          ============================================ */}
      <section className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content */}
            <div>
              <span className="badge-premium mb-6">Developer API</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-6 heading-uppercase">
                Powerful API for <span className="text-gold-gradient">Developers</span>
              </h2>
              <p className="text-text-secondary leading-relaxed mb-8">
                Integrate SMS verification into your applications with our comprehensive REST API. 
                Full documentation, SDKs, and code examples included.
              </p>

              <div className="space-y-4 mb-8">
                {apiFeatures.map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-accent-gold/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-accent-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary">{item.title}</h4>
                      <p className="text-sm text-text-secondary">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/api-docs">
                <button className="btn-pill btn-pill-primary flex items-center gap-2">
                  View API Documentation
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>

            {/* Code Preview */}
            <div className="relative">
              <div className="glass-card p-6 overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-danger" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="ml-2 text-xs text-text-muted">api-example.js</span>
                </div>
                <pre className="text-sm text-text-secondary overflow-x-auto">
                  <code>{`// Get a virtual number
const response = await fetch(
  'https://api.bestsmshq.com/v1/numbers',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      country: 'US',
      service: 'whatsapp'
    })
  }
);

const { number, id } = await response.json();
console.log('Number:', number);
// Output: +1 (555) 123-4567`}</code>
                </pre>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 border-2 border-accent-gold/20 rotate-45" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECURITY SECTION
          ============================================ */}
      <section className="py-20 lg:py-28 bg-bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <span className="badge-premium mb-6">Security</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4 heading-uppercase">
              Enterprise-Grade <span className="text-gold-gradient">Security</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Your security is our top priority. We employ industry-leading measures to protect your data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature) => (
              <div key={feature.title} className="glass-card p-6 text-center card-lift">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-gold/10 flex items-center justify-center mb-4 glow-gold">
                  <feature.icon className="w-8 h-8 text-accent-gold" />
                </div>
                <h3 className="font-bold text-text-primary mb-2 uppercase">{feature.title}</h3>
                <p className="text-sm text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          COMPARISON SECTION
          ============================================ */}
      <section className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="badge-premium mb-6">Comparison</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4 heading-uppercase">
              Why Choose <span className="text-gold-gradient">BestSMSHQ</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              See how we compare to other SMS verification services
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="glass-card overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 gap-4 p-6 bg-bg-elevated border-b border-border-default">
                <div className="font-semibold text-text-primary">Feature</div>
                <div className="text-center font-semibold text-accent-gold">BestSMSHQ</div>
                <div className="text-center font-semibold text-text-muted">Others</div>
              </div>
              
              {/* Rows */}
              {comparisonData.map((row, index) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 gap-4 p-4 ${
                    index % 2 === 0 ? "bg-bg-secondary/50" : ""
                  }`}
                >
                  <div className="text-text-secondary">{row.feature}</div>
                  <div className="text-center">
                    {row.us ? (
                      <CheckCircle className="w-5 h-5 text-success mx-auto" />
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </div>
                  <div className="text-center">
                    {row.others ? (
                      <CheckCircle className="w-5 h-5 text-text-muted mx-auto" />
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
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
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-6 heading-uppercase">
              Ready to Experience the Difference?
            </h2>
            <p className="text-xl text-text-secondary mb-10">
              Join thousands of satisfied users. Start with our free tier today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="btn-pill btn-pill-primary flex items-center gap-2 justify-center">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/pricing-public">
                <button className="btn-pill btn-pill-secondary">
                  View Pricing
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
