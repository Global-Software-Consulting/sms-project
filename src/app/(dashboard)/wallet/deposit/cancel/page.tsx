'use client';

import Link from 'next/link';
import { 
  XCircle, 
  ArrowLeft,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui';
import { DashboardShell } from '@/components/layout';

/**
 * Payment Cancelled Page
 * 
 * Shown when user cancels Stripe checkout
 */
export default function PaymentCancelPage() {
  return (
    <DashboardShell>
      <div style={{ 
        maxWidth: '500px', 
        margin: '0 auto', 
        textAlign: 'center',
        padding: '48px 24px'
      }}>
        {/* Cancel Icon */}
        <div style={{ 
          width: '80px', 
          height: '80px', 
          margin: '0 auto 24px',
          borderRadius: '50%',
          backgroundColor: 'rgba(107, 114, 128, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <XCircle style={{ width: '48px', height: '48px', color: 'var(--text-muted)' }} />
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Payment Cancelled
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Your payment was cancelled. No charges were made to your account.
        </p>

        {/* Info Card */}
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border-default)', 
          borderRadius: '16px', 
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            What happened?
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                You closed the payment window before completing the transaction
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Your card was not charged
              </span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                You can try again anytime
              </span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href="/wallet/deposit" style={{ textDecoration: 'none' }}>
            <Button fullWidth size="lg">
              <RefreshCw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Try Again
            </Button>
          </Link>
          <Link href="/wallet" style={{ textDecoration: 'none' }}>
            <Button variant="outline" fullWidth>
              <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Back to Wallet
            </Button>
          </Link>
        </div>

        {/* Help Link */}
        <div style={{ marginTop: '32px' }}>
          <Link 
            href="/help" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: 'var(--text-muted)', 
              fontSize: '14px',
              textDecoration: 'none'
            }}
          >
            <HelpCircle style={{ width: '16px', height: '16px' }} />
            Need help? Contact support
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}

