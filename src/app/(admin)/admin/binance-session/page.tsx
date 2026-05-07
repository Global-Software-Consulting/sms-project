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
  BinanceSessionTry,
  clearBinanceScraperSession,
  getBinanceScraperSession,
  getBinanceSessionTries,
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

  const [logs, setLogs] = useState<BinanceSessionTry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [auditFilter, setAuditFilter] = useState<
    'all' | 'verified' | 'failed' | 'pending'
  >('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

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

  const fetchLogs = useCallback(async () => {
    try {
      const res = await getBinanceSessionTries();
      setLogs(res.data);
    } catch {
      // silent — supplementary widget
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
    void fetchLogs();
  }, [fetchStatus, fetchLogs]);

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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">All Session Tries</CardTitle>
              <CardDescription>
                Every Binance Pay verification attempt — auto + manual
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'verified', label: 'Success' },
                  { id: 'failed', label: 'Failed' },
                  { id: 'pending', label: 'Pending' },
                ] as const
              ).map((f) => {
                const count =
                  f.id === 'all'
                    ? logs.length
                    : logs.filter((l) => l.status === f.id.toUpperCase())
                        .length;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setAuditFilter(f.id);
                      setPage(1);
                    }}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      auditFilter === f.id
                        ? 'bg-amber-500 text-black'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70'
                    }`}
                  >
                    {f.label}
                    <span className="ml-1.5 opacity-70">{count}</span>
                  </button>
                );
              })}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setLogsLoading(true);
                  void fetchLogs();
                }}
                disabled={logsLoading}
              >
                {logsLoading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <RefreshCw className="size-3" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground border-b text-xs uppercase">
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-left font-medium">Action</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Order ID</th>
                  <th className="px-4 py-2 text-right font-medium">Amount</th>
                  <th className="px-4 py-2 text-left font-medium">User</th>
                  <th className="px-4 py-2 text-left font-medium">
                    Verdict / Note
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs
                  .filter((log) =>
                    auditFilter === 'all'
                      ? true
                      : log.status === auditFilter.toUpperCase(),
                  )
                  .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                  .map((log) => {
                    const actionVariant:
                      | 'default'
                      | 'secondary'
                      | 'destructive'
                      | 'outline' = log.action.includes('VERIFY')
                      ? 'default'
                      : log.action.includes('REJECT')
                        ? 'destructive'
                        : 'secondary';
                    const statusVariant:
                      | 'default'
                      | 'secondary'
                      | 'destructive'
                      | 'outline' =
                      log.status === 'VERIFIED'
                        ? 'default'
                        : log.status === 'FAILED'
                          ? 'destructive'
                          : log.status === 'PENDING'
                            ? 'secondary'
                            : 'outline';
                    const verdictColor = log.scraperVerdict
                      ? log.scraperVerdict === 'FOUND'
                        ? 'text-green-500'
                        : log.scraperVerdict === 'NOT_FOUND' ||
                            log.scraperVerdict === 'WRONG_TYPE'
                          ? 'text-red-500'
                          : 'text-amber-500'
                      : 'text-muted-foreground';
                    return (
                      <tr key={log.id} className="hover:bg-muted/30">
                        <td className="text-muted-foreground px-4 py-2 text-xs whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant={actionVariant} className="text-xs">
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          {log.status && (
                            <Badge variant={statusVariant} className="text-xs">
                              {log.status}
                            </Badge>
                          )}
                        </td>
                        <td className="max-w-[180px] truncate px-4 py-2 font-mono text-xs">
                          {log.orderId || '—'}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {log.amount
                            ? `${log.currency || ''} ${Number(log.amount).toFixed(2)}`
                            : '—'}
                        </td>
                        <td className="px-4 py-2 text-xs">
                          {log.user?.email || 'System'}
                        </td>
                        <td className="max-w-xs px-4 py-2">
                          {log.scraperVerdict ? (
                            <div className="space-y-0.5">
                              <span
                                className={`font-mono text-xs font-medium ${verdictColor}`}
                              >
                                {log.scraperVerdict}
                              </span>
                              {log.errorMessage && (
                                <p className="text-muted-foreground truncate text-xs">
                                  {log.errorMessage.replace(
                                    /^\[.+?\]\s*Scraper:\s*[A-Z_]+\s*[—-]?\s*/,
                                    '',
                                  )}
                                </p>
                              )}
                            </div>
                          ) : log.errorMessage ? (
                            <p className="text-muted-foreground truncate text-xs">
                              {log.errorMessage}
                            </p>
                          ) : log.txHash ? (
                            <p className="truncate font-mono text-xs text-green-500">
                              tx: {log.txHash.slice(0, 24)}…
                            </p>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                          {log.attempts !== undefined && log.attempts > 1 && (
                            <p className="text-muted-foreground mt-0.5 text-[10px]">
                              Attempts: {log.attempts}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                {!logsLoading &&
                  logs.filter((log) =>
                    auditFilter === 'all'
                      ? true
                      : log.status === auditFilter.toUpperCase(),
                  ).length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-muted-foreground py-12 text-center text-sm"
                      >
                        No {auditFilter === 'all' ? '' : auditFilter} session
                        tries
                      </td>
                    </tr>
                  )}
                {logsLoading && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Loader2 className="text-muted-foreground mx-auto size-5 animate-spin" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {(() => {
            const filtered = logs.filter((log) =>
              auditFilter === 'all'
                ? true
                : log.status === auditFilter.toUpperCase(),
            );
            const totalPages = Math.max(
              1,
              Math.ceil(filtered.length / PAGE_SIZE),
            );
            const safePage = Math.min(page, totalPages);
            if (filtered.length === 0) return null;
            const start = (safePage - 1) * PAGE_SIZE + 1;
            const end = Math.min(safePage * PAGE_SIZE, filtered.length);
            return (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-muted-foreground text-xs">
                  Showing <span className="font-medium">{start}</span>–
                  <span className="font-medium">{end}</span> of{' '}
                  <span className="font-medium">{filtered.length}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    Page {safePage} / {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            );
          })()}
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
