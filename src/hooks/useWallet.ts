"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  getWallet,
  getWalletBalance,
  getTransactions,
  Wallet,
  WalletBalance,
  WalletTransaction,
  TransactionQueryParams,
  TransactionListResponse,
} from '@/lib/api/walletApi';

// ============================================
// Wallet Hook
// ============================================

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWallet();
      setWallet(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return { wallet, loading, error, refetch: fetchWallet };
}

// ============================================
// Wallet Balance Hook (Lightweight)
// ============================================

export function useWalletBalance() {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWalletBalance();
      setBalance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, error, refetch: fetchBalance };
}

// ============================================
// Transactions Hook
// ============================================

export function useTransactions(params?: TransactionQueryParams) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [meta, setMeta] = useState<TransactionListResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (queryParams?: TransactionQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTransactions(queryParams || params);
      setTransactions(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, meta, loading, error, refetch: fetchTransactions };
}

