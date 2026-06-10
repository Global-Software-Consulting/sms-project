'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminGlassCard } from '@/components/admin/glass-card';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Save,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
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
} from '@/lib/api/adminModulesApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categoryColors = [
  '#3B82F6',
  '#22C55E',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
];

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function AdminFaqPage() {
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [articles, setArticles] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<FaqItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<{
    type: 'article' | 'category';
    item: FaqItem | FaqCategory;
  } | null>(null);

  const [articleForm, setArticleForm] = useState({
    category: '',
    question: '',
    answer: '',
    sortOrder: 0,
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
    if (!articleForm.category || !articleForm.question || !articleForm.answer) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (editingArticle) {
        const updated = await updateFaqItem(editingArticle.id, {
          question: articleForm.question,
          answer: articleForm.answer,
          category: articleForm.category,
          sortOrder: articleForm.sortOrder,
          isActive: articleForm.isActive,
        });
        setArticles(articles.map((a) => (a.id === updated.id ? updated : a)));
        toast.success('Article updated successfully!');
      } else {
        const created = await createFaqItem({
          question: articleForm.question,
          answer: articleForm.answer,
          category: articleForm.category,
          sortOrder: articleForm.sortOrder,
          isActive: articleForm.isActive,
        });
        setArticles([...articles, created]);
        toast.success('Article created successfully!');
      }
      setShowArticleModal(false);
      setEditingArticle(null);
      setArticleForm({
        category: '',
        question: '',
        answer: '',
        sortOrder: 0,
        isActive: true,
      });
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
        setArticles(articles.filter((a) => a.id !== deleteItem.item.id));
        toast.success('Article deleted successfully!');
      } else {
        await deleteFaqCategory(deleteItem.item.id);
        setCategories(categories.filter((c) => c.id !== deleteItem.item.id));
        setArticles(
          articles.filter(
            (a) => a.category !== (deleteItem.item as FaqCategory).name,
          ),
        );
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
      category: article.category,
      question: article.question,
      answer: article.answer,
      sortOrder: article.sortOrder,
      isActive: article.isActive,
    });
    setShowArticleModal(true);
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.question
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (category: string) => {
    const name =
      categories.find((c) => c.id === category || c.name === category)?.name ||
      category;
    return capitalize(name);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <Loader2 className="h-10 w-10 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-semibold text-white sm:text-3xl">
          FAQ Management
        </h1>
        <p className="text-sm text-[#94A3B8] sm:text-base">
          Create and manage help articles to assist your users.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {categories.map((category, index) => (
          <AdminGlassCard key={category.id}>
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `${categoryColors[index % categoryColors.length]}20`,
              }}
            >
              <BookOpen
                className="h-6 w-6"
                style={{ color: categoryColors[index % categoryColors.length] }}
              />
            </div>
            <h3 className="mb-2 font-semibold text-white">
              {capitalize(category.name)}
            </h3>
            <p className="text-sm text-[#64748B]">
              {category.faqCount || 0} articles
            </p>
            <button
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category.name ? null : category.name,
                )
              }
              className={`mt-3 rounded-lg px-3 py-1 text-xs transition-colors ${
                selectedCategory === category.name
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
            className="flex h-full w-full flex-col items-center justify-center text-[#64748B] transition-colors hover:text-white"
          >
            <Plus className="mb-2 h-8 w-8" />
            <span className="text-sm font-medium">Add Category</span>
          </button>
        </AdminGlassCard>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-96 sm:flex-1">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] py-3 pr-4 pl-12 text-base text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none sm:text-sm"
          />
        </div>
        <button
          onClick={() => {
            setEditingArticle(null);
            setArticleForm({
              category: '',
              question: '',
              answer: '',
              sortOrder: 0,
              isActive: true,
            });
            setShowArticleModal(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-4 py-2.5 text-base font-medium text-white transition-colors hover:bg-[#2563EB] sm:w-auto sm:justify-start sm:text-sm"
        >
          <Plus className="h-5 w-5" />
          Create Article
        </button>
      </div>

      <AdminGlassCard>
        <h3 className="mb-6 text-xl font-semibold text-white">
          {selectedCategory
            ? `Articles in ${getCategoryName(selectedCategory)}`
            : 'All Articles'}
        </h3>
        {filteredArticles.length === 0 ? (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-[#64748B]" />
            <p className="mb-2 text-lg font-medium text-white">
              No articles found
            </p>
            <p className="text-sm text-[#94A3B8]">
              Create your first FAQ article to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.03)] p-4 transition-colors hover:bg-[rgba(255,255,255,0.05)]"
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h4 className="font-semibold text-white">
                      {capitalize(article.question)}
                    </h4>
                    <span
                      className={`rounded-lg px-3 py-1 text-xs font-medium ${
                        article.isActive
                          ? 'bg-[#22C55E]/20 text-[#22C55E]'
                          : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                      }`}
                    >
                      {article.isActive ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#64748B]">
                    <span>{getCategoryName(article.category)}</span>
                    <span>•</span>
                    <span>{article.viewCount || 0} views</span>
                    <span>•</span>
                    <span>
                      Updated {new Date(article.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditArticle(article)}
                    className="rounded-lg p-2 transition-colors hover:bg-[rgba(255,255,255,0.08)]"
                    title="Edit Article"
                  >
                    <Edit className="h-5 w-5 text-[#F59E0B]" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteItem({ type: 'article', item: article });
                      setShowDeleteModal(true);
                    }}
                    className="rounded-lg p-2 transition-colors hover:bg-[rgba(255,255,255,0.08)]"
                    title="Delete Article"
                  >
                    <Trash2 className="h-5 w-5 text-[#EF4444]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminGlassCard>

      {/* Article Modal */}
      {showArticleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingArticle ? 'Edit Article' : 'Create Article'}
              </h2>
              <button
                onClick={() => setShowArticleModal(false)}
                className="text-[#64748B] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Category
                </label>
                <Select
                  value={articleForm.category || '__placeholder__'}
                  onValueChange={(v) =>
                    setArticleForm({
                      ...articleForm,
                      category: v === '__placeholder__' ? '' : v,
                    })
                  }
                >
                  <SelectTrigger className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none data-[size=default]:h-auto data-[size=default]:min-h-12">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 border-[rgba(255,255,255,0.18)] bg-[#1E293B] text-white">
                    <SelectItem
                      value="__placeholder__"
                      className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                    >
                      Select category
                    </SelectItem>
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.name}
                        className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                      >
                        {capitalize(cat.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Question
                </label>
                <input
                  type="text"
                  value={articleForm.question}
                  onChange={(e) =>
                    setArticleForm({ ...articleForm, question: e.target.value })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter the FAQ question"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Answer
                </label>
                <textarea
                  value={articleForm.answer}
                  onChange={(e) =>
                    setArticleForm({ ...articleForm, answer: e.target.value })
                  }
                  rows={8}
                  className="w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Enter the answer"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={articleForm.isActive}
                  onChange={(e) =>
                    setArticleForm({
                      ...articleForm,
                      isActive: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-[#3B82F6] focus:ring-[#3B82F6]"
                />
                <label htmlFor="isActive" className="text-sm text-white">
                  Publish immediately
                </label>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowArticleModal(false)}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateArticle}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {editingArticle ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Create Category
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-[#64748B] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Name
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Category name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Description (optional)
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  placeholder="Brief description"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#0F172A] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Delete {deleteItem.type === 'article' ? 'Article' : 'Category'}
            </h2>
            <p className="mb-6 text-sm text-[#94A3B8]">
              Are you sure you want to delete this {deleteItem.type}? This
              action cannot be undone.
              {deleteItem.type === 'category' &&
                ' All articles in this category will also be deleted.'}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteItem(null);
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
    </div>
  );
}
