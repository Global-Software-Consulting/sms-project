'use client';

import { useState } from "react";
import { AdminGlassCard } from "@/components/admin/glass-card";
import { toast } from "sonner";

export default function AdminUrlTrackingPage() {
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [redirectBase, setRedirectBase] = useState("https://");
  const [pixelId, setPixelId] = useState("");
  const [gaTrackingId, setGaTrackingId] = useState("");

  const handleSave = () => {
    toast.success("URL tracking settings saved successfully");
  };

  const handleReset = () => {
    setUtmSource("");
    setUtmMedium("");
    setUtmCampaign("");
    setRedirectBase("https://");
    setPixelId("");
    setGaTrackingId("");
    toast.info("URL tracking settings reset to defaults");
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-3xl font-semibold mb-2">URL Tracking</h1>
        <p className="text-[#94A3B8]">
          Configure URL tracking, UTM parameters, and analytics integrations for your platform.
        </p>
      </div>

      <div className="space-y-6">
        {/* General Tracking Toggle */}
        <AdminGlassCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white text-xl font-semibold mb-1">Tracking Status</h3>
              <p className="text-[#94A3B8] text-sm">Enable or disable URL tracking globally</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={trackingEnabled}
                onChange={(e) => setTrackingEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[rgba(255,255,255,0.1)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
              <span className="ml-3 text-sm font-medium text-[#94A3B8]">
                {trackingEnabled ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Redirect Base URL
            </label>
            <input
              type="text"
              value={redirectBase}
              onChange={(e) => setRedirectBase(e.target.value)}
              placeholder="https://yourdomain.com"
              className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
            <p className="text-[#64748B] text-xs mt-1">
              Base URL used for generating tracked short links.
            </p>
          </div>
        </AdminGlassCard>

        {/* UTM Parameters */}
        <AdminGlassCard>
          <h3 className="text-white text-xl font-semibold mb-2">UTM Parameters</h3>
          <p className="text-[#94A3B8] text-sm mb-6">
            Set default UTM parameters appended to outbound tracked links.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                UTM Source
              </label>
              <input
                type="text"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                placeholder="e.g. google"
                className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                UTM Medium
              </label>
              <input
                type="text"
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                placeholder="e.g. cpc"
                className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                UTM Campaign
              </label>
              <input
                type="text"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                placeholder="e.g. spring_sale"
                className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>
          </div>
        </AdminGlassCard>

        {/* Analytics Integrations */}
        <AdminGlassCard>
          <h3 className="text-white text-xl font-semibold mb-2">Analytics Integrations</h3>
          <p className="text-[#94A3B8] text-sm mb-6">
            Connect third-party analytics and pixel tracking services.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Google Analytics Tracking ID
              </label>
              <input
                type="text"
                value={gaTrackingId}
                onChange={(e) => setGaTrackingId(e.target.value)}
                placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Meta (Facebook) Pixel ID
              </label>
              <input
                type="text"
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
                placeholder="Enter your Pixel ID"
                className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>
          </div>
        </AdminGlassCard>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
