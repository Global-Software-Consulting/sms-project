'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, Loader2 } from 'lucide-react';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';
import { toast } from 'sonner';

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'MEDIUM',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.CONTACT.SUBMIT, formData);
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '', priority: 'MEDIUM' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">Contact Us</h1>
          <p className="text-muted-foreground text-base sm:text-xl">
            Get in touch with our team
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Mail className="text-primary mb-2 h-8 w-8" />
              <CardTitle>Email Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">support@smspro.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="text-primary mb-2 h-8 w-8" />
              <CardTitle>Live Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Available 24/7 in dashboard
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low Priority</SelectItem>
                    <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                    <SelectItem value="HIGH">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Your message..."
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
              <Button size="lg" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}