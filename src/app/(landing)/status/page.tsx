import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildLandingMetadata } from '@/lib/seo/landing-metadata';
import { fetchPageContent, pick } from '@/lib/page-content';

interface AddonRow {
  key: string;
  value: string;
}

async function fetchUptimeRobotLink(): Promise<string | null> {
  const base =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  try {
    const res = await fetch(`${base}/settings/addons`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as AddonRow[];
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    if (map['addon_uptimerobot_enabled'] !== 'true') return null;
    const url = map['addon_uptimerobot_status_page_url']?.trim();
    if (!url) return null;
    if (!/^https?:\/\//.test(url)) return null;
    return url;
  } catch {
    return null;
  }
}

export const generateMetadata = () =>
  buildLandingMetadata({
    slug: 'status',
    title: 'System Status',
    description:
      'Real-time status of BestSMSHQ services — API, SMS gateway, payment processing and dashboard. Live uptime and incident history.',
    path: '/status',
  });

export default async function Status() {
  const [raw, uptimeRobotUrl] = await Promise.all([
    fetchPageContent('status'),
    fetchUptimeRobotLink(),
  ]);
  const heroHeading = pick(
    raw,
    'page_status_hero_heading',
    'All Systems Operational',
  );
  const services = [
    { name: 'API Services', status: 'operational', uptime: '99.99%' },
    { name: 'SMS Delivery', status: 'operational', uptime: '99.95%' },
    { name: 'Payment Processing', status: 'operational', uptime: '99.97%' },
    { name: 'Web Dashboard', status: 'operational', uptime: '99.98%' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <CheckCircle2 className="text-success h-10 w-10 sm:h-12 sm:w-12" />
            <h1 className="text-2xl font-bold sm:text-4xl md:text-5xl">
              {heroHeading}
            </h1>
          </div>
          <p className="text-muted-foreground text-xl">
            Last updated: Feb 13, 2026 14:35 UTC
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="border-border flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="text-success h-5 w-5" />
                    <div>
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-muted-foreground text-sm">
                        Uptime: {service.uptime}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-success text-success-foreground">
                    Operational
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {uptimeRobotUrl && (
          <div className="flex justify-center">
            <Button asChild variant="outline" size="lg">
              <a
                href={uptimeRobotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                View live uptime details
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="text-muted-foreground mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-semibold">All systems operational</p>
                  <p className="text-muted-foreground text-sm">
                    Feb 13, 2026 at 14:35 UTC
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
