'use client';

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminGlassCard } from '@/components/admin/glass-card';
import { AdminFormInput } from '@/components/admin/form-input';
import { AdminModal } from '@/components/admin/modal';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Upload, Copy, Loader2, Eye, X } from "lucide-react";
import {
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  publishBlogPost,
  unpublishBlogPost,
  getBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  getBlogAuthors,
  createBlogAuthor,
  updateBlogAuthor,
  deleteBlogAuthor,
  bulkCreateBlogPosts,
  type BlogPost,
  type BlogCategory,
  type BlogAuthor,
} from '@/lib/api/adminModulesApi';

export default function AdminBlogsPage() {
  const [activeTab, setActiveTab] = useState<"manual" | "auto" | "category" | "author" | "image">("manual");
  const [categorySubTab, setCategorySubTab] = useState<"category" | "subcategory">("category");

  // Data states
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Modal states
  const [isCreateBlogModalOpen, setIsCreateBlogModalOpen] = useState(false);
  const [isEditBlogModalOpen, setIsEditBlogModalOpen] = useState(false);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isCreateAuthorModalOpen, setIsCreateAuthorModalOpen] = useState(false);
  const [isEditAuthorModalOpen, setIsEditAuthorModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'blog' | 'category' | 'author'>('blog');

  // Selected items
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<BlogAuthor | null>(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form states
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    categoryId: '',
    authorId: '',
    tags: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
  });

  const [authorForm, setAuthorForm] = useState({
    name: '',
    slug: '',
    bio: '',
    avatar: '',
    email: '',
    website: '',
  });

  // Auto Blog Upload State
  const [autoBlogConfig, setAutoBlogConfig] = useState({
    category: "",
    author: "",
  });

  const [blogPostDraft, setBlogPostDraft] = useState({
    title: "",
    content: "",
    tags: "",
  });

  const [scheduling, setScheduling] = useState({
    minHours: "8",
    maxHours: "11",
    authorRotation: true,
  });

  // Image Editor State
  const [imageConfig, setImageConfig] = useState({
    searchName: "",
    crop1: "2", crop2: "4", crop3: "10", crop4: "15",
    saturation1: "1", saturation2: "15",
    brightness1: "5", brightness2: "10",
    contrast1: "5", contrast2: "10",
    rotation1: "-1", rotation2: "1",
    noise1: "1", noise2: "2",
    convertWebP: true,
    stripEXIF: true,
    bypassMode: false,
  });

  // Fetch functions
  const fetchBlogPosts = useCallback(async () => {
    try {
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await getBlogPosts(params);
      setBlogs(response.data);
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
      toast.error('Failed to load blog posts');
    }
  }, [statusFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getBlogCategories(true);
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  const fetchAuthors = useCallback(async () => {
    try {
      const data = await getBlogAuthors(true);
      setAuthors(data);
    } catch (error) {
      console.error('Failed to fetch authors:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsPageLoading(true);
      await Promise.all([fetchBlogPosts(), fetchCategories(), fetchAuthors()]);
      setIsPageLoading(false);
    };
    loadData();
  }, [fetchBlogPosts, fetchCategories, fetchAuthors]);

  // Blog handlers
  const handleCreateBlog = async () => {
    if (!blogForm.title || !blogForm.content) {
      toast.error('Title and content are required');
      return;
    }
    setIsLoading(true);
    try {
      await createBlogPost({
        title: blogForm.title,
        slug: blogForm.slug || undefined,
        excerpt: blogForm.excerpt || undefined,
        content: blogForm.content,
        featuredImage: blogForm.featuredImage || undefined,
        categoryId: blogForm.categoryId || undefined,
        authorId: blogForm.authorId || undefined,
        tags: blogForm.tags ? blogForm.tags.split(',').map(t => t.trim()) : [],
        status: blogForm.status,
      });
      toast.success('Blog post created successfully!');
      setIsCreateBlogModalOpen(false);
      resetBlogForm();
      await fetchBlogPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create blog post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBlog = async () => {
    if (!selectedBlog || !blogForm.title || !blogForm.content) {
      toast.error('Title and content are required');
      return;
    }
    setIsLoading(true);
    try {
      await updateBlogPost(selectedBlog.id, {
        title: blogForm.title,
        slug: blogForm.slug || undefined,
        excerpt: blogForm.excerpt || undefined,
        content: blogForm.content,
        featuredImage: blogForm.featuredImage || undefined,
        categoryId: blogForm.categoryId || undefined,
        authorId: blogForm.authorId || undefined,
        tags: blogForm.tags ? blogForm.tags.split(',').map(t => t.trim()) : [],
        status: blogForm.status,
      });
      toast.success('Blog post updated successfully!');
      setIsEditBlogModalOpen(false);
      setSelectedBlog(null);
      resetBlogForm();
      await fetchBlogPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update blog post');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishToggle = async (blog: BlogPost) => {
    try {
      if (blog.status === 'PUBLISHED') {
        await unpublishBlogPost(blog.id);
        toast.success('Blog unpublished successfully!');
      } else {
        await publishBlogPost(blog.id);
        toast.success('Blog published successfully!');
      }
      await fetchBlogPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update blog status');
    }
  };

  const handleDeleteBlog = async () => {
    if (!selectedBlog) return;
    setIsLoading(true);
    try {
      await deleteBlogPost(selectedBlog.id);
      toast.success('Blog deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedBlog(null);
      await fetchBlogPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete blog');
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk create handler
  const handleBulkCreate = async () => {
    if (!autoBlogConfig.category) {
      toast.error('Please select a category');
      return;
    }
    if (!blogPostDraft.title || !blogPostDraft.content) {
      toast.error('Title and content are required');
      return;
    }
    if (!scheduling.authorRotation && !autoBlogConfig.author) {
      toast.error('Please select an author or enable author rotation');
      return;
    }

    setIsLoading(true);
    try {
      const result = await bulkCreateBlogPosts({
        categoryId: autoBlogConfig.category,
        authorId: autoBlogConfig.author || undefined,
        title: blogPostDraft.title,
        content: blogPostDraft.content,
        tags: blogPostDraft.tags ? blogPostDraft.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        minHoursBetweenPosts: parseInt(scheduling.minHours) || 8,
        maxHoursBetweenPosts: parseInt(scheduling.maxHours) || 12,
        authorRotation: scheduling.authorRotation,
        count: 1,
      });
      toast.success(result.message);
      // Reset form
      setBlogPostDraft({ title: '', content: '', tags: '' });
      await fetchBlogPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create bulk blogs');
    } finally {
      setIsLoading(false);
    }
  };

  // Category handlers
  const handleCreateCategory = async () => {
    if (!categoryForm.name) {
      toast.error('Category name is required');
      return;
    }
    setIsLoading(true);
    try {
      await createBlogCategory({
        name: categoryForm.name,
        slug: categoryForm.slug || undefined,
        description: categoryForm.description || undefined,
        parentId: categoryForm.parentId || undefined,
      });
      toast.success('Category created successfully!');
      setIsCreateCategoryModalOpen(false);
      resetCategoryForm();
      await fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory || !categoryForm.name) {
      toast.error('Category name is required');
      return;
    }
    setIsLoading(true);
    try {
      await updateBlogCategory(selectedCategory.id, {
        name: categoryForm.name,
        slug: categoryForm.slug || undefined,
        description: categoryForm.description || undefined,
        parentId: categoryForm.parentId || undefined,
      });
      toast.success('Category updated successfully!');
      setIsEditCategoryModalOpen(false);
      setSelectedCategory(null);
      resetCategoryForm();
      await fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    setIsLoading(true);
    try {
      await deleteBlogCategory(selectedCategory.id);
      toast.success('Category deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      await fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setIsLoading(false);
    }
  };

  // Author handlers
  const handleCreateAuthor = async () => {
    if (!authorForm.name) {
      toast.error('Author name is required');
      return;
    }
    setIsLoading(true);
    try {
      await createBlogAuthor({
        name: authorForm.name,
        slug: authorForm.slug || undefined,
        bio: authorForm.bio || undefined,
        avatar: authorForm.avatar || undefined,
        email: authorForm.email || undefined,
        website: authorForm.website || undefined,
      });
      toast.success('Author created successfully!');
      setIsCreateAuthorModalOpen(false);
      resetAuthorForm();
      await fetchAuthors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create author');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAuthor = async () => {
    if (!selectedAuthor || !authorForm.name) {
      toast.error('Author name is required');
      return;
    }
    setIsLoading(true);
    try {
      await updateBlogAuthor(selectedAuthor.id, {
        name: authorForm.name,
        slug: authorForm.slug || undefined,
        bio: authorForm.bio || undefined,
        avatar: authorForm.avatar || undefined,
        email: authorForm.email || undefined,
        website: authorForm.website || undefined,
      });
      toast.success('Author updated successfully!');
      setIsEditAuthorModalOpen(false);
      setSelectedAuthor(null);
      resetAuthorForm();
      await fetchAuthors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update author');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAuthor = async () => {
    if (!selectedAuthor) return;
    setIsLoading(true);
    try {
      await deleteBlogAuthor(selectedAuthor.id);
      toast.success('Author deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedAuthor(null);
      await fetchAuthors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete author');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form functions
  const resetBlogForm = () => {
    setBlogForm({
      title: '', slug: '', excerpt: '', content: '', featuredImage: '',
      categoryId: '', authorId: '', tags: '', status: 'DRAFT',
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', slug: '', description: '', parentId: '' });
  };

  const resetAuthorForm = () => {
    setAuthorForm({ name: '', slug: '', bio: '', avatar: '', email: '', website: '' });
  };

  // Open edit modals
  const openEditBlog = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setBlogForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || '',
      content: blog.content,
      featuredImage: blog.featuredImage || '',
      categoryId: blog.categoryId || '',
      authorId: blog.authorId || '',
      tags: blog.tags.join(', '),
      status: blog.status,
    });
    setIsEditBlogModalOpen(true);
  };

  const openEditCategory = (category: BlogCategory) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId || '',
    });
    setIsEditCategoryModalOpen(true);
  };

  const openEditAuthor = (author: BlogAuthor) => {
    setSelectedAuthor(author);
    setAuthorForm({
      name: author.name,
      slug: author.slug,
      bio: author.bio || '',
      avatar: author.avatar || '',
      email: author.email || '',
      website: author.website || '',
    });
    setIsEditAuthorModalOpen(true);
  };

  // Open delete modals
  const openDeleteBlog = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setDeleteType('blog');
    setIsDeleteModalOpen(true);
  };

  const openDeleteCategory = (category: BlogCategory) => {
    setSelectedCategory(category);
    setDeleteType('category');
    setIsDeleteModalOpen(true);
  };

  const openDeleteAuthor = (author: BlogAuthor) => {
    setSelectedAuthor(author);
    setDeleteType('author');
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteType === 'blog') handleDeleteBlog();
    else if (deleteType === 'category') handleDeleteCategory();
    else if (deleteType === 'author') handleDeleteAuthor();
  };

  const getDeleteItemName = () => {
    if (deleteType === 'blog') return selectedBlog?.title;
    if (deleteType === 'category') return selectedCategory?.name;
    if (deleteType === 'author') return selectedAuthor?.name;
    return '';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not published';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-[#22C55E]/20 text-[#22C55E]';
      case 'DRAFT': return 'bg-[#F59E0B]/20 text-[#F59E0B]';
      case 'ARCHIVED': return 'bg-[#64748B]/20 text-[#64748B]';
      default: return 'bg-[#64748B]/20 text-[#64748B]';
    }
  };

  const tabs = [
    { id: "manual", label: "Add Blog Manually" },
    { id: "auto", label: "Auto Blog Upload" },
    { id: "category", label: "Category Management" },
    { id: "author", label: "Author Pool" },
    { id: "image", label: "Image Auto Editor" },
  ];

  // Get parent categories for dropdown
  const parentCategories = categories.filter(c => !c.parentId);
  const subCategories = categories.filter(c => c.parentId);

  if (isPageLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader title="Blog Management" description="Manage blogs, categories, authors, and auto-upload" />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-6 mb-8 border-b border-[rgba(255,255,255,0.18)] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-2 text-sm font-medium transition-colors whitespace-nowrap relative ${
              activeTab === tab.id ? "text-[#3B82F6]" : "text-[#64748B] hover:text-white"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />}
          </button>
        ))}
      </div>

      {/* Add Blog Manually Tab */}
      {activeTab === "manual" && (
        <AdminGlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-semibold">Manage Blogs</h2>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] [&>option]:bg-[#1E293B] [&>option]:text-white"
              >
                <option value="all">All Blogs</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <button
                onClick={() => { resetBlogForm(); setIsCreateBlogModalOpen(true); }}
                className="px-4 py-2 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Blog
              </button>
            </div>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#64748B]">No blog posts found. Create your first blog post!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]"
                >
                  <div className="flex items-start gap-4">
                    {blog.featuredImage && (
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white text-lg font-semibold mb-1">{blog.title}</h3>
                          <p className="text-[#94A3B8] text-sm">
                            By {blog.author?.name || 'Unknown'} • {formatDate(blog.publishedAt)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(blog.status)}`}>
                          {blog.status}
                        </span>
                      </div>

                      {blog.category && (
                        <p className="text-[#3B82F6] text-sm mb-3">📁 {blog.category.name}</p>
                      )}

                      {blog.tags.length > 0 && (
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          {blog.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 rounded-full bg-[#06B6D4]/20 text-[#06B6D4] text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePublishToggle(blog)}
                          className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                            blog.status === 'PUBLISHED'
                              ? 'bg-[#F59E0B] hover:bg-[#D97706]'
                              : 'bg-[#22C55E] hover:bg-[#16A34A]'
                          }`}
                        >
                          {blog.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => openEditBlog(blog)}
                          className="px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteBlog(blog)}
                          className="px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="text-right text-xs text-[#64748B]">
                      <p>Slug: {blog.slug}</p>
                      <p>Views: {blog.viewCount}</p>
                      <p>Created: {formatDate(blog.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminGlassCard>
      )}

      {/* Auto Blog Upload Tab */}
      {activeTab === "auto" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">📋 Blog Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Category</label>
                <select
                  value={autoBlogConfig.category}
                  onChange={(e) => setAutoBlogConfig({ ...autoBlogConfig, category: e.target.value })}
                  className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] [&>option]:bg-[#1E293B] [&>option]:text-white"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Author</label>
                <select
                  value={autoBlogConfig.author}
                  onChange={(e) => setAutoBlogConfig({ ...autoBlogConfig, author: e.target.value })}
                  className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] [&>option]:bg-[#1E293B] [&>option]:text-white"
                >
                  <option value="">Random rotation</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>{author.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">✏️ Blog Post Draft</h3>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Title *</label>
                <input
                  type="text"
                  value={blogPostDraft.title}
                  onChange={(e) => setBlogPostDraft({ ...blogPostDraft, title: e.target.value })}
                  placeholder="Enter blog title"
                  className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] placeholder:text-[#64748B]"
                />
              </div>
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Content</label>
                <textarea
                  value={blogPostDraft.content}
                  onChange={(e) => setBlogPostDraft({ ...blogPostDraft, content: e.target.value })}
                  rows={6}
                  placeholder="Write your blog content here..."
                  className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none placeholder:text-[#64748B]"
                />
              </div>
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Tags</label>
                <input
                  type="text"
                  value={blogPostDraft.tags}
                  onChange={(e) => setBlogPostDraft({ ...blogPostDraft, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                  className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] placeholder:text-[#64748B]"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">⏰ Scheduling Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Min Hours Between Posts</label>
                <input
                  type="number"
                  value={scheduling.minHours}
                  onChange={(e) => setScheduling({ ...scheduling, minHours: e.target.value })}
                  className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Max Hours Between Posts</label>
                <input
                  type="number"
                  value={scheduling.maxHours}
                  onChange={(e) => setScheduling({ ...scheduling, maxHours: e.target.value })}
                  className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="authorRotation"
                checked={scheduling.authorRotation}
                onChange={(e) => setScheduling({ ...scheduling, authorRotation: e.target.checked })}
                className="w-4 h-4 rounded border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-[#3B82F6] focus:ring-[#3B82F6]"
              />
              <label htmlFor="authorRotation" className="text-white text-sm">
                Author Rotation <span className="text-[#22C55E]">{scheduling.authorRotation ? 'ON' : 'OFF'}</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleBulkCreate}
            disabled={isLoading}
            className="px-8 py-3 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create Bulk Blogs"}
          </button>
        </div>
      )}

      {/* Category Management Tab */}
      {activeTab === "category" && (
        <AdminGlassCard>
          <div className="flex items-center gap-6 mb-6 border-b border-[rgba(255,255,255,0.18)]">
            <button
              onClick={() => setCategorySubTab("category")}
              className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
                categorySubTab === "category" ? "text-[#3B82F6]" : "text-[#64748B] hover:text-white"
              }`}
            >
              Category Management
              {categorySubTab === "category" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />}
            </button>
            <button
              onClick={() => setCategorySubTab("subcategory")}
              className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
                categorySubTab === "subcategory" ? "text-[#3B82F6]" : "text-[#64748B] hover:text-white"
              }`}
            >
              Sub-Category Management
              {categorySubTab === "subcategory" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />}
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-semibold">
              {categorySubTab === "category" ? "Manage Categories" : "Manage Sub-Categories"}
            </h2>
            <button
              onClick={() => { resetCategoryForm(); setIsCreateCategoryModalOpen(true); }}
              className="px-4 py-2 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-medium transition-colors"
            >
              + Create {categorySubTab === "category" ? "Category" : "Sub-Category"}
            </button>
          </div>

          <div className="space-y-3">
            {(categorySubTab === "category" ? parentCategories : subCategories).map((category) => (
              <div
                key={category.id}
                className="p-4 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)] flex items-center justify-between"
              >
                <div>
                  <h3 className="text-white text-base font-semibold mb-1">{category.name}</h3>
                  <p className="text-[#64748B] text-sm">
                    Slug: {category.slug}
                    {category.parent && <span> • Parent: {category.parent.name}</span>}
                    {category._count && <span> • Posts: {category._count.posts}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditCategory(category)}
                    className="px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteCategory(category)}
                    className="px-3 py-1.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {(categorySubTab === "category" ? parentCategories : subCategories).length === 0 && (
              <p className="text-[#64748B] text-center py-8">
                No {categorySubTab === "category" ? "categories" : "sub-categories"} found. Create one to get started!
              </p>
            )}
          </div>
        </AdminGlassCard>
      )}

      {/* Author Pool Tab */}
      {activeTab === "author" && (
        <AdminGlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-semibold">Manage Authors</h2>
            <button
              onClick={() => { resetAuthorForm(); setIsCreateAuthorModalOpen(true); }}
              className="px-4 py-2 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-medium transition-colors"
            >
              + Create Author
            </button>
          </div>

          <div className="space-y-3">
            {authors.map((author) => (
              <div
                key={author.id}
                className="p-4 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)] flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {author.avatar && (
                    <img src={author.avatar} alt={author.name} className="w-12 h-12 rounded-full object-cover" />
                  )}
                  <div>
                    <h3 className="text-white text-base font-semibold mb-1">{author.name}</h3>
                    <p className="text-[#3B82F6] text-sm">{author.bio || 'No bio'}</p>
                    {author._count && <p className="text-[#64748B] text-xs">Posts: {author._count.posts}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditAuthor(author)}
                    className="px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteAuthor(author)}
                    className="px-3 py-1.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {authors.length === 0 && (
              <p className="text-[#64748B] text-center py-8">No authors found. Create one to get started!</p>
            )}
          </div>
        </AdminGlassCard>
      )}

      {/* Image Auto Editor Tab */}
      {activeTab === "image" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">Upload Images</h3>
            <button className="px-6 py-3 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-medium transition-colors flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Choose Images
            </button>
          </div>

          <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">Search Name for Images</h3>
            <input
              type="text"
              value={imageConfig.searchName}
              onChange={(e) => setImageConfig({ ...imageConfig, searchName: e.target.value })}
              placeholder="e.g., How to use IPTV in Bangladesh"
              className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] placeholder:text-[#64748B]"
            />
          </div>

          <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">Processing Settings</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Crop (%)</label>
                <div className="grid grid-cols-4 gap-1">
                  {['crop1', 'crop2', 'crop3', 'crop4'].map((key) => (
                    <input
                      key={key}
                      type="number"
                      value={imageConfig[key as keyof typeof imageConfig] as string}
                      onChange={(e) => setImageConfig({ ...imageConfig, [key]: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded px-2 py-1 text-white text-xs"
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Saturation (%)</label>
                <div className="grid grid-cols-2 gap-1">
                  {['saturation1', 'saturation2'].map((key) => (
                    <input
                      key={key}
                      type="number"
                      value={imageConfig[key as keyof typeof imageConfig] as string}
                      onChange={(e) => setImageConfig({ ...imageConfig, [key]: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded px-2 py-1 text-white text-xs"
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Brightness (%)</label>
                <div className="grid grid-cols-2 gap-1">
                  {['brightness1', 'brightness2'].map((key) => (
                    <input
                      key={key}
                      type="number"
                      value={imageConfig[key as keyof typeof imageConfig] as string}
                      onChange={(e) => setImageConfig({ ...imageConfig, [key]: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded px-2 py-1 text-white text-xs"
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Contrast (%)</label>
                <div className="grid grid-cols-2 gap-1">
                  {['contrast1', 'contrast2'].map((key) => (
                    <input
                      key={key}
                      type="number"
                      value={imageConfig[key as keyof typeof imageConfig] as string}
                      onChange={(e) => setImageConfig({ ...imageConfig, [key]: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded px-2 py-1 text-white text-xs"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-white text-sm">
                <input
                  type="checkbox"
                  checked={imageConfig.convertWebP}
                  onChange={(e) => setImageConfig({ ...imageConfig, convertWebP: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                Convert to WebP
              </label>
              <label className="flex items-center gap-2 text-white text-sm">
                <input
                  type="checkbox"
                  checked={imageConfig.stripEXIF}
                  onChange={(e) => setImageConfig({ ...imageConfig, stripEXIF: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                Strip EXIF metadata
              </label>
            </div>
          </div>

          <button className="px-8 py-3 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-medium transition-colors">
            Process Images
          </button>
        </div>
      )}

      {/* Create/Edit Blog Modal */}
      <AdminModal
        isOpen={isCreateBlogModalOpen || isEditBlogModalOpen}
        onClose={() => { setIsCreateBlogModalOpen(false); setIsEditBlogModalOpen(false); setSelectedBlog(null); }}
        title={isEditBlogModalOpen ? "Edit Blog Post" : "Create Blog Post"}
        primaryAction={{
          label: isEditBlogModalOpen ? "Update" : "Create",
          onClick: isEditBlogModalOpen ? handleEditBlog : handleCreateBlog,
          loading: isLoading,
          variant: "primary",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => { setIsCreateBlogModalOpen(false); setIsEditBlogModalOpen(false); setSelectedBlog(null); },
        }}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <AdminFormInput label="Title" name="title" required value={blogForm.title} onChange={(value) => setBlogForm({ ...blogForm, title: value })} placeholder="Enter blog title" />
          <AdminFormInput label="Slug" name="slug" value={blogForm.slug} onChange={(value) => setBlogForm({ ...blogForm, slug: value })} placeholder="auto-generated-if-empty" />
          <AdminFormInput label="Excerpt" name="excerpt" value={blogForm.excerpt} onChange={(value) => setBlogForm({ ...blogForm, excerpt: value })} placeholder="Brief description" />
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Content *</label>
            <textarea
              value={blogForm.content}
              onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
              rows={6}
              placeholder="Write your blog content..."
              className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
            />
          </div>
          <AdminFormInput label="Featured Image URL" name="featuredImage" value={blogForm.featuredImage} onChange={(value) => setBlogForm({ ...blogForm, featuredImage: value })} placeholder="https://..." />
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Category</label>
            <select
              value={blogForm.categoryId}
              onChange={(e) => setBlogForm({ ...blogForm, categoryId: e.target.value })}
              className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] [&>option]:bg-[#1E293B] [&>option]:text-white"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
          </div>
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Author</label>
            <select
              value={blogForm.authorId}
              onChange={(e) => setBlogForm({ ...blogForm, authorId: e.target.value })}
              className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] [&>option]:bg-[#1E293B] [&>option]:text-white"
            >
              <option value="">Select author</option>
              {authors.map((author) => (<option key={author.id} value={author.id}>{author.name}</option>))}
            </select>
          </div>
          <AdminFormInput label="Tags" name="tags" value={blogForm.tags} onChange={(value) => setBlogForm({ ...blogForm, tags: value })} placeholder="tag1, tag2, tag3" />
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Status</label>
            <select
              value={blogForm.status}
              onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as any })}
              className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] [&>option]:bg-[#1E293B] [&>option]:text-white"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </AdminModal>

      {/* Create/Edit Category Modal */}
      <AdminModal
        isOpen={isCreateCategoryModalOpen || isEditCategoryModalOpen}
        onClose={() => { setIsCreateCategoryModalOpen(false); setIsEditCategoryModalOpen(false); setSelectedCategory(null); }}
        title={isEditCategoryModalOpen ? "Edit Category" : "Create Category"}
        primaryAction={{
          label: isEditCategoryModalOpen ? "Update" : "Create",
          onClick: isEditCategoryModalOpen ? handleEditCategory : handleCreateCategory,
          loading: isLoading,
          variant: "primary",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => { setIsCreateCategoryModalOpen(false); setIsEditCategoryModalOpen(false); setSelectedCategory(null); },
        }}
      >
        <div className="space-y-4">
          <AdminFormInput label="Category Name" name="categoryName" required value={categoryForm.name} onChange={(value) => setCategoryForm({ ...categoryForm, name: value })} placeholder="Enter category name" />
          <AdminFormInput label="Slug" name="categorySlug" value={categoryForm.slug} onChange={(value) => setCategoryForm({ ...categoryForm, slug: value })} placeholder="auto-generated-if-empty" />
          <AdminFormInput label="Description" name="categoryDescription" value={categoryForm.description} onChange={(value) => setCategoryForm({ ...categoryForm, description: value })} placeholder="Category description" />
          {categorySubTab === "subcategory" && (
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Parent Category</label>
              <select
                value={categoryForm.parentId}
                onChange={(e) => setCategoryForm({ ...categoryForm, parentId: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] [&>option]:bg-[#1E293B] [&>option]:text-white"
              >
                <option value="">Select parent category</option>
                {parentCategories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>
          )}
        </div>
      </AdminModal>

      {/* Create/Edit Author Modal */}
      <AdminModal
        isOpen={isCreateAuthorModalOpen || isEditAuthorModalOpen}
        onClose={() => { setIsCreateAuthorModalOpen(false); setIsEditAuthorModalOpen(false); setSelectedAuthor(null); }}
        title={isEditAuthorModalOpen ? "Edit Author" : "Create Author"}
        primaryAction={{
          label: isEditAuthorModalOpen ? "Update" : "Create",
          onClick: isEditAuthorModalOpen ? handleEditAuthor : handleCreateAuthor,
          loading: isLoading,
          variant: "primary",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => { setIsCreateAuthorModalOpen(false); setIsEditAuthorModalOpen(false); setSelectedAuthor(null); },
        }}
      >
        <div className="space-y-4">
          <AdminFormInput label="Author Name" name="authorName" required value={authorForm.name} onChange={(value) => setAuthorForm({ ...authorForm, name: value })} placeholder="Enter author name" />
          <AdminFormInput label="Slug" name="authorSlug" value={authorForm.slug} onChange={(value) => setAuthorForm({ ...authorForm, slug: value })} placeholder="auto-generated-if-empty" />
          <AdminFormInput label="Bio" name="authorBio" value={authorForm.bio} onChange={(value) => setAuthorForm({ ...authorForm, bio: value })} placeholder="Author bio/description" />
          <AdminFormInput label="Avatar URL" name="authorAvatar" value={authorForm.avatar} onChange={(value) => setAuthorForm({ ...authorForm, avatar: value })} placeholder="https://..." />
          <AdminFormInput label="Email" name="authorEmail" value={authorForm.email} onChange={(value) => setAuthorForm({ ...authorForm, email: value })} placeholder="author@example.com" />
          <AdminFormInput label="Website" name="authorWebsite" value={authorForm.website} onChange={(value) => setAuthorForm({ ...authorForm, website: value })} placeholder="https://..." />
        </div>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedBlog(null); setSelectedCategory(null); setSelectedAuthor(null); }}
        title="Confirm Delete"
        primaryAction={{
          label: "Delete",
          onClick: handleDelete,
          loading: isLoading,
          variant: "danger",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => { setIsDeleteModalOpen(false); setSelectedBlog(null); setSelectedCategory(null); setSelectedAuthor(null); },
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to delete <span className="text-white font-medium">{getDeleteItemName()}</span>? This action cannot be undone.
        </p>
      </AdminModal>
    </div>
  );
}
