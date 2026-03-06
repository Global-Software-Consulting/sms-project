"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  getPlans,
  getCurrentMembership,
  subscribeToPlan,
  upgradePlan,
  cancelSubscription,
  MembershipPlan,
  CurrentMembershipResponse,
  PlanSlug,
} from '@/lib/api/membershipApi';

// ============================================
// Plans Hook
// ============================================

export function usePlans() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlans();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return { plans, loading, error, refetch: fetchPlans };
}

// ============================================
// Current Membership Hook
// ============================================

export function useCurrentMembership() {
  const [membership, setMembership] = useState<CurrentMembershipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembership = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentMembership();
      setMembership(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch membership');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  return { membership, loading, error, refetch: fetchMembership };
}

// ============================================
// Subscription Actions Hook
// ============================================

export function useSubscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(async (planSlug: PlanSlug) => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscribeToPlan(planSlug);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to subscribe';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const upgrade = useCallback(async (planSlug: PlanSlug) => {
    try {
      setLoading(true);
      setError(null);
      const response = await upgradePlan(planSlug);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upgrade';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(async (reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await cancelSubscription(reason);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel subscription';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, subscribe, upgrade, cancel };
}

