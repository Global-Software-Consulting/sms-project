'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Smartphone,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Loader2,
  ChevronDown,
  Home,
  Server,
  Activity,
  Users,
  LogOut,
  Edit2,
  Power,
  PowerOff,
  Globe
} from 'lucide-react';
import { Button, Alert, Badge } from '@/components/ui';
import { useAuth } from '@/hooks';
import {
  adminGetServices,
  adminUpdateService,
  adminBulkDisableServices,
  adminGetCountries,
  adminUpdateCountry,
  SmsService,
  SmsCountry,
  SERVICE_CATEGORIES,
} from '@/lib/api';

type TabType = 'services' | 'countries';

export default function AdminServicesPage() {
  const { user, logout } = useAuth();
  
  // Data states
  const [services, setServices] = useState<SmsService[]>([]);
  const [countries, setCountries] = useState<SmsCountry[]>([]);
  const [totalServices, setTotalServices] = useState(0);
  const [totalCountries, setTotalCountries] = useState(0);
  
  // Filter states
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; category: string; iconUrl: string }>({ name: '', category: '', iconUrl: '' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDisabling, setIsBulkDisabling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab, searchQuery, categoryFilter, activeFilter, currentPage]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'services') {
        const res = await adminGetServices({
          search: searchQuery || undefined,
          category: categoryFilter || undefined,
          isActive: activeFilter,
          page: currentPage,
          limit: 50,
        });
        setServices(res.data);
        setTotalServices(res.meta.total);
      } else {
        const res = await adminGetCountries({
          search: searchQuery || undefined,
          isActive: activeFilter,
          page: currentPage,
          limit: 50,
        });
        setCountries(res.data);
        setTotalCountries(res.meta.total);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleService = async (service: SmsService) => {
    try {
      await adminUpdateService(service.id, { isActive: !service.isActive });
      setServices(services.map(s => 
        s.id === service.id ? { ...s, isActive: !s.isActive } : s
      ));
      setSuccess(`${service.name} ${service.isActive ? 'disabled' : 'enabled'}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update service');
    }
  };

  const handleToggleCountry = async (country: SmsCountry) => {
    try {
      await adminUpdateCountry(country.id, { isActive: !country.isActive });
      setCountries(countries.map(c => 
        c.id === country.id ? { ...c, isActive: !c.isActive } : c
      ));
      setSuccess(`${country.name} ${country.isActive ? 'disabled' : 'enabled'}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update country');
    }
  };

  const handleStartEditService = (service: SmsService) => {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      category: service.category || '',
      iconUrl: service.iconUrl || '',
    });
  };

  const handleSaveService = async (serviceId: string) => {
    try {
      await adminUpdateService(serviceId, editForm);
      setServices(services.map(s => 
        s.id === serviceId ? { ...s, ...editForm } : s
      ));
      setEditingId(null);
      setSuccess('Service updated');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update service');
    }
  };

  const handleBulkDisable = async () => {
    if (selectedIds.length === 0) return;
    
    setIsBulkDisabling(true);
    try {
      await adminBulkDisableServices(selectedIds);
      setServices(services.map(s => 
        selectedIds.includes(s.id) ? { ...s, isActive: false } : s
      ));
      setSelectedIds([]);
      setSuccess(`${selectedIds.length} services disabled`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disable services');
    } finally {
      setIsBulkDisabling(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === services.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(services.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const totalPages = Math.ceil((activeTab === 'services' ? totalServices : totalCountries) / 50);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border-default)',
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  background: 'linear-gradient(135deg, var(--accent-gold) 0%, #D4AF37 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--bg-primary)' }}>S</span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  SMS<span style={{ color: 'var(--accent-gold)' }}>Pro</span>
                </span>
              </Link>
              
              <nav style={{ display: 'flex', gap: '8px' }} className="hidden sm:!flex">
                <NavLink href="/admin" icon={Home} label="Home" />
                <NavLink href="/admin/providers" icon={Server} label="Providers" />
                <NavLink href="/admin/services" icon={Smartphone} label="Services" active />
                <NavLink href="/admin/sms-orders" icon={Activity} label="Orders" />
                <NavLink href="/admin/users" icon={Users} label="Users" />
              </nav>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button variant="secondary" onClick={loadData} size="sm">
                <RefreshCw style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                Refresh
              </Button>
              
              {/* User Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-gold) 0%, #D4AF37 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--bg-primary)' }}>
                      {user?.firstName?.[0] || 'A'}
                    </span>
                  </div>
                  <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                </button>

                {showUserMenu && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowUserMenu(false)} />
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      width: '200px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                      overflow: 'hidden',
                      zIndex: 50
                    }}>
                      <div style={{ padding: '8px' }}>
                        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-secondary)' }}>
                          <Home style={{ width: '16px', height: '16px' }} />
                          <span style={{ fontSize: '14px' }}>User Dashboard</span>
                        </Link>
                      </div>
                      <div style={{ padding: '8px', borderTop: '1px solid var(--border-default)' }}>
                        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontSize: '14px' }}>
                          <LogOut style={{ width: '16px', height: '16px' }} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Services & Countries
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Manage SMS services and countries, edit names, icons, and availability
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 24px' }}>
        {/* Alerts */}
        {error && (
          <div style={{ marginBottom: '24px' }}>
            <Alert variant="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}
        {success && (
          <div style={{ marginBottom: '24px' }}>
            <Alert variant="success" dismissible onDismiss={() => setSuccess(null)}>
              {success}
            </Alert>
          </div>
        )}

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          padding: '4px', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-default)',
          marginBottom: '24px',
          width: 'fit-content'
        }}>
          <button
            onClick={() => { setActiveTab('services'); setCurrentPage(1); setSelectedIds([]); }}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'services' ? 'rgba(198, 167, 94, 0.15)' : 'transparent',
              color: activeTab === 'services' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Smartphone style={{ width: '16px', height: '16px' }} />
            Services ({totalServices})
          </button>
          <button
            onClick={() => { setActiveTab('countries'); setCurrentPage(1); setSelectedIds([]); }}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'countries' ? 'rgba(198, 167, 94, 0.15)' : 'transparent',
              color: activeTab === 'countries' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Globe style={{ width: '16px', height: '16px' }} />
            Countries ({totalCountries})
          </button>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '12px', 
          marginBottom: '24px',
          alignItems: 'center'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
            <Search style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              width: '16px', 
              height: '16px', 
              color: 'var(--text-muted)' 
            }} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Category Filter (services only) */}
          {activeTab === 'services' && (
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              style={{
                padding: '10px 16px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="">All Categories</option>
              {SERVICE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          )}

          {/* Active Filter */}
          <select
            value={activeFilter === undefined ? '' : activeFilter.toString()}
            onChange={(e) => { 
              setActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true'); 
              setCurrentPage(1); 
            }}
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="">All Status</option>
            <option value="true">Active Only</option>
            <option value="false">Disabled Only</option>
          </select>

          {/* Bulk Actions */}
          {activeTab === 'services' && selectedIds.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleBulkDisable}
              disabled={isBulkDisabling}
            >
              {isBulkDisabling ? (
                <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite', marginRight: '6px' }} />
              ) : (
                <PowerOff style={{ width: '14px', height: '14px', marginRight: '6px', color: 'var(--danger)' }} />
              )}
              Disable {selectedIds.length} Selected
            </Button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="skeleton" style={{ height: '64px', borderRadius: '12px' }} />
            ))}
          </div>
        ) : activeTab === 'services' ? (
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {/* Table Header */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '40px 1fr 150px 150px 120px 100px',
              gap: '16px',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <div>
                <input
                  type="checkbox"
                  checked={selectedIds.length === services.length && services.length > 0}
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Service
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Category
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Provider
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Status
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Actions
              </div>
            </div>

            {/* Table Body */}
            {services.map((service) => (
              <div 
                key={service.id}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '40px 1fr 150px 150px 120px 100px',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border-default)',
                  alignItems: 'center',
                  opacity: service.isActive ? 1 : 0.6
                }}
              >
                <div>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(service.id)}
                    onChange={() => toggleSelect(service.id)}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {service.iconUrl ? (
                    <img src={service.iconUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Smartphone style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                    </div>
                  )}
                  <div>
                    <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {service.name}
                      {(service as any).isPopular && (
                        <span style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '10px', backgroundColor: 'rgba(198, 167, 94, 0.2)', color: 'var(--accent-gold)', borderRadius: '4px', fontWeight: 600 }}>
                          POPULAR
                        </span>
                      )}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(service as any).rawName || service.slug}</p>
                  </div>
                </div>
                <div>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '6px', 
                    fontSize: '12px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)'
                  }}>
                    {service.category || 'Uncategorized'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {service.provider?.displayName || '—'}
                </div>
                <div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: service.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: service.isActive ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {service.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => handleStartEditService(service)}
                    style={{
                      padding: '6px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit2 style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                  </button>
                  <button
                    onClick={() => handleToggleService(service)}
                    style={{
                      padding: '6px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {service.isActive ? (
                      <PowerOff style={{ width: '14px', height: '14px', color: 'var(--danger)' }} />
                    ) : (
                      <Power style={{ width: '14px', height: '14px', color: 'var(--success)' }} />
                    )}
                  </button>
                </div>
              </div>
            ))}

            {services.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>No services found</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {/* Countries Table Header */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 100px 150px 120px 100px',
              gap: '16px',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Country
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Code
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Provider
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Status
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Actions
              </div>
            </div>

            {/* Countries Table Body */}
            {countries.map((country) => (
              <div 
                key={country.id}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 100px 150px 120px 100px',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border-default)',
                  alignItems: 'center',
                  opacity: country.isActive ? 1 : 0.6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {country.iconUrl ? (
                    <img src={country.iconUrl} alt="" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                  ) : (
                    <span style={{ fontSize: '20px' }}>🌍</span>
                  )}
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{country.name}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {country.code}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {country.provider?.displayName || '—'}
                </div>
                <div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: country.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: country.isActive ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {country.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => handleToggleCountry(country)}
                    style={{
                      padding: '6px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {country.isActive ? (
                      <PowerOff style={{ width: '14px', height: '14px', color: 'var(--danger)' }} />
                    ) : (
                      <Power style={{ width: '14px', height: '14px', color: 'var(--success)' }} />
                    )}
                  </button>
                </div>
              </div>
            ))}

            {countries.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>No countries found</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: '8px',
            marginTop: '24px'
          }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span style={{ 
              padding: '8px 16px', 
              color: 'var(--text-secondary)',
              fontSize: '14px'
            }}>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 50 }}
            onClick={() => setEditingId(null)}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: '480px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '20px',
            padding: '24px',
            zIndex: 51
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              Edit Service
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              >
                <option value="">Uncategorized</option>
                {SERVICE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Icon URL
              </label>
              <input
                type="text"
                value={editForm.iconUrl}
                onChange={(e) => setEditForm({ ...editForm, iconUrl: e.target.value })}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleSaveService(editingId)}>
                <Check style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                Save Changes
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  active?: boolean;
}

function NavLink({ href, icon: Icon, label, active }: NavLinkProps) {
  return (
    <Link 
      href={href} 
      style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        borderRadius: '8px',
        textDecoration: 'none',
        backgroundColor: active ? 'rgba(198, 167, 94, 0.1)' : 'transparent',
        color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
        fontSize: '13px',
        fontWeight: 500,
        transition: 'all 0.15s'
      }}
    >
      <Icon style={{ width: '16px', height: '16px' }} />
      {label}
    </Link>
  );
}

