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
import { Plus, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function Support() {
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('normal');
  const [message, setMessage] = useState('');

  const tickets = [
    {
      id: 'TICKET-5678',
      subject: 'Unable to receive SMS',
      status: 'Open',
      priority: 'High',
      date: 'Feb 13, 2026',
      responses: 2,
    },
    {
      id: 'TICKET-5677',
      subject: 'Wallet refund inquiry',
      status: 'Resolved',
      priority: 'Normal',
      date: 'Feb 12, 2026',
      responses: 5,
    },
    {
      id: 'TICKET-5676',
      subject: 'API rate limit question',
      status: 'Closed',
      priority: 'Low',
      date: 'Feb 10, 2026',
      responses: 3,
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      Open: 'default',
      Resolved: 'secondary',
      Closed: 'secondary',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'High')
      return <Badge className="bg-destructive">High</Badge>;
    if (priority === 'Normal') return <Badge variant="secondary">Normal</Badge>;
    return <Badge variant="outline">Low</Badge>;
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
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
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

          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Ticket
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
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border-border rounded-lg border p-4 transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="font-semibold">{ticket.subject}</h4>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <span>{ticket.id}</span>
                      <span>•</span>
                      <span>{ticket.date}</span>
                      <span>•</span>
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
