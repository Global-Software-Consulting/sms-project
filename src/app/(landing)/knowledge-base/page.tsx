'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Search,
  BookOpen,
  Smartphone,
  Home,
  Crown,
  DollarSign,
  MessageSquare,
  Code,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics and set up your account',
      icon: BookOpen,
      articles: 8,
      color: 'text-primary',
    },
    {
      id: 'sms-activation',
      title: 'SMS Activation Guide',
      description: 'How SMS activation works step by step',
      icon: Smartphone,
      articles: 12,
      color: 'text-success',
    },
    {
      id: 'rent-numbers',
      title: 'Rent Numbers Guide',
      description: 'Extended number rental explained',
      icon: Home,
      articles: 6,
      color: 'text-warning',
    },
    {
      id: 'membership',
      title: 'Membership & Discounts',
      description: 'Understanding tiers and benefits',
      icon: Crown,
      articles: 5,
      color: 'text-primary',
    },
    {
      id: 'wallet',
      title: 'Wallet & Payments',
      description: 'Managing your balance and transactions',
      icon: DollarSign,
      articles: 9,
      color: 'text-success',
    },
    {
      id: 'reviews',
      title: 'Reviews & Limits',
      description: 'Review system and service limits',
      icon: MessageSquare,
      articles: 4,
      color: 'text-warning',
    },
    {
      id: 'api',
      title: 'API Usage',
      description: 'Integrate our API into your workflow',
      icon: Code,
      articles: 15,
      color: 'text-primary',
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      description: 'Common issues and solutions',
      icon: AlertCircle,
      articles: 10,
      color: 'text-destructive',
    },
  ];

  const filters = [
    { id: 'all', label: 'All Categories' },
    { id: 'popular', label: 'Popular' },
    { id: 'recent', label: 'Recently Updated' },
  ];

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Knowledge Base</h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            Everything you need to understand how the platform works, from
            activation flow to advanced usage.
          </p>

          {/* Search Bar */}
          <div className="relative mx-auto max-w-2xl">
            <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 [border-color:var(--glass-border)] pl-12 text-base backdrop-blur-[var(--glass-blur)] [background:var(--glass-primary)]"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-180 ${
                  activeFilter === filter.id
                    ? 'bg-primary text-primary-foreground [box-shadow:var(--glow-accent)]'
                    : 'text-foreground [background:var(--glass-secondary)] [border:1px_solid_var(--glass-border)] hover:[box-shadow:var(--glass-shadow-2)]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={`/knowledge-base/${category.id}`}
                className="group block"
              >
                <Card className="h-full transition-all duration-180 hover:-translate-y-1 hover:[box-shadow:var(--glass-shadow-3),var(--glow-accent)]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div
                          className={`h-12 w-12 rounded-xl ${category.color} flex items-center justify-center bg-current/10`}
                        >
                          <Icon className={`h-6 w-6 ${category.color}`} />
                        </div>
                        <div>
                          <CardTitle className="group-hover:text-primary transition-colors">
                            {category.title}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {category.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground text-sm">
                      {category.articles} articles
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <Card className="mt-12 text-center">
          <CardContent className="py-12">
            <h3 className="mb-2 text-2xl font-bold">
              Can't find what you're looking for?
            </h3>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help you with any questions.
            </p>
            <Link
              href="/help"
              className="bg-primary text-primary-foreground inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium transition-all duration-180 hover:[box-shadow:var(--glow-accent-active)]"
            >
              Contact Support
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
