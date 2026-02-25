"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Send,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  CheckCircle,
  Loader2,
  Twitter,
  Github,
  HelpCircle,
} from "lucide-react";

// Contact methods
const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help via email",
    value: "support@bestsmshq.com",
    action: "mailto:support@bestsmshq.com",
    responseTime: "24h response",
  },
  {
    icon: Send,
    title: "Telegram",
    description: "Chat with us on Telegram",
    value: "@BestSMSHQ_Support",
    action: "https://t.me/BestSMSHQ_Support",
    responseTime: "Instant response",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with our team",
    value: "Available 24/7",
    action: "#",
    responseTime: "< 5 min response",
  },
];

// Social links
const socialLinks = [
  { name: "Twitter", href: "https://twitter.com/bestsmshq", icon: Twitter },
  { name: "Telegram", href: "https://t.me/bestsmshq", icon: Send },
  { name: "GitHub", href: "https://github.com/bestsmshq", icon: Github },
];

// Subject options
const subjectOptions = [
  { value: "", label: "Select a subject" },
  { value: "general", label: "General Inquiry" },
  { value: "support", label: "Technical Support" },
  { value: "billing", label: "Billing & Payments" },
  { value: "partnership", label: "Partnership Opportunity" },
  { value: "feedback", label: "Feedback & Suggestions" },
  { value: "other", label: "Other" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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
              <MessageSquare className="w-4 h-4" />
              <span>Contact Us</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary leading-[1.1] mb-6 heading-uppercase animate-slide-up">
              Get in <span className="text-gold-gradient glow-gold-text">Touch</span>
            </h1>

            {/* Tagline */}
            <p className="tagline-italic text-lg lg:text-xl max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Have questions or need help? Our team is here to assist you.
              Reach out through any of our channels below.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          CONTACT METHODS SECTION
          ============================================ */}
      <section className="py-16 bg-bg-secondary relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.action}
                target={method.action.startsWith("http") ? "_blank" : undefined}
                rel={method.action.startsWith("http") ? "noopener noreferrer" : undefined}
                className="glass-card p-6 card-lift group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 flex-shrink-0 rounded-2xl bg-accent-gold/10 flex items-center justify-center glow-gold group-hover:scale-110 transition-transform">
                    <method.icon className="w-7 h-7 text-accent-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary mb-1 uppercase">{method.title}</h3>
                    <p className="text-sm text-text-muted mb-2">{method.description}</p>
                    <p className="text-accent-gold font-medium">{method.value}</p>
                    <p className="text-xs text-text-muted mt-1">{method.responseTime}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CONTACT FORM SECTION
          ============================================ */}
      <section className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Form */}
            <div>
              <span className="badge-premium mb-6">Send a Message</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-6 heading-uppercase">
                Contact <span className="text-gold-gradient">Form</span>
              </h2>
              <p className="text-text-secondary mb-8">
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </p>

              {isSubmitted ? (
                <div className="glass-card p-8 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-success" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-4">Message Sent!</h3>
                  <p className="text-text-secondary mb-6">
                    Thank you for reaching out. We&apos;ll respond to your inquiry within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="btn-pill btn-pill-secondary"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="w-full h-14 px-4 bg-bg-secondary border border-border-default rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                        className="w-full h-14 px-4 bg-bg-secondary border border-border-default rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full h-14 px-4 bg-bg-secondary border border-border-default rounded-xl text-text-primary focus:outline-none focus:border-accent-gold transition-colors appearance-none cursor-pointer"
                    >
                      {subjectOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-4 bg-bg-secondary border border-border-default rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-pill btn-pill-primary w-full flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="glass-card p-8 mb-8">
                <h3 className="text-xl font-bold text-text-primary mb-6 uppercase">
                  Quick Links
                </h3>
                <div className="space-y-4">
                  <Link
                    href="/faq"
                    className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary/50 hover:bg-bg-hover transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <HelpCircle className="w-6 h-6 text-accent-gold" />
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary">FAQ</div>
                      <div className="text-sm text-text-muted">Find quick answers</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-muted ml-auto" />
                  </Link>
                  <Link
                    href="/status"
                    className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary/50 hover:bg-bg-hover transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6 text-accent-gold" />
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary">System Status</div>
                      <div className="text-sm text-text-muted">Check service uptime</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-muted ml-auto" />
                  </Link>
                </div>
              </div>

              <div className="glass-card p-8">
                <h3 className="text-xl font-bold text-text-primary mb-6 uppercase">
                  Follow Us
                </h3>
                <p className="text-text-secondary mb-6">
                  Stay updated with the latest news and announcements.
                </p>
                <div className="flex gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-bg-secondary border border-border-default flex items-center justify-center hover:border-accent-gold hover:bg-bg-hover transition-all group"
                    >
                      <social.icon className="w-5 h-5 text-text-muted group-hover:text-accent-gold transition-colors" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Office Info */}
              <div className="glass-card p-8 mt-8">
                <h3 className="text-xl font-bold text-text-primary mb-6 uppercase">
                  Business Hours
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Clock className="w-5 h-5 text-accent-gold" />
                    <div>
                      <div className="font-medium text-text-primary">Support Hours</div>
                      <div className="text-sm text-text-muted">24/7 - Always Available</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <MapPin className="w-5 h-5 text-accent-gold" />
                    <div>
                      <div className="font-medium text-text-primary">Location</div>
                      <div className="text-sm text-text-muted">Global - Remote First</div>
                    </div>
                  </div>
                </div>
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

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-6 heading-uppercase">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-text-secondary mb-10">
              Join 50,000+ users who trust BestSMSHQ for their verification needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="btn-pill btn-pill-primary flex items-center gap-2 justify-center">
                  Create Free Account
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
