import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Wallet — Knowledge Base',
  description:
    'Manage your BestSMSHQ wallet — adding funds, supported payment methods, transaction history, and using your balance for SMS activations.',
  path: '/knowledge-base/wallet',
});

export default function WalletArticle() {
  const articles = [
    {
      id: 'adding-funds',
      title: 'Adding Funds to Wallet',
      description: 'Payment methods and how to deposit money',
      readTime: '3 min',
    },
    {
      id: 'payment-methods',
      title: 'Supported Payment Methods',
      description: 'Credit cards, crypto, and other payment options',
      readTime: '4 min',
    },
    {
      id: 'withdrawals',
      title: 'Withdrawing Funds',
      description: 'How to request withdrawals and processing times',
      readTime: '3 min',
    },
    {
      id: 'transaction-history',
      title: 'Understanding Transaction History',
      description: 'Reading your wallet activity and statements',
      readTime: '3 min',
    },
    {
      id: 'auto-refunds',
      title: 'Automatic Refunds',
      description: 'How refunds work for failed activations',
      readTime: '4 min',
    },
    {
      id: 'payment-security',
      title: 'Payment Security',
      description: 'How we keep your payment information safe',
      readTime: '5 min',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link prefetch={false}
          href="/knowledge-base"
          className="text-muted-foreground hover:text-primary inline-flex items-center transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Knowledge Base
        </Link>

        <div>
          <Badge className="mb-4">Wallet & Payments</Badge>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Wallet & Payments</h1>
          <p className="text-muted-foreground text-xl">
            Managing your balance, deposits, withdrawals, and understanding
            transactions.
          </p>
        </div>

        <div className="space-y-4">
          {articles.map((article) => (
            <Link prefetch={false}
              key={article.id}
              href={`/knowledge-base/wallet/${article.id}`}
              className="group block"
            >
              <Card className="transition-all duration-180 hover:-translate-y-0.5 hover:[box-shadow:var(--glass-shadow-3),var(--glow-accent)]">
                <CardContent className="py-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="group-hover:text-primary mb-2 text-lg font-semibold transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {article.description}
                      </p>
                    </div>
                    <div className="text-muted-foreground ml-4 text-sm whitespace-nowrap">
                      {article.readTime}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
