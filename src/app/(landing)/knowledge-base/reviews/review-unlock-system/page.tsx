import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  DollarSign,
  MessageSquare,
  Star,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function ReviewUnlockSystem() {
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
            href="/knowledge-base/reviews"
            className="hover:text-primary transition-colors"
          >
            Reviews & Limits
          </Link>
          <ArrowRight className="h-4 w-4" />
          <span className="text-foreground">Review Unlock System</span>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <Badge className="mb-4">Reviews & Limits</Badge>
          <h1 className="mb-4 text-4xl font-bold">Review Unlock System</h1>
          <p className="text-muted-foreground">
            Published on February 17, 2026 · 3 min read
          </p>
        </div>

        <div className="space-y-8">
          {/* Main Content */}
          <Card>
            <CardContent className="space-y-8 py-8">
              {/* Introduction */}
              <div>
                <p className="mb-4 text-lg leading-relaxed">
                  Our review system ensures quality feedback from active users
                  while preventing spam. Reviews are unlocked through platform
                  usage, creating a fair and reliable rating system.
                </p>
              </div>

              {/* How It Works */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold">
                  How Review Slots Work
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
                      <DollarSign className="text-primary h-6 w-6" />
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="mb-2 font-semibold">
                        Every $10 Spent Unlocks 1 Review
                      </h3>
                      <p className="text-muted-foreground">
                        For every $10 you spend on activations or rentals, you
                        unlock one review slot. This ensures reviewers have
                        actual experience with the services.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-success/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
                      <MessageSquare className="text-success h-6 w-6" />
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="mb-2 font-semibold">
                        Review Slots Accumulate
                      </h3>
                      <p className="text-muted-foreground">
                        Unused review slots carry over and accumulate. If you
                        spend $50, you have 5 review slots available to use
                        whenever you want.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-warning/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
                      <Star className="text-warning h-6 w-6" />
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="mb-2 font-semibold">
                        Reviews Improve Provider Ranking
                      </h3>
                      <p className="text-muted-foreground">
                        Your reviews directly influence provider rankings and
                        help other users make informed decisions about which
                        services to use.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example Calculation */}
              <div className="rounded-lg p-6 [background:var(--glass-secondary)] [border:1px_solid_var(--glass-border)]">
                <h3 className="mb-4 font-semibold">Example Calculation</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total spent this month:
                    </span>
                    <span className="font-semibold">$85</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Review slots unlocked:
                    </span>
                    <span className="font-semibold">8 slots</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Reviews submitted:
                    </span>
                    <span className="font-semibold">3 reviews</span>
                  </div>
                  <div className="border-border mt-3 flex justify-between border-t pt-3">
                    <span className="text-foreground font-medium">
                      Available slots:
                    </span>
                    <span className="text-primary font-bold">5 slots</span>
                  </div>
                </div>
              </div>

              {/* VIP Influence */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold">
                  VIP Services and Reviews
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Reviews play an important role in determining VIP service
                  allocation:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      Highly-rated services receive priority in VIP routing
                      algorithms
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      VIP members' reviews carry additional weight in the
                      ranking system
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      Services with consistent 4-5 star ratings get more VIP
                      traffic
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      Poor reviews can lead to temporary service suspension for
                      quality control
                    </span>
                  </li>
                </ul>
              </div>

              {/* Review Guidelines */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold">
                  Review Guidelines
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  To maintain quality, please follow these guidelines when
                  submitting reviews:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      Rate based on actual experience with the service
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>
                      Include specific details about delivery speed and
                      reliability
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>Be honest but fair in your assessment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-success mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span>Avoid spam or duplicate reviews</span>
                  </li>
                </ul>
              </div>

              {/* Checking Your Slots */}
              <div className="bg-primary/10 border-primary/20 rounded-lg border p-6">
                <h3 className="mb-2 font-semibold">
                  Check Your Available Slots
                </h3>
                <p className="text-muted-foreground">
                  You can view your available review slots at any time in the{' '}
                  <Link
                    href="/dashboard/reviews"
                    className="text-primary hover:underline"
                  >
                    Reviews Dashboard
                  </Link>
                  . Your spending automatically unlocks slots as you use the
                  platform.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/knowledge-base/reviews"
              className="text-muted-foreground hover:text-primary inline-flex items-center transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reviews & Limits
            </Link>
            <Link
              href="/dashboard/reviews"
              className="text-primary inline-flex items-center transition-colors hover:underline"
            >
              Go to Reviews Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
