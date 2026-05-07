'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  Shield,
  Upload,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  BinanceScraperSessionStatus,
  clearBinanceScraperSession,
  getBinanceScraperSession,
  importBinanceScraperSessionFromCurl,
  testBinanceScraperSession,
} from '@/lib/api/adminModulesApi';

export default function BinanceScraperSessionPage() {
  const [status, setStatus] = useState<BinanceScraperSessionStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [curl, setCurl] = useState('');
  const [email, setEmail] = useState('');

  const fetchStatus = useCallback(async () => {
    try {
      const res = await getBinanceScraperSession();
      setStatus(res);
    } catch {
      toast.error('Failed to load session status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  const handleImport = async () => {
    if (!curl.trim()) {
      toast.error('Paste cURL command first');
      return;
    }
    if (!curl.includes('binance.com/bapi')) {
      toast.error(
        'cURL must be from a binance.com/bapi/... request (DevTools → Network)',
      );
      return;
    }
    setImporting(true);
    try {
      const res = await importBinanceScraperSessionFromCurl({
        curl,
        email: email.trim() || undefined,
      });
      if (res.success) {
        toast.success(
          `${res.message} (${res.cookieCount ?? 0} cookies stored)`,
        );
        setCurl('');
        await fetchStatus();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Failed to import session');
    } finally {
      setImporting(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await testBinanceScraperSession();
      if (res.valid) {
        toast.success(`Session valid${res.email ? ` — ${res.email}` : ''}`);
      } else {
        toast.error(res.error ?? 'Session invalid');
      }
      await fetchStatus();
    } catch {
      toast.error('Test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Clear stored session? Cookies will be deleted.')) return;
    setClearing(true);
    try {
      await clearBinanceScraperSession();
      toast.success('Session cleared');
      await fetchStatus();
    } catch {
      toast.error('Failed to clear session');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Binance Scraper Session</h1>
        <p className="text-muted-foreground text-sm">
          Import browser session cookies from a logged-in Binance personal
          account. Backend uses these to call Binance internal endpoints (Phase
          1: validation only — auto-verify and QR coming next).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-4" />
            Session Status
          </CardTitle>
          <CardDescription>
            Current Binance scraper session state
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : !status?.configured ? (
            <p className="text-muted-foreground">
              No session configured. Import cookies below to get started.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Status">
                {status.isValid ? (
                  <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                    <CheckCircle className="mr-1 size-3" /> Valid
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="mr-1 size-3" /> Invalid / not tested
                  </Badge>
                )}
              </Field>
              <Field label="Active">{status.isActive ? 'Yes' : 'No'}</Field>
              <Field label="Binance Email">
                {status.email ?? (
                  <span className="text-muted-foreground">—</span>
                )}
              </Field>
              <Field label="Pay ID">
                {status.payId ?? (
                  <span className="text-muted-foreground">—</span>
                )}
              </Field>
              <Field label="Pay QR Deeplink">
                {status.qrCodeUrl ? (
                  <a
                    href={status.qrCodeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary truncate underline"
                  >
                    {status.qrCodeUrl.replace(/^https?:\/\//, '')}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </Field>
              <Field label="Session Expires">
                {status.expiresAt
                  ? new Date(status.expiresAt).toLocaleString()
                  : 'Unknown'}
              </Field>
              <Field label="Last Tested">
                {status.lastTestedAt
                  ? new Date(status.lastTestedAt).toLocaleString()
                  : 'Never'}
              </Field>
              {status.testError && (
                <div className="border-destructive/30 bg-destructive/5 rounded-md border p-3 text-sm sm:col-span-2">
                  <strong className="text-destructive">Last error:</strong>{' '}
                  {status.testError}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={handleTest}
              disabled={testing || !status?.configured}
              variant="default"
            >
              {testing ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 size-4" />
              )}
              Test Session
            </Button>
            <Button
              onClick={handleClear}
              disabled={clearing || !status?.configured}
              variant="destructive"
            >
              {clearing ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
              Clear Session
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-4" />
            Import Session (paste cURL)
          </CardTitle>
          <CardDescription>
            Single paste — captures everything Binance needs (cookies +
            csrftoken + device-info + fvideo + UA).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="text-muted-foreground list-decimal space-y-1 pl-5 text-xs">
            <li>
              Open{' '}
              <code className="bg-muted px-1">
                www.binance.com/en/my/dashboard
              </code>{' '}
              logged in
            </li>
            <li>
              Press <kbd className="bg-muted rounded px-1">F12</kbd> →{' '}
              <strong>Network</strong> tab → filter <code>bapi</code>
            </li>
            <li>
              Refresh page, find any{' '}
              <code className="bg-muted px-1">/bapi/.../private/...</code> 200
              row
            </li>
            <li>
              Right-click → <strong>Copy</strong> →{' '}
              <strong>Copy as cURL (bash)</strong>
            </li>
            <li>Paste below + click Import Session</li>
          </ol>

          <div className="space-y-1">
            <Label htmlFor="email">
              Binance Email (optional, display only)
            </Label>
            <Input
              id="email"
              placeholder="merchant@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="curl">cURL command from DevTools</Label>
            <Textarea
              id="curl"
              placeholder={`curl 'https://www.binance.com/bapi/accounts/v1/private/account/get-user-base-info' \\\n  -H 'csrftoken: ...' \\\n  -H 'device-info: ...' \\\n  -b 'p20t=...; r20t=...; cr00=...; ...'`}
              value={curl}
              onChange={(e) => setCurl(e.target.value)}
              rows={12}
              className="font-mono text-xs"
            />
            <p className="text-muted-foreground text-xs">
              Cookies, csrftoken, device-info and fingerprint headers are
              extracted automatically.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleImport} disabled={importing}>
              {importing ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Upload className="mr-2 size-4" />
              )}
              Import Session
            </Button>
            <p className="text-muted-foreground text-xs">
              After import, click Test Session to validate.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-base">Security Notice</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <p>
            Cookies are stored AES-256-GCM encrypted. The encryption key (
            <code>BINANCE_SESSION_KEY</code>) must be set in the server env.
          </p>
          <p>
            Calling Binance internal endpoints with personal account cookies may
            violate Binance ToS. Use a dedicated account, monitor for session
            invalidation, and rotate cookies if compromised.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-muted-foreground text-xs tracking-wide uppercase">
        {label}
      </div>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}
