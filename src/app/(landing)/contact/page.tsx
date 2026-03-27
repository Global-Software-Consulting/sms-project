import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare } from 'lucide-react';

export default function Contact() {
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
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Name" />
              <Input type="email" placeholder="Email" />
            </div>
            <Input placeholder="Subject" />
            <Textarea placeholder="Your message..." rows={6} />
            <Button size="lg">Send Message</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
