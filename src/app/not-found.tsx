"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Home,
  Search,
  MessageSquare,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-gold/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-gold/5 rounded-full blur-[128px]" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Number */}
          <div className="relative mb-8">
            <h1 className="text-[150px] sm:text-[200px] font-bold text-gold-gradient leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-bg-card border border-border-default flex items-center justify-center shadow-xl">
                <MessageSquare className="w-16 h-16 text-accent-gold" />
              </div>
            </div>
          </div>

          {/* Message */}
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-text-secondary mb-10 max-w-md mx-auto">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved. 
            Let&apos;s get you back on track.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/">
              <Button variant="primary" size="lg" leftIcon={<Home className="w-5 h-5" />}>
                Go to Homepage
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<ArrowLeft className="w-5 h-5" />}
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>

          {/* Quick Links */}
          <div className="border-t border-border-default pt-10">
            <p className="text-text-muted mb-6">Or try one of these:</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                href="/activate"
                className="flex items-center gap-3 p-4 rounded-xl bg-bg-card border border-border-default hover:border-accent-gold transition-colors duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center group-hover:bg-accent-gold/10 transition-colors duration-200">
                  <MessageSquare className="w-5 h-5 text-accent-gold" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-text-primary">SMS Activation</div>
                  <div className="text-xs text-text-muted">Get virtual numbers</div>
                </div>
              </Link>

              <Link
                href="/faq"
                className="flex items-center gap-3 p-4 rounded-xl bg-bg-card border border-border-default hover:border-accent-gold transition-colors duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center group-hover:bg-accent-gold/10 transition-colors duration-200">
                  <HelpCircle className="w-5 h-5 text-accent-gold" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-text-primary">FAQ</div>
                  <div className="text-xs text-text-muted">Get answers</div>
                </div>
              </Link>

              <Link
                href="/contact"
                className="flex items-center gap-3 p-4 rounded-xl bg-bg-card border border-border-default hover:border-accent-gold transition-colors duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center group-hover:bg-accent-gold/10 transition-colors duration-200">
                  <Search className="w-5 h-5 text-accent-gold" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-text-primary">Contact</div>
                  <div className="text-xs text-text-muted">Get help</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

