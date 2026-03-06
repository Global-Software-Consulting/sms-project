"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  getProviders,
  getServices,
  getCountries,
  getProducts,
  activateNumber,
  checkOrderStatus,
  cancelOrder,
  getOrderHistory,
  getFavorites,
  addFavorite,
  removeFavorite,
  rentNumber,
  checkRentalStatus,
  cancelRental,
  getRentalHistory,
  SmsProvider,
  SmsService,
  SmsCountry,
  SmsProduct,
  SmsOrder,
  SmsFavorite,
  SmsRental,
  ProductQueryParams,
  ServiceQueryParams,
  CountryQueryParams,
  OrderQueryParams,
  RentalQueryParams,
  PaginatedResponse,
} from '@/lib/api/smsApi';

// ============================================
// Providers Hook
// ============================================

export function useProviders() {
  const [providers, setProviders] = useState<SmsProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProviders();
      setProviders(response.providers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return { providers, loading, error, refetch: fetchProviders };
}

// ============================================
// Services Hook
// ============================================

export function useServices(params?: ServiceQueryParams) {
  const [services, setServices] = useState<SmsService[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse<SmsService>['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async (queryParams?: ServiceQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getServices(queryParams || params);
      setServices(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, meta, loading, error, refetch: fetchServices };
}

// ============================================
// Countries Hook
// ============================================

export function useCountries(params?: CountryQueryParams) {
  const [countries, setCountries] = useState<SmsCountry[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse<SmsCountry>['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = useCallback(async (queryParams?: CountryQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCountries(queryParams || params);
      setCountries(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch countries');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return { countries, meta, loading, error, refetch: fetchCountries };
}

// ============================================
// Products Hook
// ============================================

export function useProducts(params?: ProductQueryParams) {
  const [products, setProducts] = useState<SmsProduct[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse<SmsProduct>['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (queryParams?: ProductQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProducts(queryParams || params);
      setProducts(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, meta, loading, error, refetch: fetchProducts };
}

// ============================================
// Activation Hook
// ============================================

export function useActivation() {
  const [order, setOrder] = useState<SmsOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activate = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await activateNumber(productId);
      setOrder(response.order);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to activate number';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkStatus = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await checkOrderStatus(orderId);
      setOrder(response.order);
      return response.order;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check status';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await cancelOrder(orderId);
      setOrder(response.order);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel order';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { order, loading, error, activate, checkStatus, cancel, setOrder };
}

// ============================================
// Order History Hook
// ============================================

export function useOrderHistory(params?: OrderQueryParams) {
  const [orders, setOrders] = useState<SmsOrder[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse<SmsOrder>['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (queryParams?: OrderQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrderHistory(queryParams || params);
      setOrders(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, meta, loading, error, refetch: fetchOrders };
}

// ============================================
// Favorites Hook
// ============================================

export function useFavorites() {
  const [favorites, setFavorites] = useState<SmsFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getFavorites();
      setFavorites(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  const add = useCallback(async (serviceId: string, countryId: string, providerId: string) => {
    try {
      const response = await addFavorite(serviceId, countryId, providerId);
      setFavorites(prev => [...prev, response.favorite]);
      return response;
    } catch (err) {
      throw err;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await removeFavorite(id);
      setFavorites(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return { favorites, loading, error, refetch: fetchFavorites, add, remove };
}

// ============================================
// Rental Hook
// ============================================

export function useRental() {
  const [rental, setRental] = useState<SmsRental | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rent = useCallback(async (
    serviceId: string,
    countryId: string,
    duration: 1 | 4 | 12 | 24 | 48 | 72
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await rentNumber(serviceId, countryId, duration);
      setRental(response.rental);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to rent number';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkStatus = useCallback(async (rentalId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await checkRentalStatus(rentalId);
      setRental(response.rental);
      return response.rental;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check rental status';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(async (rentalId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await cancelRental(rentalId);
      setRental(response.order as unknown as SmsRental);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel rental';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { rental, loading, error, rent, checkStatus, cancel, setRental };
}

// ============================================
// Rental History Hook
// ============================================

export function useRentalHistory(params?: RentalQueryParams) {
  const [rentals, setRentals] = useState<SmsRental[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse<SmsRental>['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRentals = useCallback(async (queryParams?: RentalQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRentalHistory(queryParams || params);
      setRentals(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rentals');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  return { rentals, meta, loading, error, refetch: fetchRentals };
}

