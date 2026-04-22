'use client';

import { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';

export default function MaintenancePage() {
  const [message, setMessage] = useState<string>(
    "We're currently performing scheduled maintenance. Please check back shortly.",
  );
  const [endTime, setEndTime] = useState<string>('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiClient
      .get(API_ENDPOINTS.PUBLIC.MAINTENANCE)
      .then((res) => {
        const d = (res.data || {}) as Record<string, unknown>;
        const nested = (d.data as Record<string, unknown>) || {};
        const msg =
          (d.maintenanceMessage as string) ||
          (d.message as string) ||
          (nested.maintenanceMessage as string) ||
          '';
        const end =
          (d.maintenanceEndTime as string) ||
          (d.endTime as string) ||
          (nested.maintenanceEndTime as string) ||
          '';
        const modeOn =
          d.maintenanceMode === true ||
          d.maintenanceMode === 'true' ||
          d.enabled === true ||
          nested.maintenanceMode === true;

        if (msg) setMessage(msg);
        if (end) setEndTime(end);
        // If maintenance is OFF, go back home
        if (!modeOn) {
          window.location.href = '/';
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center">
          <Wrench className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-white text-3xl md:text-4xl font-bold mb-4">
          We&apos;ll be right back
        </h1>
        <p className="text-[#94A3B8] text-base md:text-lg mb-6 leading-relaxed whitespace-pre-line">
          {loaded ? message : 'Loading...'}
        </p>
        {endTime && (
          <p className="text-[#64748B] text-sm mb-6">
            Expected to be back: <span className="text-white">{endTime}</span>
          </p>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors"
        >
          Check again
        </button>
      </div>
    </div>
  );
}
