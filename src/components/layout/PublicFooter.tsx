"use client";

import React from "react";
import Link from "next/link";
import { 
  MessageSquare, 
  Twitter, 
  Github, 
  Send,
  Mail,
  Globe,
  Shield,
  Zap,
  CreditCard
} from "lucide-react";

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { name: "SMS Activation", href: "/activate" },
      { name: "Rent Numbers", href: "/rent" },
      { name: "Pricing", href: "/pricing-public" },
      { name: "API Access", href: "/api-docs" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Blog", href: "/blog" },
      { name: "Reviews", href: "/reviews" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { name: "Help Center", href: "/help" },
      { name: "FAQ", href: "/faq" },
      { name: "Status", href: "/status" },
      { name: "API Docs", href: "/api-docs" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Use", href: "/terms" },
      { name: "Refund Policy", href: "/payment-policy" },
      { name: "Disclaimer", href: "/disclaimer" },
    ],
  },
};

const socialLinks = [
  { name: "Twitter", href: "https://twitter.com", icon: Twitter },
  { name: "Telegram", href: "https://t.me", icon: Send },
  { name: "GitHub", href: "https://github.com", icon: Github },
];

const features = [
  { icon: Shield, text: "Secure & Private" },
  { icon: Zap, text: "Instant Delivery" },
  { icon: Globe, text: "190+ Countries" },
  { icon: CreditCard, text: "Multiple Payment Options" },
];

export const PublicFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary border-t border-border-default">
      {/* Features Bar */}
      <div className="border-b border-border-default">
        <div className="container mx-auto px-6 lg:px-12 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature) => (
              <div
                key={feature.text}
                className="flex items-center gap-3 justify-center md:justify-start"
              >
                <div className="w-10 h-10 rounded-lg bg-bg-card flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-accent-gold" />
                </div>
                <span className="text-sm font-medium text-text-secondary">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-6 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
                <MessageSquare className="w-6 h-6 text-bg-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-text-primary tracking-tight">
                  Best<span className="text-gold-gradient">SMS</span>HQ
                </span>
                <span className="text-xs text-text-muted tracking-wider uppercase">
                  Premium Verification
                </span>
              </div>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed mb-6 max-w-sm">
              The most reliable SMS activation platform with instant virtual numbers 
              for verification. Trusted by thousands of users worldwide.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-bg-card border border-border-default flex items-center justify-center hover:border-accent-gold hover:bg-bg-hover transition-all duration-200 group"
                >
                  <social.icon className="w-5 h-5 text-text-muted group-hover:text-accent-gold transition-colors duration-200" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-accent-gold transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-border-default">
        <div className="container mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                Stay Updated
              </h3>
              <p className="text-sm text-text-secondary">
                Get the latest news and updates delivered to your inbox.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <div className="relative flex-1 md:w-64">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-12 pl-12 pr-4 bg-bg-card border border-border-default rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold transition-colors duration-200"
                />
              </div>
              <button className="h-12 px-6 bg-gold-gradient text-bg-primary font-semibold rounded-xl shadow-gold hover:shadow-gold-lg transition-shadow duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border-default">
        <div className="container mx-auto px-6 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-muted">
              © {currentYear} BestSMSHQ. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-text-muted hover:text-text-secondary transition-colors duration-200"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-text-muted hover:text-text-secondary transition-colors duration-200"
              >
                Terms
              </Link>
              <Link
                href="/contact"
                className="text-sm text-text-muted hover:text-text-secondary transition-colors duration-200"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

