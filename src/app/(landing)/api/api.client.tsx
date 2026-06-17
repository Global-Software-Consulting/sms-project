'use client';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Code,
  Book,
  Zap,
  Shield,
  Key,
  Terminal,
  CheckCircle2,
  ArrowRight,
  Copy,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getProviders, type SmsProvider } from '@/lib/api/smsApi';
import { getRateLimits, type RateLimits } from '@/lib/api/rateLimitsApi';

export interface ApiContent {
  heroHeading: string;
  heroDescription: string;
  ctaHeading: string;
  ctaBody: string;
}

const FALLBACK_API_CONTENT: ApiContent = {
  heroHeading: 'Developer API',
  heroDescription:
    'Integrate SMS verification into your applications with our simple, powerful API',
  ctaHeading: 'Ready to Integrate?',
  ctaBody: 'Get your API key and start building today',
};

export default function ApiClient({
  content = FALLBACK_API_CONTENT,
}: {
  content?: ApiContent;
} = {}) {
  const [activeEndpoint, setActiveEndpoint] = useState('create');
  const [providers, setProviders] = useState<SmsProvider[]>([]);
  const [providersLoaded, setProvidersLoaded] = useState(false);
  const [rateLimits, setRateLimits] = useState<RateLimits>({
    basic: '10',
    pro: '100',
    vip: '1000',
  });

  useEffect(() => {
    getProviders()
      .then((res) =>
        setProviders(
          (res?.providers || []).filter((p) => p.isActive !== false),
        ),
      )
      .catch(() => setProviders([]))
      .finally(() => setProvidersLoaded(true));

    getRateLimits()
      .then(setRateLimits)
      .catch(() => {});
  }, []);

  // Map every active provider to exactly one tier slot (V1/V2/V3). Honors
  // explicit version where set, fills empty slots by priority desc so N
  // active providers (N <= 3) always render N cards.
  const tierProvider = useMemo(() => {
    const slots: Record<'V1' | 'V2' | 'V3', SmsProvider | undefined> = {
      V1: undefined,
      V2: undefined,
      V3: undefined,
    };
    const claimed = new Set<string>();
    for (const p of providers) {
      const v = (p.version || '').toUpperCase().trim();
      if (v.startsWith('V1') && !slots.V1) {
        slots.V1 = p;
        claimed.add(p.id);
      } else if (v.startsWith('V2') && !slots.V2) {
        slots.V2 = p;
        claimed.add(p.id);
      } else if (v.startsWith('V3') && !slots.V3) {
        slots.V3 = p;
        claimed.add(p.id);
      }
    }
    const remaining = providers
      .filter((p) => !claimed.has(p.id))
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    (['V3', 'V2', 'V1'] as const).forEach((slot) => {
      if (!slots[slot] && remaining.length) slots[slot] = remaining.shift();
    });
    return slots;
  }, [providers]);

  const hasTier = useCallback(
    (versionPrefix: 'V1' | 'V2' | 'V3'): boolean =>
      Boolean(tierProvider[versionPrefix]),
    [tierProvider],
  );

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/v1/sms/activate',
      title: 'Create Activation',
      description: 'Purchase a new SMS activation number',
    },
    {
      method: 'GET',
      path: '/api/v1/sms/orders/:id',
      title: 'Get Activation Status',
      description: 'Check status and retrieve SMS code',
    },
    {
      method: 'POST',
      path: '/api/v1/sms/orders/:id/cancel',
      title: 'Cancel Activation',
      description: 'Cancel an activation and get refund',
    },
    {
      method: 'GET',
      path: '/api/v1/sms/services',
      title: 'List Services',
      description: 'Get available services and pricing',
    },
    {
      method: 'GET',
      path: '/api/v1/wallet/balance',
      title: 'Get Balance',
      description: 'Check your account balance',
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <Badge variant="secondary" className="px-4 py-2">
            <Code className="mr-2 inline h-4 w-4" />
            RESTful API
          </Badge>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {content.heroHeading}
          </h1>

          <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-xl">
            {content.heroDescription}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Button asChild size="lg">
              <Link prefetch={false} href="/auth/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link prefetch={false} href="/knowledge-base/api">
                Full Documentation
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-border container mx-auto border-t px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                description:
                  'Average response time under 100ms with 99.9% uptime guarantee',
              },
              {
                icon: Shield,
                title: 'Secure & Reliable',
                description:
                  'Enterprise-grade security with encrypted API keys and HTTPS-only',
              },
              {
                icon: Book,
                title: 'Simple Integration',
                description:
                  'RESTful design with comprehensive docs and code examples',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="text-center">
                  <CardHeader>
                    <div className="bg-primary/10 mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl">
                      <Icon className="text-primary h-7 w-7" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
              Quick Start
            </h2>
            <p className="text-muted-foreground text-lg">
              Get up and running in minutes
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1: Get API Key */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full font-bold">
                    1
                  </div>
                  <div>
                    <CardTitle>Get Your API Key</CardTitle>
                    <CardDescription>
                      Generate an API key from your dashboard
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted group relative overflow-x-auto rounded-lg p-4 font-mono text-sm">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => copyCode('sk_live_abc123xyz789...')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <code className="text-primary">sk_live_abc123xyz789...</code>
                </div>
                <p className="text-muted-foreground mt-3 text-sm">
                  Visit{' '}
                  <Link
                    prefetch={false}
                    href="/dashboard/api"
                    className="text-primary hover:underline"
                  >
                    API Access
                  </Link>{' '}
                  page to generate your key
                </p>
              </CardContent>
            </Card>

            {/* Step 2: Make Request */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full font-bold">
                    2
                  </div>
                  <div>
                    <CardTitle>Make Your First Request</CardTitle>
                    <CardDescription>Create an SMS activation</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="curl" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>

                  <TabsContent value="curl" className="mt-4">
                    <div className="bg-muted group relative overflow-x-auto rounded-lg p-4 font-mono text-sm">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() =>
                          copyCode(`curl -X POST "https://api.bestsmshq.com/api/v1/sms/activate" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "service": "whatsapp",
    "country": "us",
    "provider": "v2"
  }'`)
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="text-xs">
                        <code>{`curl -X POST "https://api.bestsmshq.com/api/v1/sms/activate" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "service": "whatsapp",
    "country": "us",
    "provider": "v2"
  }'`}</code>
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="javascript" className="mt-4">
                    <div className="bg-muted group relative overflow-x-auto rounded-lg p-4 font-mono text-sm">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() =>
                          copyCode(`const response = await fetch('https://api.bestsmshq.com/api/v1/sms/activate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    service: 'whatsapp',
    country: 'us',
    provider: 'v2'
  })
});

const data = await response.json();
console.log(data);`)
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="text-xs">
                        <code>{`const response = await fetch('https://api.bestsmshq.com/api/v1/sms/activate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    service: 'whatsapp',
    country: 'us',
    provider: 'v2'
  })
});

const data = await response.json();
console.log(data);`}</code>
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="python" className="mt-4">
                    <div className="bg-muted group relative overflow-x-auto rounded-lg p-4 font-mono text-sm">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() =>
                          copyCode(`import requests

url = "https://api.bestsmshq.com/api/v1/sms/activate"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "service": "whatsapp",
    "country": "us",
    "provider": "v2"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`)
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="text-xs">
                        <code>{`import requests

url = "https://api.bestsmshq.com/api/v1/sms/activate"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "service": "whatsapp",
    "country": "us",
    "provider": "v2"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`}</code>
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Step 3: Get Response */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full font-bold">
                    3
                  </div>
                  <div>
                    <CardTitle>Receive Response</CardTitle>
                    <CardDescription>
                      Get your phone number instantly
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted overflow-x-auto rounded-lg p-4 font-mono text-sm">
                  <pre className="text-xs">
                    <code>{`{
  "success": true,
  "activation": {
    "id": "act_1a2b3c4d5e6f",
    "number": "+1234567890",
    "service": "whatsapp",
    "country": "us",
    "provider": "v2",
    "status": "waiting",
    "price": 1.50,
    "expires_at": "2026-02-25T12:30:00Z"
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Provider Tiers */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
              Provider Tiers via API
            </h2>
            <p className="text-muted-foreground text-lg">
              Specify provider tier in your API request
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {providersLoaded && hasTier('V1') && (
              <Card>
                <CardHeader>
                  <Badge className="mb-2 w-fit bg-blue-500">
                    💰 {tierProvider.V1?.displayName ?? 'V1 Basic'}
                  </Badge>
                  <CardTitle className="text-lg">Basic Tier</CardTitle>
                  <CardDescription>
                    Basic services - best price. Suitable for customers looking
                    for affordable options.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted overflow-x-auto rounded-lg p-3 font-mono text-xs">
                    <code className="text-blue-500">"provider": "v1"</code>
                  </div>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="text-success mt-0.5 h-4 w-4" />
                      <span>Affordable pricing</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="text-success mt-0.5 h-4 w-4" />
                      <span>Standard delivery speed</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="text-success mt-0.5 h-4 w-4" />
                      <span>Wide service coverage</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="text-success mt-0.5 h-4 w-4" />
                      <span>Regular priority</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-sm font-semibold">
                    From $1.50 per activation
                  </p>
                </CardContent>
              </Card>
            )}

            {providersLoaded && hasTier('V2') && (
              <Card className="border-primary border-2">
                <CardHeader>
                  <Badge className="bg-primary mb-2 w-fit">
                    💎 {tierProvider.V2?.displayName ?? 'V2 Standard'}
                  </Badge>
                  <CardTitle className="text-lg">Standard Tier</CardTitle>
                  <CardDescription>
                    Faster delivery and higher success rate. Ideal for customers
                    looking for more reliable results and quicker processing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted overflow-x-auto rounded-lg p-3 font-mono text-xs">
                    <code className="text-primary">"provider": "v2"</code>
                  </div>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="text-primary mt-0.5 h-4 w-4" />
                      <span>Lightning-fast delivery</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="text-primary mt-0.5 h-4 w-4" />
                      <span>Higher success rate</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="text-primary mt-0.5 h-4 w-4" />
                      <span>Standard providers</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="text-primary mt-0.5 h-4 w-4" />
                      <span>VIP priority routing</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-sm font-semibold">
                    From $2.50 per activation
                  </p>
                </CardContent>
              </Card>
            )}

            {providersLoaded && hasTier('V3') && (
              <Card className="border-warning border-2">
                <CardHeader>
                  <Badge className="bg-warning text-warning-foreground mb-2 w-fit">
                    👑 {tierProvider.V3?.displayName ?? 'V3 Premium'}
                  </Badge>
                  <CardTitle className="text-lg">Premium Tier</CardTitle>
                  <CardDescription>
                    The highest quality service with priority routing and 99.9%
                    success rate. Best for customers who demand the absolute
                    best with premium providers and priority support.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted overflow-x-auto rounded-lg p-3 font-mono text-xs">
                    <code className="text-warning">"provider": "v3"</code>
                  </div>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="text-warning mt-0.5 h-4 w-4" />
                      <span>Instant guaranteed delivery</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="text-warning mt-0.5 h-4 w-4" />
                      <span>99.9% success rate</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="text-warning mt-0.5 h-4 w-4" />
                      <span>Premium providers only</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="text-warning mt-0.5 h-4 w-4" />
                      <span>Maximum priority + support</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-sm font-semibold">
                    From $3.50 per activation
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
              API Endpoints
            </h2>
            <p className="text-muted-foreground text-lg">
              Complete reference of available endpoints
            </p>
          </div>

          <div className="space-y-3">
            {endpoints.map((endpoint, i) => (
              <Card key={i} className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={
                          endpoint.method === 'GET' ? 'secondary' : 'default'
                        }
                        className="font-mono"
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-muted-foreground font-mono text-sm">
                        {endpoint.path}
                      </code>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link prefetch={false} href="/knowledge-base/api">
                        View Docs <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-semibold">{endpoint.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {endpoint.description}
                    </p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="border-border bg-muted/30 container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Rate Limits & Pricing
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Terminal className="text-primary mb-2 h-8 w-8" />
                <CardTitle>Rate Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-border flex items-center justify-between border-b py-2">
                  <span className="text-muted-foreground text-sm">
                    Basic tier
                  </span>
                  <Badge variant="secondary">{rateLimits.basic} req/min</Badge>
                </div>
                <div className="border-border flex items-center justify-between border-b py-2">
                  <span className="text-muted-foreground text-sm">
                    Pro tier
                  </span>
                  <Badge variant="secondary">{rateLimits.pro} req/min</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground text-sm">
                    VIP tier
                  </span>
                  <Badge className="bg-primary">{rateLimits.vip} req/min</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Key className="text-primary mb-2 h-8 w-8" />
                <CardTitle>API Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-border flex items-center justify-between border-b py-2">
                  <span className="text-muted-foreground text-sm">
                    Free API key
                  </span>
                  <CheckCircle2 className="text-success h-5 w-5" />
                </div>
                <div className="border-border flex items-center justify-between border-b py-2">
                  <span className="text-muted-foreground text-sm">
                    Usage-based pricing
                  </span>
                  <CheckCircle2 className="text-success h-5 w-5" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground text-sm">
                    No setup fees
                  </span>
                  <CheckCircle2 className="text-success h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-border container mx-auto border-t px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="text-3xl font-bold">{content.ctaHeading}</h2>
          <p className="text-muted-foreground text-lg">{content.ctaBody}</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link prefetch={false} href="/auth/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link prefetch={false} href="/knowledge-base/api">
                Read Full Docs
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
