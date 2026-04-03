'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sortOrder?: number;
}

const FALLBACK_FAQS: FaqItem[] = [
  {
    id: 'fallback-1',
    question: 'How do I get started?',
    answer:
      'Sign up and add funds to your wallet. Then choose a service and country to receive SMS.',
  },
  {
    id: 'fallback-2',
    question: "What's the difference between V1 and V2?",
    answer:
      'V1 is standard pricing with good delivery. V2 is premium with faster speeds and higher success rates.',
  },
  {
    id: 'fallback-3',
    question: 'How long do SMS numbers stay active?',
    answer:
      'Activation numbers are active for 15 minutes. Rentals last for your chosen duration.',
  },
  {
    id: 'fallback-4',
    question: 'Can I get a refund?',
    answer:
      "Yes, if you don't receive an SMS within the time limit, you'll automatically receive a refund.",
  },
];

export default function FAQ() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.FAQ.ROOT);
        const items: FaqItem[] = response.data?.data ?? response.data ?? [];
        setFaqs(items.length > 0 ? items : FALLBACK_FAQS);
      } catch {
        setFaqs(FALLBACK_FAQS);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
          Frequently Asked Questions
        </h1>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          faqs.map((faq) => (
            <Card key={faq.id}>
              <CardHeader>
                <CardTitle>{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
