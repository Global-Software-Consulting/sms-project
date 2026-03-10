'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  User,
  DollarSign,
  AlertCircle,
  Clock,
  Code,
  RefreshCw,
  Plus,
  Crown,
} from 'lucide-react';
import { useState } from 'react';

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('normal');

  const quickHelpTopics = [
    {
      id: 'account',
      title: 'Account Issues',
      description: 'Login problems, verification, password reset',
      icon: User,
      color: 'text-primary',
    },
    {
      id: 'payment',
      title: 'Payment Problems',
      description: 'Deposits, withdrawals, transaction issues',
      icon: DollarSign,
      color: 'text-success',
    },
    {
      id: 'activation',
      title: 'Activation Errors',
      description: 'Number issues, SMS not received',
      icon: AlertCircle,
      color: 'text-destructive',
    },
    {
      id: 'rental',
      title: 'Rental Expiry',
      description: 'Extension requests, rental management',
      icon: Clock,
      color: 'text-warning',
    },
    {
      id: 'api',
      title: 'API Questions',
      description: 'Integration help, API errors',
      icon: Code,
      color: 'text-primary',
    },
    {
      id: 'refund',
      title: 'Refund Requests',
      description: 'Failed activations, refund status',
      icon: RefreshCw,
      color: 'text-success',
    },
  ];

  const mockTickets = [
    {
      id: 'TKT-1245',
      subject: 'SMS not received for WhatsApp',
      status: 'open',
      priority: 'high',
      lastUpdate: '2 hours ago',
    },
    {
      id: 'TKT-1238',
      subject: 'API rate limit question',
      status: 'in-progress',
      priority: 'normal',
      lastUpdate: '5 hours ago',
    },
    {
      id: 'TKT-1229',
      subject: 'Refund for failed activation',
      status: 'resolved',
      priority: 'low',
      lastUpdate: '1 day ago',
    },
  ];

  const statusColors = {
    open: 'bg-warning/10 text-warning border-warning/20',
    'in-progress': 'bg-primary/10 text-primary border-primary/20',
    resolved: 'bg-success/10 text-success border-success/20',
  };

  const priorityColors = {
    low: 'text-muted-foreground',
    normal: 'text-foreground',
    high: 'text-destructive',
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Help & Support</h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            We're here to help. Search for answers or create a support ticket.
          </p>

          {/* Search Bar */}
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
                  className="cursor-pointer transition-all duration-180 hover:-translate-y-0.5 hover:[box-shadow:var(--glass-shadow-3),var(--glow-accent)]"
                >
                  <CardContent className="py-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-12 w-12 rounded-xl ${topic.color} flex flex-shrink-0 items-center justify-center bg-current/10`}
                      >
                        <Icon className={`h-6 w-6 ${topic.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold">{topic.title}</h3>
                        <p className="text-muted-foreground text-sm">
                          {topic.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Create Ticket Section */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  Create Support Ticket
                </CardTitle>
                <CardDescription>
                  Can't find an answer? Submit a ticket and our team will help
                  you.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Pro Member
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    placeholder="Brief description of your issue"
                    className="[border-color:var(--glass-border-secondary)] backdrop-blur-[var(--glass-blur-secondary)] [background:var(--glass-secondary)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border-input bg-input-background focus:ring-ring h-9 w-full rounded-md border [border-color:var(--glass-border-secondary)] px-3 text-sm backdrop-blur-[var(--glass-blur-secondary)] [background:var(--glass-secondary)] focus:ring-2 focus:outline-none"
                  >
                    <option value="">Select category</option>
                    <option value="account">Account Issues</option>
                    <option value="payment">Payment Problems</option>
                    <option value="activation">Activation Errors</option>
                    <option value="rental">Rental Issues</option>
                    <option value="api">API Support</option>
                    <option value="refund">Refund Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <div className="flex gap-3">
                  {[
                    { value: 'low', label: 'Low', desc: 'General questions' },
                    {
                      value: 'normal',
                      label: 'Normal',
                      desc: 'Standard issues',
                    },
                    { value: 'high', label: 'High', desc: 'Pro/VIP only' },
                  ].map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setSelectedPriority(priority.value)}
                      disabled={priority.value === 'high'}
                      className={`flex-1 rounded-lg border p-4 transition-all ${
                        selectedPriority === priority.value
                          ? 'border-primary bg-primary/10 [box-shadow:var(--glow-accent)]'
                          : '[border-color:var(--glass-border-secondary)] [background:var(--glass-secondary)] hover:[box-shadow:var(--glass-shadow-2)]'
                      } ${priority.value === 'high' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      <div className="mb-1 text-sm font-medium">
                        {priority.label}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {priority.desc}
                      </div>
                      {priority.value === 'high' && (
                        <div className="text-primary mt-1 text-xs">
                          Pro/VIP Required
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Describe your issue in detail..."
                  rows={6}
                  className="[border-color:var(--glass-border-secondary)] backdrop-blur-[var(--glass-blur-secondary)] [background:var(--glass-secondary)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Attach File (optional)
                </label>
                <div className="border-border hover:border-primary cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors [background:var(--glass-secondary)]">
                  <Plus className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Submit Ticket
                </Button>
                <Button type="button" variant="outline">
                  Save Draft
                </Button>
              </div>

              <div className="bg-primary/10 border-primary/20 rounded-lg border p-4 text-sm">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">
                    Expected Response Time:
                  </strong>{' '}
                  As a Pro member, you'll receive a response within 2-4 hours
                  during business hours.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* My Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">My Tickets</CardTitle>
            <CardDescription>
              Track the status of your support requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-border border-b">
                    <th className="p-4 text-left font-semibold">Ticket ID</th>
                    <th className="p-4 text-left font-semibold">Subject</th>
                    <th className="p-4 text-left font-semibold">Status</th>
                    <th className="p-4 text-left font-semibold">Priority</th>
                    <th className="p-4 text-left font-semibold">Last Update</th>
                    <th className="p-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-border hover:bg-muted/50 border-b transition-colors last:border-0"
                    >
                      <td className="p-4 font-mono text-sm font-medium">
                        {ticket.id}
                      </td>
                      <td className="p-4">{ticket.subject}</td>
                      <td className="p-4">
                        <Badge
                          className={
                            statusColors[
                              ticket.status as keyof typeof statusColors
                            ]
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span
                          className={
                            priorityColors[
                              ticket.priority as keyof typeof priorityColors
                            ]
                          }
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="text-muted-foreground p-4 text-sm">
                        {ticket.lastUpdate}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {mockTickets.length === 0 && (
              <div className="text-muted-foreground py-12 text-center">
                <p>No tickets found. Create your first support ticket above.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alternative Support Options */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="py-6 text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Search className="text-primary h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">Knowledge Base</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Browse detailed guides and tutorials
              </p>
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
              <p className="text-muted-foreground mb-4 text-sm">
                Complete API reference and examples
              </p>
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
              <p className="text-muted-foreground mb-4 text-sm">
                Check platform and service status
              </p>
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
