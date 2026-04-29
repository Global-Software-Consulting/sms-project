'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminGlassCard } from '@/components/admin/glass-card';
import { FileText, Edit, Eye, Plus, Trash2, Loader2, Save, RefreshCw, X } from "lucide-react";
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

const TYPE_OPTIONS: Record<LegalCategory, { value: string; label: string }[]> = {
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
    setFormData({ title: '', content: '', type: '', category: activeTab, isPublished: false });
  };

  const handleTabChange = (tab: LegalCategory) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setSelectedPage(null);
    setShowFormModal(false);
    setFormData({ title: '', content: '', type: '', category: tab, isPublished: false });
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
          setPages(pages.filter(p => p.id !== updated.id));
          toast.success(`Page moved to ${updated.category === 'LEGAL' ? 'Legal' : 'Other'} pages`);
        } else {
          setPages(pages.map(p => p.id === updated.id ? updated : p));
          toast.success(publish ? 'Page published successfully!' : 'Draft saved successfully!');
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
        toast.success(publish ? 'Page created and published!' : 'Draft created successfully!');
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
      setPages(pages.filter(p => p.id !== pageToDelete.id));
      if (selectedPage?.id === pageToDelete.id) {
        setSelectedPage(null);
        setFormData({ title: '', content: '', type: '', category: activeTab, isPublished: false });
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
        <h1 className="text-white text-3xl font-semibold mb-2">Content Management</h1>
        <p className="text-[#94A3B8]">
          Manage static pages, policies, and legal documents for your platform.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-6 mb-6 border-b border-[rgba(255,255,255,0.18)]">
        <button
          type="button"
          onClick={() => handleTabChange('LEGAL')}
          className={`pb-4 px-2 text-base font-medium transition-colors relative ${
            activeTab === 'LEGAL' ? 'text-[#3B82F6]' : 'text-[#64748B] hover:text-white'
          }`}
        >
          Legal Pages
          {activeTab === 'LEGAL' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />
          )}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('OTHER')}
          className={`pb-4 px-2 text-base font-medium transition-colors relative ${
            activeTab === 'OTHER' ? 'text-[#3B82F6]' : 'text-[#64748B] hover:text-white'
          }`}
        >
          Other Pages
          {activeTab === 'OTHER' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSeedDefaults}
            disabled={isSeeding}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Seed Defaults
          </button>
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Page
          </button>
        </div>
      </div>

      <AdminGlassCard>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-[#64748B] mb-4" />
            <p className="text-white text-lg font-medium mb-2">No pages found</p>
            <p className="text-[#94A3B8] text-sm">
              Create your first {activeTab === 'LEGAL' ? 'legal' : 'other'} page to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pages.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between p-4 rounded-xl transition-colors bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{page.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-[#64748B]">
                      <span>Modified: {formatDate(page.updatedAt)}</span>
                      <span>•</span>
                      <span>by Admin</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      page.category === 'LEGAL'
                        ? 'bg-[#3B82F6]/20 text-[#3B82F6]'
                        : 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
                    }`}
                  >
                    {page.category === 'LEGAL' ? 'Legal' : 'Other'}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      page.isPublished
                        ? "bg-[#22C55E]/20 text-[#22C55E]"
                        : "bg-[#F59E0B]/20 text-[#F59E0B]"
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
                      className="p-2 rounded-lg hover:bg-[rgba(59,130,246,0.1)] transition-colors"
                      title="View"
                    >
                      <Eye className="w-5 h-5 text-[#3B82F6]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPage(page);
                      }}
                      className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5 text-[#F59E0B]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPageToDelete(page);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-[#EF4444]" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between p-6 border-b border-[rgba(255,255,255,0.1)]">
              <div>
                <h3 className="text-white text-xl font-semibold">
                  {selectedPage ? `Edit: ${selectedPage.title}` : 'Create New Page'}
                </h3>
                <p className="text-[#94A3B8] text-sm mt-1">
                  {selectedPage ? 'Edit the page content below.' : 'Fill in the details to create a new page.'}
                </p>
              </div>
              <button
                onClick={handleCloseForm}
                className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] text-[#64748B] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const nextCategory = e.target.value as LegalCategory;
                    setFormData(prev => {
                      // When creating, switching category resets the type so the user
                      // doesn't end up with a type that doesn't belong in the new category.
                      const validTypes = TYPE_OPTIONS[nextCategory].map(t => t.value);
                      const keepType = !selectedPage && validTypes.includes(prev.type);
                      return {
                        ...prev,
                        category: nextCategory,
                        type: keepType ? prev.type : (selectedPage ? prev.type : ''),
                      };
                    });
                  }}
                  className="w-full bg-[#1E293B] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] [&>option]:bg-[#1E293B] [&>option]:text-white"
                >
                  <option value="LEGAL">Legal</option>
                  <option value="OTHER">Other</option>
                </select>
                {selectedPage && formData.category !== selectedPage.category && (
                  <p className="text-[#F59E0B] text-xs mt-1">
                    Saving will move this page to the {formData.category === 'LEGAL' ? 'Legal' : 'Other'} pages tab.
                  </p>
                )}
              </div>

              {!selectedPage && (
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Page Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#1E293B] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] [&>option]:bg-[#1E293B] [&>option]:text-white"
                  >
                    <option value="">Select page type</option>
                    {TYPE_OPTIONS[formData.category].map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Page Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter page title"
                className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your content here..."
                rows={15}
                className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none font-mono"
              />
            </div>

            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-[rgba(255,255,255,0.1)]">
              <button
                onClick={handleCloseForm}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] text-sm font-medium transition-colors disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && pageToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold mb-4">Delete Page</h2>
            <p className="text-[#94A3B8] text-sm mb-6">
              Are you sure you want to delete &quot;{pageToDelete.title}&quot;? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPageToDelete(null);
                }}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Page Modal */}
      {showViewModal && pageToView && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.1)]">
              <div>
                <h2 className="text-white text-xl font-semibold">{pageToView.title}</h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#64748B]">
                  <span>Type: {pageToView.type}</span>
                  <span>•</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
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
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      pageToView.isPublished
                        ? "bg-[#22C55E]/20 text-[#22C55E]"
                        : "bg-[#F59E0B]/20 text-[#F59E0B]"
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
                className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] text-[#64748B] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div 
                className="prose prose-invert max-w-none text-[#94A3B8]"
                dangerouslySetInnerHTML={{ __html: pageToView.content }}
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[rgba(255,255,255,0.1)]">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setPageToView(null);
                  handleSelectPage(pageToView);
                }}
                className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Page
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setPageToView(null);
                }}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
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
