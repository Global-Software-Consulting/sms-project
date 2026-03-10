'use client';
import { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Clock, RefreshCw, X, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function RentNumbers() {
  const [country, setCountry] = useState('');
  const [service, setService] = useState('');
  const [duration, setDuration] = useState('7');
  const [autoRenew, setAutoRenew] = useState(false);

  const activeRentals = [
    {
      id: 1,
      number: '+1 (555) 123-4567',
      country: '🇺🇸 United States',
      service: 'WhatsApp',
      startDate: 'Feb 10, 2026',
      expiresIn: '5d 12h',
      autoRenew: true,
      price: '$15.00',
    },
    {
      id: 2,
      number: '+44 7700 900123',
      country: '🇬🇧 United Kingdom',
      service: 'Telegram',
      startDate: 'Feb 12, 2026',
      expiresIn: '6d 18h',
      autoRenew: false,
      price: '$18.00',
    },
    {
      id: 3,
      number: '+49 151 12345678',
      country: '🇩🇪 Germany',
      service: 'Instagram',
      startDate: 'Feb 8, 2026',
      expiresIn: '3d 6h',
      autoRenew: true,
      price: '$20.00',
    },
  ];

  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    toast.success('Number copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rent Numbers</h1>
        <p className="text-muted-foreground mt-1">
          Rent phone numbers for extended periods
        </p>
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
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">🇺🇸 United States</SelectItem>
                  <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                  <SelectItem value="ca">🇨🇦 Canada</SelectItem>
                  <SelectItem value="de">🇩🇪 Germany</SelectItem>
                  <SelectItem value="fr">🇫🇷 France</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="any">Any Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days - $15</SelectItem>
                  <SelectItem value="14">14 Days - $28</SelectItem>
                  <SelectItem value="30">30 Days - $50</SelectItem>
                  <SelectItem value="90">90 Days - $140</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Availability</Label>
              <div className="bg-muted flex h-10 items-center rounded-lg px-3">
                <Badge variant="secondary">47 numbers</Badge>
              </div>
            </div>
          </div>

          <div className="bg-muted flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center space-x-2">
              <Switch
                id="auto-renew"
                checked={autoRenew}
                onCheckedChange={setAutoRenew}
              />
              <Label htmlFor="auto-renew" className="cursor-pointer">
                Auto-renew subscription
              </Label>
            </div>
            <p className="text-muted-foreground text-sm">
              Automatically renew before expiry
            </p>
          </div>

          <Button size="lg" className="w-full sm:w-auto">
            Rent Number Now
          </Button>
        </CardContent>
      </Card>

      {/* Active Rentals */}
      <Card>
        <CardHeader>
          <CardTitle>Active Rentals</CardTitle>
          <CardDescription>Your currently rented phone numbers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeRentals.map((rental) => (
              <div
                key={rental.id}
                className="border-border bg-card rounded-lg border p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 text-2xl sm:text-3xl">
                      {rental.country.split(' ')[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-mono text-sm font-semibold sm:text-base">
                          {rental.number}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => copyNumber(rental.number)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-muted-foreground flex flex-wrap gap-x-2 gap-y-1 text-xs sm:text-sm">
                        <span>
                          {rental.country.split(' ').slice(1).join(' ')}
                        </span>
                        <span>•</span>
                        <span>{rental.service}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">
                          Started {rental.startDate}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="mr-1 h-3 w-3" />
                          {rental.expiresIn} remaining
                        </Badge>
                        {rental.autoRenew && (
                          <Badge variant="default" className="text-xs">
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Auto-renew ON
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
                    <span className="text-base font-bold sm:text-lg">
                      {rental.price}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                      <Button size="sm">Renew</Button>
                      <Button size="sm" variant="ghost" className="px-2">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rental History */}
      <Card>
        <CardHeader>
          <CardTitle>Rental History</CardTitle>
          <CardDescription>Previously rented numbers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                number: '+1 (555) 987-6543',
                country: '🇺🇸 US',
                service: 'Twitter',
                period: 'Jan 15 - Jan 22',
                status: 'Completed',
              },
              {
                number: '+33 6 12 34 56 78',
                country: '🇫🇷 FR',
                service: 'Facebook',
                period: 'Jan 5 - Jan 12',
                status: 'Completed',
              },
            ].map((rental, i) => (
              <div
                key={i}
                className="border-border flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">
                    {rental.country.split(' ')[0]}
                  </span>
                  <div>
                    <p className="font-mono text-sm">{rental.number}</p>
                    <p className="text-muted-foreground text-xs">
                      {rental.service} • {rental.period}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{rental.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
