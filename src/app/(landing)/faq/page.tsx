import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildMetadata } from '@/lib/seo/metadata';
import {
  JsonLd,
  breadcrumbSchema,
  faqSchema,
} from '@/lib/seo/structured-data';

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

export const metadata = buildMetadata({
  title: 'Frequently Asked Questions',
  description:
    'Answers to common questions about SMS verification, pricing, refunds, virtual numbers, rentals, and getting started with BestSMSHQ.',
  path: '/faq',
  keywords: [
    'SMS verification FAQ',
    'BestSMSHQ help',
    'how to receive SMS online',
    'SMS activation help',
  ],
});

async function fetchFaqs(): Promise<FaqItem[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return FALLBACK_FAQS;
  try {
    const res = await fetch(`${apiUrl}/faq`, { next: { revalidate: 3600 } });
    if (!res.ok) return FALLBACK_FAQS;
    const json = (await res.json()) as { data?: FaqItem[] } | FaqItem[];
    const items = Array.isArray(json) ? json : (json.data ?? []);
    return items.length > 0 ? items : FALLBACK_FAQS;
  } catch {
    return FALLBACK_FAQS;
  }
}

export default async function FAQ() {
  const faqs = await fetchFaqs();

  return (
    <div className="container mx-auto px-4 py-12 sm:py-20">
      <JsonLd
        data={faqSchema(
          faqs.map((f) => ({ question: f.question, answer: f.answer })),
        )}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'FAQ', path: '/faq' },
        ])}
      />
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
          Frequently Asked Questions
        </h1>
        {faqs.map((faq) => (
          <Card key={faq.id}>
            <CardHeader>
              <CardTitle>{faq.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
