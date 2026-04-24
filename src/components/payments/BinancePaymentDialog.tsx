'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Copy,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getBinanceInfo,
  verifyBinancePayment,
  BinancePaymentInfo,
} from '@/lib/api/paymentsApi';

interface BinancePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId: string;
  amount: number;
  onSuccess?: () => void;
}

export function BinancePaymentDialog({
  open,
  onOpenChange,
  paymentId,
  amount,
  onSuccess,
}: BinancePaymentDialogProps) {
  const [binanceInfo, setBinanceInfo] = useState<BinancePaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderId, setOrderId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  // Fetch Binance info when dialog opens
  useEffect(() => {
    if (open && amount > 0) {
      fetchBinanceInfo();
    }
  }, [open, amount]);

  const fetchBinanceInfo = async () => {
    try {
      setIsLoading(true);
      const info = await getBinanceInfo(amount);
      setBinanceInfo(info);
    } catch (error) {
      console.error('Failed to fetch Binance info:', error);
      toast.error('Failed to load Binance payment details');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleVerify = async () => {
    if (!orderId.trim()) {
      toast.error('Please enter your Binance Order ID');
      return;
    }

    if (orderId.length < 6) {
      toast.error('Order ID seems too short. Please check and try again.');
      return;
    }

    try {
      setIsVerifying(true);
      setVerificationStatus('pending');
      
      const result = await verifyBinancePayment(paymentId, orderId.trim());
      
      if (result.success && result.status === 'VERIFIED') {
        setVerificationStatus('success');
        setStatusMessage(result.message);
        toast.success('Payment verified successfully!');
        
        // Call onSuccess callback after a short delay
        setTimeout(() => {
          onSuccess?.();
          onOpenChange(false);
        }, 2000);
      } else if (result.status === 'PENDING') {
        setVerificationStatus('pending');
        setStatusMessage(result.message);
        toast.info(result.message);
      } else {
        setVerificationStatus('error');
        setStatusMessage(result.message);
        toast.error(result.message);
      }
    } catch (error: any) {
      setVerificationStatus('error');
      setStatusMessage(error.response?.data?.message || 'Verification failed. Please try again.');
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🔶</span>
            Binance Internal Transfer
          </DialogTitle>
          <DialogDescription>
            Pay with Binance internal transfer - instant & no fees
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !binanceInfo?.isConfigured ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-destructive">Binance payment is not configured</p>
            <p className="text-muted-foreground text-sm mt-2">
              Please contact support or try another payment method.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Amount to pay */}
            <div className="text-center p-4 bg-primary/10 rounded-xl">
              <p className="text-sm text-muted-foreground">Amount to Pay</p>
              <p className="text-3xl font-bold text-primary">{amount} USDT</p>
            </div>

            {/* Step 1: Pay ID and QR Code */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full">1</Badge>
                <span className="font-medium">Send USDT to this Pay ID</span>
              </div>

              {/* Pay ID */}
              <div className="flex items-center gap-2">
                <Input
                  value={binanceInfo.payId || ''}
                  readOnly
                  className="font-mono text-lg"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(binanceInfo.payId || '', 'Pay ID')}
                >
                  {copied === 'Pay ID' ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* QR Code */}
              {binanceInfo.qrCodeUrl && (
                <div className="flex justify-center">
                  <div className="p-3 bg-white rounded-xl">
                    <img
                      src={binanceInfo.qrCodeUrl}
                      alt="Binance Pay QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Scan with Binance app or enter Pay ID manually
              </p>
            </div>

            {/* Step 2: Enter Order ID */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full">2</Badge>
                <span className="font-medium">Enter your Binance Order ID</span>
              </div>

              <Input
                placeholder="e.g. 1234567890123456"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="font-mono"
                disabled={isVerifying || verificationStatus === 'success'}
              />

              <p className="text-xs text-muted-foreground">
                Find your Order ID in: Binance App → Wallet → Transaction History → Select your transfer
              </p>
            </div>

            {/* Verification Status */}
            {verificationStatus !== 'idle' && (
              <div className={`p-4 rounded-xl flex items-start gap-3 ${
                verificationStatus === 'success' 
                  ? 'bg-success/10 border border-success/30' 
                  : verificationStatus === 'pending'
                  ? 'bg-warning/10 border border-warning/30'
                  : 'bg-destructive/10 border border-destructive/30'
              }`}>
                {verificationStatus === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                ) : verificationStatus === 'pending' ? (
                  <Loader2 className="h-5 w-5 text-warning animate-spin flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${
                    verificationStatus === 'success' 
                      ? 'text-success' 
                      : verificationStatus === 'pending'
                      ? 'text-warning'
                      : 'text-destructive'
                  }`}>
                    {verificationStatus === 'success' 
                      ? 'Payment Verified!' 
                      : verificationStatus === 'pending'
                      ? 'Verification Pending'
                      : 'Verification Failed'}
                  </p>
                  <p className="text-sm text-muted-foreground">{statusMessage}</p>
                </div>
              </div>
            )}

            {/* Verify Button */}
            <Button
              onClick={handleVerify}
              disabled={!orderId.trim() || isVerifying || verificationStatus === 'success'}
              className="w-full"
              size="lg"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : verificationStatus === 'success' ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verified
                </>
              ) : (
                'Verify Payment'
              )}
            </Button>

            {/* Help text */}
            <p className="text-xs text-muted-foreground text-center">
              Payment will be credited automatically after verification.
              <br />
              If you have issues, contact support with your Order ID.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
