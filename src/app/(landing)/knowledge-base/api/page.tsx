import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';
import { RateLimitsTable } from '@/components/rate-limits-table';

export const metadata = buildMetadata({
  title: 'API Knowledge Base',
  description:
    'Learn how to integrate with the BestSMSHQ API — quick start, authentication, endpoints, error handling and code examples.',
  path: '/knowledge-base/api',
});

const BASE = 'https://api.bestsmshq.com/api/v1';

export default function APIArticle() {
  const sections = [
    {
      id: 'api-quickstart',
      title: 'API Quick Start Guide',
      description: 'Get started with the API in minutes',
      readTime: '5 min',
    },
    {
      id: 'authentication',
      title: 'Authentication & API Keys',
      description: 'Managing API keys and authenticating requests',
      readTime: '4 min',
    },
    {
      id: 'activation-endpoint',
      title: 'Activation Endpoint',
      description: 'Creating activations programmatically',
      readTime: '6 min',
    },
    {
      id: 'rental-endpoint',
      title: 'Rental Endpoint',
      description: 'Managing number rentals via API',
      readTime: '5 min',
    },
    {
      id: 'webhook-notifications',
      title: 'Webhook Notifications',
      description: 'Receiving real-time SMS updates',
      readTime: '5 min',
    },
    {
      id: 'rate-limits',
      title: 'Rate Limits & Quotas',
      description: 'Understanding API usage limits',
      readTime: '3 min',
    },
    {
      id: 'error-handling',
      title: 'Error Handling',
      description: 'Handling API errors and response codes',
      readTime: '4 min',
    },
    {
      id: 'api-examples',
      title: 'Code Examples',
      description: 'Sample implementations in multiple languages',
      readTime: '8 min',
    },
  ];

  const codeBlock = (children: React.ReactNode) => (
    <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs leading-relaxed">
      <code>{children}</code>
    </pre>
  );

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-4xl space-y-10">
        <Link prefetch={false}
          href="/knowledge-base"
          className="text-muted-foreground hover:text-primary inline-flex items-center transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Knowledge Base
        </Link>

        <div>
          <Badge className="mb-4">API Usage</Badge>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">API Usage</h1>
          <p className="text-muted-foreground text-xl">
            Integrate our API into your workflow and automate SMS activation.
          </p>
        </div>

        {/* TOC */}
        <Card>
          <CardContent className="py-6">
            <h2 className="mb-4 text-lg font-semibold">On this page</h2>
            <ul className="space-y-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-primary inline-flex items-center hover:underline"
                  >
                    <ChevronDown className="mr-2 h-4 w-4 -rotate-90" />
                    {s.title}
                    <span className="text-muted-foreground ml-2 text-sm">
                      · {s.readTime}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 1. Quick Start */}
        <section id="api-quickstart" className="scroll-mt-24 space-y-4">
          <h2 className="text-2xl font-bold">API Quick Start Guide</h2>
          <p className="text-muted-foreground">
            The BestSMSHQ REST API lets you order SMS activations, check status,
            cancel orders, and read your wallet balance from your own code. All
            endpoints are HTTPS and accept/return JSON.
          </p>
          <ol className="text-muted-foreground list-decimal space-y-2 pl-6">
            <li>Sign up and verify your email.</li>
            <li>
              Open{' '}
              <Link prefetch={false}
                href="/dashboard/api"
                className="text-primary hover:underline"
              >
                Dashboard → API
              </Link>{' '}
              and click <strong>Create API Key</strong>.
            </li>
            <li>Copy the key — it is shown only once.</li>
            <li>Send authenticated requests as shown below.</li>
          </ol>
          {codeBlock(
            `curl -X POST "${BASE}/sms/activate" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{ "service": "whatsapp", "country": "us", "version": "V2" }'`,
          )}
        </section>

        {/* 2. Authentication */}
        <section id="authentication" className="scroll-mt-24 space-y-4">
          <h2 className="text-2xl font-bold">Authentication & API Keys</h2>
          <p className="text-muted-foreground">
            Every request must include an <code>Authorization</code> header with
            your secret API key. Keys are scoped to your account; revoke and
            rotate them anytime from{' '}
            <Link prefetch={false}
              href="/dashboard/api"
              className="text-primary hover:underline"
            >
              Dashboard → API
            </Link>
            .
          </p>
          {codeBlock(`Authorization: Bearer sk_live_XXXXXXXXXXXXXXXX`)}
          <p className="text-muted-foreground text-sm">
            Never embed keys in client-side code, public repos, or mobile apps.
            Server-side use only.
          </p>
        </section>

        {/* 3. Activation Endpoint */}
        <section id="activation-endpoint" className="scroll-mt-24 space-y-4">
          <h2 className="text-2xl font-bold">Activation Endpoint</h2>
          <p className="text-muted-foreground">
            Create a one-time SMS activation. The response contains a phone
            number and an order ID you can poll for the incoming code.
          </p>
          <div>
            <Badge className="mr-2">POST</Badge>
            <code className="text-sm">{BASE}/sms/activate</code>
          </div>
          {codeBlock(
            `curl -X POST "${BASE}/sms/activate" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "service": "whatsapp",\n    "country": "us",\n    "version": "V2"\n  }'`,
          )}
          <p className="text-muted-foreground text-sm">
            Poll <code>GET {BASE}/sms/orders/:id</code> until{' '}
            <code>status</code> is <code>RECEIVED</code>, then read{' '}
            <code>smsCode</code> from the response. Cancel any unused activation
            with <code>POST {BASE}/sms/orders/:id/cancel</code> to refund your
            wallet.
          </p>
        </section>

        {/* 4. Rental Endpoint */}
        <section id="rental-endpoint" className="scroll-mt-24 space-y-4">
          <h2 className="text-2xl font-bold">Rental Endpoint</h2>
          <p className="text-muted-foreground">
            Long-term number rentals receive multiple SMS over a fixed window
            (hours, days, weeks). Create a rental, then list incoming messages.
          </p>
          <div>
            <Badge className="mr-2">POST</Badge>
            <code className="text-sm">{BASE}/sms/rent</code>
          </div>
          {codeBlock(
            `curl -X POST "${BASE}/sms/rent" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{ "service": "whatsapp", "country": "us", "duration": "1d" }'`,
          )}
          <p className="text-muted-foreground text-sm">
            Fetch received SMS at{' '}
            <code>GET {BASE}/sms/rentals/:id/messages</code>.
          </p>
        </section>

        {/* 5. Webhooks */}
        <section id="webhook-notifications" className="scroll-mt-24 space-y-4">
          <h2 className="text-2xl font-bold">Webhook Notifications</h2>
          <p className="text-muted-foreground">
            Register a webhook URL on your account to receive real-time order
            events instead of polling. We POST a JSON body with the order ID,
            status, and SMS code (if received) and expect a 2xx response.
          </p>
          {codeBlock(
            `POST https://your-app.example.com/webhooks/bestsmshq\nContent-Type: application/json\nX-Bestsmshq-Signature: t=<unix>,v1=<hmac-sha256>\n\n{\n  "orderId": "ord_...",\n  "status": "RECEIVED",\n  "smsCode": "123456",\n  "receivedAt": "2026-06-03T10:00:00Z"\n}`,
          )}
          <p className="text-muted-foreground text-sm">
            Verify the <code>X-Bestsmshq-Signature</code> header using your
            webhook secret before trusting any payload.
          </p>
        </section>

        {/* 6. Rate Limits */}
        <section id="rate-limits" className="scroll-mt-24 space-y-4">
          <h2 className="text-2xl font-bold">Rate Limits & Quotas</h2>
          <p className="text-muted-foreground">
            Limits are applied per API key and configured per plan tier. Current
            values:
          </p>
          <RateLimitsTable />
          <p className="text-muted-foreground">Every response includes:</p>
          {codeBlock(
            `X-RateLimit-Limit: <your tier limit>\nX-RateLimit-Remaining: 27\nX-RateLimit-Reset: 1717406400`,
          )}
          <p className="text-muted-foreground text-sm">
            When you exceed the limit you get HTTP{' '}
            <code>429 Too Many Requests</code> with a <code>Retry-After</code>{' '}
            header.
          </p>
        </section>

        {/* 7. Error Handling */}
        <section id="error-handling" className="scroll-mt-24 space-y-4">
          <h2 className="text-2xl font-bold">Error Handling</h2>
          <p className="text-muted-foreground">
            Errors return a non-2xx status code and a JSON body with{' '}
            <code>error</code> + <code>message</code> fields. Common ones:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Meaning</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2">
                    <code>400</code>
                  </td>
                  <td className="py-2">
                    Invalid request body or missing field
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">
                    <code>401</code>
                  </td>
                  <td className="py-2">Missing / invalid API key</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">
                    <code>402</code>
                  </td>
                  <td className="py-2">Wallet balance too low</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">
                    <code>404</code>
                  </td>
                  <td className="py-2">Order / service / country not found</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">
                    <code>409</code>
                  </td>
                  <td className="py-2">No numbers available right now</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">
                    <code>429</code>
                  </td>
                  <td className="py-2">Rate-limited — back off</td>
                </tr>
                <tr>
                  <td className="py-2">
                    <code>5xx</code>
                  </td>
                  <td className="py-2">Server error — retry with jitter</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 8. Code Examples */}
        <section id="api-examples" className="scroll-mt-24 space-y-4">
          <h2 className="text-2xl font-bold">Code Examples</h2>
          <p className="text-muted-foreground">
            Minimal examples in three common languages. Replace{' '}
            <code>YOUR_API_KEY</code> with your real key.
          </p>

          <h3 className="text-lg font-semibold">cURL</h3>
          {codeBlock(
            `curl -X POST "${BASE}/sms/activate" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{ "service": "whatsapp", "country": "us", "version": "V2" }'`,
          )}

          <h3 className="text-lg font-semibold">
            JavaScript (Node 18+ / fetch)
          </h3>
          {codeBlock(
            `const res = await fetch('${BASE}/sms/activate', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer YOUR_API_KEY',\n    'Content-Type': 'application/json',\n  },\n  body: JSON.stringify({\n    service: 'whatsapp',\n    country: 'us',\n    version: 'V2',\n  }),\n});\nconst data = await res.json();\nconsole.log(data);`,
          )}

          <h3 className="text-lg font-semibold">Python</h3>
          {codeBlock(
            `import requests\n\nresp = requests.post(\n    '${BASE}/sms/activate',\n    headers={'Authorization': 'Bearer YOUR_API_KEY'},\n    json={'service': 'whatsapp', 'country': 'us', 'version': 'V2'},\n)\nprint(resp.json())`,
          )}
        </section>
      </div>
    </div>
  );
}
