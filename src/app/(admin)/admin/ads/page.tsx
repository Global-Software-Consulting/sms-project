'use client';

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Edit2, Trash2, ExternalLink, Plus, Loader2 } from "lucide-react";
import {
  getAds,
  createAd,
  updateAd,
  deleteAd as deleteAdApi,
  type Ad as ApiAd,
} from "@/lib/api/adminModulesApi";

interface Ad {
  id: string;
  title: string;
  description: string;
  image: string;
  status: "active" | "inactive";
  sortOrder: number;
  url?: string;
}

export default function AdminAdsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [ads, setAds] = useState<Ad[]>([]);

  const transformApiAd = (apiAd: ApiAd): Ad => ({
    id: apiAd.id,
    title: apiAd.title,
    description: apiAd.description || '',
    image: apiAd.imageUrl || '',
    status: apiAd.isActive ? 'active' : 'inactive',
    sortOrder: apiAd.sortOrder,
    url: apiAd.targetUrl,
  });

  const fetchAds = useCallback(async () => {
    try {
      setIsPageLoading(true);
      const apiAds = await getAds();
      setAds(apiAds.map(transformApiAd));
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      toast.error('Failed to load ads');
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    status: "active" as "active" | "inactive",
    sortOrder: 0,
    url: "",
  });

  const handleAddAd = () => {
    setFormData({
      title: "",
      description: "",
      image: "",
      status: "active",
      sortOrder: ads.length,
      url: "",
    });
    setShowAddModal(true);
  };

  const handleEditAd = (ad: Ad) => {
    setSelectedAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      image: ad.image,
      status: ad.status,
      sortOrder: ad.sortOrder,
      url: ad.url || "",
    });
    setShowEditModal(true);
  };

  const handleDeleteAd = (ad: Ad) => {
    setSelectedAd(ad);
    setShowDeleteModal(true);
  };

  const handleSaveAd = async () => {
    setIsLoading(true);
    try {
      if (showAddModal) {
        const newAd = await createAd({
          title: formData.title,
          description: formData.description || undefined,
          imageUrl: formData.image || undefined,
          targetUrl: formData.url || undefined,
          isActive: formData.status === 'active',
          sortOrder: formData.sortOrder,
        });
        setAds([...ads, transformApiAd(newAd)]);
        toast.success("Ad added successfully!");
      } else if (showEditModal && selectedAd) {
        const updatedAd = await updateAd(selectedAd.id, {
          title: formData.title,
          description: formData.description || undefined,
          imageUrl: formData.image || undefined,
          targetUrl: formData.url || undefined,
          isActive: formData.status === 'active',
          sortOrder: formData.sortOrder,
        });
        setAds(ads.map((ad) => (ad.id === selectedAd.id ? transformApiAd(updatedAd) : ad)));
        toast.success("Ad updated successfully!");
      }
      setShowAddModal(false);
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to save ad:', error);
      toast.error("Failed to save ad. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAd) return;

    setIsLoading(true);
    try {
      await deleteAdApi(selectedAd.id);
      setAds(ads.filter((ad) => ad.id !== selectedAd.id));
      toast.success("Ad deleted successfully!");
      setShowDeleteModal(false);
      setSelectedAd(null);
    } catch (error) {
      console.error('Failed to delete ad:', error);
      toast.error("Failed to delete ad. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-white text-3xl font-semibold mb-2">Ad Management</h1>
        <p className="text-[#94A3B8] text-sm">Manage your advertisement banners and promotional content</p>
      </div>

      {/* Header Card */}
      <div className="p-8 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-2xl font-semibold mb-1">AD MANAGEMENT</h2>
          </div>
          <button
            onClick={handleAddAd}
            className="px-5 py-2.5 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Ad
          </button>
        </div>
      </div>

      {/* Ads Table */}
      <div className="rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl overflow-hidden">
        {isPageLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.1)]">
                <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                  Sort Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={ad.image || ""}
                        alt={ad.title}
                        className="w-12 h-12 rounded-lg object-cover border border-[rgba(255,255,255,0.1)]"
                      />
                      <div>
                        <div className="text-white text-sm font-medium">{ad.title}</div>
                        <div className="text-[#64748B] text-xs">{ad.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        ad.status === "active"
                          ? "bg-[#22C55E]/20 text-[#22C55E]"
                          : "bg-[#64748B]/20 text-[#64748B]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          ad.status === "active" ? "bg-[#22C55E]" : "bg-[#64748B]"
                        }`}
                      />
                      {ad.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white text-sm">{ad.sortOrder}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditAd(ad)}
                        className="p-2 hover:bg-[rgba(59,130,246,0.2)] rounded-lg text-[#3B82F6] transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad)}
                        className="p-2 hover:bg-[rgba(239,68,68,0.2)] rounded-lg text-[#EF4444] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {ad.url && (
                        <a
                          href={ad.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-[rgba(34,197,94,0.2)] rounded-lg text-[#22C55E] transition-colors"
                          title="View"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.1)] flex items-center justify-between">
          <p className="text-[#64748B] text-sm">
            Showing 1 from {ads.length}-{ads.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={true}
              className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] text-[#64748B] hover:bg-[rgba(255,255,255,0.1)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-[#3B82F6] text-white text-sm font-medium">1</button>
            <button
              disabled={true}
              className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] text-[#64748B] hover:bg-[rgba(255,255,255,0.1)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-white text-xl font-semibold mb-6">
              {showAddModal ? "Add New Ad" : "Edit Ad"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Enter ad title"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Enter ad description"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Enter image URL"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Target URL (Optional)</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAd}
                disabled={isLoading || !formData.title || !formData.description}
                className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : showAddModal ? "Add Ad" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold mb-4">Delete Ad</h2>
            <p className="text-[#94A3B8] text-sm mb-6">
              Are you sure you want to delete &quot;{selectedAd.title}&quot;? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAd(null);
                }}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
