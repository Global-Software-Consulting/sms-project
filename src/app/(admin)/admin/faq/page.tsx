'use client';

import { useState, useEffect, useCallback } from "react";
import { AdminGlassCard } from "@/components/admin/glass-card";
import { BookOpen, Plus, Edit, Trash2, Search, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  getFaqCategories,
  getFaqItems,
  createFaqCategory,
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
  deleteFaqCategory,
  type FaqCategory,
  type FaqItem,
} from "@/lib/api/adminModulesApi";

const categoryColors = ["#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];

export default function AdminFaqPage() {
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [articles, setArticles] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<FaqItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ type: 'article' | 'category'; item: FaqItem | FaqCategory } | null>(null);

  const [articleForm, setArticleForm] = useState({
    categoryId: '',
    question: '',
    answer: '',
    isActive: true,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [categoriesData, articlesData] = await Promise.all([
        getFaqCategories(),
        getFaqItems(),
      ]);
      setCategories(categoriesData);
      setArticles(articlesData);
    } catch (error) {
      console.error('Failed to fetch FAQ data:', error);
      toast.error('Failed to load FAQ data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateArticle = async () => {
    if (!articleForm.categoryId || !articleForm.question || !articleForm.answer) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (editingArticle) {
        const updated = await updateFaqItem(editingArticle.id, {
          question: articleForm.question,
          answer: articleForm.answer,
          isActive: articleForm.isActive,
        });
        setArticles(articles.map(a => a.id === updated.id ? updated : a));
        toast.success('Article updated successfully!');
      } else {
        const created = await createFaqItem({
          categoryId: articleForm.categoryId,
          question: articleForm.question,
          answer: articleForm.answer,
          isActive: articleForm.isActive,
        });
        setArticles([...articles, created]);
        toast.success('Article created successfully!');
      }
      setShowArticleModal(false);
      setEditingArticle(null);
      setArticleForm({ categoryId: '', question: '', answer: '', isActive: true });
    } catch (error) {
      console.error('Failed to save article:', error);
      toast.error('Failed to save article');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name) {
      toast.error('Category name is required');
      return;
    }

    setIsSaving(true);
    try {
      const created = await createFaqCategory({
        name: categoryForm.name,
        description: categoryForm.description,
      });
      setCategories([...categories, created]);
      toast.success('Category created successfully!');
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '' });
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error('Failed to create category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    setIsSaving(true);
    try {
      if (deleteItem.type === 'article') {
        await deleteFaqItem(deleteItem.item.id);
        setArticles(articles.filter(a => a.id !== deleteItem.item.id));
        toast.success('Article deleted successfully!');
      } else {
        await deleteFaqCategory(deleteItem.item.id);
        setCategories(categories.filter(c => c.id !== deleteItem.item.id));
        setArticles(articles.filter(a => a.categoryId !== deleteItem.item.id));
        toast.success('Category deleted successfully!');
      }
      setShowDeleteModal(false);
      setDeleteItem(null);
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditArticle = (article: FaqItem) => {
    setEditingArticle(article);
    setArticleForm({
      categoryId: article.categoryId,
      question: article.question,
      answer: article.answer,
      isActive: article.isActive,
    });
    setShowArticleModal(true);
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || article.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#3B82F6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-3xl font-semibold mb-2">Knowledge Base</h1>
        <p className="text-[#94A3B8]">
          Create and manage help articles to assist your users.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {categories.map((category, index) => (
          <AdminGlassCard key={category.id}>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${categoryColors[index % categoryColors.length]}20` }}
            >
              <BookOpen className="w-6 h-6" style={{ color: categoryColors[index % categoryColors.length] }} />
            </div>
            <h3 className="text-white font-semibold mb-2">{category.name}</h3>
            <p className="text-[#64748B] text-sm">{category.faqCount || 0} articles</p>
            <button
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              className={`mt-3 text-xs px-3 py-1 rounded-lg transition-colors ${
                selectedCategory === category.id 
                  ? 'bg-[#3B82F6] text-white' 
                  : 'bg-[rgba(255,255,255,0.08)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.12)]'
              }`}
            >
              {selectedCategory === category.id ? 'Show All' : 'Filter'}
            </button>
          </AdminGlassCard>
        ))}
        <AdminGlassCard>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="w-full h-full flex flex-col items-center justify-center text-[#64748B] hover:text-white transition-colors"
          >
            <Plus className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Add Category</span>
          </button>
        </AdminGlassCard>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] w-96"
          />
        </div>
        <button 
          onClick={() => {
            setEditingArticle(null);
            setArticleForm({ categoryId: categories[0]?.id || '', question: '', answer: '', isActive: true });
            setShowArticleModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Article
        </button>
      </div>

      <AdminGlassCard>
        <h3 className="text-white text-xl font-semibold mb-6">
          {selectedCategory ? `Articles in ${getCategoryName(selectedCategory)}` : 'All Articles'}
        </h3>
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
            <p className="text-white text-lg font-medium mb-2">No articles found</p>
            <p className="text-[#94A3B8] text-sm">Create your first FAQ article to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-semibold">{article.question}</h4>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        article.isActive
                          ? "bg-[#22C55E]/20 text-[#22C55E]"
                          : "bg-[#F59E0B]/20 text-[#F59E0B]"
                      }`}
                    >
                      {article.isActive ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#64748B]">
                    <span>{getCategoryName(article.categoryId)}</span>
                    <span>•</span>
                    <span>{article.viewCount || 0} views</span>
                    <span>•</span>
                    <span>Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditArticle(article)}
                    className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                    title="Edit Article"
                  >
                    <Edit className="w-5 h-5 text-[#F59E0B]" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteItem({ type: 'article', item: article });
                      setShowDeleteModal(true);
                    }}
                    className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                    title="Delete Article"
                  >
                    <Trash2 className="w-5 h-5 text-[#EF4444]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminGlassCard>

      {/* Article Modal */}
      {showArticleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold">
                {editingArticle ? 'Edit Article' : 'Create Article'}
              </h2>
              <button onClick={() => setShowArticleModal(false)} className="text-[#64748B] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Category</label>
                <select
                  value={articleForm.categoryId}
                  onChange={(e) => setArticleForm({ ...articleForm, categoryId: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Question</label>
                <input
                  type="text"
                  value={articleForm.question}
                  onChange={(e) => setArticleForm({ ...articleForm, question: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Enter the FAQ question"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Answer</label>
                <textarea
                  value={articleForm.answer}
                  onChange={(e) => setArticleForm({ ...articleForm, answer: e.target.value })}
                  rows={8}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
                  placeholder="Enter the answer"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={articleForm.isActive}
                  onChange={(e) => setArticleForm({ ...articleForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-[#3B82F6] focus:ring-[#3B82F6]"
                />
                <label htmlFor="isActive" className="text-white text-sm">Publish immediately</label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowArticleModal(false)}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateArticle}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingArticle ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold">Create Category</h2>
              <button onClick={() => setShowCategoryModal(false)} className="text-[#64748B] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Category name"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Description (optional)</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
                  placeholder="Brief description"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deleteItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold mb-4">
              Delete {deleteItem.type === 'article' ? 'Article' : 'Category'}
            </h2>
            <p className="text-[#94A3B8] text-sm mb-6">
              Are you sure you want to delete this {deleteItem.type}? This action cannot be undone.
              {deleteItem.type === 'category' && ' All articles in this category will also be deleted.'}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteItem(null);
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
