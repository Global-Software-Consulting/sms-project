'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Copy, RotateCw, KeyRound, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  listTierApiKeys,
  createTierApiKey,
  regenerateTierApiKey,
  TierSlot,
  ProviderTier,
  ApiKeyCreated,
} from '@/lib/api/apiKeysApi';

const TIER_META: Record<
  ProviderTier,
  { label: string; subtitle: string; gradient: string }
> = {
  V1: {
    label: 'API Key 1 — Basic (V1)',
    subtitle: 'Standard activations, lowest price tier.',
    gradient: 'from-blue-500/10 to-transparent border-blue-500/30',
  },
  V2: {
    label: 'API Key 2 — Standard (V2)',
    subtitle: 'Balanced speed + reliability.',
    gradient: 'from-primary/10 to-transparent border-primary/40',
  },
  V3: {
    label: 'API Key 3 — Premium (V3)',
    subtitle: 'Fastest delivery, highest success rate.',
    gradient: 'from-amber-500/10 to-transparent border-amber-500/30',
  },
};

const TIER_ORDER: ProviderTier[] = ['V1', 'V2', 'V3'];

export default function ApiKeysSection() {
  const [slots, setSlots] = useState<TierSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<ProviderTier | null>(null);
  const [revealed, setRevealed] = useState<{
    version: ProviderTier;
    rawKey: string;
  } | null>(null);
  const [confirmRotate, setConfirmRotate] = useState<ProviderTier | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listTierApiKeys();
      const byTier = new Map(res.map((s) => [s.providerVersion, s]));
      setSlots(
        TIER_ORDER.map(
          (v) => byTier.get(v) ?? { providerVersion: v, key: null },
        ),
      );
    } catch (err: any) {
      toast.error('Could not load API keys', {
        description: err?.response?.data?.message ?? err?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleGenerate = async (version: ProviderTier) => {
    setBusy(version);
    try {
      const created: ApiKeyCreated = await createTierApiKey(version);
      setRevealed({ version, rawKey: created.key });
      await load();
    } catch (err: any) {
      toast.error('Could not generate key', {
        description: err?.response?.data?.message ?? err?.message,
      });
    } finally {
      setBusy(null);
    }
  };

  const handleRegenerate = async (version: ProviderTier) => {
    setBusy(version);
    setConfirmRotate(null);
    try {
      const created: ApiKeyCreated = await regenerateTierApiKey(version);
      setRevealed({ version, rawKey: created.key });
      await load();
      toast.success(`${version} key rotated`);
    } catch (err: any) {
      toast.error('Could not rotate key', {
        description: err?.response?.data?.message ?? err?.message,
      });
    } finally {
      setBusy(null);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          API Keys
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          One key per provider tier. Use these in your scripts or app to call
          the BestSMSHQ API. Rotate a key any time to invalidate the old one.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : (
          slots.map((slot) => {
            const meta = TIER_META[slot.providerVersion];
            const exists = !!slot.key;
            const isBusy = busy === slot.providerVersion;
            return (
              <div
                key={slot.providerVersion}
                className={`bg-gradient-to-br ${meta.gradient} rounded-xl border p-4`}
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{meta.label}</p>
                    <p className="text-muted-foreground text-xs">
                      {meta.subtitle}
                    </p>
                  </div>
                  {exists && (
                    <span className="rounded-full border border-green-500/40 bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
                      Active
                    </span>
                  )}
                </div>

                {exists ? (
                  <>
                    <div className="bg-card/60 mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs">
                      <span className="text-muted-foreground flex-1 truncate">
                        {slot.key!.keyPrefix}
                      </span>
                      <button
                        onClick={() => copy(slot.key!.keyPrefix, 'Prefix')}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy prefix"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="text-muted-foreground text-xs">
                        {slot.key!.lastUsedAt
                          ? `Last used ${new Date(slot.key!.lastUsedAt).toLocaleDateString()}`
                          : 'Never used'}
                        {' · '}
                        {slot.key!.usageCount.toLocaleString()} req
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmRotate(slot.providerVersion)}
                        disabled={isBusy}
                        className="h-8 gap-1 text-xs"
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCw className="h-3.5 w-3.5" />
                        )}
                        Rotate
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleGenerate(slot.providerVersion)}
                    disabled={isBusy}
                    className="mt-2 h-8 gap-1 text-xs"
                  >
                    {isBusy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <KeyRound className="h-3.5 w-3.5" />
                    )}
                    Generate key
                  </Button>
                )}
              </div>
            );
          })
        )}
      </CardContent>

      {/* Reveal modal — shown only once after create/regenerate */}
      <Dialog
        open={revealed !== null}
        onOpenChange={(open) => !open && setRevealed(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              {revealed?.version} key ready
            </DialogTitle>
            <DialogDescription>
              Copy this key and store it securely. It will not be shown again.
              If you lose it, rotate the key to issue a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted flex items-center gap-2 rounded-lg p-3 font-mono text-xs break-all">
            <Input
              value={revealed?.rawKey ?? ''}
              readOnly
              className="border-0 bg-transparent font-mono text-xs"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => copy(revealed!.rawKey, 'API key')}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy key
            </Button>
            <Button onClick={() => setRevealed(null)}>I've saved it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rotate confirmation */}
      <Dialog
        open={confirmRotate !== null}
        onOpenChange={(open) => !open && setConfirmRotate(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rotate {confirmRotate} key?</DialogTitle>
            <DialogDescription>
              The existing key will stop working immediately. Any script or app
              using the old key will need to be updated with the new one.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRotate(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmRotate && handleRegenerate(confirmRotate)}
            >
              Rotate key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
