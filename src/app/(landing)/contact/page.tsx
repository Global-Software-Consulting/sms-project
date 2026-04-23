'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Phone,
  Mail,
  Clock,
  Building2,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';
import { toast } from 'sonner';

interface ContactInfo {
  phone: string;
  email: string;
  businessHours: string;
  companyName: string;
  helpMessage: string;
}

const DEFAULT_INFO: ContactInfo = {
  phone: '+123 456 7890',
  email: 'support@bestsmshq.com',
  businessHours: 'Mon-Fri (09:00 AM - 5:00 PM)',
  companyName: 'BestSMSHQ',
  helpMessage:
    'Thank you for choosing BestSMSHQ — where reliable SMS verification meets unbeatable value. We look forward to assisting you!',
};

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);
  const [info, setInfo] = useState<ContactInfo>(DEFAULT_INFO);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    priority: 'MEDIUM',
    message: '',
  });

  // Pull contact info from public site-info settings (best-effort)
  useEffect(() => {
    apiClient
      .get<Record<string, unknown>>(API_ENDPOINTS.PUBLIC.SITE_INFO)
      .then((res) => {
        const d = (res.data || {}) as Record<string, unknown>;
        setInfo({
          phone: (d.contact_phone as string) || (d.phone as string) || DEFAULT_INFO.phone,
          email: (d.contact_email as string) || (d.email as string) || DEFAULT_INFO.email,
          businessHours:
            (d.contact_business_hours as string) ||
            (d.businessHours as string) ||
            DEFAULT_INFO.businessHours,
          companyName:
            (d.company_name as string) ||
            (d.site_name as string) ||
            (d.siteName as string) ||
            DEFAULT_INFO.companyName,
          helpMessage:
            (d.contact_help_message as string) ||
            (d.helpMessage as string) ||
            DEFAULT_INFO.helpMessage,
        });
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.CONTACT.SUBMIT, {
        name:
          `${formData.firstName} ${formData.lastName}`.trim() ||
          formData.email.split('@')[0],
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        priority: formData.priority,
      });
      toast.success('Request submitted! We will get back to you soon.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        priority: 'MEDIUM',
        message: '',
      });
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to submit request';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Two-column section: info + form */}
        <div className="grid gap-10 md:grid-cols-2 md:gap-12">
          {/* Left: heading + contact info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                SUBMIT A SUPPORT TICKET
              </h1>
              <p className="text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed">
                {info.helpMessage}
              </p>
            </div>

            <div className="space-y-5">
              <InfoRow
                icon={<Phone className="h-5 w-5" />}
                label="Call Us"
                value={info.phone}
              />
              <InfoRow
                icon={<Mail className="h-5 w-5" />}
                label="Email Us"
                value={
                  <a
                    href={`mailto:${info.email}`}
                    className="text-success underline-offset-4 hover:underline"
                  >
                    {info.email}
                  </a>
                }
              />
              <InfoRow
                icon={<Clock className="h-5 w-5" />}
                label="Business Hours"
                value={info.businessHours}
              />

              <div className="border-border border-t pt-5">
                <InfoRow
                  icon={<Building2 className="text-primary h-5 w-5" />}
                  label="Company"
                  value={info.companyName}
                />
              </div>
            </div>
          </div>

          {/* Right: form card */}
          <Card className="[background:var(--glass-primary)] border-[var(--glass-border)] backdrop-blur-[var(--glass-blur)]">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="First Name">
                    <Input
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="h-11 rounded-full px-4"
                    />
                  </FormField>
                  <FormField label="Last Name">
                    <Input
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="h-11 rounded-full px-4"
                    />
                  </FormField>
                </div>

                <FormField label="Email Address" required>
                  <Input
                    type="email"
                    placeholder="Enter your email here"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="h-11 rounded-full px-4"
                  />
                </FormField>

                <FormField label="Subject" required>
                  <Input
                    placeholder="Write your contact reason here"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                    className="h-11 rounded-full px-4"
                  />
                </FormField>

                <FormField label="Priority">
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger className="h-11 rounded-full px-4">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low Priority</SelectItem>
                      <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                      <SelectItem value="HIGH">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Description" required>
                  <Textarea
                    placeholder="Type your message here"
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                    className="rounded-2xl px-4 py-3"
                  />
                </FormField>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-full text-base font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ——————— Helpers ———————

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-primary mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs sm:text-sm">{label}</p>
        <p className="mt-1 text-sm font-medium sm:text-base break-words">{value}</p>
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
