import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

export interface RateLimits {
  basic: string;
  pro: string;
  vip: string;
}

const DEFAULTS: RateLimits = { basic: '10', pro: '100', vip: '1000' };

/**
 * Public — returns the per-minute rate limit configured per tier. Used on
 * the /api landing page, /knowledge-base/api guide, and /dashboard/api.
 */
export async function getRateLimits(): Promise<RateLimits> {
  try {
    const res = await apiClient.get<Partial<RateLimits>>(
      API_ENDPOINTS.PUBLIC.RATE_LIMITS,
    );
    return {
      basic: res.data?.basic || DEFAULTS.basic,
      pro: res.data?.pro || DEFAULTS.pro,
      vip: res.data?.vip || DEFAULTS.vip,
    };
  } catch {
    return DEFAULTS;
  }
}
