'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  Wallet, 
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui';
import { DashboardShell } from '@/components/layout';
import { getPayment, getWalletBalance, formatAmount, type Payment, type WalletBalance } from '@/lib/api';

/**
 * Payment Success Page
 * 
 * Shown after successful Stripe payment
 * Displays confirmation and new balance
 */
export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('id');
  
  const [payment, setPayment] = useState<Payment | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch payment details if ID provided
        if (paymentId) {
          const paymentData = await getPayment(paymentId);
          setPayment(paymentData);
        }
        
        // Fetch updated balance
        const balanceData = await getWalletBalance();
        setBalance(balanceData);
      } catch {
        // Ignore errors - show generic success
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [paymentId]);

  return (
    <DashboardShell>
      <div style={{ 
        maxWidth: '500px', 
        margin: '0 auto', 
        textAlign: 'center',
        padding: '48px 24px'
      }}>
        {/* Success Icon */}
        <div style={{ 
          width: '80px', 
          height: '80px', 
          margin: '0 auto 24px',
          borderRadius: '50%',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <CheckCircle2 style={{ width: '48px', height: '48px', color: 'var(--success)' }} />
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Payment Successful! 🎉
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Your funds have been added to your wallet.
        </p>

        {/* Amount Card */}
        {!loading && (
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-default)', 
            borderRadius: '16px', 
            padding: '24px',
            marginBottom: '24px'
          }}>
            {payment && (
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-default)' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Amount Deposited</p>
                <p style={{ fontSize: '36px', fontWeight: 700, color: 'var(--success)' }}>
                  +{formatAmount(payment.amount, payment.currency)}
                </p>
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                backgroundColor: 'rgba(198, 167, 94, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Wallet style={{ width: '20px', height: '20px', color: 'var(--accent-gold)' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>New Balance</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatAmount(balance?.balance || '0', balance?.currency || 'USD')}
                </p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-default)', 
            borderRadius: '16px', 
            padding: '32px',
            marginBottom: '24px'
          }}>
            <RefreshCw style={{ width: '24px', height: '24px', color: 'var(--text-muted)', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading payment details...</p>
          </div>
        )}

        {/* Bonus Info */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: 'rgba(198, 167, 94, 0.1)',
          borderRadius: '12px',
          marginBottom: '32px'
        }}>
          <Sparkles style={{ width: '16px', height: '16px', color: 'var(--accent-gold)' }} />
          <span style={{ fontSize: '14px', color: 'var(--accent-gold)', fontWeight: 500 }}>
            Funds are available immediately!
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href="/sms-activation" style={{ textDecoration: 'none' }}>
            <Button fullWidth size="lg">
              Start Using SMS
              <ArrowRight style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
            </Button>
          </Link>
          <Link href="/wallet" style={{ textDecoration: 'none' }}>
            <Button variant="outline" fullWidth>
              View Wallet
            </Button>
          </Link>
        </div>

        {/* Transaction ID */}
        {payment && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '24px' }}>
            Transaction ID: {payment.id}
          </p>
        )}
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
      `}</style>
    </DashboardShell>
  );
}

