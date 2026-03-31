'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminGlassCard } from '@/components/admin/glass-card';
import { FileText, Edit, Eye, Plus, Trash2, Loader2, Save } from "lucide-react";
import { toast } from 'sonner';
import {
  getLegalPages,
  createLegalPage,
  updateLegalPage,
  deleteLegalPage,
  type LegalPage,
} from '@/lib/api/adminModulesApi';

export default function AdminLegalPage() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPage, setSelectedPage] = useState<LegalPage | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<LegalPage | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: '',
    isPublished: false,
  });

  const fetchPages = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getLegalPages();
      setPages(data);
    } catch (error) {
      console.error('Failed to fetch legal pages:', error);
      toast.error('Failed to load legal pages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleSelectPage = (page: LegalPage) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      content: page.content,
      type: page.type,
      isPublished: page.isPublished,
    });
  };

  const handleCreateNew = () => {
    setSelectedPage(null);
    setFormData({
      title: '',
      content: '',
      type: '',
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
          isPublished: publish,
        });
        setPages(pages.map(p => p.id === updated.id ? updated : p));
        setSelectedPage(updated);
        toast.success(publish ? 'Page published successfully!' : 'Draft saved successfully!');
      } else {
        if (!formData.type) {
          toast.error('Page type is required for new pages');
          setIsSaving(false);
          return;
        }
        const created = await createLegalPage({
          type: formData.type,
          title: formData.title,
          content: formData.content,
          isPublished: publish,
        });
        setPages([...pages, created]);
        setSelectedPage(created);
        toast.success(publish ? 'Page created and published!' : 'Draft created successfully!');
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
        setFormData({ title: '', content: '', type: '', isPublished: false });
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

  const filteredPages = pages.filter(page => {
    if (filter === 'published') return page.isPublished;
    if (filter === 'draft') return !page.isPublished;
    return true;
  });

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

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'published' | 'draft')}
            className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          >
            <option value="all">All Pages</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Page
        </button>
      </div>

      <AdminGlassCard>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-[#64748B] mb-4" />
            <p className="text-white text-lg font-medium mb-2">No pages found</p>
            <p className="text-[#94A3B8] text-sm">Create your first legal page to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPages.map((page) => (
              <div
                key={page.id}
                className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
                  selectedPage?.id === page.id 
                    ? 'bg-[rgba(59,130,246,0.1)] border border-[#3B82F6]' 
                    : 'bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)]'
                }`}
                onClick={() => handleSelectPage(page)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{page.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-[#64748B]">
                      <span>Type: {page.type}</span>
                      <span>•</span>
                      <span>Modified: {formatDate(page.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
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

      <div className="mt-8">
        <AdminGlassCard>
          <h3 className="text-white text-xl font-semibold mb-4">
            {selectedPage ? `Edit: ${selectedPage.title}` : 'Create New Page'}
          </h3>
          <p className="text-[#94A3B8] text-sm mb-6">
            {selectedPage ? 'Edit the page content below.' : 'Fill in the details to create a new page.'}
          </p>

          <div className="space-y-4">
            {!selectedPage && (
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Page Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                >
                  <option value="">Select page type</option>
                  <option value="privacy-policy">Privacy Policy</option>
                  <option value="terms-of-use">Terms of Use</option>
                  <option value="refund-policy">Payment & Refund Policy</option>
                  <option value="legal-disclaimer">Legal Disclaimer</option>
                  <option value="help-center">Help Center</option>
                  <option value="about-us">About Us</option>
                  <option value="contact">Contact</option>
                </select>
              </div>
            )}

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

            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-4 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Publish
              </button>
              <button 
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] text-sm font-medium transition-colors disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button 
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-[#94A3B8] hover:text-white transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Page
              </button>
            </div>
          </div>
        </AdminGlassCard>
      </div>

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
    </div>
  );
}
