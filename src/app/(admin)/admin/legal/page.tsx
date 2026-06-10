'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminGlassCard } from '@/components/admin/glass-card';
import {
  FileText,
  Edit,
  Eye,
  Plus,
  Trash2,
  Loader2,
  Save,
  RefreshCw,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getLegalPages,
  createLegalPage,
  updateLegalPage,
  deleteLegalPage,
  seedLegalPages,
  type LegalPage,
  type LegalCategory,
} from '@/lib/api/adminModulesApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TYPE_OPTIONS: Record<LegalCategory, { value: string; label: string }[]> =
  {
    LEGAL: [
      { value: 'privacy-policy', label: 'Privacy Policy' },
      { value: 'terms-of-use', label: 'Terms of Use' },
      { value: 'refund-policy', label: 'Payment & Refund Policy' },
      { value: 'legal-disclaimer', label: 'Legal Disclaimer' },
    ],
    OTHER: [
      { value: 'help-center', label: 'Help Center' },
      { value: 'about-us', label: 'About Us' },
      { value: 'contact', label: 'Contact' },
    ],
  };

export default function AdminLegalPage() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [selectedPage, setSelectedPage] = useState<LegalPage | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [pageToView, setPageToView] = useState<LegalPage | null>(null);
  const [pageToDelete, setPageToDelete] = useState<LegalPage | null>(null);
  const [activeTab, setActiveTab] = useState<LegalCategory>('LEGAL');

  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    type: string;
    category: LegalCategory;
    isPublished: boolean;
  }>({
    title: '',
    content: '',
    type: '',
    category: 'LEGAL',
    isPublished: false,
  });

  const fetchPages = useCallback(async (category: LegalCategory) => {
    try {
      setIsLoading(true);
      const data = await getLegalPages(category);
      setPages(data);
    } catch (error) {
      console.error('Failed to fetch legal pages:', error);
      toast.error('Failed to load legal pages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages(activeTab);
  }, [fetchPages, activeTab]);

  const handleSelectPage = (page: LegalPage) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      content: page.content,
      type: page.type,
      category: page.category,
      isPublished: page.isPublished,
    });
    setShowFormModal(true);
  };

  const handleCreateNew = () => {
    setSelectedPage(null);
    setFormData({
      title: '',
      content: '',
      type: '',
      category: activeTab,
      isPublished: false,
    });
    setShowFormModal(true);
  };

  const handleCloseForm = () => {
    setShowFormModal(false);
    setSelectedPage(null);
    setFormData({
      title: '',
      content: '',
      type: '',
      category: activeTab,
      isPublished: false,
    });
  };

  const handleTabChange = (tab: LegalCategory) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setSelectedPage(null);
    setShowFormModal(false);
    setFormData({
      title: '',
      content: '',
      type: '',
      category: tab,
      isPublished: false,
    });
  };

  const handleSave = async (publish: boolean) => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    setIsSaving(true);
    try {
      if (selectedPage) {
        const updated = await updateLegalPage(selectedPage.id, {
          title: formData.title,
          content: formData.content,
          category: formData.category,
          isPublished: publish,
        });
        // If the page's category was changed, it no longer belongs in the active
        // tab — drop it from the local list. Otherwise replace in place.
        if (updated.category !== activeTab) {
          setPages(pages.filter((p) => p.id !== updated.id));
          toast.success(
            `Page moved to ${updated.category === 'LEGAL' ? 'Legal' : 'Other'} pages`,
          );
        } else {
          setPages(pages.map((p) => (p.id === updated.id ? updated : p)));
          toast.success(
            publish
              ? 'Page published successfully!'
              : 'Draft saved successfully!',
          );
        }
        handleCloseForm();
      } else {
        if (!formData.type) {
          toast.error('Page type is required for new pages');
          setIsSaving(false);
          return;
        }
        const created = await createLegalPage({
          type: formData.type,
          category: formData.category,
          title: formData.title,
          content: formData.content,
          isPublished: publish,
        });
        // Only show in the list if the new page belongs in the active tab.
        if (created.category === activeTab) {
          setPages([...pages, created]);
        }
        toast.success(
          publish
            ? 'Page created and published!'
            : 'Draft created successfully!',
        );
        handleCloseForm();
      }
    } catch (error) {
      console.error('Failed to save page:', error);
      toast.error('Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pageToDelete) return;

    setIsSaving(true);
    try {
      await deleteLegalPage(pageToDelete.id);
      setPages(pages.filter((p) => p.id !== pageToDelete.id));
      if (selectedPage?.id === pageToDelete.id) {
        setSelectedPage(null);
        setFormData({
          title: '',
          content: '',
          type: '',
          category: activeTab,
          isPublished: false,
        });
      }
      toast.success('Page deleted successfully!');
      setShowDeleteModal(false);
      setPageToDelete(null);
    } catch (error) {
      console.error('Failed to delete page:', error);
      toast.error('Failed to delete page');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewPage = (page: LegalPage) => {
    setPageToView(page);
    setShowViewModal(true);
  };

  const handleSeedDefaults = async () => {
    setIsSeeding(true);
    try {
      const result = await seedLegalPages();
      if (result.created.length > 0) {
        toast.success(`Created ${result.created.length} default pages`);
        await fetchPages(activeTab);
      } else {
        toast.info('All default pages already exist');
      }
    } catch (error) {
      console.error('Failed to seed defaults:', error);
      toast.error('Failed to seed default pages');
    } finally {
      setIsSeeding(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold text-white">
          Content Management
        </h1>
        <p className="text-[#94A3B8]">
          Manage static pages, policies, and legal documents for your platform.
        </p>
      </div>

      {/* Category tabs */}
      <div className="mb-6 flex items-center gap-6 border-b border-[rgba(255,255,255,0.18)]">
        <button
          type="button"
          onClick={() => handleTabChange('LEGAL')}
          className={`relative px-2 pb-4 text-base font-medium transition-colors ${
            activeTab === 'LEGAL'
              ? 'text-[#3B82F6]'
              : 'text-[#64748B] hover:text-white'
          }`}
        >
          Legal Pages
          {activeTab === 'LEGAL' && (
            <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-[#3B82F6]" />
          )}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('OTHER')}
          className={`relative px-2 pb-4 text-base font-medium transition-colors ${
            activeTab === 'OTHER'
              ? 'text-[#3B82F6]'
              : 'text-[#64748B] hover:text-white'
          }`}
        >
          Other Pages
          {activeTab === 'OTHER' && (
            <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-[#3B82F6]" />
          )}
        </button>
      </div>

      <div className="mb-6 flex items-center justify-end">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDefaults}
            disabled={isSeeding}
            className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] disabled:opacity-50"
          >
            {isSeeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Seed Defaults
          </button>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 rounded-xl bg-[#3B82F6] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
          >
            <Plus className="h-5 w-5" />
            Create New Page
          </button>
        </div>
      </div>

      <AdminGlassCard>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-4 h-12 w-12 text-[#64748B]" />
            <p className="mb-2 text-lg font-medium text-white">
              No pages found
            </p>
            <p className="text-sm text-[#94A3B8]">
              Create your first {activeTab === 'LEGAL' ? 'legal' : 'other'} page
              to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pages.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.03)] p-4 transition-colors hover:bg-[rgba(255,255,255,0.05)]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20">
                    <FileText className="h-6 w-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-white">
                      {page.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-[#64748B]">
                      <span>Modified: {formatDate(page.updatedAt)}</span>
                      <span>•</span>
                      <span>by Admin</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-lg px-3 py-1 text-xs font-medium ${
                      page.category === 'LEGAL'
                        ? 'bg-[#3B82F6]/20 text-[#3B82F6]'
                        : 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
                    }`}
                  >
                    {page.category === 'LEGAL' ? 'Legal' : 'Other'}
                  </span>
                  <span
                    className={`rounded-lg px-3 py-1 text-xs font-medium ${
                      page.isPublished
                        ? 'bg-[#22C55E]/20 text-[#22C55E]'
                        : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                    }`}
                  >
                    {page.isPublished ? 'Published' : 'Draft'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPage(page);
                      }}
                      className="rounded-lg p-2 transition-colors hover:bg-[rgba(59,130,246,0.1)]"
                      title="View"
                    >
                      <Eye className="h-5 w-5 text-[#3B82F6]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPage(page);
                      }}
                      className="rounded-lg p-2 transition-colors hover:bg-[rgba(255,255,255,0.08)]"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5 text-[#F59E0B]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPageToDelete(page);
                        setShowDeleteModal(true);
                      }}
                      className="rounded-lg p-2 transition-colors hover:bg-[rgba(239,68,68,0.1)]"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5 text-[#EF4444]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminGlassCard>

      {/* Create / Edit Page Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A]">
            <div className="flex items-start justify-between border-b border-[rgba(255,255,255,0.1)] p-6">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {selectedPage
                    ? `Edit: ${selectedPage.title}`
                    : 'Create New Page'}
                </h3>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  {selectedPage
                    ? 'Edit the page content below.'
                    : 'Fill in the details to create a new page.'}
                </p>
              </div>
              <button
                onClick={handleCloseForm}
                className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Category
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => {
                      const nextCategory = v as LegalCategory;
                      setFormData((prev) => {
                        // When creating, switching category resets the type so the user
                        // doesn't end up with a type that doesn't belong in the new category.
                        const validTypes = TYPE_OPTIONS[nextCategory].map(
                          (t) => t.value,
                        );
                        const keepType =
                          !selectedPage && validTypes.includes(prev.type);
                        return {
                          ...prev,
                          category: nextCategory,
                          type: keepType
                            ? prev.type
                            : selectedPage
                              ? prev.type
                              : '',
                        };
                      });
                    }}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-[rgba(255,255,255,0.18)] bg-[#1E293B] px-4 py-3 text-sm text-white focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none data-[size=default]:h-auto data-[size=default]:min-h-12">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72 border-[rgba(255,255,255,0.18)] bg-[#1E293B] text-white">
                      <SelectItem
                        value="LEGAL"
                        className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                      >
                        Legal
                      </SelectItem>
                      <SelectItem
                        value="OTHER"
                        className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                      >
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedPage &&
                    formData.category !== selectedPage.category && (
                      <p className="mt-1 text-xs text-[#F59E0B]">
                        Saving will move this page to the{' '}
                        {formData.category === 'LEGAL' ? 'Legal' : 'Other'}{' '}
                        pages tab.
                      </p>
                    )}
                </div>

                {!selectedPage && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
                      Page Type
                    </label>
                    <Select
                      value={formData.type || '__placeholder__'}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          type: v === '__placeholder__' ? '' : v,
                        })
                      }
                    >
                      <SelectTrigger className="w-full rounded-xl border border-[rgba(255,255,255,0.18)] bg-[#1E293B] px-4 py-3 text-sm text-white focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none data-[size=default]:h-auto data-[size=default]:min-h-12">
                        <SelectValue placeholder="Select page type" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72 border-[rgba(255,255,255,0.18)] bg-[#1E293B] text-white">
                        <SelectItem
                          value="__placeholder__"
                          className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                        >
                          Select page type
                        </SelectItem>
                        {TYPE_OPTIONS[formData.category].map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Page Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter page title"
                  className="w-full rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Write your content here..."
                  rows={15}
                  className="w-full resize-none rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 font-mono text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[rgba(255,255,255,0.1)] p-6">
              <button
                onClick={handleCloseForm}
                disabled={isSaving}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && pageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Delete Page
            </h2>
            <p className="mb-6 text-sm text-[#94A3B8]">
              Are you sure you want to delete &quot;{pageToDelete.title}&quot;?
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPageToDelete(null);
                }}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-[#EF4444] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#DC2626] disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Page Modal */}
      {showViewModal && pageToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A]">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] p-6">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {pageToView.title}
                </h2>
                <div className="mt-1 flex items-center gap-3 text-xs text-[#64748B]">
                  <span>Type: {pageToView.type}</span>
                  <span>•</span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      pageToView.category === 'LEGAL'
                        ? 'bg-[#3B82F6]/20 text-[#3B82F6]'
                        : 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
                    }`}
                  >
                    {pageToView.category === 'LEGAL' ? 'Legal' : 'Other'}
                  </span>
                  <span>•</span>
                  <span>Modified: {formatDate(pageToView.updatedAt)}</span>
                  <span>•</span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      pageToView.isPublished
                        ? 'bg-[#22C55E]/20 text-[#22C55E]'
                        : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                    }`}
                  >
                    {pageToView.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setPageToView(null);
                }}
                className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div
                className="prose prose-invert max-w-none text-[#94A3B8]"
                dangerouslySetInnerHTML={{ __html: pageToView.content }}
              />
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-[rgba(255,255,255,0.1)] p-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setPageToView(null);
                  handleSelectPage(pageToView);
                }}
                className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
              >
                <Edit className="h-4 w-4" />
                Edit Page
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setPageToView(null);
                }}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
