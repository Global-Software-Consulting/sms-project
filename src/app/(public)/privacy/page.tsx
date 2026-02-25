"use client";

import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  const lastUpdated = "February 23, 2026";

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative hero-bg-overlay" style={{ paddingTop: '160px', paddingBottom: '40px' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        
        {/* Geometric Shapes */}
        <div className="absolute top-32 left-10 w-32 h-32 border-2 border-accent-gold/20 rotate-45 animate-float" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent-gold/10 rounded-full blur-[150px]" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-gold transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-accent-gold/10 flex items-center justify-center glow-gold">
                <Shield className="w-8 h-8 text-accent-gold" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-text-primary heading-uppercase">
                  Privacy Policy
                </h1>
                <p className="text-text-muted">Last updated: {lastUpdated}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 lg:p-12">
              <div className="prose prose-invert max-w-none">
                <div className="space-y-8 text-text-secondary leading-relaxed">
                  {/* Introduction */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      1. Introduction
                    </h2>
                    <p>
                      Welcome to BestSMSHQ (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting 
                      your privacy and ensuring the security of your personal information. This Privacy 
                      Policy explains how we collect, use, disclose, and safeguard your information when 
                      you use our SMS verification services.
                    </p>
                    <p className="mt-4">
                      By using our services, you agree to the collection and use of information in 
                      accordance with this policy. If you do not agree with our policies and practices, 
                      please do not use our services.
                    </p>
                  </section>

                  {/* Information We Collect */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      2. Information We Collect
                    </h2>
                    <h3 className="text-lg font-medium text-text-primary mt-6 mb-3">
                      2.1 Information You Provide
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Email address (required for account creation)</li>
                      <li>Username (optional)</li>
                      <li>Payment information (processed by third-party payment providers)</li>
                      <li>Communication data when you contact our support team</li>
                    </ul>

                    <h3 className="text-lg font-medium text-text-primary mt-6 mb-3">
                      2.2 Information Collected Automatically
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>IP address and approximate location</li>
                      <li>Device information (browser type, operating system)</li>
                      <li>Usage data (pages visited, features used, timestamps)</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>

                    <h3 className="text-lg font-medium text-text-primary mt-6 mb-3">
                      2.3 Information We Do NOT Collect
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Government-issued identification</li>
                      <li>Physical address</li>
                      <li>Phone numbers (except virtual numbers you purchase)</li>
                      <li>Social security numbers or equivalent</li>
                    </ul>
                  </section>

                  {/* How We Use Your Information */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      3. How We Use Your Information
                    </h2>
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li>Provide, maintain, and improve our services</li>
                      <li>Process transactions and send related information</li>
                      <li>Send technical notices, updates, and support messages</li>
                      <li>Respond to your comments, questions, and requests</li>
                      <li>Monitor and analyze trends, usage, and activities</li>
                      <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                  </section>

                  {/* Data Retention */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      4. Data Retention
                    </h2>
                    <p>
                      We retain your personal information only for as long as necessary to fulfill 
                      the purposes outlined in this Privacy Policy, unless a longer retention period 
                      is required or permitted by law.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li>Account data: Retained while your account is active</li>
                      <li>Transaction records: Retained for 7 years for legal compliance</li>
                      <li>SMS content: Deleted within 24 hours of delivery</li>
                      <li>Usage logs: Retained for 90 days</li>
                    </ul>
                  </section>

                  {/* Data Sharing */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      5. Data Sharing and Disclosure
                    </h2>
                    <p>We may share your information in the following circumstances:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li>
                        <strong className="text-text-primary">Service Providers:</strong> With third-party 
                        vendors who perform services on our behalf (payment processing, hosting, analytics)
                      </li>
                      <li>
                        <strong className="text-text-primary">Legal Requirements:</strong> When required by 
                        law, court order, or governmental authority
                      </li>
                      <li>
                        <strong className="text-text-primary">Protection of Rights:</strong> To protect our 
                        rights, privacy, safety, or property
                      </li>
                      <li>
                        <strong className="text-text-primary">Business Transfers:</strong> In connection with 
                        a merger, acquisition, or sale of assets
                      </li>
                    </ul>
                    <p className="mt-4">
                      We do NOT sell, rent, or trade your personal information to third parties for 
                      marketing purposes.
                    </p>
                  </section>

                  {/* Security */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      6. Data Security
                    </h2>
                    <p>
                      We implement appropriate technical and organizational measures to protect your 
                      personal information against unauthorized access, alteration, disclosure, or 
                      destruction. These measures include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li>TLS 1.3 encryption for all data in transit</li>
                      <li>AES-256 encryption for data at rest</li>
                      <li>Regular security audits and penetration testing</li>
                      <li>Access controls and authentication mechanisms</li>
                      <li>Secure data centers with physical security measures</li>
                    </ul>
                  </section>

                  {/* Cookies */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      7. Cookies and Tracking Technologies
                    </h2>
                    <p>
                      We use cookies and similar tracking technologies to collect and track information 
                      about your use of our services. You can control cookies through your browser 
                      settings, but disabling cookies may affect the functionality of our services.
                    </p>
                    <h3 className="text-lg font-medium text-text-primary mt-6 mb-3">
                      Types of Cookies We Use:
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong className="text-text-primary">Essential Cookies:</strong> Required for 
                        basic site functionality
                      </li>
                      <li>
                        <strong className="text-text-primary">Analytics Cookies:</strong> Help us understand 
                        how visitors interact with our site
                      </li>
                      <li>
                        <strong className="text-text-primary">Preference Cookies:</strong> Remember your 
                        settings and preferences
                      </li>
                    </ul>
                  </section>

                  {/* Your Rights */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      8. Your Rights
                    </h2>
                    <p>Depending on your location, you may have the following rights:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li>Access your personal information</li>
                      <li>Correct inaccurate or incomplete data</li>
                      <li>Delete your personal information</li>
                      <li>Object to or restrict processing</li>
                      <li>Data portability</li>
                      <li>Withdraw consent at any time</li>
                    </ul>
                    <p className="mt-4">
                      To exercise these rights, please contact us at{" "}
                      <a href="mailto:privacy@bestsmshq.com" className="text-accent-gold hover:underline">
                        privacy@bestsmshq.com
                      </a>
                    </p>
                  </section>

                  {/* International Transfers */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      9. International Data Transfers
                    </h2>
                    <p>
                      Your information may be transferred to and processed in countries other than 
                      your country of residence. These countries may have different data protection 
                      laws. We ensure appropriate safeguards are in place to protect your information 
                      in accordance with this Privacy Policy.
                    </p>
                  </section>

                  {/* Children's Privacy */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      10. Children&apos;s Privacy
                    </h2>
                    <p>
                      Our services are not intended for individuals under the age of 18. We do not 
                      knowingly collect personal information from children. If you are a parent or 
                      guardian and believe your child has provided us with personal information, 
                      please contact us immediately.
                    </p>
                  </section>

                  {/* Changes to Policy */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      11. Changes to This Privacy Policy
                    </h2>
                    <p>
                      We may update this Privacy Policy from time to time. We will notify you of 
                      any changes by posting the new Privacy Policy on this page and updating the 
                      &quot;Last updated&quot; date. We encourage you to review this Privacy Policy periodically.
                    </p>
                  </section>

                  {/* Contact */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      12. Contact Us
                    </h2>
                    <p>
                      If you have any questions about this Privacy Policy or our privacy practices, 
                      please contact us:
                    </p>
                    <ul className="list-none space-y-2 mt-4">
                      <li>
                        <strong className="text-text-primary">Email:</strong>{" "}
                        <a href="mailto:privacy@bestsmshq.com" className="text-accent-gold hover:underline">
                          privacy@bestsmshq.com
                        </a>
                      </li>
                      <li>
                        <strong className="text-text-primary">Support:</strong>{" "}
                        <a href="mailto:support@bestsmshq.com" className="text-accent-gold hover:underline">
                          support@bestsmshq.com
                        </a>
                      </li>
                    </ul>
                  </section>
                </div>
              </div>
            </div>

            {/* Related Links */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/terms"
                className="btn-pill btn-pill-secondary text-sm"
              >
                Terms of Use →
              </Link>
              <Link
                href="/payment-policy"
                className="btn-pill btn-pill-secondary text-sm"
              >
                Payment & Refund Policy →
              </Link>
              <Link
                href="/contact"
                className="btn-pill btn-pill-secondary text-sm"
              >
                Contact Us →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

