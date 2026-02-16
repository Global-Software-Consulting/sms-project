'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Key, 
  Plus, 
  Copy, 
  Check,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Clock,
  Activity,
  ArrowLeft,
  X,
  Shield,
  Code,
  ExternalLink
} from 'lucide-react';
import { Button, Alert, Input } from '@/components/ui';
import { DashboardShell } from '@/components/layout';
import { 
  getApiKeys,
  createApiKey,
  revokeApiKey,
  formatKeyPrefix,
  getLastUsedText,
  formatUsageCount,
  copyToClipboard,
  MAX_API_KEYS,
  type ApiKey,
  type ApiKeyCreated
} from '@/lib/api';

/**
 * API Keys Management Page
 * 
 * Features:
 * - List all API keys (max 5)
 * - Create new key with one-time display
 * - Revoke existing keys
 * - View usage statistics
 */
export default function ApiKeysPage() {
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({ total: 0, limit: MAX_API_KEYS });

  // Create key modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<ApiKeyCreated | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  // Revoke modal
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);

  // Fetch API keys on mount
  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getApiKeys();
      setApiKeys(response.data);
      setMeta(response.meta);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a name for your API key');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      const key = await createApiKey({ name: newKeyName.trim() });
      setCreatedKey(key);
      setNewKeyName('');
      // Refresh list
      await fetchApiKeys();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyKey = async () => {
    if (createdKey?.key) {
      const success = await copyToClipboard(createdKey.key);
      if (success) {
        setKeyCopied(true);
        setTimeout(() => setKeyCopied(false), 2000);
      }
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreatedKey(null);
    setNewKeyName('');
    setKeyCopied(false);
  };

  const handleRevokeKey = async () => {
    if (!keyToRevoke) return;

    try {
      setRevoking(true);
      setError(null);
      await revokeApiKey(keyToRevoke.id, revokeReason || undefined);
      setShowRevokeModal(false);
      setKeyToRevoke(null);
      setRevokeReason('');
      // Refresh list
      await fetchApiKeys();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to revoke API key');
    } finally {
      setRevoking(false);
    }
  };

  const openRevokeModal = (key: ApiKey) => {
    setKeyToRevoke(key);
    setShowRevokeModal(true);
  };

  const canCreateMore = meta.total < meta.limit;

  return (
    <DashboardShell>
      {/* Back Link */}
      <Link 
        href="/settings" 
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
        Back to Settings
      </Link>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            API Keys
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage your API keys for programmatic access. Maximum {MAX_API_KEYS} keys allowed.
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          disabled={!canCreateMore}
        >
          <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          Create New Key
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ marginBottom: '24px' }}>
          <Alert variant="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      {/* Usage Info */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '16px', 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border-default)', 
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '10px', 
          backgroundColor: 'rgba(198, 167, 94, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Key style={{ width: '20px', height: '20px', color: 'var(--accent-gold)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
            {meta.total} of {meta.limit} API keys used
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {canCreateMore ? `You can create ${meta.limit - meta.total} more key${meta.limit - meta.total !== 1 ? 's' : ''}` : 'Maximum limit reached'}
          </p>
        </div>
        <div style={{ 
          width: '100px', 
          height: '8px', 
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${(meta.total / meta.limit) * 100}%`, 
            height: '100%', 
            backgroundColor: meta.total >= meta.limit ? 'var(--warning)' : 'var(--accent-gold)',
            borderRadius: '4px',
            transition: 'width 300ms ease'
          }} />
        </div>
      </div>

      {/* API Keys List */}
      {loading ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '64px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '16px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid var(--accent-gold)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading API keys...</p>
          </div>
        </div>
      ) : apiKeys.length === 0 ? (
        <div style={{ 
          padding: '64px 24px', 
          backgroundColor: 'var(--bg-card)', 
          border: '1px dashed var(--border-default)', 
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            margin: '0 auto 16px', 
            borderRadius: '16px', 
            backgroundColor: 'rgba(198, 167, 94, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Key style={{ width: '32px', height: '32px', color: 'var(--accent-gold)' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            No API Keys Yet
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
            Create your first API key to start making programmatic requests to our API.
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Create Your First Key
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {apiKeys.map((key) => (
            <ApiKeyCard 
              key={key.id} 
              apiKey={key} 
              onRevoke={() => openRevokeModal(key)} 
            />
          ))}
        </div>
      )}

      {/* Documentation Link */}
      <div style={{ 
        marginTop: '32px', 
        padding: '20px', 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border-default)', 
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '12px', 
          backgroundColor: 'rgba(59, 130, 246, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Code style={{ width: '24px', height: '24px', color: 'var(--info)' }} />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            API Documentation
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Learn how to authenticate and use our API with your keys.
          </p>
        </div>
        <Link href="/docs/api" style={{ textDecoration: 'none' }}>
          <Button variant="outline">
            View Docs
            <ExternalLink style={{ width: '14px', height: '14px', marginLeft: '8px' }} />
          </Button>
        </Link>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(4px)', 
          zIndex: 100, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '24px' 
        }}>
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderRadius: '16px', 
            padding: '24px', 
            maxWidth: '500px', 
            width: '100%' 
          }}>
            {!createdKey ? (
              <>
                {/* Create Form */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Create API Key</h3>
                  <button onClick={handleCloseCreateModal} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
                  </button>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Give your API key a descriptive name to help you identify it later.
                </p>

                <Input
                  label="Key Name"
                  placeholder="e.g., Production Server, Development, My App"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  leftIcon={<Key style={{ width: '18px', height: '18px' }} />}
                  maxLength={50}
                />

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <Button variant="outline" fullWidth onClick={handleCloseCreateModal}>
                    Cancel
                  </Button>
                  <Button fullWidth onClick={handleCreateKey} isLoading={creating} disabled={!newKeyName.trim()}>
                    Create Key
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Key Created - Show Full Key */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    margin: '0 auto 16px', 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Check style={{ width: '32px', height: '32px', color: 'var(--success)' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    API Key Created!
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Your new API key &quot;{createdKey.name}&quot; has been created.
                  </p>
                </div>

                {/* Warning */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px', 
                  padding: '16px', 
                  backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                  borderRadius: '12px', 
                  marginBottom: '20px' 
                }}>
                  <AlertTriangle style={{ width: '20px', height: '20px', color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--warning)', marginBottom: '4px' }}>
                      Save this key now!
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      This is the only time you&apos;ll see the full key. Store it securely - we cannot show it again.
                    </p>
                  </div>
                </div>

                {/* Key Display */}
                <div style={{ 
                  position: 'relative',
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '12px',
                  marginBottom: '24px'
                }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Your API Key</p>
                  <code style={{ 
                    display: 'block',
                    fontSize: '14px', 
                    color: 'var(--text-primary)', 
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    paddingRight: '40px'
                  }}>
                    {createdKey.key}
                  </code>
                  <button
                    onClick={handleCopyKey}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: keyCopied ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease'
                    }}
                  >
                    {keyCopied ? (
                      <Check style={{ width: '16px', height: '16px', color: 'var(--success)' }} />
                    ) : (
                      <Copy style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                    )}
                  </button>
                </div>

                <Button fullWidth onClick={handleCloseCreateModal}>
                  Done
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Revoke Key Modal */}
      {showRevokeModal && keyToRevoke && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(4px)', 
          zIndex: 100, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '24px' 
        }}>
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderRadius: '16px', 
            padding: '24px', 
            maxWidth: '400px', 
            width: '100%' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--danger)' }}>Revoke API Key</h3>
              <button onClick={() => setShowRevokeModal(false)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px', 
              padding: '16px', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '12px', 
              marginBottom: '20px' 
            }}>
              <AlertTriangle style={{ width: '20px', height: '20px', color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                This will permanently revoke the key &quot;<strong>{keyToRevoke.name}</strong>&quot;. 
                Any applications using this key will stop working immediately.
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Reason (optional)
              </label>
              <input
                type="text"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g., Key compromised, No longer needed"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 16px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" fullWidth onClick={() => setShowRevokeModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" fullWidth onClick={handleRevokeKey} isLoading={revoking}>
                Revoke Key
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

/* ==================== COMPONENTS ==================== */

interface ApiKeyCardProps {
  apiKey: ApiKey;
  onRevoke: () => void;
}

function ApiKeyCard({ apiKey, onRevoke }: ApiKeyCardProps) {
  const [showPrefix, setShowPrefix] = useState(false);

  return (
    <div style={{ 
      backgroundColor: 'var(--bg-card)', 
      border: '1px solid var(--border-default)', 
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      {/* Icon */}
      <div style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '12px', 
        backgroundColor: apiKey.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Key style={{ width: '24px', height: '24px', color: apiKey.isActive ? 'var(--success)' : 'var(--text-muted)' }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {apiKey.name}
          </h3>
          {!apiKey.isActive && (
            <span style={{ 
              padding: '2px 8px', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--danger)', 
              fontSize: '11px', 
              fontWeight: 600, 
              borderRadius: '4px' 
            }}>
              REVOKED
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <code style={{ 
            fontSize: '13px', 
            color: 'var(--text-muted)', 
            fontFamily: 'monospace',
            backgroundColor: 'var(--bg-secondary)',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            {showPrefix ? apiKey.keyPrefix : '••••••••••••'}...
          </code>
          <button
            onClick={() => setShowPrefix(!showPrefix)}
            style={{ padding: '4px', borderRadius: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {showPrefix ? (
              <EyeOff style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
            ) : (
              <Eye style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
            <Activity style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatUsageCount(apiKey.usageCount)}
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Requests</p>
        </div>
        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
            <Clock style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {getLastUsedText(apiKey.lastUsedAt)}
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Last Used</p>
        </div>
      </div>

      {/* Actions */}
      {apiKey.isActive && (
        <Button variant="outline" size="sm" onClick={onRevoke}>
          <Trash2 style={{ width: '14px', height: '14px', marginRight: '6px' }} />
          Revoke
        </Button>
      )}
    </div>
  );
}

