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
  RefreshCw,
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
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  // Fetch Binance info when dialog opens
  useEffect(() => {
    if (open && amount > 0) {
      fetchBinanceInfo();
      // Reset state when dialog opens
      setOrderId('');
      setVerificationStatus('idle');
      setStatusMessage('');
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

  const handleCheckStatus = async () => {
    try {
      setIsCheckingStatus(true);
      // Re-verify with existing Order ID if available, or just check status
      if (orderId.trim()) {
        const result = await verifyBinancePayment(paymentId, orderId.trim());
        if (result.success && result.status === 'VERIFIED') {
          setVerificationStatus('success');
          setStatusMessage(result.message);
          toast.success('Payment verified!');
          setTimeout(() => {
            onSuccess?.();
            onOpenChange(false);
          }, 2000);
        } else {
          setStatusMessage(result.message);
          toast.info(result.message);
        }
      } else {
        toast.info('Please enter your Order ID first, then verify');
      }
    } catch (error) {
      toast.error('Failed to check status');
    } finally {
      setIsCheckingStatus(false);
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
          <div className="space-y-5">
            {/* Top-up Request Header */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
              <div>
                <p className="text-xs text-muted-foreground">Top-up Request</p>
                <p className="font-mono font-medium text-sm">#{paymentId.slice(-8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="font-bold text-primary">{amount} USDT</p>
              </div>
            </div>

            {/* Binance Pay ID Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Binance Pay ID</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(binanceInfo.payId || '', 'Binance ID')}
                  className="h-8"
                >
                  {copied === 'Binance ID' ? (
                    <>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-success" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy Binance ID
                    </>
                  )}
                </Button>
              </div>
              
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
                <p className="font-mono text-2xl font-bold text-primary tracking-wider">
                  {binanceInfo.payId}
                </p>
              </div>
            </div>

            {/* QR Code (Optional) */}
            {binanceInfo.qrCodeUrl && (
              <div className="flex justify-center">
                <div className="p-2 bg-white rounded-lg border">
                  <img
                    src={binanceInfo.qrCodeUrl}
                    alt="Binance Pay QR Code"
                    className="w-32 h-32"
                  />
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">1.</span> Open Binance and send the amount to the Binance ID above.
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">2.</span> After payment, copy your Binance Order ID from the successful transfer.
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">3.</span> Paste it below and verify to credit your wallet balance.
              </p>
            </div>

            {/* Order ID Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter your Binance Order ID</label>
              <Input
                placeholder="e.g. 1234567890123456"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="font-mono"
                disabled={isVerifying || verificationStatus === 'success'}
              />
            </div>

            {/* Verification Status */}
            {verificationStatus !== 'idle' && (
              <div className={`p-3 rounded-lg flex items-start gap-3 ${
                verificationStatus === 'success' 
                  ? 'bg-success/10 border border-success/30' 
                  : verificationStatus === 'pending'
                  ? 'bg-warning/10 border border-warning/30'
                  : 'bg-destructive/10 border border-destructive/30'
              }`}>
                {verificationStatus === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                ) : verificationStatus === 'pending' ? (
                  <Loader2 className="h-5 w-5 text-warning animate-spin flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
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
                  <p className="text-xs text-muted-foreground">{statusMessage}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCheckStatus}
                disabled={isCheckingStatus || verificationStatus === 'success'}
                className="flex-1"
              >
                {isCheckingStatus ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Check Status
              </Button>
              <Button
                onClick={handleVerify}
                disabled={!orderId.trim() || isVerifying || verificationStatus === 'success'}
                className="flex-1"
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
            </div>

            {/* Help text */}
            <p className="text-xs text-muted-foreground text-center">
              Payment will be credited automatically after verification.
              If pending, our team will verify within 15 minutes.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
