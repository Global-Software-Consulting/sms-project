import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FAQ() {
  const faqs = [
    {
      q: 'How do I get started?',
      a: 'Sign up and add funds to your wallet. Then choose a service and country to receive SMS.',
    },
    {
      q: "What's the difference between V1 and V2?",
      a: 'V1 is standard pricing with good delivery. V2 is premium with faster speeds and higher success rates.',
    },
    {
      q: 'How long do SMS numbers stay active?',
      a: 'Activation numbers are active for 15 minutes. Rentals last for your chosen duration.',
    },
    {
      q: 'Can I get a refund?',
      a: "Yes, if you don't receive an SMS within the time limit, you'll automatically receive a refund.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
          Frequently Asked Questions
        </h1>
        {faqs.map((faq, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>{faq.q}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{faq.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
