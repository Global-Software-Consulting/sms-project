"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Globe,
  Award,
  Target,
  Heart,
  Zap,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Lock,
  Headphones,
} from "lucide-react";

// Stats data
const stats = [
  { value: "50K+", label: "Active Users", icon: Users },
  { value: "190+", label: "Countries", icon: Globe },
  { value: "1000+", label: "Services", icon: Zap },
  { value: "99.9%", label: "Uptime", icon: TrendingUp },
];

// Values data
const values = [
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your privacy is our top priority. We never store personal data or share information with third parties.",
  },
  {
    icon: Zap,
    title: "Speed & Reliability",
    description: "Lightning-fast SMS delivery with 99.9% uptime. Our infrastructure is built for performance.",
  },
  {
    icon: Heart,
    title: "Customer Focus",
    description: "We listen to our users and continuously improve based on feedback. Your success is our success.",
  },
  {
    icon: Lock,
    title: "Security",
    description: "Enterprise-grade security measures protect your transactions and data at all times.",
  },
];

// Timeline milestones
const milestones = [
  { year: "2022", title: "Founded", description: "BestSMSHQ was born with a mission to simplify SMS verification." },
  { year: "2023", title: "Global Expansion", description: "Expanded to 100+ countries with 500+ supported services." },
  { year: "2024", title: "1M Verifications", description: "Reached 1 million successful verifications milestone." },
  { year: "2025", title: "Industry Leader", description: "Became the #1 choice for privacy-focused SMS verification." },
];

// Team values
const teamValues = [
  { icon: Target, title: "Mission-Driven", description: "Every decision we make is guided by our mission to protect user privacy." },
  { icon: Award, title: "Excellence", description: "We strive for excellence in everything we do, from code to customer service." },
  { icon: Users, title: "Community", description: "We believe in building a strong community of privacy-conscious users." },
];

export default function AboutPage() {
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
              <Users className="w-4 h-4" />
              <span>About Us</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary leading-[1.1] mb-6 heading-uppercase animate-slide-up">
              Making SMS Verification
              <br />
              <span className="text-gold-gradient glow-gold-text">Simple & Private</span>
            </h1>

            {/* Tagline */}
            <p className="tagline-italic text-lg lg:text-xl max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
              We&apos;re on a mission to provide the most reliable, private, and user-friendly
              SMS verification service in the world.
            </p>

            {/* Accent Line */}
            <div className="accent-line mx-auto animate-slide-up" style={{ animationDelay: '200ms' }} />
          </div>
        </div>
      </section>

      {/* ============================================
          STATS SECTION
          ============================================ */}
      <section className="py-16 bg-bg-secondary relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-6 text-center card-lift">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-accent-gold/10 flex items-center justify-center">
                  <stat.icon className="w-7 h-7 text-accent-gold" />
                </div>
                <div className="stat-number text-3xl lg:text-4xl mb-2">{stat.value}</div>
                <div className="text-text-secondary text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          OUR STORY SECTION
          ============================================ */}
      <section className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content */}
            <div>
              <span className="badge-premium mb-6">Our Story</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-6 heading-uppercase">
                Built by Users, <span className="text-gold-gradient">for Users</span>
              </h2>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>
                  BestSMSHQ was born out of frustration with existing SMS verification services. 
                  As developers and privacy advocates ourselves, we experienced firsthand the 
                  challenges of finding reliable, private, and affordable verification solutions.
                </p>
                <p>
                  We set out to build something better—a platform that prioritizes user privacy, 
                  delivers instant results, and offers transparent pricing. Today, we&apos;re proud 
                  to serve over 50,000 users worldwide.
                </p>
                <p>
                  Our commitment to excellence has made us the go-to choice for individuals and 
                  businesses who value their privacy and need reliable SMS verification.
                </p>
              </div>
              
              <div className="mt-8">
                <Link href="/contact">
                  <button className="btn-pill btn-pill-primary flex items-center gap-2">
                    Get in Touch
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="glass-card p-8 lg:p-12">
                <div className="grid grid-cols-2 gap-6">
                  <div className="glass-card p-6 text-center glow-gold">
                    <Shield className="w-10 h-10 text-accent-gold mx-auto mb-3" />
                    <div className="font-bold text-text-primary">Privacy</div>
                    <div className="text-sm text-text-muted">Guaranteed</div>
                  </div>
                  <div className="glass-card p-6 text-center">
                    <Zap className="w-10 h-10 text-accent-gold mx-auto mb-3" />
                    <div className="font-bold text-text-primary">Instant</div>
                    <div className="text-sm text-text-muted">Delivery</div>
                  </div>
                  <div className="glass-card p-6 text-center">
                    <Globe className="w-10 h-10 text-accent-gold mx-auto mb-3" />
                    <div className="font-bold text-text-primary">Global</div>
                    <div className="text-sm text-text-muted">Coverage</div>
                  </div>
                  <div className="glass-card p-6 text-center glow-gold">
                    <Headphones className="w-10 h-10 text-accent-gold mx-auto mb-3" />
                    <div className="font-bold text-text-primary">24/7</div>
                    <div className="text-sm text-text-muted">Support</div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 border-2 border-accent-gold/20 rotate-45" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 border-2 border-accent-gold/10 rotate-12" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          VALUES SECTION
          ============================================ */}
      <section className="py-20 lg:py-28 bg-bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-pattern opacity-50" />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <span className="badge-premium mb-6">Our Values</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4 heading-uppercase">
              What We <span className="text-gold-gradient">Stand For</span>
            </h2>
            <div className="accent-line mx-auto mt-6" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="glass-card glass-card-hover p-8 card-lift">
                <div className="w-16 h-16 rounded-2xl bg-accent-gold/10 flex items-center justify-center mb-6 glow-gold">
                  <value.icon className="w-8 h-8 text-accent-gold" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3 uppercase tracking-wide">
                  {value.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          TIMELINE SECTION
          ============================================ */}
      <section className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="badge-premium mb-6">Our Journey</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4 heading-uppercase">
              Milestones & <span className="text-gold-gradient">Achievements</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-gold via-accent-gold to-accent-gold/30" />

              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`relative flex items-center gap-8 mb-12 ${
                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-8 lg:left-1/2 w-4 h-4 -translate-x-1/2 rounded-full bg-accent-gold glow-gold z-10" />

                  {/* Content */}
                  <div className={`ml-20 lg:ml-0 lg:w-1/2 ${index % 2 === 0 ? "lg:pr-16 lg:text-right" : "lg:pl-16"}`}>
                    <div className="glass-card p-6 card-lift">
                      <div className="text-accent-gold font-bold text-2xl mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-text-primary mb-2 uppercase">{milestone.title}</h3>
                      <p className="text-text-secondary">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          TEAM VALUES SECTION
          ============================================ */}
      <section className="py-20 lg:py-28 bg-bg-secondary relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="badge-premium mb-6">Our Team</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4 heading-uppercase">
              Driven by <span className="text-gold-gradient">Excellence</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Our team is united by a shared commitment to privacy, security, and exceptional service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {teamValues.map((item) => (
              <div key={item.title} className="glass-card p-8 text-center card-lift">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-accent-gold/10 flex items-center justify-center mb-6 glow-gold">
                  <item.icon className="w-10 h-10 text-accent-gold" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3 uppercase">{item.title}</h3>
                <p className="text-text-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          MISSION SECTION
          ============================================ */}
      <section className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 lg:p-12 text-center relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-accent-gold/10 rounded-full blur-[100px]" />
              
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gold-gradient flex items-center justify-center mb-8 shadow-gold-lg">
                  <Target className="w-10 h-10 text-bg-primary" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-6 heading-uppercase">
                  Our Mission
                </h2>
                <p className="text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
                  To empower individuals and businesses with secure, private, and instant SMS verification 
                  solutions that protect their digital identity while simplifying online verification processes.
                </p>
              </div>
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
              Join Our Growing Community
            </h2>
            <p className="text-xl text-text-secondary mb-10">
              Be part of 50,000+ users who trust BestSMSHQ for their verification needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="btn-pill btn-pill-primary flex items-center gap-2 justify-center">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="btn-pill btn-pill-secondary">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
