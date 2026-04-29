'use client';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  User,
  DollarSign,
  AlertCircle,
  Clock,
  Code,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';

export default function HelpClient() {
  const [searchQuery, setSearchQuery] = useState('');

  const quickHelpTopics = [
    { id: 'account', title: 'Account Issues', description: 'Login problems, verification, password reset', icon: User, color: 'text-primary' },
    { id: 'payment', title: 'Payment Problems', description: 'Deposits, withdrawals, transaction issues', icon: DollarSign, color: 'text-success' },
    { id: 'activation', title: 'Activation Errors', description: 'Number issues, SMS not received', icon: AlertCircle, color: 'text-destructive' },
    { id: 'rental', title: 'Rental Expiry', description: 'Extension requests, rental management', icon: Clock, color: 'text-warning' },
    { id: 'api', title: 'API Questions', description: 'Integration help, API errors', icon: Code, color: 'text-primary' },
    { id: 'refund', title: 'Refund Requests', description: 'Failed activations, refund status', icon: RefreshCw, color: 'text-success' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">Help & Support</h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-xl">
            We're here to help. Search our help center for answers and guides.
          </p>

          <div className="relative mx-auto max-w-2xl">
            <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search help articles or describe your issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 [border-color:var(--glass-border)] pl-12 text-base backdrop-blur-[var(--glass-blur)] [background:var(--glass-primary)]"
            />
          </div>
        </div>

        {/* Quick Help Topics */}
        <div>
          <h2 className="mb-6 text-2xl font-semibold">Quick Help Topics</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quickHelpTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Card
                  key={topic.id}
                  className="transition-all duration-180 hover:-translate-y-0.5 hover:[box-shadow:var(--glass-shadow-3),var(--glow-accent)]"
                >
                  <CardContent className="py-6">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl ${topic.color} flex flex-shrink-0 items-center justify-center bg-current/10`}>
                        <Icon className={`h-6 w-6 ${topic.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold">{topic.title}</h3>
                        <p className="text-muted-foreground text-sm">{topic.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Alternative Support Options */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="py-6 text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Search className="text-primary h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">Knowledge Base</h3>
              <p className="text-muted-foreground mb-4 text-sm">Browse detailed guides and tutorials</p>
              <Button variant="outline" size="sm" asChild>
                <a href="/knowledge-base">View Articles</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6 text-center">
              <div className="bg-success/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Code className="text-success h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">API Documentation</h3>
              <p className="text-muted-foreground mb-4 text-sm">Complete API reference and examples</p>
              <Button variant="outline" size="sm" asChild>
                <a href="/api">View Docs</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6 text-center">
              <div className="bg-warning/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <AlertCircle className="text-warning h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">System Status</h3>
              <p className="text-muted-foreground mb-4 text-sm">Check platform and service status</p>
              <Button variant="outline" size="sm" asChild>
                <a href="/status">View Status</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
