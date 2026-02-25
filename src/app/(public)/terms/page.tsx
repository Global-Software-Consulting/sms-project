"use client";

import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export default function TermsOfUsePage() {
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
                <FileText className="w-8 h-8 text-accent-gold" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-text-primary heading-uppercase">
                  Terms of Use
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
                      1. Acceptance of Terms
                    </h2>
                    <p>
                      By accessing or using BestSMSHQ (&quot;Service&quot;), you agree to be bound by these 
                      Terms of Use (&quot;Terms&quot;). If you disagree with any part of these terms, you may 
                      not access the Service.
                    </p>
                    <p className="mt-4">
                      These Terms apply to all visitors, users, and others who access or use the Service. 
                      We reserve the right to update these Terms at any time. Continued use of the Service 
                      after changes constitutes acceptance of the new Terms.
                    </p>
                  </section>

                  {/* Description of Service */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      2. Description of Service
                    </h2>
                    <p>
                      BestSMSHQ provides virtual phone numbers for SMS verification purposes. Our Service 
                      allows users to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li>Purchase temporary virtual phone numbers</li>
                      <li>Receive SMS verification codes</li>
                      <li>Rent phone numbers for extended periods</li>
                      <li>Access our API for automated verification</li>
                    </ul>
                  </section>

                  {/* User Accounts */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      3. User Accounts
                    </h2>
                    <h3 className="text-lg font-medium text-text-primary mt-6 mb-3">
                      3.1 Account Creation
                    </h3>
                    <p>
                      To use certain features of the Service, you must create an account. You agree to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li>Provide accurate and complete information</li>
                      <li>Maintain the security of your account credentials</li>
                      <li>Notify us immediately of any unauthorized access</li>
                      <li>Accept responsibility for all activities under your account</li>
                    </ul>

                    <h3 className="text-lg font-medium text-text-primary mt-6 mb-3">
                      3.2 Account Termination
                    </h3>
                    <p>
                      We reserve the right to suspend or terminate your account at any time for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li>Violation of these Terms</li>
                      <li>Fraudulent or illegal activity</li>
                      <li>Abuse of the Service</li>
                      <li>Non-payment of fees</li>
                    </ul>
                  </section>

                  {/* Acceptable Use */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      4. Acceptable Use Policy
                    </h2>
                    <p>You agree NOT to use the Service to:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li>Engage in any illegal activities</li>
                      <li>Violate the terms of service of third-party platforms</li>
                      <li>Commit fraud or identity theft</li>
                      <li>Send spam or unsolicited communications</li>
                      <li>Harass, abuse, or harm others</li>
                      <li>Distribute malware or harmful content</li>
                      <li>Attempt to gain unauthorized access to our systems</li>
                      <li>Resell or redistribute our services without authorization</li>
                      <li>Use automated tools to abuse the Service</li>
                    </ul>
                    <p className="mt-4">
                      Violation of this policy may result in immediate account termination without 
                      refund and may be reported to relevant authorities.
                    </p>
                  </section>

                  {/* Payment Terms */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      5. Payment Terms
                    </h2>
                    <h3 className="text-lg font-medium text-text-primary mt-6 mb-3">
                      5.1 Pricing
                    </h3>
                    <p>
                      All prices are displayed in USD unless otherwise specified. Prices may change 
                      without notice. The price at the time of purchase applies to your transaction.
                    </p>

                    <h3 className="text-lg font-medium text-text-primary mt-6 mb-3">
                      5.2 Wallet System
                    </h3>
                    <p>
                      Funds deposited to your wallet are non-refundable except as provided in our 
                      Refund Policy. Wallet balances do not expire but may be forfeited upon account 
                      termination for Terms violations.
                    </p>

                    <h3 className="text-lg font-medium text-text-primary mt-6 mb-3">
                      5.3 Memberships
                    </h3>
                    <p>
                      Membership fees are charged from your wallet balance. If insufficient funds are 
                      available, your membership will not renew and you will be downgraded to the Free tier.
                    </p>
                  </section>

                  {/* Service Availability */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      6. Service Availability
                    </h2>
                    <p>
                      We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. 
                      The Service may be temporarily unavailable due to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li>Scheduled maintenance</li>
                      <li>Emergency repairs</li>
                      <li>Third-party service outages</li>
                      <li>Force majeure events</li>
                    </ul>
                    <p className="mt-4">
                      We are not liable for any losses resulting from service unavailability.
                    </p>
                  </section>

                  {/* Intellectual Property */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      7. Intellectual Property
                    </h2>
                    <p>
                      The Service and its original content, features, and functionality are owned by 
                      BestSMSHQ and are protected by international copyright, trademark, and other 
                      intellectual property laws.
                    </p>
                    <p className="mt-4">
                      You may not copy, modify, distribute, sell, or lease any part of our Service 
                      without explicit written permission.
                    </p>
                  </section>

                  {/* Disclaimer */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      8. Disclaimer of Warranties
                    </h2>
                    <p>
                      THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY 
                      KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li>MERCHANTABILITY</li>
                      <li>FITNESS FOR A PARTICULAR PURPOSE</li>
                      <li>NON-INFRINGEMENT</li>
                      <li>ACCURACY OR RELIABILITY OF RESULTS</li>
                    </ul>
                    <p className="mt-4">
                      We do not warrant that the Service will meet your requirements or that it will 
                      be error-free, secure, or uninterrupted.
                    </p>
                  </section>

                  {/* Limitation of Liability */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      9. Limitation of Liability
                    </h2>
                    <p>
                      TO THE MAXIMUM EXTENT PERMITTED BY LAW, BESTSMSHQ SHALL NOT BE LIABLE FOR:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li>Any indirect, incidental, special, or consequential damages</li>
                      <li>Loss of profits, data, or business opportunities</li>
                      <li>Damages resulting from unauthorized access to your account</li>
                      <li>Damages resulting from third-party actions</li>
                    </ul>
                    <p className="mt-4">
                      Our total liability shall not exceed the amount you paid to us in the 12 months 
                      preceding the claim.
                    </p>
                  </section>

                  {/* Indemnification */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      10. Indemnification
                    </h2>
                    <p>
                      You agree to indemnify, defend, and hold harmless BestSMSHQ and its officers, 
                      directors, employees, and agents from any claims, damages, losses, or expenses 
                      arising from:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li>Your use of the Service</li>
                      <li>Your violation of these Terms</li>
                      <li>Your violation of any third-party rights</li>
                      <li>Any content you submit through the Service</li>
                    </ul>
                  </section>

                  {/* Governing Law */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      11. Governing Law
                    </h2>
                    <p>
                      These Terms shall be governed by and construed in accordance with the laws of 
                      the jurisdiction in which BestSMSHQ operates, without regard to its conflict 
                      of law provisions.
                    </p>
                    <p className="mt-4">
                      Any disputes arising from these Terms shall be resolved through binding 
                      arbitration, except where prohibited by law.
                    </p>
                  </section>

                  {/* Changes to Terms */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      12. Changes to Terms
                    </h2>
                    <p>
                      We reserve the right to modify these Terms at any time. We will provide notice 
                      of significant changes by posting the new Terms on this page and updating the 
                      &quot;Last updated&quot; date.
                    </p>
                    <p className="mt-4">
                      Your continued use of the Service after changes become effective constitutes 
                      acceptance of the revised Terms.
                    </p>
                  </section>

                  {/* Severability */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      13. Severability
                    </h2>
                    <p>
                      If any provision of these Terms is found to be unenforceable or invalid, that 
                      provision shall be limited or eliminated to the minimum extent necessary, and 
                      the remaining provisions shall remain in full force and effect.
                    </p>
                  </section>

                  {/* Contact */}
                  <section>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">
                      14. Contact Information
                    </h2>
                    <p>
                      If you have any questions about these Terms, please contact us:
                    </p>
                    <ul className="list-none space-y-2 mt-4">
                      <li>
                        <strong className="text-text-primary">Email:</strong>{" "}
                        <a href="mailto:legal@bestsmshq.com" className="text-accent-gold hover:underline">
                          legal@bestsmshq.com
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
                href="/privacy"
                className="btn-pill btn-pill-secondary text-sm"
              >
                Privacy Policy →
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
