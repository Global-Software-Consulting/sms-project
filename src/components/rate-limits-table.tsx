'use client';
import { useEffect, useState } from 'react';
import { getRateLimits, type RateLimits } from '@/lib/api/rateLimitsApi';

/**
 * Small client island used inside server components (e.g. the
 * /knowledge-base/api guide) to show the per-tier rate limits live
 * from the admin-editable settings.
 */
export function RateLimitsTable() {
  const [limits, setLimits] = useState<RateLimits>({
    basic: '10',
    pro: '100',
    vip: '1000',
  });

  useEffect(() => {
    getRateLimits().then(setLimits).catch(() => {});
  }, []);

  const rows = [
    { label: 'Basic tier', value: limits.basic },
    { label: 'Pro tier', value: limits.pro },
    { label: 'VIP tier', value: limits.vip },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Tier</th>
            <th className="py-2 text-left">Requests per minute</th>
          </tr>
        </thead>
        <tbody className="text-muted-foreground">
          {rows.map((r) => (
            <tr key={r.label} className="border-b last:border-b-0">
              <td className="py-2">{r.label}</td>
              <td className="py-2">
                <code>{r.value} req/min</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
