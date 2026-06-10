'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Edit2,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
  MonitorPlay,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getAds,
  createAd,
  updateAd,
  deleteAd as deleteAdApi,
  type Ad as ApiAd,
} from '@/lib/api/adminModulesApi';

interface Ad {
  id: string;
  title: string;
  description: string;
  image: string;
  status: 'active' | 'inactive';
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
    title: '',
    description: '',
    image: '',
    status: 'active' as 'active' | 'inactive',
    sortOrder: 0,
    url: '',
  });

  const handleAddAd = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      status: 'active',
      sortOrder: ads.length,
      url: '',
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
      url: ad.url || '',
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
        toast.success('Ad added successfully!');
      } else if (showEditModal && selectedAd) {
        const updatedAd = await updateAd(selectedAd.id, {
          title: formData.title,
          description: formData.description || undefined,
          imageUrl: formData.image || undefined,
          targetUrl: formData.url || undefined,
          isActive: formData.status === 'active',
          sortOrder: formData.sortOrder,
        });
        setAds(
          ads.map((ad) =>
            ad.id === selectedAd.id ? transformApiAd(updatedAd) : ad,
          ),
        );
        toast.success('Ad updated successfully!');
      }
      setShowAddModal(false);
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to save ad:', error);
      toast.error('Failed to save ad. Please try again.');
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
      toast.success('Ad deleted successfully!');
      setShowDeleteModal(false);
      setSelectedAd(null);
    } catch (error) {
      console.error('Failed to delete ad:', error);
      toast.error('Failed to delete ad. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold text-white">
          Ad Management
        </h1>
        <p className="text-sm text-[#94A3B8]">
          Manage your advertisement banners and promotional content
        </p>
      </div>

      {/* Header Card */}
      <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white sm:mb-1 sm:text-2xl">
              AD MANAGEMENT
            </h2>
          </div>
          <button
            onClick={handleAddAd}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#06B6D4] px-5 py-2.5 text-base font-medium whitespace-nowrap text-white transition-colors hover:bg-[#0891B2] sm:w-auto sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            Add New Ad
          </button>
        </div>
      </div>

      {/* Ads Table */}
      <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,42,0.6)] backdrop-blur-xl">
        {isPageLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.1)]">
                    <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-[#94A3B8] uppercase">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-[#94A3B8] uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-[#94A3B8] uppercase">
                      Sort Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-[#94A3B8] uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {ads.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-16">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)]">
                            <MonitorPlay className="h-8 w-8 text-[#64748B]" />
                          </div>
                          <p className="text-lg font-medium text-white">
                            No ads found
                          </p>
                          <p className="mt-1 text-sm text-[#94A3B8]">
                            Create your first ad to get started
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    ads.map((ad) => (
                      <tr
                        key={ad.id}
                        className="transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={ad.image || ''}
                              alt={ad.title}
                              className="h-12 w-12 rounded-lg border border-[rgba(255,255,255,0.1)] object-cover"
                            />
                            <div>
                              <div className="text-sm font-medium text-white">
                                {ad.title}
                              </div>
                              <div className="text-xs text-[#64748B]">
                                {ad.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                              ad.status === 'active'
                                ? 'bg-[#22C55E]/20 text-[#22C55E]'
                                : 'bg-[#64748B]/20 text-[#64748B]'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                ad.status === 'active'
                                  ? 'bg-[#22C55E]'
                                  : 'bg-[#64748B]'
                              }`}
                            />
                            {ad.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-white">
                            {ad.sortOrder}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditAd(ad)}
                              className="rounded-lg p-2 text-[#3B82F6] transition-colors hover:bg-[rgba(59,130,246,0.2)]"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAd(ad)}
                              className="rounded-lg p-2 text-[#EF4444] transition-colors hover:bg-[rgba(239,68,68,0.2)]"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            {ad.url && (
                              <a
                                href={ad.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg p-2 text-[#22C55E] transition-colors hover:bg-[rgba(34,197,94,0.2)]"
                                title="View"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.1)] px-6 py-4">
              <p className="text-sm text-[#64748B]">
                Showing 1 from {ads.length}-{ads.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={true}
                  className="rounded-lg bg-[rgba(255,255,255,0.05)] p-2 text-[#64748B] transition-colors hover:bg-[rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button className="rounded-lg bg-[#3B82F6] px-3 py-1.5 text-sm font-medium text-white">
                  1
                </button>
                <button
                  disabled={true}
                  className="rounded-lg bg-[rgba(255,255,255,0.05)] p-2 text-[#64748B] transition-colors hover:bg-[rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              {showAddModal ? 'Add New Ad' : 'Edit Ad'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter ad title"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter ad description"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter image URL"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Target URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        status: v as 'active' | 'inactive',
                      })
                    }
                  >
                    <SelectTrigger className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-base text-white focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none data-[size=default]:h-auto data-[size=default]:min-h-12 lg:text-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72 border-[rgba(255,255,255,0.18)] bg-[#1E293B] text-white">
                      <SelectItem
                        value="active"
                        className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                      >
                        Active
                      </SelectItem>
                      <SelectItem
                        value="inactive"
                        className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                      >
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAd}
                disabled={isLoading || !formData.title || !formData.description}
                className="rounded-lg bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading
                  ? 'Saving...'
                  : showAddModal
                    ? 'Add Ad'
                    : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Delete Ad</h2>
            <p className="mb-6 text-sm text-[#94A3B8]">
              Are you sure you want to delete &quot;{selectedAd.title}&quot;?
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAd(null);
                }}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isLoading}
                className="rounded-lg bg-[#EF4444] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#DC2626] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
