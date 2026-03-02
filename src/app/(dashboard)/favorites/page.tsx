'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Trash2,
  Smartphone,
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui';
import { DashboardShell } from '@/components/layout';
import { useAuth } from '@/hooks';
import {
  getFavorites,
  removeFavorite,
  SmsFavorite,
  getCountryFlag,
  getProviderBadge,
} from '@/lib/api';

export default function FavoritesPage() {
  const { user } = useAuth();
  
  const [favorites, setFavorites] = useState<SmsFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const res = await getFavorites({ limit: 100 });
      setFavorites(res.data);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await removeFavorite(id);
      setFavorites(favorites.filter(f => f.id !== id));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    } finally {
      setRemovingId(null);
    }
  };

  // Group favorites by provider
  const groupedFavorites = favorites.reduce((acc, fav) => {
    const providerSlug = fav.provider.slug;
    if (!acc[providerSlug]) {
      acc[providerSlug] = {
        provider: fav.provider,
        items: []
      };
    }
    acc[providerSlug].items.push(fav);
    return acc;
  }, {} as Record<string, { provider: SmsFavorite['provider']; items: SmsFavorite[] }>);

  if (!user) return null;

  return (
    <DashboardShell>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Favorites
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Quick access to your favorite service and country combinations
            </p>
          </div>
          <Link href="/activate">
            <Button>
              <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Add Favorites
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : favorites.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {Object.entries(groupedFavorites).map(([slug, group]) => {
            const badge = getProviderBadge(slug);
            return (
              <div key={slug}>
                {/* Provider Header */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  marginBottom: '16px' 
                }}>
                  <span style={{ fontSize: '24px' }}>{badge.icon}</span>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {group.provider.displayName}
                  </h2>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: badge.color,
                    color: '#000'
                  }}>
                    {badge.label}
                  </span>
                  <span style={{ 
                    marginLeft: 'auto',
                    fontSize: '14px', 
                    color: 'var(--text-muted)' 
                  }}>
                    {group.items.length} favorite{group.items.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Favorites Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                  gap: '16px' 
                }}>
                  {group.items.map((fav) => (
                    <FavoriteCard
                      key={fav.id}
                      favorite={fav}
                      onRemove={() => handleRemove(fav.id)}
                      isRemoving={removingId === fav.id}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function LoadingState() {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
      gap: '16px' 
    }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ 
      padding: '80px 24px', 
      textAlign: 'center',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '20px',
      border: '1px dashed var(--border-default)'
    }}>
      <div style={{ 
        width: '80px', 
        height: '80px', 
        margin: '0 auto 24px', 
        borderRadius: '20px', 
        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Heart style={{ width: '40px', height: '40px', color: 'var(--danger)' }} />
      </div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
        No Favorites Yet
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
        Add your frequently used service and country combinations to favorites for quick access. 
        Click the heart icon on any product to add it here.
      </p>
      <Link href="/activate">
        <Button size="lg">
          <Smartphone style={{ width: '18px', height: '18px', marginRight: '8px' }} />
          Browse Services
        </Button>
      </Link>
    </div>
  );
}

interface FavoriteCardProps {
  favorite: SmsFavorite;
  onRemove: () => void;
  isRemoving: boolean;
}

function FavoriteCard({ favorite, onRemove, isRemoving }: FavoriteCardProps) {
  const badge = getProviderBadge(favorite.provider.slug);

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: '16px',
      padding: '20px',
      transition: 'all 200ms ease',
      position: 'relative'
    }} className="card-lift">
      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onRemove();
        }}
        disabled={isRemoving}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '8px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 150ms ease'
        }}
      >
        {isRemoving ? (
          <Loader2 style={{ width: '16px', height: '16px', color: 'var(--danger)', animation: 'spin 1s linear infinite' }} />
        ) : (
          <Trash2 style={{ width: '16px', height: '16px', color: 'var(--danger)' }} />
        )}
      </button>

      {/* Content */}
      <Link href={`/activate?service=${favorite.service.id}&country=${favorite.country.id}&provider=${favorite.provider.id}`} style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          {favorite.service.iconUrl ? (
            <img 
              src={favorite.service.iconUrl} 
              alt={favorite.service.name}
              style={{ width: '44px', height: '44px', borderRadius: '12px' }}
            />
          ) : (
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '12px', 
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              📱
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {favorite.service.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>{getCountryFlag(favorite.country.code)}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{favorite.country.name}</span>
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '12px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>{badge.icon}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{favorite.provider.displayName}</span>
          </div>
          <span style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: badge.color,
            color: '#000'
          }}>
            {badge.label}
          </span>
        </div>

        <div style={{ 
          marginTop: '16px', 
          textAlign: 'center' 
        }}>
          <Button variant="outline" size="sm" style={{ width: '100%' }}>
            Get Number
          </Button>
        </div>
      </Link>
    </div>
  );
}

