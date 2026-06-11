'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Copy, Check, Globe } from 'lucide-react';
import { API_BASE_URL } from '@/config/api-client.config';
import type { PaymentGatewayType } from '@/lib/api/adminModulesApi';

/**
 * Read-only block shown inside each gateway's edit modal listing the
 * three URLs the merchant must paste into the gateway's own dashboard
 * (webhook / IPN / status URL + success + cancel/failed redirects).
 *
 * - Status (webhook) URL is built from `NEXT_PUBLIC_API_URL` + the
 *   gateway slug exposed by `webhooks.controller.ts` in sms-api.
 * - Success / Failed URLs are built from the browser origin so the
 *   redirect lands on the same host the admin is on (handles staging
 *   and prod transparently).
 *
 * Includes a copy-to-clipboard button per URL so the merchant can
 * paste straight into the gateway dashboard without typos.
 */

const GATEWAY_SLUG: Record<PaymentGatewayType, string | null> = {
  STRIPE: 'stripe',
  PAYGATE: 'paygate',
  PLISIO: 'plisio',
  VOLET: 'volet',
  BINANCE: 'binance',
  CRYPTOMUS: 'cryptomus',
  NOWPAYMENTS: 'nowpayments',
};

interface UrlRowProps {
  label: string;
  url: string;
  help: string;
}

function UrlRow({ label, url, help }: UrlRowProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Copy failed — select and copy manually');
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white">
        {label}
      </label>
      <div className="flex items-stretch gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-3 py-2">
          <Globe className="h-4 w-4 flex-shrink-0 text-[#64748B]" />
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 bg-transparent text-xs text-white focus:outline-none"
            aria-label={label}
          />
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.06)] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <p className="mt-1 text-[11px] text-[#64748B]">{help}</p>
    </div>
  );
}

interface GatewayWebhookUrlsProps {
  gateway: PaymentGatewayType;
}

export function GatewayWebhookUrls({
  gateway,
}: GatewayWebhookUrlsProps): React.ReactElement | null {
  const slug = GATEWAY_SLUG[gateway];
  const [appOrigin, setAppOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppOrigin(window.location.origin);
    }
  }, []);

  if (!slug) return null;

  // API_BASE_URL ends with /api/v1, so the webhook path is appended directly.
  const apiBase = API_BASE_URL.replace(/\/$/, '');
  const statusUrl = `${apiBase}/webhooks/${slug}`;
  const successUrl = `${appOrigin}/dashboard/wallet?payment=success`;
  const failedUrl = `${appOrigin}/dashboard/wallet?payment=cancelled`;

  const statusHelp =
    gateway === 'BINANCE'
      ? 'Confirmation endpoint. Binance does not auto-send webhooks for internal transfers — this is for the admin/script confirmation flow.'
      : 'Paste this into the gateway dashboard as the webhook / IPN / status URL. The signing secret on the gateway side must match the secret saved above.';

  return (
    <div className="rounded-lg border border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.08)] p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <Globe className="h-4 w-4 text-[#A855F7]" />
        Webhook &amp; Redirect URLs
      </h3>
      <p className="mb-4 text-xs text-[#94A3B8]">
        Paste these URLs into the gateway dashboard so the merchant&apos;s
        side can talk to ours. All three are required for payment status to
        flow correctly.
      </p>
      <div className="space-y-3">
        <UrlRow label="Status URL (webhook)" url={statusUrl} help={statusHelp} />
        <UrlRow
          label="Success URL"
          url={successUrl}
          help="Browser redirect after a successful payment."
        />
        <UrlRow
          label="Failed / Cancel URL"
          url={failedUrl}
          help="Browser redirect after a cancelled or failed payment."
        />
      </div>
    </div>
  );
}
