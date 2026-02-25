"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Shield, Zap, Globe, ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * AuthLayout Component - Following Design Guidelines
 * 
 * Split layout:
 * - Left: Branding panel with features (hidden on mobile)
 * - Right: Auth form area
 * 
 * Spacing follows 8px grid system:
 * - Section padding: 48-64px
 * - Component gaps: 24-32px
 * - Feature card gaps: 16px
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-bg-primary">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary" />
        
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          {/* Gold accent circles */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl" />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(198, 167, 94, 0.3) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(198, 167, 94, 0.3) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* Content - 64px padding as per guidelines */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold group-hover:shadow-gold-lg transition-shadow duration-200">
                <MessageSquare className="w-6 h-6 text-bg-primary" />
              </div>
              <span className="text-2xl font-bold text-text-primary">
                SMS<span className="text-gold-gradient">Pro</span>
              </span>
            </Link>
          </div>

          {/* Main Content - 48px gap between sections */}
          <div className="space-y-12">
            {/* Headline Section - 24px internal gap */}
            <div className="space-y-6">
              <h1 className="text-4xl xl:text-5xl font-bold text-text-primary leading-tight">
                Premium SMS
                <br />
                <span className="text-gold-gradient">Activation Platform</span>
              </h1>
              <p className="text-lg text-text-secondary max-w-md leading-relaxed">
                Get instant access to virtual numbers from 150+ countries. 
                High success rates, multiple providers, enterprise-grade reliability.
              </p>
            </div>

            {/* Features Grid - 16px gap as per guidelines */}
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard
                icon={<Globe className="w-5 h-5" />}
                title="150+ Countries"
                description="Global coverage"
              />
              <FeatureCard
                icon={<Zap className="w-5 h-5" />}
                title="Instant Delivery"
                description="Real-time SMS"
              />
              <FeatureCard
                icon={<Shield className="w-5 h-5" />}
                title="99.9% Uptime"
                description="Enterprise reliability"
              />
              <FeatureCard
                icon={<MessageSquare className="w-5 h-5" />}
                title="Multi-Provider"
                description="Best rates guaranteed"
              />
            </div>
          </div>

          {/* Stats - 48px gap between items as per guidelines */}
          <div className="flex items-center gap-12">
            <StatItem value="10M+" label="SMS Delivered" />
            <div className="w-px h-12 bg-border-default" />
            <StatItem value="50K+" label="Active Users" />
            <div className="w-px h-12 bg-border-default" />
            <StatItem value="99.9%" label="Success Rate" />
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form with proper breathing space */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center px-6 py-12 sm:px-8 lg:px-12 xl:px-16">
        <div className="w-full max-w-[420px]">
          {/* Back to Home Link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent-gold transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Mobile Logo - 32px margin bottom */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
                <MessageSquare className="w-5 h-5 text-bg-primary" />
              </div>
              <span className="text-xl font-bold text-text-primary">
                SMS<span className="text-gold-gradient">Pro</span>
              </span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

/**
 * Feature Card - 16px padding, 12px gap between icon and text
 */
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="p-4 rounded-2xl bg-text-primary/[0.03] border border-text-primary/[0.06] hover:bg-text-primary/[0.05] hover:border-accent-gold/20 transition-all duration-200 group">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center text-accent-gold group-hover:bg-accent-gold/20 transition-colors duration-200 flex-shrink-0">
        {icon}
      </div>
      <div className="pt-1">
        <h3 className="font-semibold text-text-primary text-sm leading-tight">{title}</h3>
        <p className="text-xs text-text-muted mt-1">{description}</p>
      </div>
    </div>
  </div>
);

interface StatItemProps {
  value: string;
  label: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, label }) => (
  <div>
    <div className="text-2xl font-bold text-gold-gradient">{value}</div>
    <div className="text-sm text-text-muted mt-1">{label}</div>
  </div>
);
