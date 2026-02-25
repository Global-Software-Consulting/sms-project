'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  ArrowLeft, 
  Wallet,
  Check,
  Shield,
  Zap,
  Lock,
  Bitcoin,
  ArrowRightLeft,
  Globe,
  ChevronRight
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
import { getErrorMessage, logError } from '@/lib/errors';
import { useToast } from '@/contexts/ToastContext';

// Payment Gateway Types
type PaymentGateway = 'STRIPE' | 'PAYGATE' | 'PLISIO' | 'CRYPTOMUS' | 'NOWPAYMENTS' | 'VOLET' | 'BINANCE';

interface GatewayOption {
  id: PaymentGateway;
  name: string;
  description: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  type: 'card' | 'crypto' | 'transfer';
  color: string;
  popular?: boolean;
  minAmount?: number;
}

const GATEWAY_OPTIONS: GatewayOption[] = [
  {
    id: 'STRIPE',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, Amex via Stripe',
    icon: CreditCard,
    type: 'card',
    color: '#635BFF',
    popular: true,
  },
  {
    id: 'VOLET',
    name: 'Volet Card',
    description: 'Alternative card processor',
    icon: CreditCard,
    type: 'card',
    color: '#00B4D8',
  },
  {
    id: 'PAYGATE',
    name: 'PayGate Multi-Currency',
    description: 'Multiple currencies supported',
    icon: Globe,
    type: 'card',
    color: '#F59E0B',
  },
  {
    id: 'PLISIO',
    name: 'Plisio Crypto',
    description: 'BTC, ETH, USDT & 100+ coins',
    icon: Bitcoin,
    type: 'crypto',
    color: '#F7931A',
  },
  {
    id: 'CRYPTOMUS',
    name: 'Cryptomus',
    description: 'Fast crypto payments',
    icon: Bitcoin,
    type: 'crypto',
    color: '#8B5CF6',
  },
  {
    id: 'NOWPAYMENTS',
    name: 'NOWPayments',
    description: 'USDT TRC20 & 100+ coins',
    icon: Bitcoin,
    type: 'crypto',
    color: '#00C853',
    minAmount: 5,
  },
  {
    id: 'BINANCE',
    name: 'Binance Internal Transfer',
    description: 'Zero fees, instant transfer',
    icon: ArrowRightLeft,
    type: 'transfer',
    color: '#F0B90B',
  },
];

/**
 * Deposit Page - Add funds to wallet via multiple payment gateways
 * 
 * Flow:
 * 1. User selects payment gateway
 * 2. User selects/enters amount
 * 3. Click "Continue to Payment"
 * 4. Redirect to gateway checkout
 * 5. After payment: redirect to success/cancel page
 */
export default function DepositPage() {
  const toast = useToast();
  
  // Wallet balance
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  
  // Gateway selection
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('STRIPE');
  
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
      } catch (err: unknown) {
        logError(err, 'fetchWalletBalance');
        // Ignore - user might not have wallet yet
      } finally {
        setBalanceLoading(false);
      }
    };
    fetchBalance();
  }, []);

  // Get effective amount
  const effectiveAmount = useCustom ? parseFloat(customAmount) || 0 : amount;
  
  // Get selected gateway info
  const selectedGatewayInfo = GATEWAY_OPTIONS.find(g => g.id === selectedGateway);
  const minAmountForGateway = selectedGatewayInfo?.minAmount || MIN_AMOUNT;
  
  // Validate amount
  const isAmountValid = effectiveAmount >= minAmountForGateway && effectiveAmount <= MAX_AMOUNT;

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

  // Handle gateway selection
  const handleGatewaySelect = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setError(null);
  };

  // Handle payment
  const handlePayment = async () => {
    if (!isAmountValid) {
      const errorMsg = `Amount must be between $${minAmountForGateway} and $${MAX_AMOUNT.toLocaleString()}`;
      setError(errorMsg);
      toast.warning(errorMsg, 'Invalid Amount');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const response = await createPayment({
        amount: effectiveAmount,
        gateway: selectedGateway,
        successUrl: `${window.location.origin}/wallet/deposit/success`,
        cancelUrl: `${window.location.origin}/wallet/deposit/cancel`,
      });

      // Handle different gateway responses
      if (selectedGateway === 'BINANCE') {
        // Binance shows instructions instead of redirect
        toast.success('Payment instructions generated. Please complete the transfer.', 'Instructions Ready');
        // Could show a modal with instructions here
        if (response.checkoutUrl) {
          window.location.href = response.checkoutUrl;
        }
      } else if (response.checkoutUrl) {
        toast.info('Redirecting to payment gateway...', 'Processing');
        window.location.href = response.checkoutUrl;
      } else {
        const errorMsg = 'Failed to create checkout session. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg, 'Payment Error');
      }
    } catch (err: unknown) {
      logError(err, 'createPayment');
      const errorMessage = getErrorMessage(err, 'payment');
      setError(errorMessage);
      toast.error(errorMessage, 'Payment Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Group gateways by type
  const cardGateways = GATEWAY_OPTIONS.filter(g => g.type === 'card');
  const cryptoGateways = GATEWAY_OPTIONS.filter(g => g.type === 'crypto');
  const transferGateways = GATEWAY_OPTIONS.filter(g => g.type === 'transfer');

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
          Choose your preferred payment method and deposit amount.
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
        {/* Left: Gateway & Amount Selection */}
        <div style={{ gridColumn: 'span 1' }} className="lg:!col-span-2">
          {/* Current Balance */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
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
          </div>

          {/* Payment Method Selection */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              Select Payment Method
            </h2>

            {/* Card Payments */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                💳 Card Payments
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cardGateways.map((gateway) => (
                  <GatewayButton
                    key={gateway.id}
                    gateway={gateway}
                    isSelected={selectedGateway === gateway.id}
                    onClick={() => handleGatewaySelect(gateway.id)}
                  />
                ))}
              </div>
            </div>

            {/* Crypto Payments */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                ₿ Cryptocurrency
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cryptoGateways.map((gateway) => (
                  <GatewayButton
                    key={gateway.id}
                    gateway={gateway}
                    isSelected={selectedGateway === gateway.id}
                    onClick={() => handleGatewaySelect(gateway.id)}
                  />
                ))}
              </div>
            </div>

            {/* Transfer */}
            <div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                🔄 Direct Transfer
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {transferGateways.map((gateway) => (
                  <GatewayButton
                    key={gateway.id}
                    gateway={gateway}
                    isSelected={selectedGateway === gateway.id}
                    onClick={() => handleGatewaySelect(gateway.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Amount Selection */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              Select Amount
            </h2>

            {/* Preset Amounts */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetClick(preset)}
                    disabled={preset < minAmountForGateway}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: `2px solid ${!useCustom && amount === preset ? 'var(--accent-gold)' : 'var(--border-default)'}`,
                      backgroundColor: !useCustom && amount === preset ? 'rgba(198, 167, 94, 0.1)' : 'var(--bg-secondary)',
                      cursor: preset < minAmountForGateway ? 'not-allowed' : 'pointer',
                      opacity: preset < minAmountForGateway ? 0.5 : 1,
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
                Min: ${minAmountForGateway} • Max: ${MAX_AMOUNT.toLocaleString()}
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
              {selectedGatewayInfo?.icon && <selectedGatewayInfo.icon style={{ width: '20px', height: '20px', marginRight: '8px' }} />}
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
                <span style={{ color: 'var(--text-muted)' }}>Payment Method</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedGatewayInfo?.name}</span>
              </div>
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
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>Secure Checkout</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>All payments are encrypted</p>
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

            {/* Selected Gateway Badge */}
            {selectedGatewayInfo && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-default)', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Powered by</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <selectedGatewayInfo.icon style={{ width: '18px', height: '18px', color: selectedGatewayInfo.color }} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: selectedGatewayInfo.color }}>{selectedGatewayInfo.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

/* ==================== COMPONENTS ==================== */

interface GatewayButtonProps {
  gateway: GatewayOption;
  isSelected: boolean;
  onClick: () => void;
}

function GatewayButton({ gateway, isSelected, onClick }: GatewayButtonProps) {
  const Icon = gateway.icon;
  
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 16px',
        borderRadius: '12px',
        border: `2px solid ${isSelected ? gateway.color : 'var(--border-default)'}`,
        backgroundColor: isSelected ? `${gateway.color}10` : 'var(--bg-secondary)',
        cursor: 'pointer',
        transition: 'all 150ms ease',
        textAlign: 'left',
        width: '100%'
      }}
    >
      <div style={{ 
        width: '44px', 
        height: '44px', 
        borderRadius: '10px', 
        backgroundColor: `${gateway.color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon style={{ width: '22px', height: '22px', color: gateway.color }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {gateway.name}
          </span>
          {gateway.popular && (
            <span style={{ 
              padding: '2px 6px', 
              borderRadius: '4px', 
              fontSize: '10px', 
              fontWeight: 600,
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              color: 'var(--success)'
            }}>
              Popular
            </span>
          )}
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {gateway.description}
        </p>
      </div>
      <ChevronRight style={{ 
        width: '18px', 
        height: '18px', 
        color: isSelected ? gateway.color : 'var(--text-muted)',
        flexShrink: 0
      }} />
    </button>
  );
}
