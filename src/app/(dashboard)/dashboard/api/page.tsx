'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Code, Copy, RefreshCw, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type ProviderType = 'v1' | 'v2' | 'v3';

export default function APIAccess() {
  const [showKeyV1, setShowKeyV1] = useState(false);
  const [showKeyV2, setShowKeyV2] = useState(false);
  const [showKeyV3, setShowKeyV3] = useState(false);
  const [activeTab, setActiveTab] = useState<ProviderType>('v1');

  const apiKeys = {
    v1: 'sk_v1_live_7x9k3m2n8p4q1r5t6w0y2z4a5b7c9d1e3f',
    v2: 'sk_v2_live_9a1b3c5d7e9f2g4h6i8j0k2l4m6n8o0p2q',
    v3: 'sk_v3_live_4r5s7t9u1v3w5x7y9z1a3b5c7d9e1f3g5h',
  };

  const endpoints = {
    v1: 'https://api.smspro.com/v1',
    v2: 'https://api.smspro.com/v2',
    v3: 'https://api.smspro.com/v3',
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const regenerateKey = (provider: ProviderType) => {
    toast.success(`${provider.toUpperCase()} API key regenerated`, {
      description: 'Your old key has been revoked',
    });
  };

  const stats = {
    v1: [
      { label: 'Total Requests', value: '12,458' },
      { label: 'This Month', value: '3,247' },
      { label: 'Success Rate', value: '99.2%' },
      { label: 'Avg Response', value: '156ms' },
    ],
    v2: [
      { label: 'Total Requests', value: '8,231' },
      { label: 'This Month', value: '2,104' },
      { label: 'Success Rate', value: '99.8%' },
      { label: 'Avg Response', value: '89ms' },
    ],
    v3: [
      { label: 'Total Requests', value: '4,567' },
      { label: 'This Month', value: '1,234' },
      { label: 'Success Rate', value: '99.9%' },
      { label: 'Avg Response', value: '45ms' },
    ],
  };

  const renderProviderContent = (provider: ProviderType) => {
    const showKey =
      provider === 'v1' ? showKeyV1 : provider === 'v2' ? showKeyV2 : showKeyV3;
    const setShowKey =
      provider === 'v1'
        ? setShowKeyV1
        : provider === 'v2'
          ? setShowKeyV2
          : setShowKeyV3;
    const apiKey = apiKeys[provider];
    const endpoint = endpoints[provider];
    const providerStats = stats[provider];

    const providerInfo = {
      v1: {
        name: 'Standard V1',
        icon: '💰',
        description: 'Cost-effective API access with standard performance',
        features: ['Standard rate limits', 'Basic support', '99%+ uptime SLA'],
      },
      v2: {
        name: 'Premium V2',
        icon: '💎',
        description: 'Enhanced API access with priority routing',
        features: [
          'Higher rate limits',
          'Priority support',
          '99.9%+ uptime SLA',
          'Faster response times',
        ],
      },
      v3: {
        name: 'Elite V3',
        icon: '👑',
        description: 'Ultimate API access with guaranteed performance',
        features: [
          'Unlimited rate limits',
          'Dedicated support',
          '99.99%+ uptime SLA',
          'Guaranteed instant delivery',
        ],
      },
    };

    const info = providerInfo[provider];

    return (
      <div className="space-y-6">
        {/* Provider Info */}
        <div className="bg-muted/50 border-border rounded-lg border p-4">
          <div className="flex items-start space-x-3">
            <div className="text-3xl">{info.icon}</div>
            <div className="flex-1">
              <h4 className="mb-1 font-semibold">{info.name} API</h4>
              <p className="text-muted-foreground mb-3 text-sm">
                {info.description}
              </p>
              <ul className="space-y-1">
                {info.features.map((feature, i) => (
                  <li
                    key={i}
                    className="text-muted-foreground flex items-center text-sm"
                  >
                    <span className="text-success mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* API Key */}
        <Card>
          <CardHeader>
            <CardTitle>API Key</CardTitle>
            <CardDescription>
              Use this key to authenticate your {info.name} API requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  value={showKey ? apiKey : '••••••••••••••••••••••••••••••••'}
                  readOnly
                  className="bg-muted/50 pr-20 font-mono"
                />
                <div className="absolute top-1/2 right-2 flex -translate-y-1/2 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyToClipboard(apiKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button variant="outline" onClick={() => regenerateKey(provider)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Endpoint Base URL</label>
              <div className="flex items-center gap-2">
                <Input
                  value={endpoint}
                  readOnly
                  className="bg-muted/50 font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(endpoint)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-warning/10 border-warning/20 flex items-start space-x-2 rounded-lg border p-4">
              <AlertCircle className="text-warning mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-warning-foreground text-sm">
                <strong>Security Warning:</strong> Keep your API key secure.
                Don't share it publicly or commit it to version control.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>
              Your {info.name} API usage overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {providerStats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-muted/50 border-border rounded-lg border p-4"
                >
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>
              Get started with the {info.name} API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 font-semibold">1. Get Available Services</h4>
              <div className="relative">
                <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
                  <code>{`curl -X GET "${endpoint}/services" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() =>
                    copyToClipboard(
                      `curl -X GET "${endpoint}/services" -H "Authorization: Bearer YOUR_API_KEY"`,
                    )
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold">2. Order SMS Activation</h4>
              <div className="relative">
                <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
                  <code>{`curl -X POST "${endpoint}/activations" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"service": "whatsapp", "country": "us", "provider": "${provider}"}'`}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() =>
                    copyToClipboard(
                      `curl -X POST "${endpoint}/activations" -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d '{"service": "whatsapp", "country": "us", "provider": "${provider}"}'`,
                    )
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold">3. Check SMS Status</h4>
              <div className="relative">
                <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
                  <code>{`curl -X GET "${endpoint}/activations/{id}" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() =>
                    copyToClipboard(
                      `curl -X GET "${endpoint}/activations/{id}" -H "Authorization: Bearer YOUR_API_KEY"`,
                    )
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold">4. Cancel Activation</h4>
              <div className="relative">
                <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
                  <code>{`curl -X DELETE "${endpoint}/activations/{id}" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() =>
                    copyToClipboard(
                      `curl -X DELETE "${endpoint}/activations/{id}" -H "Authorization: Bearer YOUR_API_KEY"`,
                    )
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Access</h1>
        <p className="text-muted-foreground mt-1">
          Integrate SMS services into your applications
        </p>
      </div>

      {/* Provider Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ProviderType)}
          >
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="v1" className="space-x-2">
                <span>💰 V1 Standard</span>
              </TabsTrigger>
              <TabsTrigger value="v2" className="space-x-2">
                <span>💎 V2 Premium</span>
              </TabsTrigger>
              <TabsTrigger value="v3" className="space-x-2">
                <span>👑 V3 Elite</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="v1" className="mt-6">
              {renderProviderContent('v1')}
            </TabsContent>

            <TabsContent value="v2" className="mt-6">
              {renderProviderContent('v2')}
            </TabsContent>

            <TabsContent value="v3" className="mt-6">
              {renderProviderContent('v3')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Documentation Link */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center md:text-left">
              <h3 className="mb-1 font-semibold">Need more details?</h3>
              <p className="text-muted-foreground text-sm">
                Check out our complete API documentation for detailed endpoints,
                parameters, and examples
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <a
                href="https://docs.smspro.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Code className="mr-2 h-4 w-4" />
                View Full Documentation
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
