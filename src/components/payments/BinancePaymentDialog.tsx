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
  /** 'initial' = full instructions + QR (fresh deposit). 'resume' = compact follow-up. */
  mode?: 'initial' | 'resume';
  /** Previously submitted Order ID — prefilled in resume mode. */
  existingOrderId?: string | null;
  onSuccess?: () => void;
}

export function BinancePaymentDialog({
  open,
  onOpenChange,
  paymentId,
  amount,
  mode = 'initial',
  existingOrderId = null,
  onSuccess,
}: BinancePaymentDialogProps) {
  const [binanceInfo, setBinanceInfo] = useState<BinancePaymentInfo | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [orderId, setOrderId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  // Fetch Binance info when dialog opens
  useEffect(() => {
    if (open && amount > 0) {
      fetchBinanceInfo();
      // Prefill Order ID in resume mode if user already submitted one
      setOrderId(existingOrderId ?? '');
      setVerificationStatus(existingOrderId ? 'pending' : 'idle');
      setStatusMessage(
        existingOrderId
          ? 'Order ID submitted. Awaiting admin verification.'
          : '',
      );
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
      setStatusMessage(
        error.response?.data?.message ||
          'Verification failed. Please try again.',
      );
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const isResume = mode === 'resume';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-white/10 px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🔶</span>
            {isResume ? 'Resume Binance Payment' : 'Binance Internal Transfer'}
          </DialogTitle>
          <DialogDescription>
            {isResume
              ? 'Update Order ID or check verification status.'
              : 'Pay with Binance internal transfer - instant & no fees'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : !binanceInfo?.isConfigured ? (
            <div className="py-8 text-center">
              <AlertCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
              <p className="text-destructive">
                Binance payment is not configured
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Please contact support or try another payment method.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Top-up Request Header */}
              <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-muted-foreground text-xs">
                    Top-up Request
                  </p>
                  <p className="font-mono text-sm font-medium">
                    #{paymentId.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">Amount</p>
                  <p className="text-primary font-bold">{amount} USDT</p>
                </div>
              </div>

              {/* Resume mode: compact status banner */}
              {isResume && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-amber-500" />
                    <div className="space-y-1">
                      <p className="font-medium text-amber-500">
                        Awaiting Admin Verification
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Our team typically verifies within 15 minutes. You'll
                        get a notification when your balance is credited. You
                        can update your Order ID below if needed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Binance Pay ID Section (initial mode only — full-prominent display) */}
              {!isResume && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Binance Pay ID</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(binanceInfo.payId || '', 'Binance ID')
                      }
                      className="h-8"
                    >
                      {copied === 'Binance ID' ? (
                        <>
                          <CheckCircle2 className="text-success mr-1.5 h-3.5 w-3.5" />
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

                  <div className="bg-primary/5 border-primary/20 rounded-xl border p-4 text-center">
                    <p className="text-primary font-mono text-2xl font-bold tracking-wider">
                      {binanceInfo.payId}
                    </p>
                  </div>
                </div>
              )}

              {/* QR Code (initial mode only) */}
              {!isResume && binanceInfo.qrCodeUrl && (
                <div className="flex justify-center">
                  <div className="rounded-lg border bg-white p-2">
                    <img
                      src={binanceInfo.qrCodeUrl}
                      alt="Binance Pay QR Code"
                      className="h-32 w-32"
                    />
                  </div>
                </div>
              )}

              {/* Instructions (initial mode only) */}
              {!isResume && (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">1.</span> Open
                    Binance and send the amount to the Binance ID above.
                  </p>
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">2.</span>{' '}
                    After payment, copy your Binance Order ID from the
                    successful transfer.
                  </p>
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">3.</span>{' '}
                    Paste it below and verify to credit your wallet balance.
                  </p>
                </div>
              )}

              {/* Resume mode: compact Pay ID copy */}
              {isResume && (
                <div className="bg-muted/40 flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Binance Pay ID
                    </p>
                    <p className="font-mono text-sm font-medium">
                      {binanceInfo.payId}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(binanceInfo.payId || '', 'Binance ID')
                    }
                    className="h-8"
                  >
                    {copied === 'Binance ID' ? (
                      <CheckCircle2 className="text-success h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              )}

              {/* Order ID Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isResume
                    ? 'Update Binance Order ID (optional)'
                    : 'Enter your Binance Order ID'}
                </label>
                <Input
                  placeholder="e.g. 1234567890123456"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="font-mono"
                  disabled={isVerifying || verificationStatus === 'success'}
                />
                {isResume && (
                  <p className="text-muted-foreground text-xs">
                    Only fill this if you mistyped earlier or have a new Order
                    ID.
                  </p>
                )}
              </div>

              {/* Verification Status — hide initial 'pending' banner in resume mode (top banner covers it) */}
              {verificationStatus !== 'idle' &&
                !(isResume && verificationStatus === 'pending') && (
                  <div
                    className={`flex items-start gap-3 rounded-lg p-3 ${
                      verificationStatus === 'success'
                        ? 'bg-success/10 border-success/30 border'
                        : verificationStatus === 'pending'
                          ? 'bg-warning/10 border-warning/30 border'
                          : 'bg-destructive/10 border-destructive/30 border'
                    }`}
                  >
                    {verificationStatus === 'success' ? (
                      <CheckCircle2 className="text-success h-5 w-5 flex-shrink-0" />
                    ) : verificationStatus === 'pending' ? (
                      <Loader2 className="text-warning h-5 w-5 flex-shrink-0 animate-spin" />
                    ) : (
                      <AlertCircle className="text-destructive h-5 w-5 flex-shrink-0" />
                    )}
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          verificationStatus === 'success'
                            ? 'text-success'
                            : verificationStatus === 'pending'
                              ? 'text-warning'
                              : 'text-destructive'
                        }`}
                      >
                        {verificationStatus === 'success'
                          ? 'Payment Verified!'
                          : verificationStatus === 'pending'
                            ? 'Verification Pending'
                            : 'Verification Failed'}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {statusMessage}
                      </p>
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCheckStatus}
                  disabled={
                    isCheckingStatus || verificationStatus === 'success'
                  }
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
                  disabled={
                    !orderId.trim() ||
                    isVerifying ||
                    verificationStatus === 'success' ||
                    // In resume mode, only enable if Order ID actually changed
                    (isResume &&
                      orderId.trim() === (existingOrderId ?? '').trim())
                  }
                  className="flex-1"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isResume ? 'Updating...' : 'Verifying...'}
                    </>
                  ) : verificationStatus === 'success' ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Verified
                    </>
                  ) : isResume ? (
                    'Update Order ID'
                  ) : (
                    'Verify Payment'
                  )}
                </Button>
              </div>

              {/* Help text */}
              <p className="text-muted-foreground text-center text-xs">
                Payment will be credited automatically after verification. If
                pending, our team will verify within 15 minutes.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
