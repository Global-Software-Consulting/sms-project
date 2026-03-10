import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function StandardVsPremium() {
  const comparison = [
    {
      feature: 'Routing',
      v1: 'Cost-efficient routing',
      v2: 'Priority routing',
      v3: 'Dedicated routing',
    },
    {
      feature: 'Success Rate',
      v1: '85-90% average',
      v2: '95-99% average',
      v3: '99.9% guaranteed',
    },
    {
      feature: 'Delivery Speed',
      v1: '30-60 seconds',
      v2: '10-30 seconds',
      v3: 'Instant (1-5 seconds)',
    },
    {
      feature: 'Peak Time Priority',
      v1: 'Standard queue',
      v2: 'Priority queue',
      v3: 'Bypass queue',
    },
    {
      feature: 'Price Range',
      v1: '$0.45 - $0.95',
      v2: '$1.35 - $2.95',
      v3: '$2.25 - $4.95',
    },
    {
      feature: 'Number Pool',
      v1: 'Standard pool',
      v2: 'Premium pool',
      v3: 'Elite pool',
    },
    {
      feature: 'Support',
      v1: 'Standard support',
      v2: 'Priority support',
      v3: 'Dedicated support',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <div className="text-muted-foreground mb-8 flex items-center gap-2 text-sm">
          <Link
            href="/knowledge-base"
            className="hover:text-primary transition-colors"
          >
            Knowledge Base
          </Link>
          <ArrowRight className="h-4 w-4" />
          <Link
            href="/knowledge-base/sms-activation"
            className="hover:text-primary transition-colors"
          >
            SMS Activation
          </Link>
          <ArrowRight className="h-4 w-4" />
          <span className="text-foreground">Provider Differences</span>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <Badge className="mb-4">SMS Activation</Badge>
          <h1 className="mb-4 text-4xl font-bold">
            Provider Differences: V1 vs V2 vs V3
          </h1>
          <p className="text-muted-foreground">
            Published on February 25, 2026 · 7 min read
          </p>
        </div>

        <div className="space-y-8">
          {/* Main Content */}
          <Card>
            <CardContent className="space-y-8 py-8">
              {/* Introduction */}
              <div>
                <p className="mb-4 text-lg leading-relaxed">
                  Our platform offers three provider tiers: V1 Standard, V2
                  Premium, and V3 Elite. Each tier is designed for different use
                  cases and offers varying levels of performance, reliability,
                  and support.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Understanding the differences will help you choose the right
                  provider for your specific needs and budget.
                </p>
              </div>

              {/* V1 Standard Provider */}
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                  <span className="text-2xl">💰</span> V1 Standard Provider
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  V1 Standard providers offer cost-efficient SMS activation with
                  reliable delivery. Perfect for testing, development, or
                  budget-conscious users who don't need instant delivery.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      Most affordable pricing option ($0.45 - $0.95 per SMS)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>Good success rates (85-90% average)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>Standard delivery time (30-60 seconds)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>Best for: Testing, low-volume use, cost savings</span>
                  </li>
                </ul>
              </div>

              {/* V2 Premium Provider */}
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                  <span className="text-2xl">💎</span> V2 Premium Provider
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  V2 Premium providers deliver priority routing with
                  significantly higher success rates and faster delivery. The
                  go-to choice for production environments and business use.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      Priority routing with faster processing ($1.35 - $2.95 per
                      SMS)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>Higher success rates (95-99% average)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>Faster delivery (10-30 seconds)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      Priority support and processing during peak times
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      Best for: Production use, business operations, high-volume
                      needs
                    </span>
                  </li>
                </ul>
              </div>

              {/* V3 Elite Provider */}
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                  <span className="text-2xl">👑</span> V3 Elite Provider
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  V3 Elite is our premium tier offering guaranteed instant
                  delivery with the highest success rates and dedicated support.
                  Built for mission-critical applications and enterprise
                  customers.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      Guaranteed instant delivery ($2.25 - $4.95 per SMS)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      Industry-leading success rate (99.9% guaranteed)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>Lightning-fast delivery (1-5 seconds)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>Bypass all queues - highest priority processing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>Dedicated support with priority response times</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      Best for: Enterprise applications, mission-critical
                      operations, maximum reliability
                    </span>
                  </li>
                </ul>
              </div>

              {/* Comparison Table */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold">
                  Complete Feature Comparison
                </h2>
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-border bg-muted/50 border-b">
                          <th className="p-4 text-left font-semibold">
                            Feature
                          </th>
                          <th className="p-4 text-left font-semibold">
                            💰 V1 Standard
                          </th>
                          <th className="p-4 text-left font-semibold">
                            💎 V2 Premium
                          </th>
                          <th className="p-4 text-left font-semibold">
                            👑 V3 Elite
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.map((row, index) => (
                          <tr
                            key={index}
                            className="border-border hover:bg-muted/50 border-b transition-colors last:border-0"
                          >
                            <td className="p-4 font-medium">{row.feature}</td>
                            <td className="text-muted-foreground p-4">
                              {row.v1}
                            </td>
                            <td className="text-muted-foreground p-4">
                              {row.v2}
                            </td>
                            <td className="text-muted-foreground p-4 font-medium">
                              {row.v3}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Auto-Cancel System */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold">
                  Auto-Cancel Protection
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  All provider tiers include automatic cancellation and refund
                  if SMS is not received within the specified timeframe:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>Automatic refund to wallet if SMS not received</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      Instant notification when number is auto-canceled
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      No risk - you only pay for successfully received SMS codes
                    </span>
                  </li>
                </ul>
              </div>

              {/* Which to Choose */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold">
                  Which Provider Should You Choose?
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg p-6 [background:var(--glass-secondary)] [border:1px_solid_var(--glass-border)]">
                    <div className="mb-3 text-2xl">💰</div>
                    <h3 className="mb-3 font-semibold">Choose V1 If:</h3>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li>• Budget is primary concern</li>
                      <li>• Testing or development</li>
                      <li>• Low-volume usage</li>
                      <li>• Time is not critical</li>
                    </ul>
                  </div>
                  <div className="bg-primary/10 border-primary/20 rounded-lg border p-6">
                    <div className="mb-3 text-2xl">💎</div>
                    <h3 className="mb-3 font-semibold">Choose V2 If:</h3>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li>• Production environment</li>
                      <li>• Need high success rate</li>
                      <li>• Business operations</li>
                      <li>• Faster delivery needed</li>
                    </ul>
                  </div>
                  <div className="bg-primary/10 border-primary/30 rounded-lg border p-6">
                    <div className="mb-3 text-2xl">👑</div>
                    <h3 className="mb-3 font-semibold">Choose V3 If:</h3>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li>• Mission-critical apps</li>
                      <li>• Enterprise requirements</li>
                      <li>• Guaranteed delivery needed</li>
                      <li>• Maximum reliability required</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Membership Benefits */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold">
                  Membership Tier Benefits
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Your membership tier provides additional discounts on all
                  provider types:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      <strong>Pro Members:</strong> 10% discount on all
                      providers
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      <strong>Business Members:</strong> 20% discount + priority
                      support
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      <strong>Enterprise Members:</strong> 30% discount +
                      dedicated manager
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/knowledge-base/sms-activation/how-it-works"
              className="text-muted-foreground hover:text-primary inline-flex items-center transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: How It Works
            </Link>
            <Link
              href="/knowledge-base/sms-activation"
              className="text-primary inline-flex items-center transition-colors hover:underline"
            >
              Back to Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
