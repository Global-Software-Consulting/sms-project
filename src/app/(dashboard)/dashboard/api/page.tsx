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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Code,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createApiKey,
  getApiKeys,
  getApiKey,
  updateApiKey,
  revokeApiKey,
  getApiKeyUsage,
  ApiKey,
  ApiKeyCreated,
  ApiKeyPermissions,
  ApiKeyUsage,
  formatKeyPrefix,
  getLastUsedText,
  formatUsageCount,
  copyToClipboard as copyKey,
} from '@/lib/api/apiKeysApi';
import { getProviders, type SmsProvider } from '@/lib/api/smsApi';

type ProviderType = 'v1' | 'v2' | 'v3';

const DEFAULT_PERMISSIONS: ApiKeyPermissions = {
  canActivate: true, // maps to canOrder
  canRent: false, // maps to canManage
  canViewBalance: true, // maps to canWallet
  canViewHistory: true, // maps to canRead
};

export default function APIAccess() {
  // Data state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [keyUsage, setKeyUsage] = useState<ApiKeyUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [activeTab, setActiveTab] = useState<ProviderType>('v1');
  const [availableTiers, setAvailableTiers] = useState<ProviderType[]>([
    'v1',
    'v2',
    'v3',
  ]);

  useEffect(() => {
    getProviders()
      .then((res) => {
        const active = (res?.providers || []).filter(
          (p: SmsProvider) => p.isActive !== false,
        );
        const tiers: ProviderType[] = (
          ['v1', 'v2', 'v3'] as ProviderType[]
        ).filter((t) =>
          active.some((p) => (p.version || '').toLowerCase().startsWith(t)),
        );
        if (tiers.length > 0) {
          setAvailableTiers(tiers);
          if (!tiers.includes(activeTab)) setActiveTab(tiers[0]);
        }
      })
      .catch(() => {
        /* keep defaults */
      });
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [showKeyValues, setShowKeyValues] = useState<Record<string, boolean>>(
    {},
  );

  // Create key dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] =
    useState<ApiKeyPermissions>(DEFAULT_PERMISSIONS);
  const [isCreating, setIsCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<ApiKeyCreated | null>(null);

  // Revoke dialog
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Fetch API keys
  const fetchApiKeys = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getApiKeys({ limit: 50 });
      setApiKeys(response.data);
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
      toast.error('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch key usage
  const fetchKeyUsage = useCallback(async (keyId: string) => {
    try {
      const response = await getApiKeyUsage(keyId);
      setKeyUsage(response);
    } catch (err) {
      console.error('Failed to fetch key usage:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  // Fetch usage when key is selected
  useEffect(() => {
    if (selectedKey) {
      fetchKeyUsage(selectedKey.id);
    }
  }, [selectedKey, fetchKeyUsage]);

  // Handle create key
  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    try {
      setIsCreating(true);
      // Map frontend permissions to backend field names
      const response = await createApiKey({
        name: newKeyName,
        canOrder: newKeyPermissions.canActivate,
        canManage: newKeyPermissions.canRent,
        canWallet: newKeyPermissions.canViewBalance,
        canRead: newKeyPermissions.canViewHistory,
      });
      setCreatedKey(response);
      setApiKeys((prev) => [response.apiKey, ...prev]);
      toast.success('API key created!', {
        description:
          "Make sure to copy your key now. You won't be able to see it again.",
      });
    } catch (err: any) {
      console.error('Create key error:', err);
      toast.error('Failed to create API key', {
        description: err.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle revoke key
  const handleRevokeKey = async () => {
    if (!keyToRevoke) return;

    try {
      setIsRevoking(true);
      await revokeApiKey(keyToRevoke.id);
      setApiKeys((prev) =>
        prev.map((k) =>
          k.id === keyToRevoke.id ? { ...k, status: 'REVOKED' as const } : k,
        ),
      );
      toast.success('API key revoked');
      setShowRevokeDialog(false);
      setKeyToRevoke(null);
    } catch (err: any) {
      console.error('Revoke key error:', err);
      toast.error('Failed to revoke API key', {
        description: err.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsRevoking(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async (text: string, label: string = 'Copied') => {
    const success = await copyKey(text);
    if (success) {
      toast.success(`${label} to clipboard!`);
    } else {
      toast.error('Failed to copy');
    }
  };

  // Toggle key visibility
  const toggleKeyVisibility = (keyId: string) => {
    setShowKeyValues((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  // Reset create dialog
  const resetCreateDialog = () => {
    setShowCreateDialog(false);
    setNewKeyName('');
    setNewKeyPermissions(DEFAULT_PERMISSIONS);
    setCreatedKey(null);
  };

  // Provider info
  const providerInfo = {
    v1: {
      name: 'V1 - Basic',
      icon: '💰',
      description: 'Cost-effective API access with basic performance',
      features: ['Standard rate limits', 'Basic support', '99%+ uptime SLA'],
      endpoint: 'https://api.bestsmshq.com/api/v1',
    },
    v2: {
      name: 'V2 - Standard',
      icon: '💎',
      description: 'Enhanced API access with priority routing',
      features: [
        'Higher rate limits',
        'Priority support',
        '99.9%+ uptime SLA',
        'Faster response times',
      ],
      endpoint: 'https://api.bestsmshq.com/api/v1',
    },
    v3: {
      name: 'V3 - Premium',
      icon: '👑',
      description: 'Premium API access with maximum priority',
      features: [
        'Unlimited rate limits',
        'Dedicated support',
        '99.99%+ uptime SLA',
        'Guaranteed instant delivery',
      ],
      endpoint: 'https://api.bestsmshq.com/api/v1',
    },
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading API keys...</p>
        </div>
      </div>
    );
  }

  const info = providerInfo[activeTab];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">API Access</h1>
          <p className="text-muted-foreground mt-1">
            Integrate SMS services into your applications
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </div>

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Manage your API keys for programmatic access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="py-12 text-center">
              <Key className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">No API keys yet</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Create an API key to get started with the API
              </p>
              <Button
                className="mt-4"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="border-border bg-card rounded-lg border p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-semibold">{key.name}</h4>
                        <Badge
                          variant={
                            key.status === 'ACTIVE' ? 'default' : 'destructive'
                          }
                        >
                          {key.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted rounded px-2 py-1 font-mono text-sm">
                          {formatKeyPrefix(key.keyPrefix)}
                        </code>
                        <span className="text-muted-foreground text-xs">
                          {getLastUsedText(key.lastUsedAt)}
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-2 flex flex-wrap gap-2 text-xs">
                        {key.permissions.canActivate && (
                          <Badge variant="outline" className="text-xs">
                            Activate
                          </Badge>
                        )}
                        {key.permissions.canRent && (
                          <Badge variant="outline" className="text-xs">
                            Rent
                          </Badge>
                        )}
                        {key.permissions.canViewBalance && (
                          <Badge variant="outline" className="text-xs">
                            Balance
                          </Badge>
                        )}
                        {key.permissions.canViewHistory && (
                          <Badge variant="outline" className="text-xs">
                            History
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        {formatUsageCount(key.usageCount)} requests
                      </span>
                      {key.status === 'ACTIVE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setKeyToRevoke(key);
                            setShowRevokeDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider Tabs */}
      <Card>
        <CardContent className="px-3 pt-6 sm:px-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ProviderType)}
          >
            <TabsList
              className="grid w-full sm:max-w-2xl"
              style={{
                gridTemplateColumns: `repeat(${availableTiers.length}, minmax(0, 1fr))`,
              }}
            >
              {availableTiers.includes('v1') && (
                <TabsTrigger
                  value="v1"
                  className="space-x-1 text-xs sm:space-x-2 sm:text-sm"
                >
                  <span>💰</span>
                  <span className="hidden sm:inline">V1 Basic</span>
                  <span className="sm:hidden">Basic</span>
                </TabsTrigger>
              )}
              {availableTiers.includes('v2') && (
                <TabsTrigger
                  value="v2"
                  className="space-x-1 text-xs sm:space-x-2 sm:text-sm"
                >
                  <span>💎</span>
                  <span className="hidden sm:inline">V2 Standard</span>
                  <span className="sm:hidden">Standard</span>
                </TabsTrigger>
              )}
              {availableTiers.includes('v3') && (
                <TabsTrigger
                  value="v3"
                  className="space-x-1 text-xs sm:space-x-2 sm:text-sm"
                >
                  <span>👑</span>
                  <span className="hidden sm:inline">V3 Premium</span>
                  <span className="sm:hidden">Premium</span>
                </TabsTrigger>
              )}
            </TabsList>

            {availableTiers.map((provider) => (
              <TabsContent key={provider} value={provider} className="mt-6">
                <div className="space-y-6">
                  {/* Provider Info */}
                  <div className="bg-muted/50 border-border rounded-lg border p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-3xl">
                        {providerInfo[provider].icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-1 font-semibold">
                          {providerInfo[provider].name} API
                        </h4>
                        <p className="text-muted-foreground mb-3 text-sm">
                          {providerInfo[provider].description}
                        </p>
                        <ul className="space-y-1">
                          {providerInfo[provider].features.map((feature, i) => (
                            <li
                              key={i}
                              className="text-muted-foreground flex items-center text-sm"
                            >
                              <span className="text-success mr-2">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Endpoint */}
                  <Card>
                    <CardHeader className="px-3 sm:px-6">
                      <CardTitle>API Endpoint</CardTitle>
                      <CardDescription>
                        Base URL for {providerInfo[provider].name} API requests
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6">
                      <div className="flex items-center gap-2">
                        <Input
                          value={providerInfo[provider].endpoint}
                          readOnly
                          className="bg-muted/50 font-mono"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-icon !min-h-0 shrink-0 !p-0"
                          onClick={() =>
                            handleCopy(
                              providerInfo[provider].endpoint,
                              'Endpoint copied',
                            )
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="bg-warning/10 border-warning/20 mt-4 flex items-start space-x-2 rounded-lg border p-4">
                        <AlertCircle className="text-warning mt-0.5 h-4 w-4 shrink-0" />
                        <p className="text-warning-foreground text-sm">
                          <strong>Security Warning:</strong> Keep your API key
                          secure. Don't share it publicly or commit it to
                          version control.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Start */}
                  <Card>
                    <CardHeader className="px-3 sm:px-6">
                      <CardTitle>Quick Start Guide</CardTitle>
                      <CardDescription>
                        Get started with the {providerInfo[provider].name} API
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-3 sm:px-6">
                      <div>
                        <h4 className="mb-2 font-semibold">
                          1. Get Available Services
                        </h4>
                        <div className="relative">
                          <pre className="bg-muted rounded-lg p-4 pr-12 text-xs break-all whitespace-pre-wrap sm:overflow-x-auto sm:text-sm sm:break-normal sm:whitespace-pre">
                            <code>{`curl -X GET "${providerInfo[provider].endpoint}/services" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
                          </pre>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-icon absolute top-2 right-2 h-8 !min-h-0 w-8 !p-0"
                            onClick={() =>
                              handleCopy(
                                `curl -X GET "${providerInfo[provider].endpoint}/services" -H "Authorization: Bearer YOUR_API_KEY"`,
                                'Command copied',
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 font-semibold">
                          2. Order SMS Activation
                        </h4>
                        <div className="relative">
                          <pre className="bg-muted rounded-lg p-4 pr-12 text-xs break-all whitespace-pre-wrap sm:overflow-x-auto sm:text-sm sm:break-normal sm:whitespace-pre">
                            <code>{`curl -X POST "${providerInfo[provider].endpoint}/activations" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"service": "whatsapp", "country": "us", "provider": "${provider}"}'`}</code>
                          </pre>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-icon absolute top-2 right-2 h-8 !min-h-0 w-8 !p-0"
                            onClick={() =>
                              handleCopy(
                                `curl -X POST "${providerInfo[provider].endpoint}/activations" -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d '{"service": "whatsapp", "country": "us", "provider": "${provider}"}'`,
                                'Command copied',
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 font-semibold">
                          3. Check SMS Status
                        </h4>
                        <div className="relative">
                          <pre className="bg-muted rounded-lg p-4 pr-12 text-xs break-all whitespace-pre-wrap sm:overflow-x-auto sm:text-sm sm:break-normal sm:whitespace-pre">
                            <code>{`curl -X GET "${providerInfo[provider].endpoint}/activations/{id}" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
                          </pre>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-icon absolute top-2 right-2 h-8 !min-h-0 w-8 !p-0"
                            onClick={() =>
                              handleCopy(
                                `curl -X GET "${providerInfo[provider].endpoint}/activations/{id}" -H "Authorization: Bearer YOUR_API_KEY"`,
                                'Command copied',
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 font-semibold">
                          4. Cancel Activation
                        </h4>
                        <div className="relative">
                          <pre className="bg-muted rounded-lg p-4 pr-12 text-xs break-all whitespace-pre-wrap sm:overflow-x-auto sm:text-sm sm:break-normal sm:whitespace-pre">
                            <code>{`curl -X DELETE "${providerInfo[provider].endpoint}/activations/{id}" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
                          </pre>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-icon absolute top-2 right-2 h-8 !min-h-0 w-8 !p-0"
                            onClick={() =>
                              handleCopy(
                                `curl -X DELETE "${providerInfo[provider].endpoint}/activations/{id}" -H "Authorization: Bearer YOUR_API_KEY"`,
                                'Command copied',
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Documentation Link */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center md:text-left">
              <h3 className="mb-1 font-semibold">Need more details?</h3>
              <p className="text-muted-foreground text-sm">
                Check out our complete API documentation for detailed endpoints,
                parameters, and examples
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <a
                href="/knowledge-base/api"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Code className="mr-2 h-4 w-4" />
                View Full Documentation
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={resetCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {createdKey ? 'API Key Created!' : 'Create API Key'}
            </DialogTitle>
            <DialogDescription>
              {createdKey
                ? "Make sure to copy your API key now. You won't be able to see it again!"
                : 'Create a new API key for programmatic access'}
            </DialogDescription>
          </DialogHeader>

          {createdKey ? (
            <div className="space-y-4">
              <div className="bg-success/10 border-success/20 rounded-lg border p-4">
                <Label className="text-success mb-2 block text-sm font-medium">
                  Your API Key
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={createdKey.key}
                    readOnly
                    className="bg-background font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(createdKey.key, 'API key copied')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-warning/10 border-warning/20 flex items-start space-x-2 rounded-lg border p-4">
                <AlertCircle className="text-warning mt-0.5 h-4 w-4 shrink-0" />
                <p className="text-warning-foreground text-sm">
                  This is the only time you'll see this key. Store it securely!
                </p>
              </div>
              <Button className="w-full" onClick={resetCreateDialog}>
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Key Name</Label>
                <Input
                  placeholder="e.g., Production API Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canActivate"
                      checked={newKeyPermissions.canActivate}
                      onCheckedChange={(checked) =>
                        setNewKeyPermissions((prev) => ({
                          ...prev,
                          canActivate: !!checked,
                        }))
                      }
                    />
                    <label htmlFor="canActivate" className="text-sm">
                      SMS Activation
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canRent"
                      checked={newKeyPermissions.canRent}
                      onCheckedChange={(checked) =>
                        setNewKeyPermissions((prev) => ({
                          ...prev,
                          canRent: !!checked,
                        }))
                      }
                    />
                    <label htmlFor="canRent" className="text-sm">
                      Number Rental
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canViewBalance"
                      checked={newKeyPermissions.canViewBalance}
                      onCheckedChange={(checked) =>
                        setNewKeyPermissions((prev) => ({
                          ...prev,
                          canViewBalance: !!checked,
                        }))
                      }
                    />
                    <label htmlFor="canViewBalance" className="text-sm">
                      View Balance
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canViewHistory"
                      checked={newKeyPermissions.canViewHistory}
                      onCheckedChange={(checked) =>
                        setNewKeyPermissions((prev) => ({
                          ...prev,
                          canViewHistory: !!checked,
                        }))
                      }
                    />
                    <label htmlFor="canViewHistory" className="text-sm">
                      View History
                    </label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetCreateDialog}>
                  Cancel
                </Button>
                <Button onClick={handleCreateKey} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Key'
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke Key Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke the API key "{keyToRevoke?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRevokeDialog(false);
                setKeyToRevoke(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeKey}
              disabled={isRevoking}
            >
              {isRevoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                'Revoke Key'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
