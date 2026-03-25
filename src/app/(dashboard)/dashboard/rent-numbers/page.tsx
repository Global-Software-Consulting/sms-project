'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Clock,
  RefreshCw,
  X,
  Copy,
  Loader2,
  AlertCircle,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getProviders,
  getServices,
  getCountries,
  rentNumber,
  getRentalHistory,
  checkRentalStatus,
  cancelRental,
  SmsProvider,
  SmsService,
  SmsCountry,
  SmsRental,
  getRentalStatusLabel,
  getRentalStatusColor,
  getCountryFlag,
  canCancelRental,
  formatDuration,
  RENTAL_DURATIONS,
} from '@/lib/api/smsApi';
import { getWalletBalance, formatBalance } from '@/lib/api/walletApi';

export default function RentNumbers() {
  // Data state
  const [providers, setProviders] = useState<SmsProvider[]>([]);
  const [services, setServices] = useState<SmsService[]>([]);
  const [countries, setCountries] = useState<SmsCountry[]>([]);
  const [activeRentals, setActiveRentals] = useState<SmsRental[]>([]);
  const [rentalHistory, setRentalHistory] = useState<SmsRental[]>([]);
  const [walletBalance, setWalletBalance] = useState<string>('0');

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRenting, setIsRenting] = useState(false);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  // Form state
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('4');

  // Messages dialog
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [selectedRental, setSelectedRental] = useState<SmsRental | null>(null);

  // Fetch initial data - optimized to load essential data first
  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load providers and balance first
      const [providersRes, balanceRes] =
        await Promise.allSettled([
          getProviders(),
          getWalletBalance(),
        ]);

      let rentalProviderId = '';
      if (providersRes.status === 'fulfilled') {
        const rentalProviders = providersRes.value.providers?.filter(
          p => p.isActive && p.supportsRental
        ) || [];
        setProviders(rentalProviders);
        if (rentalProviders.length > 0) {
          rentalProviderId = rentalProviders[0].id;
          setSelectedProvider(rentalProviderId);
        }
      }

      if (balanceRes.status === 'fulfilled') {
        setWalletBalance(balanceRes.value.balance);
      }

      // Load services and countries for the rental provider specifically
      if (rentalProviderId) {
        const [servicesRes, countriesRes] = await Promise.allSettled([
          getServices({ providerId: rentalProviderId, limit: 200 }),
          getCountries({ providerId: rentalProviderId, limit: 300 }),
        ]);

        if (servicesRes.status === 'fulfilled') {
          setServices(servicesRes.value.data || []);
        }
        if (countriesRes.status === 'fulfilled') {
          setCountries(countriesRes.value.data || []);
        }
      }

      // Load rental history in background
      Promise.allSettled([
        getRentalHistory({ status: 'ACTIVE', limit: 50 }),
        getRentalHistory({ limit: 20 }),
      ]).then(([activeRes, historyRes]) => {
        if (activeRes.status === 'fulfilled') {
          setActiveRentals((activeRes.value.data || []).filter(r => r.status === 'ACTIVE'));
        }
        if (historyRes.status === 'fulfilled') {
          setRentalHistory(
            (historyRes.value.data || []).filter(r => r.status !== 'ACTIVE')
          );
        }
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Poll active rentals for messages
  useEffect(() => {
    if (activeRentals.length === 0) return;

    const pollInterval = setInterval(async () => {
      for (const rental of activeRentals) {
        try {
          const response = await checkRentalStatus(rental.id);
          setActiveRentals(prev =>
            prev.map(r => (r.id === rental.id ? response.rental : r))
          );

          // Check for new messages
          if (response.rental.messages.length > rental.messages.length) {
            const newMessages = response.rental.messages.slice(rental.messages.length);
            newMessages.forEach(msg => {
              toast.success('New SMS received!', {
                description: msg.text.slice(0, 50) + (msg.text.length > 50 ? '...' : ''),
              });
            });
          }
        } catch (err) {
          console.error('Failed to check rental status:', err);
        }
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [activeRentals]);

  // Handle rent number
  const handleRentNumber = async () => {
    if (!selectedService || !selectedCountry || !selectedDuration) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsRenting(true);
      const duration = parseInt(selectedDuration) as 1 | 4 | 12 | 24 | 48 | 72;
      const response = await rentNumber(selectedService, selectedCountry, duration);

      setActiveRentals(prev => [response.rental, ...prev]);
      setWalletBalance(prev =>
        (parseFloat(prev) - parseFloat(response.rental.finalCost)).toFixed(2)
      );

      toast.success('Number rented successfully!', {
        description: `${response.rental.phoneNumber} - ${formatDuration(duration)}`,
      });

      // Reset form
      setSelectedService('');
      setSelectedCountry('');
    } catch (err: any) {
      console.error('Rent error:', err);
      toast.error('Failed to rent number', {
        description: err.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsRenting(false);
    }
  };

  // Handle cancel rental
  const handleCancelRental = async (rentalId: string) => {
    try {
      setIsCancelling(rentalId);
      const response = await cancelRental(rentalId);

      setActiveRentals(prev => prev.filter(r => r.id !== rentalId));
      setRentalHistory(prev => [response.order, ...prev]);
      setWalletBalance(prev =>
        (parseFloat(prev) + parseFloat(response.refundAmount)).toFixed(2)
      );

      toast.success('Rental cancelled', {
        description: `Refunded: $${parseFloat(response.refundAmount).toFixed(2)}`,
      });
    } catch (err: any) {
      toast.error('Failed to cancel rental', {
        description: err.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsCancelling(null);
    }
  };

  // Copy to clipboard
  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    toast.success('Number copied to clipboard!');
  };

  // Format time remaining
  const formatTimeRemaining = (expiresAt: string): string => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffMs = expires.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;

    if (diffDays > 0) {
      return `${diffDays}d ${remainingHours}h`;
    }
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  // View messages
  const viewMessages = (rental: SmsRental) => {
    setSelectedRental(rental);
    setShowMessagesDialog(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading rentals...</p>
        </div>
      </div>
    );
  }

  // No rental providers available
  if (providers.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Rent Numbers</h1>
          <p className="text-muted-foreground mt-1">
            Rent phone numbers for extended periods
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">
              Number rental is not available at the moment.
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Please check back later or use SMS activation instead.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rent Numbers</h1>
          <p className="text-muted-foreground mt-1">
            Rent phone numbers for extended periods
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Balance: {formatBalance(walletBalance, 'USD')}
        </Badge>
      </div>

      {/* Rent New Number */}
      <Card>
        <CardHeader>
          <CardTitle>Rent a New Number</CardTitle>
          <CardDescription>
            Select your preferences to rent a phone number
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Provider */}
            {providers.length > 1 && (
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select
                  value={selectedProvider}
                  onValueChange={setSelectedProvider}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map(provider => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Service */}
            <div className="space-y-2">
              <Label>Service</Label>
              <Select
                value={selectedService}
                onValueChange={setSelectedService}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label>Country</Label>
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.id} value={country.id}>
                      <span className="flex items-center gap-2">
                        <span>{getCountryFlag(country.code)}</span>
                        <span>{country.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select
                value={selectedDuration}
                onValueChange={setSelectedDuration}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RENTAL_DURATIONS.map(duration => (
                    <SelectItem
                      key={duration.value}
                      value={duration.value.toString()}
                    >
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleRentNumber}
            disabled={isRenting || !selectedService || !selectedCountry}
          >
            {isRenting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Renting...
              </>
            ) : (
              'Rent Number Now'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Active Rentals */}
      <Card>
        <CardHeader>
          <CardTitle>Active Rentals ({activeRentals.length})</CardTitle>
          <CardDescription>Your currently rented phone numbers</CardDescription>
        </CardHeader>
        <CardContent>
          {activeRentals.length === 0 ? (
            <div className="py-12 text-center">
              <Phone className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">No active rentals</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Rent a number above to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeRentals.map(rental => (
                <div
                  key={rental.id}
                  className="border-border bg-card rounded-lg border p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 text-2xl sm:text-3xl">
                        📱
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-mono text-sm font-semibold sm:text-base">
                            {rental.phoneNumber || 'Pending...'}
                          </h3>
                          {rental.phoneNumber && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0"
                              onClick={() => copyNumber(rental.phoneNumber!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <div className="text-muted-foreground flex flex-wrap gap-x-2 gap-y-1 text-xs sm:text-sm">
                          <span>{rental.provider?.displayName}</span>
                          <span>•</span>
                          <span>{formatDuration(rental.rentalDuration)}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatTimeRemaining(rental.expiresAt)} remaining
                          </Badge>
                          {rental.messages.length > 0 && (
                            <Badge variant="default" className="text-xs">
                              <MessageSquare className="mr-1 h-3 w-3" />
                              {rental.messages.length} messages
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
                      <span className="text-base font-bold sm:text-lg">
                        ${parseFloat(rental.finalCost).toFixed(2)}
                      </span>
                      <div className="flex gap-2">
                        {rental.messages.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewMessages(rental)}
                          >
                            Messages
                          </Button>
                        )}
                        {canCancelRental(rental.status) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleCancelRental(rental.id)}
                            disabled={isCancelling === rental.id}
                          >
                            {isCancelling === rental.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rental History */}
      {rentalHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rental History</CardTitle>
            <CardDescription>Previously rented numbers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rentalHistory.map(rental => (
                <div
                  key={rental.id}
                  className="border-border flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📱</span>
                    <div>
                      <p className="font-mono text-sm">
                        {rental.phoneNumber || 'N/A'}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {rental.provider?.displayName} •{' '}
                        {formatDuration(rental.rentalDuration)} •{' '}
                        {rental.messages.length} messages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      ${parseFloat(rental.finalCost).toFixed(2)}
                    </span>
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${getRentalStatusColor(rental.status)} 15%, transparent)`,
                        color: getRentalStatusColor(rental.status),
                      }}
                    >
                      {getRentalStatusLabel(rental.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages Dialog */}
      <Dialog open={showMessagesDialog} onOpenChange={setShowMessagesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Messages</DialogTitle>
            <DialogDescription>
              {selectedRental?.phoneNumber} •{' '}
              {selectedRental?.messages.length || 0} messages received
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] space-y-3 overflow-y-auto">
            {selectedRental?.messages.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No messages received yet
              </p>
            ) : (
              selectedRental?.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className="bg-muted/50 border-border rounded-lg border p-3"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      From: {msg.sender}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(msg.receivedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{msg.text}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(msg.text);
                      toast.success('Message copied!');
                    }}
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copy
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
