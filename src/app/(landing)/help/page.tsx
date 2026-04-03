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
  Loader2,
  Inbox,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';
import { createTicket } from '@/lib/api/ticketsApi';
import { getCurrentMembership } from '@/lib/api/membershipApi';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Ticket {
  id: string;
  ticketNumber?: string;
  subject: string;
  status: string;
  priority: string;
  updatedAt: string;
  createdAt: string;
  category?: string;
}

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('normal');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketFiles, setTicketFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userPlanSlug, setUserPlanSlug] = useState<string | null>(null);

  const canUseHighPriority = userPlanSlug === 'pro' || userPlanSlug === 'vip';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => f.size <= 10 * 1024 * 1024 && ['image/png', 'image/jpeg', 'application/pdf'].includes(f.type));
    setTicketFiles(prev => [...prev, ...valid].slice(0, 3));
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }
    setIsSubmitting(true);
    try {
      await createTicket(
        {
          subject: ticketSubject,
          message: ticketMessage,
          category: selectedCategory || undefined,
          priority: selectedPriority.toUpperCase(),
        },
        ticketFiles.length > 0 ? ticketFiles : undefined,
      );
      toast.success('Ticket submitted successfully!');
      setTicketSubject('');
      setTicketMessage('');
      setSelectedCategory('');
      setSelectedPriority('normal');
      setTicketFiles([]);
      fetchTickets();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit ticket. Please log in first.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tickets state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isTicketsLoading, setIsTicketsLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    try {
      setIsTicketsLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.TICKETS.ROOT);
      const data = response.data;
      const list = Array.isArray(data) ? data : data.data || data.tickets || [];
      setTickets(list);
    } catch {
      // User might not be logged in on public page
      setTickets([]);
    } finally {
      setIsTicketsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    getCurrentMembership()
      .then((res) => {
        setUserPlanSlug(res.currentPlan?.slug || null);
      })
      .catch(() => {});
  }, [fetchTickets]);

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return dateStr;
    }
  };

  const quickHelpTopics = [
    { id: 'account', title: 'Account Issues', description: 'Login problems, verification, password reset', icon: User, color: 'text-primary' },
    { id: 'payment', title: 'Payment Problems', description: 'Deposits, withdrawals, transaction issues', icon: DollarSign, color: 'text-success' },
    { id: 'activation', title: 'Activation Errors', description: 'Number issues, SMS not received', icon: AlertCircle, color: 'text-destructive' },
    { id: 'rental', title: 'Rental Expiry', description: 'Extension requests, rental management', icon: Clock, color: 'text-warning' },
    { id: 'api', title: 'API Questions', description: 'Integration help, API errors', icon: Code, color: 'text-primary' },
    { id: 'refund', title: 'Refund Requests', description: 'Failed activations, refund status', icon: RefreshCw, color: 'text-success' },
  ];

  const statusColors: Record<string, string> = {
    open: 'bg-warning/10 text-warning border-warning/20',
    OPEN: 'bg-warning/10 text-warning border-warning/20',
    'in-progress': 'bg-primary/10 text-primary border-primary/20',
    IN_PROGRESS: 'bg-primary/10 text-primary border-primary/20',
    resolved: 'bg-success/10 text-success border-success/20',
    RESOLVED: 'bg-success/10 text-success border-success/20',
    closed: 'bg-muted text-muted-foreground border-muted',
    CLOSED: 'bg-muted text-muted-foreground border-muted',
  };

  const priorityColors: Record<string, string> = {
    low: 'text-muted-foreground',
    LOW: 'text-muted-foreground',
    normal: 'text-foreground',
    NORMAL: 'text-foreground',
    MEDIUM: 'text-foreground',
    high: 'text-destructive',
    HIGH: 'text-destructive',
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">Help & Support</h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-xl">
            We're here to help. Search for answers or create a support ticket.
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
                  className="cursor-pointer transition-all duration-180 hover:-translate-y-0.5 hover:[box-shadow:var(--glass-shadow-3),var(--glow-accent)]"
                  onClick={() => setSelectedCategory(topic.id)}
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

        {/* Create Ticket Section */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Create Support Ticket</CardTitle>
                <CardDescription>
                  Can't find an answer? Submit a ticket and our team will help you.
                </CardDescription>
              </div>
              {userPlanSlug && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  {userPlanSlug.charAt(0).toUpperCase() + userPlanSlug.slice(1)} Member
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmitTicket}>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    placeholder="Brief description of your issue"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="[border-color:var(--glass-border-secondary)] backdrop-blur-[var(--glass-blur-secondary)] [background:var(--glass-secondary)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="border-input focus:ring-ring h-9 w-full appearance-none rounded-md border bg-transparent [border-color:var(--glass-border-secondary)] px-3 text-sm [background:var(--glass-secondary)] focus:ring-2 focus:outline-none"
                  >
                    <option value="" style={{ background: '#1a1a2e', color: '#e2e8f0' }}>Select category</option>
                    <option value="GENERAL" style={{ background: '#1a1a2e', color: '#e2e8f0' }}>General</option>
                    <option value="PAYMENT" style={{ background: '#1a1a2e', color: '#e2e8f0' }}>Payment</option>
                    <option value="SMS_ISSUE" style={{ background: '#1a1a2e', color: '#e2e8f0' }}>SMS Issue</option>
                    <option value="ACCOUNT" style={{ background: '#1a1a2e', color: '#e2e8f0' }}>Account</option>
                    <option value="REFUND" style={{ background: '#1a1a2e', color: '#e2e8f0' }}>Refund</option>
                    <option value="TECHNICAL" style={{ background: '#1a1a2e', color: '#e2e8f0' }}>Technical</option>
                    <option value="OTHER" style={{ background: '#1a1a2e', color: '#e2e8f0' }}>Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <div className="flex gap-3">
                  {[
                    { value: 'low', label: 'Low', desc: 'General questions' },
                    { value: 'normal', label: 'Normal', desc: 'Standard issues' },
                    { value: 'high', label: 'High', desc: 'Pro/VIP only' },
                  ].map((priority) => {
                    const isHighDisabled = priority.value === 'high' && !canUseHighPriority;
                    return (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => !isHighDisabled && setSelectedPriority(priority.value)}
                        disabled={isHighDisabled}
                        className={`flex-1 rounded-lg border p-4 transition-all ${
                          selectedPriority === priority.value
                            ? 'border-primary bg-primary/10 [box-shadow:var(--glow-accent)]'
                            : '[border-color:var(--glass-border-secondary)] [background:var(--glass-secondary)] hover:[box-shadow:var(--glass-shadow-2)]'
                        } ${isHighDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        <div className="mb-1 text-sm font-medium">{priority.label}</div>
                        <div className="text-muted-foreground text-xs">{priority.desc}</div>
                        {isHighDisabled && (
                          <div className="text-primary mt-1 text-xs">Pro/VIP Required</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Describe your issue in detail..."
                  rows={6}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="[border-color:var(--glass-border-secondary)] backdrop-blur-[var(--glass-blur-secondary)] [background:var(--glass-secondary)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Attach File (optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-border hover:border-primary cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors [background:var(--glass-secondary)]"
                >
                  <Plus className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">Click to upload or drag and drop</p>
                  <p className="text-muted-foreground mt-1 text-xs">PNG, JPG, PDF up to 10MB (max 3 files)</p>
                </div>
                {ticketFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ticketFiles.map((file, i) => (
                      <Badge key={i} variant="secondary" className="flex items-center gap-1">
                        {file.name}
                        <button type="button" onClick={() => setTicketFiles(prev => prev.filter((_, idx) => idx !== i))}>
                          <AlertCircle className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    'Submit Ticket'
                  )}
                </Button>
                <Button type="button" variant="outline">Save Draft</Button>
              </div>

              <div className="bg-primary/10 border-primary/20 rounded-lg border p-4 text-sm">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Expected Response Time:</strong>{' '}
                  {canUseHighPriority
                    ? `As a ${userPlanSlug!.charAt(0).toUpperCase() + userPlanSlug!.slice(1)} member, you'll receive a response within 1-2 hours.`
                    : "You'll receive a response within 12-24 hours during business hours. Upgrade to Pro/VIP for faster support."}
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* My Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">My Tickets</CardTitle>
            <CardDescription>Track the status of your support requests</CardDescription>
          </CardHeader>
          <CardContent>
            {isTicketsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-primary h-6 w-6 animate-spin" />
                <span className="text-muted-foreground ml-3 text-sm">Loading tickets...</span>
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-12 text-center">
                <Inbox className="text-muted-foreground mx-auto mb-3 h-12 w-12 opacity-20" />
                <p className="text-muted-foreground text-sm">No tickets found. Create your first support ticket above.</p>
              </div>
            ) : (
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
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="border-border hover:bg-muted/50 border-b transition-colors last:border-0"
                      >
                        <td className="p-4 font-mono text-sm font-medium">
                          {ticket.ticketNumber || ticket.id.slice(0, 8)}
                        </td>
                        <td className="p-4">{ticket.subject}</td>
                        <td className="p-4">
                          <Badge className={statusColors[ticket.status] || 'bg-muted text-muted-foreground'}>
                            {ticket.status.toLowerCase().replace('_', '-')}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className={priorityColors[ticket.priority] || 'text-foreground'}>
                            {ticket.priority.toLowerCase()}
                          </span>
                        </td>
                        <td className="text-muted-foreground p-4 text-sm">
                          {formatTime(ticket.updatedAt || ticket.createdAt)}
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/dashboard/support`}>View</a>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
