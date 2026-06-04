'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminGlassCard } from '@/components/admin/glass-card';
import { AdminFormInput } from '@/components/admin/form-input';
import { AdminModal } from '@/components/admin/modal';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Copy,
  Loader2,
  Eye,
  X,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [activeTab, setActiveTab] = useState<
    'manual' | 'auto' | 'category' | 'author' | 'image'
  >('manual');
  const [categorySubTab, setCategorySubTab] = useState<
    'category' | 'subcategory'
  >('category');

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
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] =
    useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isCreateAuthorModalOpen, setIsCreateAuthorModalOpen] = useState(false);
  const [isEditAuthorModalOpen, setIsEditAuthorModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'blog' | 'category' | 'author'>(
    'blog',
  );

  // Selected items
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(
    null,
  );
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
    category: '',
    author: '',
  });

  const [blogPostDraft, setBlogPostDraft] = useState({
    title: '',
    content: '',
    tags: '',
  });

  const [scheduling, setScheduling] = useState({
    minHours: '8',
    maxHours: '11',
    authorRotation: true,
  });

  // Image Editor State
  const [imageConfig, setImageConfig] = useState({
    searchName: '',
    crop1: '2',
    crop2: '4',
    crop3: '10',
    crop4: '15',
    saturation1: '1',
    saturation2: '15',
    brightness1: '5',
    brightness2: '10',
    contrast1: '5',
    contrast2: '10',
    rotation1: '-1',
    rotation2: '1',
    noise1: '1',
    noise2: '2',
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
        tags: blogForm.tags
          ? blogForm.tags.split(',').map((t) => t.trim())
          : [],
        status: blogForm.status,
      });
      toast.success('Blog post created successfully!');
      setIsCreateBlogModalOpen(false);
      resetBlogForm();
      await fetchBlogPosts();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to create blog post',
      );
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
        tags: blogForm.tags
          ? blogForm.tags.split(',').map((t) => t.trim())
          : [],
        status: blogForm.status,
      });
      toast.success('Blog post updated successfully!');
      setIsEditBlogModalOpen(false);
      setSelectedBlog(null);
      resetBlogForm();
      await fetchBlogPosts();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to update blog post',
      );
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
      toast.error(
        error.response?.data?.message || 'Failed to update blog status',
      );
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
        tags: blogPostDraft.tags
          ? blogPostDraft.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
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
      toast.error(
        error.response?.data?.message || 'Failed to create bulk blogs',
      );
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
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      categoryId: '',
      authorId: '',
      tags: '',
      status: 'DRAFT',
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', slug: '', description: '', parentId: '' });
  };

  const resetAuthorForm = () => {
    setAuthorForm({
      name: '',
      slug: '',
      bio: '',
      avatar: '',
      email: '',
      website: '',
    });
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-[#22C55E]/20 text-[#22C55E]';
      case 'DRAFT':
        return 'bg-[#F59E0B]/20 text-[#F59E0B]';
      case 'ARCHIVED':
        return 'bg-[#64748B]/20 text-[#64748B]';
      default:
        return 'bg-[#64748B]/20 text-[#64748B]';
    }
  };

  const tabs = [
    { id: 'manual', label: 'Add Blog Manually' },
    { id: 'auto', label: 'Auto Blog Upload' },
    { id: 'category', label: 'Category Management' },
    { id: 'author', label: 'Author Pool' },
    { id: 'image', label: 'Image Auto Editor' },
  ];

  // Get parent categories for dropdown
  const parentCategories = categories.filter((c) => !c.parentId);
  const subCategories = categories.filter((c) => c.parentId);

  if (isPageLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Blog Management"
        description="Manage blogs, categories, authors, and auto-upload"
      />

      {/* Navigation Tabs */}
      <div className="mb-8 flex items-center gap-6 overflow-x-auto border-b border-[rgba(255,255,255,0.18)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative px-2 pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-[#3B82F6]'
                : 'text-[#64748B] hover:text-white'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-[#3B82F6]" />
            )}
          </button>
        ))}
      </div>

      {/* Add Blog Manually Tab */}
      {activeTab === 'manual' && (
        <AdminGlassCard>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Manage Blogs</h2>
            <div className="flex items-center gap-3">
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v)}
              >
                <SelectTrigger className="rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-2 text-base text-white focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none data-[size=default]:h-auto data-[size=default]:min-h-11 lg:text-sm">
                  <SelectValue placeholder="All Blogs" />
                </SelectTrigger>
                <SelectContent className="max-h-72 border-[rgba(255,255,255,0.18)] bg-[#1E293B] text-white">
                  <SelectItem
                    value="all"
                    className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                  >
                    All Blogs
                  </SelectItem>
                  <SelectItem
                    value="PUBLISHED"
                    className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                  >
                    Published
                  </SelectItem>
                  <SelectItem
                    value="DRAFT"
                    className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                  >
                    Draft
                  </SelectItem>
                  <SelectItem
                    value="ARCHIVED"
                    className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                  >
                    Archived
                  </SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => {
                  resetBlogForm();
                  setIsCreateBlogModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-[#06B6D4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0891B2]"
              >
                <Plus className="h-4 w-4" />
                Create Blog
              </button>
            </div>
          </div>

          {blogs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[#64748B]">
                No blog posts found. Create your first blog post!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.3)] p-6"
                >
                  <div className="flex items-start gap-4">
                    {blog.featuredImage && (
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="mb-1 text-lg font-semibold text-white">
                            {blog.title}
                          </h3>
                          <p className="text-sm text-[#94A3B8]">
                            By {blog.author?.name || 'Unknown'} •{' '}
                            {formatDate(blog.publishedAt)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(blog.status)}`}
                        >
                          {blog.status}
                        </span>
                      </div>

                      {blog.category && (
                        <p className="mb-3 text-sm text-[#3B82F6]">
                          📁 {blog.category.name}
                        </p>
                      )}

                      {blog.tags.length > 0 && (
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                          {blog.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-[#06B6D4]/20 px-3 py-1 text-xs text-[#06B6D4]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePublishToggle(blog)}
                          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                            blog.status === 'PUBLISHED'
                              ? 'bg-[#F59E0B] hover:bg-[#D97706]'
                              : 'bg-[#22C55E] hover:bg-[#16A34A]'
                          }`}
                        >
                          {blog.status === 'PUBLISHED'
                            ? 'Unpublish'
                            : 'Publish'}
                        </button>
                        <button
                          onClick={() => openEditBlog(blog)}
                          className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteBlog(blog)}
                          className="flex items-center gap-2 rounded-lg bg-[#EF4444] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#DC2626]"
                        >
                          <Trash2 className="h-4 w-4" />
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
      {activeTab === 'auto' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.3)] p-6">
            <h3 className="mb-4 text-base font-semibold text-white">
              📋 Blog Configuration
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Category
                </label>
                <Select
                  value={autoBlogConfig.category || '__placeholder__'}
                  onValueChange={(v) =>
                    setAutoBlogConfig({
                      ...autoBlogConfig,
                      category: v === '__placeholder__' ? '' : v,
                    })
                  }
                >
                  <SelectTrigger className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-base text-white focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none data-[size=default]:h-auto data-[size=default]:min-h-12 lg:text-sm">
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
                        value={cat.id}
                        className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Author
                </label>
                <Select
                  value={autoBlogConfig.author || '__rotation__'}
                  onValueChange={(v) =>
                    setAutoBlogConfig({
                      ...autoBlogConfig,
                      author: v === '__rotation__' ? '' : v,
                    })
                  }
                >
                  <SelectTrigger className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-base text-white focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none data-[size=default]:h-auto data-[size=default]:min-h-12 lg:text-sm">
                    <SelectValue placeholder="Random rotation" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 border-[rgba(255,255,255,0.18)] bg-[#1E293B] text-white">
                    <SelectItem
                      value="__rotation__"
                      className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                    >
                      Random rotation
                    </SelectItem>
                    {authors.map((author) => (
                      <SelectItem
                        key={author.id}
                        value={author.id}
                        className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                      >
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.3)] p-6">
            <h3 className="mb-4 text-base font-semibold text-white">
              ✏️ Blog Post Draft
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Title *
                </label>
                <input
                  type="text"
                  value={blogPostDraft.title}
                  onChange={(e) =>
                    setBlogPostDraft({
                      ...blogPostDraft,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter blog title"
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Content
                </label>
                <textarea
                  value={blogPostDraft.content}
                  onChange={(e) =>
                    setBlogPostDraft({
                      ...blogPostDraft,
                      content: e.target.value,
                    })
                  }
                  rows={6}
                  placeholder="Write your blog content here..."
                  className="w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Tags
                </label>
                <input
                  type="text"
                  value={blogPostDraft.tags}
                  onChange={(e) =>
                    setBlogPostDraft({ ...blogPostDraft, tags: e.target.value })
                  }
                  placeholder="tag1, tag2, tag3"
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.3)] p-6">
            <h3 className="mb-4 text-base font-semibold text-white">
              ⏰ Scheduling Options
            </h3>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Min Hours Between Posts
                </label>
                <input
                  type="number"
                  value={scheduling.minHours}
                  onChange={(e) =>
                    setScheduling({ ...scheduling, minHours: e.target.value })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Max Hours Between Posts
                </label>
                <input
                  type="number"
                  value={scheduling.maxHours}
                  onChange={(e) =>
                    setScheduling({ ...scheduling, maxHours: e.target.value })
                  }
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="authorRotation"
                checked={scheduling.authorRotation}
                onChange={(e) =>
                  setScheduling({
                    ...scheduling,
                    authorRotation: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-[#3B82F6] focus:ring-[#3B82F6]"
              />
              <label htmlFor="authorRotation" className="text-sm text-white">
                Author Rotation{' '}
                <span className="text-[#22C55E]">
                  {scheduling.authorRotation ? 'ON' : 'OFF'}
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={handleBulkCreate}
            disabled={isLoading}
            className="rounded-lg bg-[#06B6D4] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0891B2] disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Bulk Blogs'}
          </button>
        </div>
      )}

      {/* Category Management Tab */}
      {activeTab === 'category' && (
        <AdminGlassCard>
          <div className="mb-6 flex items-center gap-6 border-b border-[rgba(255,255,255,0.18)]">
            <button
              onClick={() => setCategorySubTab('category')}
              className={`relative px-2 pb-3 text-sm font-medium transition-colors ${
                categorySubTab === 'category'
                  ? 'text-[#3B82F6]'
                  : 'text-[#64748B] hover:text-white'
              }`}
            >
              Category Management
              {categorySubTab === 'category' && (
                <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-[#3B82F6]" />
              )}
            </button>
            <button
              onClick={() => setCategorySubTab('subcategory')}
              className={`relative px-2 pb-3 text-sm font-medium transition-colors ${
                categorySubTab === 'subcategory'
                  ? 'text-[#3B82F6]'
                  : 'text-[#64748B] hover:text-white'
              }`}
            >
              Sub-Category Management
              {categorySubTab === 'subcategory' && (
                <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-[#3B82F6]" />
              )}
            </button>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {categorySubTab === 'category'
                ? 'Manage Categories'
                : 'Manage Sub-Categories'}
            </h2>
            <button
              onClick={() => {
                resetCategoryForm();
                setIsCreateCategoryModalOpen(true);
              }}
              className="rounded-lg bg-[#06B6D4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0891B2]"
            >
              + Create{' '}
              {categorySubTab === 'category' ? 'Category' : 'Sub-Category'}
            </button>
          </div>

          <div className="space-y-3">
            {(categorySubTab === 'category'
              ? parentCategories
              : subCategories
            ).map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.3)] p-4"
              >
                <div>
                  <h3 className="mb-1 text-base font-semibold text-white">
                    {category.name}
                  </h3>
                  <p className="text-sm text-[#64748B]">
                    Slug: {category.slug}
                    {category.parent && (
                      <span> • Parent: {category.parent.name}</span>
                    )}
                    {category._count && (
                      <span> • Posts: {category._count.posts}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditCategory(category)}
                    className="rounded-lg bg-[#3B82F6] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteCategory(category)}
                    className="rounded-lg bg-[#EF4444] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#DC2626]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {(categorySubTab === 'category' ? parentCategories : subCategories)
              .length === 0 && (
              <p className="py-8 text-center text-[#64748B]">
                No{' '}
                {categorySubTab === 'category'
                  ? 'categories'
                  : 'sub-categories'}{' '}
                found. Create one to get started!
              </p>
            )}
          </div>
        </AdminGlassCard>
      )}

      {/* Author Pool Tab */}
      {activeTab === 'author' && (
        <AdminGlassCard>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Manage Authors</h2>
            <button
              onClick={() => {
                resetAuthorForm();
                setIsCreateAuthorModalOpen(true);
              }}
              className="rounded-lg bg-[#06B6D4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0891B2]"
            >
              + Create Author
            </button>
          </div>

          <div className="space-y-3">
            {authors.map((author) => (
              <div
                key={author.id}
                className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.3)] p-4"
              >
                <div className="flex items-center gap-4">
                  {author.avatar && (
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="mb-1 text-base font-semibold text-white">
                      {author.name}
                    </h3>
                    <p className="text-sm text-[#3B82F6]">
                      {author.bio || 'No bio'}
                    </p>
                    {author._count && (
                      <p className="text-xs text-[#64748B]">
                        Posts: {author._count.posts}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditAuthor(author)}
                    className="rounded-lg bg-[#3B82F6] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteAuthor(author)}
                    className="rounded-lg bg-[#EF4444] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#DC2626]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {authors.length === 0 && (
              <p className="py-8 text-center text-[#64748B]">
                No authors found. Create one to get started!
              </p>
            )}
          </div>
        </AdminGlassCard>
      )}

      {/* Image Auto Editor Tab */}
      {activeTab === 'image' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.3)] p-6">
            <h3 className="mb-4 text-base font-semibold text-white">
              Upload Images
            </h3>
            <button className="flex items-center gap-2 rounded-lg bg-[#06B6D4] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0891B2]">
              <Upload className="h-5 w-5" />
              Choose Images
            </button>
          </div>

          <div className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.3)] p-6">
            <h3 className="mb-4 text-base font-semibold text-white">
              Search Name for Images
            </h3>
            <input
              type="text"
              value={imageConfig.searchName}
              onChange={(e) =>
                setImageConfig({ ...imageConfig, searchName: e.target.value })
              }
              placeholder="e.g., How to use IPTV in Bangladesh"
              className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(0,0,0,0.3)] p-6">
            <h3 className="mb-4 text-base font-semibold text-white">
              Processing Settings
            </h3>
            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Crop (%)
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {['crop1', 'crop2', 'crop3', 'crop4'].map((key) => (
                    <input
                      key={key}
                      type="number"
                      value={
                        imageConfig[key as keyof typeof imageConfig] as string
                      }
                      onChange={(e) =>
                        setImageConfig({
                          ...imageConfig,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full rounded border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-2 py-1 text-xs text-white"
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Saturation (%)
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {['saturation1', 'saturation2'].map((key) => (
                    <input
                      key={key}
                      type="number"
                      value={
                        imageConfig[key as keyof typeof imageConfig] as string
                      }
                      onChange={(e) =>
                        setImageConfig({
                          ...imageConfig,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full rounded border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-2 py-1 text-xs text-white"
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Brightness (%)
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {['brightness1', 'brightness2'].map((key) => (
                    <input
                      key={key}
                      type="number"
                      value={
                        imageConfig[key as keyof typeof imageConfig] as string
                      }
                      onChange={(e) =>
                        setImageConfig({
                          ...imageConfig,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full rounded border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-2 py-1 text-xs text-white"
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Contrast (%)
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {['contrast1', 'contrast2'].map((key) => (
                    <input
                      key={key}
                      type="number"
                      value={
                        imageConfig[key as keyof typeof imageConfig] as string
                      }
                      onChange={(e) =>
                        setImageConfig({
                          ...imageConfig,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full rounded border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-2 py-1 text-xs text-white"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={imageConfig.convertWebP}
                  onChange={(e) =>
                    setImageConfig({
                      ...imageConfig,
                      convertWebP: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded"
                />
                Convert to WebP
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={imageConfig.stripEXIF}
                  onChange={(e) =>
                    setImageConfig({
                      ...imageConfig,
                      stripEXIF: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded"
                />
                Strip EXIF metadata
              </label>
            </div>
          </div>

          <button className="rounded-lg bg-[#06B6D4] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0891B2]">
            Process Images
          </button>
        </div>
      )}

      {/* Create/Edit Blog Modal */}
      <AdminModal
        isOpen={isCreateBlogModalOpen || isEditBlogModalOpen}
        onClose={() => {
          setIsCreateBlogModalOpen(false);
          setIsEditBlogModalOpen(false);
          setSelectedBlog(null);
        }}
        title={isEditBlogModalOpen ? 'Edit Blog Post' : 'Create Blog Post'}
        primaryAction={{
          label: isEditBlogModalOpen ? 'Update' : 'Create',
          onClick: isEditBlogModalOpen ? handleEditBlog : handleCreateBlog,
          loading: isLoading,
          variant: 'primary',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => {
            setIsCreateBlogModalOpen(false);
            setIsEditBlogModalOpen(false);
            setSelectedBlog(null);
          },
        }}
      >
        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          <AdminFormInput
            label="Title"
            name="title"
            required
            value={blogForm.title}
            onChange={(value) => setBlogForm({ ...blogForm, title: value })}
            placeholder="Enter blog title"
          />
          <AdminFormInput
            label="Slug"
            name="slug"
            value={blogForm.slug}
            onChange={(value) => setBlogForm({ ...blogForm, slug: value })}
            placeholder="auto-generated-if-empty"
          />
          <AdminFormInput
            label="Excerpt"
            name="excerpt"
            value={blogForm.excerpt}
            onChange={(value) => setBlogForm({ ...blogForm, excerpt: value })}
            placeholder="Brief description"
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Content *
            </label>
            <textarea
              value={blogForm.content}
              onChange={(e) =>
                setBlogForm({ ...blogForm, content: e.target.value })
              }
              rows={6}
              placeholder="Write your blog content..."
              className="w-full resize-none rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
            />
          </div>
          <AdminFormInput
            label="Featured Image URL"
            name="featuredImage"
            value={blogForm.featuredImage}
            onChange={(value) =>
              setBlogForm({ ...blogForm, featuredImage: value })
            }
            placeholder="https://..."
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Category
            </label>
            <Select
              value={blogForm.categoryId || '__placeholder__'}
              onValueChange={(v) =>
                setBlogForm({
                  ...blogForm,
                  categoryId: v === '__placeholder__' ? '' : v,
                })
              }
            >
              <SelectTrigger className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-base text-white focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none data-[size=default]:h-auto data-[size=default]:min-h-12 lg:text-sm">
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
                    value={cat.id}
                    className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                  >
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Author
            </label>
            <Select
              value={blogForm.authorId || '__placeholder__'}
              onValueChange={(v) =>
                setBlogForm({
                  ...blogForm,
                  authorId: v === '__placeholder__' ? '' : v,
                })
              }
            >
              <SelectTrigger className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-base text-white focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none data-[size=default]:h-auto data-[size=default]:min-h-12 lg:text-sm">
                <SelectValue placeholder="Select author" />
              </SelectTrigger>
              <SelectContent className="max-h-72 border-[rgba(255,255,255,0.18)] bg-[#1E293B] text-white">
                <SelectItem
                  value="__placeholder__"
                  className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                >
                  Select author
                </SelectItem>
                {authors.map((author) => (
                  <SelectItem
                    key={author.id}
                    value={author.id}
                    className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                  >
                    {author.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AdminFormInput
            label="Tags"
            name="tags"
            value={blogForm.tags}
            onChange={(value) => setBlogForm({ ...blogForm, tags: value })}
            placeholder="tag1, tag2, tag3"
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Status
            </label>
            <Select
              value={blogForm.status}
              onValueChange={(v) =>
                setBlogForm({ ...blogForm, status: v as any })
              }
            >
              <SelectTrigger className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-base text-white focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none data-[size=default]:h-auto data-[size=default]:min-h-12 lg:text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="max-h-72 border-[rgba(255,255,255,0.18)] bg-[#1E293B] text-white">
                <SelectItem
                  value="DRAFT"
                  className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                >
                  Draft
                </SelectItem>
                <SelectItem
                  value="PUBLISHED"
                  className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                >
                  Published
                </SelectItem>
                <SelectItem
                  value="ARCHIVED"
                  className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                >
                  Archived
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </AdminModal>

      {/* Create/Edit Category Modal */}
      <AdminModal
        isOpen={isCreateCategoryModalOpen || isEditCategoryModalOpen}
        onClose={() => {
          setIsCreateCategoryModalOpen(false);
          setIsEditCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        title={isEditCategoryModalOpen ? 'Edit Category' : 'Create Category'}
        primaryAction={{
          label: isEditCategoryModalOpen ? 'Update' : 'Create',
          onClick: isEditCategoryModalOpen
            ? handleEditCategory
            : handleCreateCategory,
          loading: isLoading,
          variant: 'primary',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => {
            setIsCreateCategoryModalOpen(false);
            setIsEditCategoryModalOpen(false);
            setSelectedCategory(null);
          },
        }}
      >
        <div className="space-y-4">
          <AdminFormInput
            label="Category Name"
            name="categoryName"
            required
            value={categoryForm.name}
            onChange={(value) =>
              setCategoryForm({ ...categoryForm, name: value })
            }
            placeholder="Enter category name"
          />
          <AdminFormInput
            label="Slug"
            name="categorySlug"
            value={categoryForm.slug}
            onChange={(value) =>
              setCategoryForm({ ...categoryForm, slug: value })
            }
            placeholder="auto-generated-if-empty"
          />
          <AdminFormInput
            label="Description"
            name="categoryDescription"
            value={categoryForm.description}
            onChange={(value) =>
              setCategoryForm({ ...categoryForm, description: value })
            }
            placeholder="Category description"
          />
          {categorySubTab === 'subcategory' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Parent Category
              </label>
              <Select
                value={categoryForm.parentId || '__placeholder__'}
                onValueChange={(v) =>
                  setCategoryForm({
                    ...categoryForm,
                    parentId: v === '__placeholder__' ? '' : v,
                  })
                }
              >
                <SelectTrigger className="w-full rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-base text-white focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-none data-[size=default]:h-auto data-[size=default]:min-h-12 lg:text-sm">
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent className="max-h-72 border-[rgba(255,255,255,0.18)] bg-[#1E293B] text-white">
                  <SelectItem
                    value="__placeholder__"
                    className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                  >
                    Select parent category
                  </SelectItem>
                  {parentCategories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id}
                      className="text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </AdminModal>

      {/* Create/Edit Author Modal */}
      <AdminModal
        isOpen={isCreateAuthorModalOpen || isEditAuthorModalOpen}
        onClose={() => {
          setIsCreateAuthorModalOpen(false);
          setIsEditAuthorModalOpen(false);
          setSelectedAuthor(null);
        }}
        title={isEditAuthorModalOpen ? 'Edit Author' : 'Create Author'}
        primaryAction={{
          label: isEditAuthorModalOpen ? 'Update' : 'Create',
          onClick: isEditAuthorModalOpen
            ? handleEditAuthor
            : handleCreateAuthor,
          loading: isLoading,
          variant: 'primary',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => {
            setIsCreateAuthorModalOpen(false);
            setIsEditAuthorModalOpen(false);
            setSelectedAuthor(null);
          },
        }}
      >
        <div className="space-y-4">
          <AdminFormInput
            label="Author Name"
            name="authorName"
            required
            value={authorForm.name}
            onChange={(value) => setAuthorForm({ ...authorForm, name: value })}
            placeholder="Enter author name"
          />
          <AdminFormInput
            label="Slug"
            name="authorSlug"
            value={authorForm.slug}
            onChange={(value) => setAuthorForm({ ...authorForm, slug: value })}
            placeholder="auto-generated-if-empty"
          />
          <AdminFormInput
            label="Bio"
            name="authorBio"
            value={authorForm.bio}
            onChange={(value) => setAuthorForm({ ...authorForm, bio: value })}
            placeholder="Author bio/description"
          />
          <AdminFormInput
            label="Avatar URL"
            name="authorAvatar"
            value={authorForm.avatar}
            onChange={(value) =>
              setAuthorForm({ ...authorForm, avatar: value })
            }
            placeholder="https://..."
          />
          <AdminFormInput
            label="Email"
            name="authorEmail"
            value={authorForm.email}
            onChange={(value) => setAuthorForm({ ...authorForm, email: value })}
            placeholder="author@example.com"
          />
          <AdminFormInput
            label="Website"
            name="authorWebsite"
            value={authorForm.website}
            onChange={(value) =>
              setAuthorForm({ ...authorForm, website: value })
            }
            placeholder="https://..."
          />
        </div>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBlog(null);
          setSelectedCategory(null);
          setSelectedAuthor(null);
        }}
        title="Confirm Delete"
        primaryAction={{
          label: 'Delete',
          onClick: handleDelete,
          loading: isLoading,
          variant: 'danger',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => {
            setIsDeleteModalOpen(false);
            setSelectedBlog(null);
            setSelectedCategory(null);
            setSelectedAuthor(null);
          },
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to delete{' '}
          <span className="font-medium text-white">{getDeleteItemName()}</span>?
          This action cannot be undone.
        </p>
      </AdminModal>
    </div>
  );
}
