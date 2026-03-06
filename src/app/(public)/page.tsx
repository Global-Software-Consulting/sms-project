"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Globe, 
  Star, 
  Sparkles,
  Clock,
  Lock,
  TrendingUp,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  const stats = [
    { label: "Active Numbers", value: "45K+" },
    { label: "Countries", value: "180+" },
    { label: "Success Rate", value: "99.7%" },
    { label: "Uptime", value: "99.9%" },
  ];

  const features = [
    {
      icon: Zap,
      title: "Instant Activation",
      description: "Get your SMS number within seconds and start receiving messages immediately"
    },
    {
      icon: Clock,
      title: "Real-time SMS",
      description: "Receive SMS codes in real-time with instant delivery notifications"
    },
    {
      icon: Globe,
      title: "Multiple Providers",
      description: "Choose from V1 Standard, V2 Premium, or V3 Elite providers based on your needs"
    },
    {
      icon: Sparkles,
      title: "VIP Routing",
      description: "Premium members get priority access to the fastest and most reliable numbers"
    },
    {
      icon: Shield,
      title: "Wallet System",
      description: "Secure wallet with instant top-ups and transparent transaction history"
    },
    {
      icon: Star,
      title: "Membership Discounts",
      description: "Save up to 40% on all services with our VIP membership tiers"
    },
    {
      icon: Lock,
      title: "Favorite Services",
      description: "Save your most-used services for one-click quick ordering"
    },
    {
      icon: TrendingUp,
      title: "API Support",
      description: "Integrate our service into your workflow with our developer-friendly API"
    }
  ];

  const membershipTiers = [
    {
      name: "Basic",
      price: "$0",
      discount: "0%",
      features: ["Standard pricing", "All services", "Basic support"],
      badge: null
    },
    {
      name: "Standard",
      price: "$29",
      discount: "10%",
      features: ["10% discount", "Priority support", "Favorite services"],
      badge: null
    },
    {
      name: "Pro",
      price: "$79",
      discount: "25%",
      features: ["25% discount", "24/7 support", "API access", "VIP routing"],
      badge: "Popular"
    },
    {
      name: "VIP",
      price: "$199",
      discount: "40%",
      features: ["40% discount", "Dedicated support", "Premium API", "Highest priority"],
      badge: "Best Value"
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-14 sm:py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 inline" />
            Premium SMS Platform
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight">
            Receive SMS Activations
            <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Instantly & Reliably
            </span>
          </h1>
          
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Get instant access to SMS verification numbers from 180+ countries. 
            Professional, fast, and secure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Button asChild size="lg" className="text-base btn-premium w-full sm:w-auto">
              <Link href="/register">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base w-full sm:w-auto">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 sm:pt-12">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1 sm:space-y-2">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Provider Comparison Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Choose Your Provider Type</h2>
            <p className="text-lg text-muted-foreground">
              Select from Standard, Premium, or Elite providers based on your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Standard V1 */}
            <Card className="border-2">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-blue-500">💰 Standard V1</Badge>
                <CardTitle className="text-xl">Standard Activation</CardTitle>
                <CardDescription>Cost-effective SMS verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm">Affordable pricing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm">Standard delivery speed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm">Wide service coverage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm">Regular priority</span>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-2xl font-bold">From $0.50</p>
                  <p className="text-sm text-muted-foreground">per activation</p>
                </div>
              </CardContent>
            </Card>

            {/* Premium V2 */}
            <Card className="border-2 border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
                POPULAR
              </div>
              <CardHeader>
                <Badge className="w-fit mb-2 bg-gradient-to-r from-primary to-accent">💎 Premium V2</Badge>
                <CardTitle className="text-xl">Premium Activation</CardTitle>
                <CardDescription>Fastest and most reliable service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium text-sm">Lightning-fast delivery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium text-sm">Higher success rate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium text-sm">Premium providers only</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium text-sm">VIP priority routing</span>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-2xl font-bold text-primary">From $1.50</p>
                  <p className="text-sm text-muted-foreground">per activation</p>
                </div>
              </CardContent>
            </Card>

            {/* Elite V3 */}
            <Card className="border-2 border-warning relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-warning text-warning-foreground px-3 py-1 text-xs font-semibold">
                BEST
              </div>
              <CardHeader>
                <Badge className="w-fit mb-2 bg-gradient-to-r from-warning to-amber-500">👑 Elite V3</Badge>
                <CardTitle className="text-xl">Elite Activation</CardTitle>
                <CardDescription>Ultimate tier with guaranteed delivery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-warning" />
                    <span className="font-semibold text-sm">Instant guaranteed delivery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-warning" />
                    <span className="font-semibold text-sm">99.9% success rate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-warning" />
                    <span className="font-semibold text-sm">Elite providers only</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-warning" />
                    <span className="font-semibold text-sm">Maximum priority + support</span>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-2xl font-bold text-warning">From $2.50</p>
                  <p className="text-sm text-muted-foreground">per activation</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Choose Service & Country</h3>
              <p className="text-muted-foreground">
                Select from 500+ services across 180+ countries
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Get Number Instantly</h3>
              <p className="text-muted-foreground">
                Receive your phone number immediately after purchase
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Receive SMS Live</h3>
              <p className="text-muted-foreground">
                Get your verification code in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Key Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for SMS verification
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-2 hover:border-primary transition-colors card-hover-lift">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Membership Preview */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Membership Plans</h2>
            <p className="text-lg text-muted-foreground">
              Save more with our membership tiers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {membershipTiers.map((tier) => (
              <Card 
                key={tier.name} 
                className={tier.name === "VIP" ? "border-2 border-primary relative" : "border-2"}
              >
                {tier.badge && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
                    {tier.badge}
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="pt-2">
                    <p className="text-3xl font-bold">{tier.price}</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <Badge variant={tier.name === "VIP" ? "default" : "secondary"} className="w-fit mt-2">
                    {tier.discount} Discount
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    asChild 
                    className="w-full mt-6" 
                    variant={tier.name === "VIP" ? "default" : "outline"}
                  >
                    <Link href="/dashboard/pricing">
                      {tier.name === "Basic" ? "Get Started" : "Upgrade"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Reviews */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Trusted by Thousands</h2>
            <p className="text-lg text-muted-foreground">
              See what our customers have to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Johnson",
                role: "Developer",
                content: "Best SMS service I've used. Fast, reliable, and great API documentation.",
                rating: 5
              },
              {
                name: "Mike Chen",
                role: "Business Owner",
                content: "The premium providers are worth it. Never had a failed verification.",
                rating: 5
              },
              {
                name: "Emma Davis",
                role: "Marketing Manager",
                content: "VIP membership pays for itself. The discounts are incredible.",
                rating: 5
              }
            ].map((review, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex space-x-1 mb-2">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <CardTitle className="text-base">{review.name}</CardTitle>
                  <CardDescription>{review.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{review.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center gap-8 mt-12 pt-12 border-t border-border">
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-success" />
              <p className="font-semibold">Secure</p>
              <p className="text-sm text-muted-foreground">SSL Encrypted</p>
            </div>
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">99.9% Uptime</p>
              <p className="text-sm text-muted-foreground">Always Available</p>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-warning" />
              <p className="font-semibold">4.9/5 Rating</p>
              <p className="text-sm text-muted-foreground">From 10K+ Reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of satisfied customers using SMSPro
          </p>
          <Button asChild size="lg" className="text-base btn-premium">
            <Link href="/register">
              Start Receiving SMS Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
