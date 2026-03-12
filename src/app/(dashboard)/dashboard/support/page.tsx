'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, MessageSquare, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import {
  getTickets,
  createTicket,
  Ticket,
  TicketPriority,
  getTicketStatusLabel,
  getTicketStatusVariant,
  getTicketPriorityVariant,
} from '@/lib/api/ticketsApi';
import { formatDistanceToNow } from 'date-fns';

export default function Support() {
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tickets state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch tickets
  const fetchTickets = useCallback(async (overridePage?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getTickets({ page: overridePage ?? page, limit: 20 });
      setTickets(response.tickets);
      setTotalPages(response.totalPages);
    } catch {
      setError('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Create ticket handler
  const handleCreateTicket = async () => {
    console.log('handleCreateTicket called', { subject, priority, message });
    if (!subject.trim() || !message.trim()) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await createTicket({ subject: subject.charAt(0).toUpperCase() + subject.slice(1), priority, message });
      setSubject('');
      setPriority('NORMAL');
      setMessage('');
      setPage(1);
      await fetchTickets(1);
    } catch {
      setError('Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityLabel = (p: TicketPriority): string => {
    const labels: Record<TicketPriority, string> = {
      LOW: 'Low',
      NORMAL: 'Normal',
      HIGH: 'High',
      URGENT: 'Urgent',
    };
    return labels[p] || p;
  };

  const formatDate = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support</h1>
        <p className="text-muted-foreground mt-1">
          Get help from our support team
        </p>
      </div>

      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pro Member Support</CardTitle>
              <CardDescription>24/7 priority support access</CardDescription>
            </div>
            <Badge variant="default">Pro Priority</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            As a Pro member, your tickets receive priority handling with faster
            response times. Average response time: <strong>30 minutes</strong>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create New Ticket</CardTitle>
          <CardDescription>Submit a support request</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input
              placeholder="Brief description of your issue..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Describe your issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
          </div>

          <Button
            size="lg"
            onClick={handleCreateTicket}
            disabled={isSubmitting || !subject.trim() || !message.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? 'Creating...' : 'Create Ticket'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Tickets</CardTitle>
          <CardDescription>
            View and manage your support tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <AlertCircle className="text-destructive h-8 w-8" />
              <p className="text-muted-foreground text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchTickets()}>
                Retry
              </Button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              No tickets yet. Create one above if you need help.
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border-border rounded-lg border p-4 transition-shadow hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-semibold capitalize">{ticket.subject}</h4>
                        <Badge variant={getTicketStatusVariant(ticket.status)}>
                          {getTicketStatusLabel(ticket.status)}
                        </Badge>
                        <Badge variant={getTicketPriorityVariant(ticket.priority)}>
                          {getPriorityLabel(ticket.priority)}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <span>{ticket.ticketNumber}</span>
                        <span>·</span>
                        <span>{formatDate(ticket.createdAt)}</span>
                        <span>·</span>
                        <span className="flex items-center">
                          <MessageSquare className="mr-1 h-3 w-3" />
                          {ticket.responses} responses
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !error && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Find answers faster</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              variant="outline"
              className="h-auto justify-start py-4"
              asChild
            >
              <a href="/help">
                <div className="text-left">
                  <p className="font-semibold">Help Center</p>
                  <p className="text-muted-foreground text-sm">
                    Browse articles and guides
                  </p>
                </div>
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto justify-start py-4"
              asChild
            >
              <a href="/faq">
                <div className="text-left">
                  <p className="font-semibold">FAQ</p>
                  <p className="text-muted-foreground text-sm">
                    Frequently asked questions
                  </p>
                </div>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
