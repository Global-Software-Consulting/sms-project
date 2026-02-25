"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Shield,
  Zap,
  Globe,
  CreditCard,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Smartphone,
  ChevronRight,
  Play,
  ChevronDown,
  Headphones,
} from "lucide-react";

// Animated counter hook
const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
};

// Stats data matching CheapStreamTV style
const stats = [
  { label: "Virtual Numbers", value: 500000, suffix: "+", icon: Smartphone },
  { label: "Services Supported", value: 1000, suffix: "+", icon: Globe },
  { label: "Countries Available", value: 190, suffix: "+", icon: TrendingUp },
];

// Features data
const features = [
  {
    icon: Zap,
    title: "Instant Activation",
    description: "Get your virtual number in under 3 seconds. Our advanced infrastructure ensures lightning-fast number allocation.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Access phone numbers from 190+ countries. Perfect for any verification need worldwide.",
  },
  {
    icon: Shield,
    title: "100% Anonymous",
    description: "Your privacy is guaranteed. No personal data required, no traces left behind.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description: "Pay with crypto, cards, or e-wallets. 7+ payment gateways for your convenience.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Our platform never sleeps. Get numbers and receive SMS anytime, anywhere.",
  },
  {
    icon: Headphones,
    title: "Premium Support",
    description: "Dedicated support team ready to help. Fast response times guaranteed.",
  },
];

// Pricing tiers
const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out",
    features: ["10 active numbers", "Basic support", "Standard routing"],
    popular: false,
  },
  {
    name: "Standard",
    price: "$9.99",
    period: "/month",
    description: "For regular users",
    features: ["50 active numbers", "5% discount", "Priority support", "Faster routing"],
    popular: true,
  },
  {
    name: "Pro",
    price: "$24.99",
    period: "/month",
    description: "For power users",
    features: ["200 active numbers", "10% discount", "Premium support", "Priority routing"],
    popular: false,
  },
];

// Testimonials
const testimonials = [
  {
    name: "Alex M.",
    role: "Developer",
    content: "Best SMS service I've used. Fast, reliable, and the API is incredibly easy to integrate. Highly recommended!",
    rating: 5,
    avatar: "A",
  },
  {
    name: "Sarah K.",
    role: "Marketing Manager",
    content: "We use BestSMSHQ for all our verification needs. The success rate is unmatched in the industry.",
    rating: 5,
    avatar: "S",
  },
  {
    name: "Michael R.",
    role: "Entrepreneur",
    content: "The crypto payment option is a game changer. Privacy-focused and efficient. Love it!",
    rating: 5,
    avatar: "M",
  },
];

// FAQ data
const faqData = [
  {
    question: "What is BestSMSHQ?",
    answer: "BestSMSHQ is a premium SMS verification platform that provides virtual phone numbers from 190+ countries for instant verification on any service.",
  },
  {
    question: "How many services are supported?",
    answer: "We support over 1000+ services including WhatsApp, Telegram, Google, Instagram, Twitter, Discord, and many more.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept multiple payment methods including cryptocurrency (Bitcoin, Ethereum, USDT), credit/debit cards, and various e-wallets.",
  },
  {
    question: "How fast will I receive my SMS code?",
    answer: "Most SMS codes are delivered within 3-30 seconds. Our advanced infrastructure ensures the fastest possible delivery times.",
  },
  {
    question: "Is my privacy protected?",
    answer: "Absolutely. We don't require any personal information. Your verification activities remain completely anonymous.",
  },
];

// Popular services
const popularServices = [
  { name: "WhatsApp", icon: "📱", price: "$0.50" },
  { name: "Telegram", icon: "✈️", price: "$0.35" },
  { name: "Google", icon: "🔍", price: "$0.45" },
  { name: "Instagram", icon: "📸", price: "$0.55" },
  { name: "Twitter/X", icon: "🐦", price: "$0.40" },
  { name: "Discord", icon: "🎮", price: "$0.30" },
];

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const numbersCount = useCounter(500000, 2500);
  const servicesCount = useCounter(1000, 2000);
  const countriesCount = useCounter(190, 2000);

  return (
    <div className="relative overflow-hidden">
      {/* ============================================
          HERO SECTION - CheapStreamTV Style
          ============================================ */}
      <section className="relative hero-bg-overlay" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
        {/* Background Image Placeholder - SMS/Tech themed */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23C6A75E' fill-opacity='0.05'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-primary/80 to-bg-primary z-[1]" />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-[2]">
          {/* Geometric Shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-accent-gold/20 rotate-45 animate-float" />
          <div className="absolute top-40 right-20 w-24 h-24 border-2 border-accent-gold/10 rotate-12" />
          <div className="absolute bottom-40 left-1/4 w-16 h-16 bg-accent-gold/5 rotate-45" />
          
          {/* Glow Orbs */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent-gold/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="badge-premium mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>Trusted by 50,000+ Users Worldwide</span>
            </div>

            {/* Main Headline - CheapStreamTV Style */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-text-primary leading-[1.1] mb-6 heading-uppercase animate-slide-up">
              Instant SMS
              <br />
              <span className="text-gold-gradient glow-gold-text">Verification</span>
              <br />
              Made Simple
            </h1>

            {/* Tagline */}
            <p className="tagline-italic text-lg lg:text-xl max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Get virtual phone numbers from 190+ countries for instant verification.
              Fast, secure, and completely anonymous.
            </p>

            {/* Email Capture Form - CheapStreamTV Style */}
            <div className="max-w-xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="glass-card p-2 flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email to get started"
                  className="flex-1 h-14 px-6 bg-bg-secondary/50 border border-border-default rounded-full text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold transition-colors"
                />
                <Link href="/register">
                  <button className="btn-pill btn-pill-primary h-14 px-8 whitespace-nowrap flex items-center gap-2">
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '300ms' }}>
              <Link href="/register">
                <button className="btn-pill btn-pill-primary flex items-center gap-2 justify-center">
                  <Play className="w-5 h-5" />
                  Start Free Trial
                </button>
              </Link>
              <Link href="/pricing-public">
                <button className="btn-pill btn-pill-secondary flex items-center gap-2 justify-center">
                  View Packages
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-12 animate-slide-up" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent-gold" />
                <span className="text-sm text-text-secondary">100% Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent-gold" />
                <span className="text-sm text-text-secondary">Instant Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent-gold" />
                <span className="text-sm text-text-secondary">Crypto Accepted</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ============================================
          STATS SECTION - CheapStreamTV Style
          ============================================ */}
      <section className="py-16 bg-bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-4">
              Choose the Best SMS Verification Service
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Join thousands of satisfied users who trust BestSMSHQ for their verification needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center glass-card p-8 card-lift">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-gold/10 flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-accent-gold" />
                </div>
                <div className="stat-number mb-2">
                  {index === 0 ? numbersCount.toLocaleString() : index === 1 ? servicesCount.toLocaleString() : countriesCount}
                  {stat.suffix}
                </div>
                <div className="text-text-secondary font-medium uppercase tracking-wider text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          POPULAR SERVICES SECTION
          ============================================ */}
      <section className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <span className="badge-premium mb-6">Popular Services</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4 heading-uppercase">
              Trending <span className="text-gold-gradient">Verifications</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Get instant verification for the most popular platforms
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularServices.map((service) => (
              <div
                key={service.name}
                className="glass-card glass-card-hover p-6 text-center cursor-pointer card-lift"
              >
                <div className="text-4xl mb-3">{service.icon}</div>
                <div className="font-semibold text-text-primary mb-1">{service.name}</div>
                <div className="text-accent-gold font-bold">from {service.price}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/activate">
              <button className="btn-pill btn-pill-secondary">
                View All Services
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES SECTION - CheapStreamTV Style
          ============================================ */}
      <section className="py-20 lg:py-28 bg-bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-pattern opacity-50" />
        
        {/* Geometric Decorations */}
        <div className="absolute top-20 right-10 w-40 h-40 border border-accent-gold/10 rotate-45" />
        <div className="absolute bottom-20 left-10 w-32 h-32 border border-accent-gold/5 rotate-12" />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <span className="badge-premium mb-6">Why Choose Us</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-text-primary mb-4 heading-uppercase">
              Everything You Need for
              <br />
              <span className="text-gold-gradient">SMS Verification</span>
            </h2>
            <div className="accent-line mx-auto mt-6" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card glass-card-hover p-8 card-lift"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent-gold/10 flex items-center justify-center mb-6 glow-gold">
                  <feature.icon className="w-8 h-8 text-accent-gold" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3 uppercase tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS SECTION
          ============================================ */}
      <section className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="badge-premium mb-6">Simple Process</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4 heading-uppercase">
              Start Watching in <span className="text-gold-gradient">60 Seconds!</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Get your verification code in just 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-1 bg-gradient-to-r from-accent-gold via-accent-gold to-accent-gold/30 rounded-full" />

            {[
              {
                step: "01",
                title: "Choose Service",
                description: "Select the platform you need verification for and pick your country.",
                icon: Smartphone,
              },
              {
                step: "02",
                title: "Get Number",
                description: "Instantly receive a virtual phone number ready for verification.",
                icon: MessageSquare,
              },
              {
                step: "03",
                title: "Receive SMS",
                description: "Get your verification code delivered in seconds. Done!",
                icon: CheckCircle,
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="w-24 h-24 mx-auto rounded-3xl glass-card flex items-center justify-center mb-6 relative z-10 glow-gold">
                  <item.icon className="w-10 h-10 text-accent-gold" />
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-sm font-bold text-bg-primary shadow-gold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3 uppercase">{item.title}</h3>
                <p className="text-text-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          PRICING SECTION - CheapStreamTV Style
          ============================================ */}
      <section className="py-20 lg:py-28 bg-bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern" />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <span className="badge-premium mb-6">Pricing Plans</span>
            <h2 className="text-3xl lg:text-5xl font-bold text-text-primary mb-4 heading-uppercase">
              Simple, <span className="text-gold-gradient">Transparent</span> Pricing
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`glass-card p-8 card-lift relative ${
                  tier.popular ? "ring-2 ring-accent-gold animate-border-glow" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gold-gradient text-bg-primary text-xs font-bold rounded-full uppercase tracking-wider shadow-gold">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-text-primary mb-2 uppercase">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-black text-gold-gradient">{tier.price}</span>
                    <span className="text-text-muted">{tier.period}</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">{tier.description}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block">
                  <button className={`btn-pill w-full ${tier.popular ? "btn-pill-primary" : "btn-pill-secondary"}`}>
                    Get Started
                  </button>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/pricing-public" className="text-accent-gold hover:underline font-medium">
              View full pricing details →
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS SECTION - CheapStreamTV Style
          ============================================ */}
      <section className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="badge-premium mb-6">Customer Reviews</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4 heading-uppercase">
              Loved by <span className="text-gold-gradient">Thousands</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              See what our customers have to say about their experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass-card p-8 card-lift">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent-gold text-accent-gold" />
                  ))}
                </div>
                <p className="text-text-secondary mb-6 leading-relaxed italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center text-lg font-bold text-bg-primary">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">{testimonial.name}</div>
                    <div className="text-sm text-text-muted">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/reviews">
              <button className="btn-pill btn-pill-secondary">
                View All Reviews
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          FAQ SECTION - CheapStreamTV Style
          ============================================ */}
      <section className="py-20 lg:py-28 bg-bg-secondary relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="badge-premium mb-6">FAQ</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4 heading-uppercase">
              Frequently Asked <span className="text-gold-gradient">Questions</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="glass-card overflow-hidden"
              >
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
        </div>
      </section>

      {/* ============================================
          CTA SECTION - CheapStreamTV Style
          ============================================ */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/10 via-bg-primary to-bg-primary" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-gold/20 rounded-full blur-[150px]" />
        
        {/* Geometric Shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 border border-accent-gold/20 rotate-45" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border border-accent-gold/10 rotate-12" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-5xl font-black text-text-primary mb-6 heading-uppercase">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-text-secondary mb-10">
              Join 50,000+ users who trust BestSMSHQ for their SMS verification needs.
              Start free today, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="btn-pill btn-pill-primary flex items-center gap-2 justify-center">
                  Create Free Account
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
