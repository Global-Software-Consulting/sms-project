import Link from "next/link";
import { MessageSquare, ArrowRight, Shield, Zap, Globe, Users, Star, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-accent-gold to-accent-gold-light flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#0E0E0E]" />
              </div>
              <span className="text-xl font-bold text-foreground">
                SMS<span className="gold-text">Pro</span>
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/api-docs" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
                API
              </Link>
              <Link href="/contact" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-[#0E0E0E] font-semibold rounded-[12px] hover:brightness-110 transition-all"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-primary">99.9% Uptime Guaranteed</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Premium SMS Activation
              <br />
              <span className="gold-text">For Modern Businesses</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-foreground-muted max-w-2xl mx-auto mb-10">
              Get instant access to virtual numbers from 150+ countries. 
              High success rates, multiple providers, enterprise-grade reliability.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-[#0E0E0E] font-semibold rounded-[16px] hover:brightness-110 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 bg-background-card border border-border text-foreground font-semibold rounded-[16px] hover:bg-border transition-all w-full sm:w-auto justify-center"
              >
                View Pricing
              </Link>
            </div>

            {/* Live Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              <StatItem value="10M+" label="SMS Delivered" />
              <StatItem value="150+" label="Countries" />
              <StatItem value="50K+" label="Active Users" />
              <StatItem value="99.9%" label="Success Rate" />
            </div>
          </div>
        </div>
      </section>

      {/* Providers Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Choose Your Provider
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              We offer multiple providers to ensure the best rates and availability
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* V1 Provider */}
            <div className="p-6 rounded-[20px] bg-background-card border border-border hover:border-primary/50 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-[14px] bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Standard Activation</h3>
                  <p className="text-sm text-foreground-muted">V1 Provider</p>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-foreground-muted">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Budget-friendly pricing
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground-muted">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Wide service coverage
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground-muted">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Fast delivery
                </li>
              </ul>
              <div className="text-sm text-foreground-muted">
                Starting from <span className="font-bold text-foreground">$0.05</span>/SMS
              </div>
            </div>

            {/* V2 Provider */}
            <div className="p-6 rounded-[20px] bg-gradient-to-br from-accent-gold/5 to-accent-gold/10 border border-accent-gold/30 hover:border-accent-gold/50 transition-all group relative overflow-hidden">
              <div className="absolute top-4 right-4 px-2 py-1 bg-accent-gold text-[#0E0E0E] text-xs font-bold rounded-full">
                PREMIUM
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-[14px] bg-accent-gold/20 flex items-center justify-center">
                  <span className="text-2xl">💎</span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Premium Activation</h3>
                  <p className="text-sm text-foreground-muted">V2 Provider</p>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-foreground-muted">
                  <CheckCircle2 className="w-4 h-4 text-accent-gold" />
                  Highest success rates
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground-muted">
                  <CheckCircle2 className="w-4 h-4 text-accent-gold" />
                  Priority support
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground-muted">
                  <CheckCircle2 className="w-4 h-4 text-accent-gold" />
                  Premium numbers
                </li>
              </ul>
              <div className="text-sm text-foreground-muted">
                Starting from <span className="font-bold gold-text">$0.10</span>/SMS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose SMSPro?
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              Enterprise-grade features designed for scale
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Global Coverage"
              description="Access numbers from 150+ countries worldwide"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Instant Delivery"
              description="Real-time SMS delivery via WebSocket"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Enterprise Security"
              description="256-bit SSL encryption & 2FA support"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="24/7 Support"
              description="Dedicated support team always available"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              See what our customers have to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="Best SMS service I've ever used. The success rate is incredible and support is always helpful."
              author="John D."
              role="Developer"
              rating={5}
            />
            <TestimonialCard
              quote="We switched from another provider and saw immediate improvements. Highly recommended!"
              author="Sarah M."
              role="Business Owner"
              rating={5}
            />
            <TestimonialCard
              quote="The API is well-documented and easy to integrate. Perfect for our automation needs."
              author="Mike R."
              role="CTO"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-[24px] bg-gradient-to-br from-accent-gold/10 to-accent-gold/5 border border-accent-gold/20">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-foreground-muted mb-8 max-w-xl mx-auto">
              Join thousands of satisfied customers. Get $5 free credits when you sign up today.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-[#0E0E0E] font-semibold rounded-[16px] hover:brightness-110 transition-all shadow-lg hover:shadow-xl"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-sm text-foreground-muted hover:text-foreground">Features</Link></li>
                <li><Link href="/pricing" className="text-sm text-foreground-muted hover:text-foreground">Pricing</Link></li>
                <li><Link href="/api-docs" className="text-sm text-foreground-muted hover:text-foreground">API</Link></li>
                <li><Link href="/status" className="text-sm text-foreground-muted hover:text-foreground">Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-foreground-muted hover:text-foreground">About</Link></li>
                <li><Link href="/blog" className="text-sm text-foreground-muted hover:text-foreground">Blog</Link></li>
                <li><Link href="/careers" className="text-sm text-foreground-muted hover:text-foreground">Careers</Link></li>
                <li><Link href="/contact" className="text-sm text-foreground-muted hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-sm text-foreground-muted hover:text-foreground">Help Center</Link></li>
                <li><Link href="/faq" className="text-sm text-foreground-muted hover:text-foreground">FAQ</Link></li>
                <li><Link href="/knowledge-base" className="text-sm text-foreground-muted hover:text-foreground">Knowledge Base</Link></li>
                <li><Link href="/referral" className="text-sm text-foreground-muted hover:text-foreground">Referral Program</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-sm text-foreground-muted hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-foreground-muted hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="/refund" className="text-sm text-foreground-muted hover:text-foreground">Refund Policy</Link></li>
                <li><Link href="/disclaimer" className="text-sm text-foreground-muted hover:text-foreground">Disclaimer</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-accent-gold to-accent-gold-light flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-[#0E0E0E]" />
              </div>
              <span className="font-bold text-foreground">
                SMS<span className="gold-text">Pro</span>
              </span>
            </div>
            <p className="text-sm text-foreground-muted">
              © {new Date().getFullYear()} SMSPro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-bold gold-text">{value}</div>
      <div className="text-sm text-foreground-muted">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-[20px] bg-background-card border border-border hover:border-primary/30 transition-all group">
      <div className="w-12 h-12 rounded-[14px] bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-foreground-muted">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role, rating }: { quote: string; author: string; role: string; rating: number }) {
  return (
    <div className="p-6 rounded-[20px] bg-background-card border border-border">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-accent-gold text-accent-gold" />
        ))}
      </div>
      <p className="text-foreground-muted mb-4">&ldquo;{quote}&rdquo;</p>
      <div>
        <div className="font-semibold text-foreground">{author}</div>
        <div className="text-sm text-foreground-muted">{role}</div>
      </div>
    </div>
  );
}
