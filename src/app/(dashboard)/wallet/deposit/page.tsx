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
  ChevronRight,
  X,
  Star
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
  PAYGATE_PROVIDERS,
  type WalletBalance,
  type PaygateProvider
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
  hasProviderSelection?: boolean; // For PayGate
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
    description: 'Secure Card Payments - Multiple providers available',
    icon: Globe,
    type: 'card',
    color: '#10B981',
    hasProviderSelection: true, // Shows provider selection modal
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
 * 2. If PayGate: Show provider selection modal (like CheapStreamTV)
 * 3. User selects/enters amount
 * 4. Click "Continue to Payment"
 * 5. Redirect to gateway checkout
 * 6. After payment: redirect to success/cancel page
 */
export default function DepositPage() {
  const toast = useToast();
  
  // Wallet balance
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  
  // Gateway selection
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('STRIPE');
  
  // PayGate provider selection (like CheapStreamTV)
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [selectedPaygateProvider, setSelectedPaygateProvider] = useState<PaygateProvider>('multi');
  
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
  
  // Get min amount based on gateway and provider
  const getMinAmount = () => {
    if (selectedGateway === 'PAYGATE') {
      const provider = PAYGATE_PROVIDERS.find(p => p.id === selectedPaygateProvider);
      return provider?.minAmount || 1;
    }
    return selectedGatewayInfo?.minAmount || MIN_AMOUNT;
  };
  
  const minAmountForGateway = getMinAmount();
  
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
    
    // If PayGate is selected, show provider selection modal
    if (gateway === 'PAYGATE') {
      setShowProviderModal(true);
    }
  };

  // Handle PayGate provider selection
  const handleProviderSelect = (provider: PaygateProvider) => {
    setSelectedPaygateProvider(provider);
  };

  // Confirm provider selection and close modal
  const handleConfirmProvider = () => {
    setShowProviderModal(false);
  };

  // Handle payment
  const handlePayment = async () => {
    if (!isAmountValid) {
      const errorMsg = `Amount must be between $${minAmountForGateway} and $${MAX_AMOUNT.toLocaleString()}`;
      setError(errorMsg);
      toast.warning(errorMsg, 'Invalid Amount');
      return;
    }

    // If PayGate is selected but amount is below provider minimum
    if (selectedGateway === 'PAYGATE') {
      const provider = PAYGATE_PROVIDERS.find(p => p.id === selectedPaygateProvider);
      if (provider && effectiveAmount < provider.minAmount) {
        const errorMsg = `Minimum amount for ${provider.name} is $${provider.minAmount}`;
        setError(errorMsg);
        toast.warning(errorMsg, 'Amount Too Low');
        return;
      }
    }

    try {
      setIsProcessing(true);
      setError(null);

      const response = await createPayment({
        amount: effectiveAmount,
        gateway: selectedGateway,
        successUrl: `${window.location.origin}/wallet/deposit/success`,
        cancelUrl: `${window.location.origin}/wallet/deposit/cancel`,
        // Include PayGate provider if selected
        ...(selectedGateway === 'PAYGATE' && { paygateProvider: selectedPaygateProvider }),
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

  // Get selected PayGate provider info
  const selectedProviderInfo = PAYGATE_PROVIDERS.find(p => p.id === selectedPaygateProvider);

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
                    selectedProvider={gateway.id === 'PAYGATE' ? selectedProviderInfo?.name : undefined}
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
              {selectedGateway === 'PAYGATE' && selectedProviderInfo && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Provider</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedProviderInfo.name}</span>
                </div>
              )}
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

      {/* PayGate Provider Selection Modal (like CheapStreamTV) */}
      {showProviderModal && (
        <PaygateProviderModal
          selectedProvider={selectedPaygateProvider}
          onSelect={handleProviderSelect}
          onConfirm={handleConfirmProvider}
          onClose={() => setShowProviderModal(false)}
          currentAmount={effectiveAmount}
        />
      )}
    </DashboardShell>
  );
}

/* ==================== COMPONENTS ==================== */

interface GatewayButtonProps {
  gateway: GatewayOption;
  isSelected: boolean;
  onClick: () => void;
  selectedProvider?: string;
}

function GatewayButton({ gateway, isSelected, onClick, selectedProvider }: GatewayButtonProps) {
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
        {/* Show selected provider for PayGate */}
        {gateway.hasProviderSelection && isSelected && selectedProvider && (
          <p style={{ fontSize: '12px', color: gateway.color, marginTop: '4px', fontWeight: 500 }}>
            Provider: {selectedProvider}
          </p>
        )}
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

/* ==================== PAYGATE PROVIDER MODAL ==================== */

interface PaygateProviderModalProps {
  selectedProvider: PaygateProvider;
  onSelect: (provider: PaygateProvider) => void;
  onConfirm: () => void;
  onClose: () => void;
  currentAmount: number;
}

function PaygateProviderModal({ 
  selectedProvider, 
  onSelect, 
  onConfirm, 
  onClose,
  currentAmount 
}: PaygateProviderModalProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid var(--border-default)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Select Payment Provider
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Choose how you want to pay with PayGate
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--bg-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Provider List */}
        <div style={{ padding: '16px 24px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            💳 Card Payments
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {PAYGATE_PROVIDERS.map((provider) => {
              const isDisabled = currentAmount > 0 && currentAmount < provider.minAmount;
              const amountNeeded = provider.minAmount - currentAmount;
              
              return (
                <button
                  key={provider.id}
                  onClick={() => !isDisabled && onSelect(provider.id)}
                  disabled={isDisabled}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: `2px solid ${selectedProvider === provider.id ? '#10B981' : 'var(--border-default)'}`,
                    backgroundColor: selectedProvider === provider.id ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.6 : 1,
                    transition: 'all 150ms ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    backgroundColor: selectedProvider === provider.id ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {provider.recommended ? (
                      <Globe style={{ width: '20px', height: '20px', color: '#10B981' }} />
                    ) : (
                      <CreditCard style={{ width: '20px', height: '20px', color: '#F59E0B' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {provider.name}
                      </span>
                      {provider.recommended && (
                        <span style={{ 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '10px', 
                          fontWeight: 600,
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          color: '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Star style={{ width: '10px', height: '10px' }} />
                          Recommended
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      {provider.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
                        Min: ${provider.minAmount}
                      </span>
                      {isDisabled && amountNeeded > 0 && (
                        <span style={{ fontSize: '11px', color: 'var(--danger)' }}>
                          You need ${amountNeeded.toFixed(2)} more for this provider
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedProvider === provider.id && (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Check style={{ width: '14px', height: '14px', color: 'white' }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px 24px',
          borderTop: '1px solid var(--border-default)'
        }}>
          <Button 
            fullWidth 
            size="lg" 
            onClick={onConfirm}
          >
            <Check style={{ width: '18px', height: '18px', marginRight: '8px' }} />
            Confirm Provider Selection
          </Button>
        </div>
      </div>
    </div>
  );
}
