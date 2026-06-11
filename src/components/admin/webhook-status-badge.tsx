'use client';

import { CheckCircle2, AlertTriangle, XCircle, CircleDashed } from 'lucide-react';

/**
 * Visual indicator of whether the gateway's webhook URL has been wired
 * up correctly on the client's side. Reads two fields the backend stamps
 * inside every /webhooks/<gateway> call (PR sms-api #39):
 *
 *   lastWebhookAt     ISO timestamp of the last hit, or null = never received
 *   lastWebhookStatus 'connected' | 'invalid_signature' | 'error' | null
 *
 * Diagnostic states:
 *   ⚪ Never received     — client did not paste the URL on their dashboard
 *   🟢 Connected           — URL right + signing secret right; webhook works
 *   🟡 Invalid signature   — URL right but signing secret on client side does
 *                            not match ours (most common misconfiguration)
 *   🔴 Error               — handler threw, check server logs
 *   🟠 Stale (overlay)     — previously connected but no hit in 24h
 *
 * Two layouts: compact (table cell) and full (with timestamp tooltip).
 */

const STALE_MS = 24 * 60 * 60 * 1000;

interface WebhookStatusBadgeProps {
  lastWebhookAt?: string | null;
  lastWebhookStatus?: 'connected' | 'invalid_signature' | 'error' | null;
  /** Compact = icon + short label, no timestamp. Full = icon + label + when. */
  compact?: boolean;
}

interface BadgeMeta {
  label: string;
  Icon: typeof CheckCircle2;
  className: string;
  help: string;
}

function resolveMeta(
  status: WebhookStatusBadgeProps['lastWebhookStatus'],
  receivedAt: Date | null,
): BadgeMeta {
  if (status === null || status === undefined) {
    return {
      label: 'Never received',
      Icon: CircleDashed,
      className:
        'border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.04)] text-[#94A3B8]',
      help: 'Client has not configured the webhook URL on their gateway dashboard yet, or has typed it incorrectly. Send them the Status URL above.',
    };
  }
  const isStale = receivedAt
    ? Date.now() - receivedAt.getTime() > STALE_MS
    : false;
  if (status === 'connected') {
    if (isStale) {
      return {
        label: 'Stale',
        Icon: AlertTriangle,
        className:
          'border-[rgba(249,115,22,0.4)] bg-[rgba(249,115,22,0.12)] text-[#FB923C]',
        help: 'Webhook was reachable previously but no hit in the last 24 hours. Confirm with the client that the URL is still configured on their gateway dashboard.',
      };
    }
    return {
      label: 'Connected',
      Icon: CheckCircle2,
      className:
        'border-[rgba(16,185,129,0.4)] bg-[rgba(16,185,129,0.12)] text-[#34D399]',
      help: 'Webhook is wired correctly. URL right, signing secret matches.',
    };
  }
  if (status === 'invalid_signature') {
    return {
      label: 'Secret mismatch',
      Icon: AlertTriangle,
      className:
        'border-[rgba(234,179,8,0.4)] bg-[rgba(234,179,8,0.12)] text-[#FACC15]',
      help: 'URL is reachable but the signing secret on the client side does not match ours. Tell the client to copy the signing secret from this admin panel and paste it into their gateway dashboard.',
    };
  }
  return {
    label: 'Error',
    Icon: XCircle,
    className:
      'border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.12)] text-[#F87171]',
    help: 'The webhook handler threw on the most recent call. Check server logs.',
  };
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export function WebhookStatusBadge({
  lastWebhookAt,
  lastWebhookStatus,
  compact = false,
}: WebhookStatusBadgeProps): React.ReactElement {
  const receivedAt = lastWebhookAt ? new Date(lastWebhookAt) : null;
  const meta = resolveMeta(lastWebhookStatus, receivedAt);
  const Icon = meta.Icon;
  const tooltip = receivedAt
    ? `${meta.help}\n\nLast received: ${receivedAt.toLocaleString()} (${formatRelative(receivedAt)})`
    : meta.help;

  return (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.className}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
      {!compact && receivedAt && (
        <span className="text-[10px] opacity-75">
          · {formatRelative(receivedAt)}
        </span>
      )}
    </span>
  );
}
