'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  ArrowLeft, 
  Wallet,
  Check,
  AlertCircle,
  ExternalLink,
  Shield,
  Zap,
  Lock
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { DashboardShell } from '@/components/layout';
import { 
  createPayment,
  getWalletBalance,
  formatAmount,
  PRESET_AMOUNTS,
  MIN_AMOUNT,
  MAX_AMOUNT,
  isValidAmount,
  type WalletBalance
} from '@/lib/api';

/**
 * Deposit Page - Add funds to wallet via Stripe
 * 
 * Flow:
 * 1. User selects/enters amount
 * 2. Click "Continue to Payment"
 * 3. Redirect to Stripe Checkout
 * 4. After payment: redirect to success/cancel page
 */
export default function DepositPage() {
  const router = useRouter();
  
  // Wallet balance
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  
  // Amount selection
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [useCustom, setUseCustom] = useState(false);
  
  // Payment state
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await getWalletBalance();
        setBalance(data);
      } catch {
        // Ignore - user might not have wallet yet
      } finally {
        setBalanceLoading(false);
      }
    };
    fetchBalance();
  }, []);

  // Get effective amount
  const effectiveAmount = useCustom ? parseFloat(customAmount) || 0 : amount;
  const isAmountValid = isValidAmount(effectiveAmount);

  // Handle preset amount click
  const handlePresetClick = (preset: number) => {
    setAmount(preset);
    setUseCustom(false);
    setCustomAmount('');
    setError(null);
  };

  // Handle custom amount change
  const handleCustomChange = (value: string) => {
    // Only allow numbers and decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    setCustomAmount(cleaned);
    setUseCustom(true);
    setError(null);
  };

  // Handle payment
  const handlePayment = async () => {
    if (!isAmountValid) {
      setError(`Amount must be between $${MIN_AMOUNT} and $${MAX_AMOUNT.toLocaleString()}`);
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const response = await createPayment({
        amount: effectiveAmount,
        successUrl: `${window.location.origin}/wallet/deposit/success`,
        cancelUrl: `${window.location.origin}/wallet/deposit/cancel`,
      });

      // Redirect to Stripe Checkout
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        setError('Failed to create checkout session. Please try again.');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardShell>
      {/* Back Link */}
      <Link 
        href="/wallet" 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--text-muted)', 
          fontSize: '14px',
          marginBottom: '24px',
          textDecoration: 'none'
        }}
      >
        <ArrowLeft style={{ width: '16px', height: '16px' }} />
        Back to Wallet
      </Link>

      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Add Funds
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Deposit money to your wallet using Stripe secure checkout.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ marginBottom: '24px' }}>
          <Alert variant="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:!grid-cols-3">
        {/* Left: Amount Selection */}
        <div style={{ gridColumn: 'span 1' }} className="lg:!col-span-2">
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
            {/* Current Balance */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(198, 167, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet style={{ width: '20px', height: '20px', color: 'var(--accent-gold)' }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Current Balance</p>
                <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {balanceLoading ? '...' : formatAmount(balance?.balance || '0', balance?.currency || 'USD')}
                </p>
              </div>
            </div>

            {/* Amount Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Select Amount
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetClick(preset)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: `2px solid ${!useCustom && amount === preset ? 'var(--accent-gold)' : 'var(--border-default)'}`,
                      backgroundColor: !useCustom && amount === preset ? 'rgba(198, 167, 94, 0.1)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease'
                    }}
                  >
                    <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      ${preset}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Or Enter Custom Amount
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  fontSize: '20px', 
                  fontWeight: 600, 
                  color: 'var(--text-muted)' 
                }}>
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  onFocus={() => setUseCustom(true)}
                  style={{
                    width: '100%',
                    height: '56px',
                    paddingLeft: '40px',
                    paddingRight: '16px',
                    fontSize: '20px',
                    fontWeight: 600,
                    backgroundColor: 'var(--bg-secondary)',
                    border: `2px solid ${useCustom ? 'var(--accent-gold)' : 'var(--border-default)'}`,
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 150ms ease'
                  }}
                />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Min: ${MIN_AMOUNT} • Max: ${MAX_AMOUNT.toLocaleString()}
              </p>
            </div>

            {/* Payment Button */}
            <Button 
              fullWidth 
              size="lg" 
              onClick={handlePayment}
              isLoading={isProcessing}
              disabled={!isAmountValid}
            >
              <CreditCard style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              Continue to Payment • {formatAmount(effectiveAmount)}
            </Button>
          </div>
        </div>

        {/* Right: Summary & Info */}
        <div style={{ gridColumn: 'span 1' }}>
          {/* Order Summary */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Order Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Deposit Amount</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{formatAmount(effectiveAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Processing Fee</span>
                <span style={{ fontWeight: 500, color: 'var(--success)' }}>$0.00</span>
              </div>
              <div style={{ height: '1px', backgroundColor: 'var(--border-default)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--accent-gold)' }}>{formatAmount(effectiveAmount)}</span>
              </div>
            </div>
            
            {/* What you'll receive */}
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check style={{ width: '16px', height: '16px', color: 'var(--success)' }} />
                <span style={{ fontSize: '14px', color: 'var(--success)', fontWeight: 500 }}>
                  You&apos;ll receive {formatAmount(effectiveAmount)} in your wallet
                </span>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Secure Payment
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield style={{ width: '16px', height: '16px', color: 'var(--info)' }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>Stripe Secure</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PCI-DSS Level 1 certified</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap style={{ width: '16px', height: '16px', color: 'var(--success)' }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>Instant Credit</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Funds available immediately</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(198, 167, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Lock style={{ width: '16px', height: '16px', color: 'var(--accent-gold)' }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>256-bit Encryption</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Your data is protected</p>
                </div>
              </div>
            </div>

            {/* Stripe Badge */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-default)', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Powered by</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#635BFF' }}>stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

