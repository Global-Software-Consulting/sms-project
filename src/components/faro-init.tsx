'use client';

import { useFaroInit } from '@/hooks/useFaroInit';

/**
 * Mounted in the root layout to bootstrap Grafana Faro RUM when the admin
 * has enabled it. Renders nothing — purely a side-effect host.
 */
export function FaroInit(): null {
  useFaroInit();
  return null;
}
