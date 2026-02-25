"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
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

// Features data
const features = [
  {
    icon: Zap,
    title: "Instant Activation",
    description: "Get your virtual number in seconds. No waiting, no delays.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    icon: Globe,
    title: "190+ Countries",
    description: "Access phone numbers from over 190 countries worldwide.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Shield,
    title: "100% Private",
    description: "No personal data required. Anonymous verification made easy.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: CreditCard,
    title: "Multiple Payments",
    description: "Pay with crypto, cards, or e-wallets. 7+ payment gateways.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Our platform never sleeps. Get numbers anytime, anywhere.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: TrendingUp,
    title: "High Success Rate",
    description: "99%+ success rate across all services. Reliable numbers.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
];

// Pricing tiers preview
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
    price: "$14.99",
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

// Popular services
const popularServices = [
  { name: "WhatsApp", icon: "📱", price: "$0.50" },
  { name: "Telegram", icon: "✈️", price: "$0.35" },
  { name: "Google", icon: "🔍", price: "$0.45" },
  { name: "Instagram", icon: "📸", price: "$0.55" },
  { name: "Twitter/X", icon: "🐦", price: "$0.40" },
  { name: "Discord", icon: "🎮", price: "$0.30" },
];

// Testimonials
const testimonials = [
  {
    name: "Alex M.",
    role: "Developer",
    content: "Best SMS service I've used. Fast, reliable, and the API is incredibly easy to integrate.",
    rating: 5,
  },
  {
    name: "Sarah K.",
    role: "Marketing Manager",
    content: "We use BestSMSHQ for all our verification needs. The success rate is unmatched.",
    rating: 5,
  },
  {
    name: "Michael R.",
    role: "Entrepreneur",
    content: "The crypto payment option is a game changer. Privacy-focused and efficient.",
    rating: 5,
  },
];

export default function Home() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  const usersCount = useCounter(50000, 2500);
  const countriesCount = useCounter(190, 2000);
  const servicesCount = useCounter(1000, 2500);
  const successRate = useCounter(99, 2000);

  useEffect(() => {
    // Only redirect authenticated users to dashboard
    if (isInitialized && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isInitialized, router]);

  // If authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-accent-gold border-t-transparent animate-spin" />
          <p className="text-text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // For non-authenticated users, show the landing page
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <PublicHeader />
      <main className="flex-1 pt-20">
        <div className="relative overflow-hidden">
          {/* Hero Section */}
          <section className="relative min-h-[90vh] flex items-center">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-gold/20 rounded-full blur-[128px]" />
              <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-gold/10 rounded-full blur-[128px]" />
              <div 
                className="absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                   linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                  backgroundSize: '64px 64px',
                }}
              />
              <div className="absolute top-32 left-[15%] w-3 h-3 bg-accent-gold rounded-full animate-pulse" />
              <div className="absolute top-48 right-[20%] w-2 h-2 bg-accent-gold/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-32 left-[25%] w-2 h-2 bg-accent-gold/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Left Content */}
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-card border border-border-default mb-8 animate-fade-in">
                    <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span className="text-sm text-text-secondary">
                      Trusted by <span className="text-accent-gold font-semibold">50,000+</span> users worldwide
                    </span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-[1.1] mb-6 animate-slide-up">
                    Instant SMS
                    <br />
                    <span className="text-gold-gradient">Verification</span>
                    <br />
                    Made Simple
                  </h1>

                  <p className="text-lg text-text-secondary max-w-xl mx-auto lg:mx-0 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    Get virtual phone numbers from 190+ countries for instant SMS verification. 
                    Fast, secure, and anonymous. No personal data required.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <Link href="/register">
                      <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                        Start Free Now
                      </Button>
                    </Link>
                    <Link href="/pricing-public">
                      <Button variant="secondary" size="lg">
                        View Pricing
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-bg-card border-2 border-bg-primary flex items-center justify-center text-xs font-medium text-text-secondary"
                          >
                            {String.fromCharCode(64 + i)}
                          </div>
                        ))}
                      </div>
                      <span className="text-sm text-text-muted">+50k users</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-accent-gold text-accent-gold" />
                      ))}
                      <span className="text-sm text-text-muted ml-1">4.9/5</span>
                    </div>
                  </div>
                </div>

                {/* Right Content - Interactive Demo */}
                <div className="relative animate-slide-up" style={{ animationDelay: '400ms' }}>
                  <div className="relative">
                    <Card variant="premium" padding="large" className="relative overflow-hidden">
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-gold/20 rounded-full blur-3xl" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-text-primary">Quick Activation</h3>
                          <span className="px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                            Live Demo
                          </span>
                        </div>

                        <div className="space-y-4 mb-6">
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-secondary border border-border-default">
                            <div className="w-10 h-10 rounded-lg bg-bg-card flex items-center justify-center text-xl">
                              📱
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-text-primary">WhatsApp</div>
                              <div className="text-xs text-text-muted">Most Popular</div>
                            </div>
                            <div className="text-accent-gold font-semibold">$0.50</div>
                          </div>

                          <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-secondary border border-border-default">
                            <div className="w-10 h-10 rounded-lg bg-bg-card flex items-center justify-center">
                              <Globe className="w-5 h-5 text-accent-gold" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-text-primary">United States</div>
                              <div className="text-xs text-text-muted">+1 (XXX) XXX-XXXX</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-text-muted" />
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-accent-gold/5 border border-accent-gold/20 mb-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-text-muted mb-1">Your Number</div>
                              <div className="text-xl font-mono font-bold text-accent-gold">
                                +1 (555) 123-4567
                              </div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-success" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-secondary border border-success/30">
                          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-success" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-text-muted">Verification Code</div>
                            <div className="text-lg font-mono font-bold text-text-primary">847291</div>
                          </div>
                          <span className="text-xs text-success">Just now</span>
                        </div>
                      </div>
                    </Card>

                    <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-bg-card border border-border-default shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-accent-gold" />
                        <span className="text-sm font-medium text-text-primary">Instant delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16 bg-bg-secondary border-y border-border-default">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold text-accent-gold mb-2">
                    {usersCount.toLocaleString()}+
                  </div>
                  <div className="text-text-secondary">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold text-accent-gold mb-2">
                    {countriesCount}+
                  </div>
                  <div className="text-text-secondary">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold text-accent-gold mb-2">
                    {servicesCount.toLocaleString()}+
                  </div>
                  <div className="text-text-secondary">Services</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold text-accent-gold mb-2">
                    {successRate}%
                  </div>
                  <div className="text-text-secondary">Success Rate</div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 lg:py-32">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-block px-4 py-2 rounded-full bg-accent-gold/10 text-accent-gold text-sm font-medium mb-6">
                  Why Choose Us
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
                  Everything You Need for
                  <br />
                  <span className="text-gold-gradient">SMS Verification</span>
                </h2>
                <p className="text-text-secondary text-lg">
                  We provide the most reliable and feature-rich SMS activation platform.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature) => (
                  <Card
                    key={feature.title}
                    variant="default"
                    padding="large"
                    hover
                    className="group"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Popular Services Section */}
          <section className="py-20 bg-bg-secondary">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
                  Popular Services
                </h2>
                <p className="text-text-secondary">
                  Get instant verification for the most popular platforms
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {popularServices.map((service) => (
                  <Card
                    key={service.name}
                    variant="default"
                    padding="default"
                    hover
                    className="text-center group"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {service.icon}
                    </div>
                    <div className="font-medium text-text-primary mb-1">{service.name}</div>
                    <div className="text-sm text-accent-gold font-semibold">from {service.price}</div>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link href="/features">
                  <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View All Services
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-20 lg:py-32">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-block px-4 py-2 rounded-full bg-accent-gold/10 text-accent-gold text-sm font-medium mb-6">
                  Simple Process
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
                  How It Works
                </h2>
                <p className="text-text-secondary text-lg">
                  Get your verification code in just 3 simple steps
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 relative">
                <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-accent-gold via-accent-gold to-accent-gold/30" />

                {[
                  { step: "01", title: "Choose Service", description: "Select the platform you need verification for.", icon: Smartphone },
                  { step: "02", title: "Get Number", description: "Instantly receive a virtual phone number.", icon: MessageSquare },
                  { step: "03", title: "Receive SMS", description: "Get your verification code in seconds.", icon: CheckCircle },
                ].map((item) => (
                  <div key={item.step} className="relative text-center">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-bg-card border border-border-default flex items-center justify-center mb-6 relative z-10">
                      <item.icon className="w-8 h-8 text-accent-gold" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent-gold flex items-center justify-center text-sm font-bold text-bg-primary">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-3">{item.title}</h3>
                    <p className="text-text-secondary">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Preview Section */}
          <section className="py-20 bg-bg-secondary">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-block px-4 py-2 rounded-full bg-accent-gold/10 text-accent-gold text-sm font-medium mb-6">
                  Pricing Plans
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-text-secondary text-lg">
                  Choose the plan that fits your needs.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {pricingTiers.map((tier) => (
                  <Card
                    key={tier.name}
                    variant={tier.popular ? "premium" : "default"}
                    padding="large"
                    className={`relative ${tier.popular ? "ring-2 ring-accent-gold" : ""}`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-gold text-bg-primary text-xs font-semibold rounded-full">
                        Most Popular
                      </div>
                    )}
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-text-primary mb-2">{tier.name}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-text-primary">{tier.price}</span>
                        <span className="text-text-muted">{tier.period}</span>
                      </div>
                      <p className="text-sm text-text-secondary mt-2">{tier.description}</p>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                          <span className="text-text-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register" className="block">
                      <Button variant={tier.popular ? "primary" : "secondary"} fullWidth>
                        Get Started
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link href="/pricing-public" className="text-accent-gold hover:underline">
                  View full pricing details →
                </Link>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-20 lg:py-32">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-block px-4 py-2 rounded-full bg-accent-gold/10 text-accent-gold text-sm font-medium mb-6">
                  Testimonials
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
                  Loved by Thousands
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} variant="default" padding="large">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-accent-gold text-accent-gold" />
                      ))}
                    </div>
                    <p className="text-text-secondary mb-6 leading-relaxed">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center text-sm font-medium text-accent-gold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">{testimonial.name}</div>
                        <div className="text-sm text-text-muted">{testimonial.role}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 lg:py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/10 via-bg-secondary to-bg-primary" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-gold/20 rounded-full blur-[128px]" />

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl lg:text-5xl font-bold text-text-primary mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-text-secondary mb-10">
                  Join 50,000+ users who trust BestSMSHQ for their SMS verification needs.
                  Start free today, no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                      Create Free Account
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="secondary" size="lg">
                      Contact Sales
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
