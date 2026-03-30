'use client';

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminGlassCard } from "@/components/admin/glass-card";
import { AdminFormInput } from "@/components/admin/form-input";
import { AdminModal } from "@/components/admin/modal";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Upload, Copy } from "lucide-react";

// Mock data
const blogsData = [
  {
    id: "2",
    title: "2",
    author: "Pirates",
    slug: "slug-2",
    publishedDate: "Jan 19, 2026 07:18 AM",
    createdDate: "Jan 20, 2026 22:14 AM",
    category: "TV / cheap iptv solutions",
    tags: ["2"],
    status: "published",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400",
  },
  {
    id: "1",
    title: "1",
    author: "Jubayer Ahmed",
    slug: "slug-1",
    publishedDate: "Jan 19, 2026 07:18 AM",
    createdDate: "Jan 19, 2026 07:18 AM",
    category: "TV / cheap iptv solutions",
    tags: ["1"],
    status: "published",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400",
  },
  {
    id: "one",
    title: "one",
    author: "Jubayer Ahmed",
    slug: "slug-one",
    publishedDate: "Jan 18, 2026 12:32 AM",
    createdDate: "Jan 18, 2026 12:32 AM",
    category: "TV / cheap iptv solutions",
    tags: ["fasdjf"],
    status: "published",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400",
  },
];

const categoriesData = [
  { id: "1", name: "IP-TV", slug: "ip-tv" },
  { id: "2", name: "test the category", slug: "test-the-category" },
];

const authorsData = [
  { id: "1", name: "Alan", description: "Awesome blog author/seo/graphicdesign" },
  { id: "2", name: "new", description: "Test" },
  { id: "3", name: "Pirates", description: "Python Dojo" },
  { id: "4", name: "Jubayer Ahmed", description: "Javascript Developer" },
];

export default function AdminBlogsPage() {
  const [activeTab, setActiveTab] = useState<"manual" | "auto" | "category" | "author" | "image">("manual");
  const [categorySubTab, setGategorySubTab] = useState<"category" | "subcategory">("category");

  const [blogs, setBlogs] = useState(blogsData);
  const [categories, setCategories] = useState(categoriesData);
  const [authors, setAuthors] = useState(authorsData);

  const [isCreateBlogModalOpen, setIsCreateBlogModalOpen] = useState(false);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [isCreateAuthorModalOpen, setIsCreateAuthorModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto Blog Upload State
  const [autoBlogConfig, setAutoBlogConfig] = useState({
    category: "",
    subCategory: "",
    author: "",
  });

  const [blogPost, setBlogPost] = useState({
    title: "",
    content: "",
    tags: "",
    image: null as File | null,
  });

  const [scheduling, setScheduling] = useState({
    minHours: "8",
    maxHours: "11",
    authorRotation: true,
  });

  // Image Editor State
  const [imageConfig, setImageConfig] = useState({
    searchName: "",
    crop1: "2",
    crop2: "4",
    crop3: "10",
    crop4: "15",
    saturation1: "1",
    saturation2: "15",
    brightness1: "5",
    brightness2: "10",
    contrast1: "5",
    contrast2: "10",
    rotation1: "-1",
    rotation2: "1",
    noise1: "1",
    noise2: "2",
    convertWebP: true,
    stripEXIF: true,
    bypassMode: false,
  });

  const [newCategory, setNewCategory] = useState({ name: "", slug: "" });
  const [newAuthor, setNewAuthor] = useState({ name: "", description: "" });

  const handleUnpublish = async (blog: any) => {
    setBlogs(blogs.map((b) => (b.id === blog.id ? { ...b, status: "draft" } : b)));
    toast.success("Blog unpublished successfully!");
  };

  const handleDeleteBlog = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setBlogs(blogs.filter((b) => b.id !== selectedItem.id));
    setIsLoading(false);
    setIsDeleteModalOpen(false);
    toast.success("Blog deleted successfully!");
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name) {
      toast.error("Please enter category name");
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setCategories([...categories, { id: String(categories.length + 1), ...newCategory }]);
    setNewCategory({ name: "", slug: "" });
    setIsLoading(false);
    setIsCreateCategoryModalOpen(false);
    toast.success("Category created successfully!");
  };

  const handleDeleteCategory = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setCategories(categories.filter((c) => c.id !== selectedItem.id));
    setIsLoading(false);
    setIsDeleteModalOpen(false);
    toast.success("Category deleted successfully!");
  };

  const handleCreateAuthor = async () => {
    if (!newAuthor.name) {
      toast.error("Please enter author name");
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setAuthors([...authors, { id: String(authors.length + 1), ...newAuthor }]);
    setNewAuthor({ name: "", description: "" });
    setIsLoading(false);
    setIsCreateAuthorModalOpen(false);
    toast.success("Author created successfully!");
  };

  const handleDeleteAuthor = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setAuthors(authors.filter((a) => a.id !== selectedItem.id));
    setIsLoading(false);
    setIsDeleteModalOpen(false);
    toast.success("Author deleted successfully!");
  };

  const handleAddMore = () => {
    toast.info("Add more blog posts functionality");
  };

  const handleCreateBulkBlogs = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    toast.success("Bulk blogs created successfully!");
  };

  const handleProcessImages = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    toast.success("Images processed successfully!");
  };

  const tabs = [
    { id: "manual", label: "Add Blog Manually" },
    { id: "auto", label: "Auto Blog Upload" },
    { id: "category", label: "Category Management" },
    { id: "author", label: "Author Pool" },
    { id: "image", label: "Image Auto Editor" },
  ];

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
              <select className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]">
                <option>All Blogs</option>
                <option>Published</option>
                <option>Draft</option>
              </select>
              <button
                onClick={() => setIsCreateBlogModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Blog
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white text-lg font-semibold mb-1">{blog.title}</h3>
                        <p className="text-[#94A3B8] text-sm">
                          By {blog.author} • {blog.publishedDate}
                        </p>
                        <p className="text-[#64748B] text-xs">Published: {blog.publishedDate}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#22C55E]/20 text-[#22C55E] text-xs font-medium capitalize">
                        {blog.status}
                      </span>
                    </div>

                    <p className="text-[#3B82F6] text-sm mb-3">📺 {blog.category}</p>

                    <div className="flex items-center gap-2 mb-4">
                      {blog.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-[#06B6D4]/20 text-[#06B6D4] text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUnpublish(blog)}
                        className="px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-medium transition-colors"
                      >
                        Unpublish
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem(blog);
                          setIsDeleteModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[#64748B] text-xs mb-1">Slug: {blog.slug}</p>
                    <p className="text-[#64748B] text-xs">Created: {blog.createdDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AdminGlassCard>
      )}

      {/* Auto Blog Upload Tab */}
      {activeTab === "auto" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">📋 Blog Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Sub Category *</label>
                <select
                  value={autoBlogConfig.category}
                  onChange={(e) => setAutoBlogConfig({ ...autoBlogConfig, category: e.target.value })}
                  className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Author</label>
                <select
                  value={autoBlogConfig.author}
                  onChange={(e) => setAutoBlogConfig({ ...autoBlogConfig, author: e.target.value })}
                  className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                >
                  <option value="">Random rotation</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white text-base font-semibold">✏️ Blog Posts *</h3>
                <p className="text-[#3B82F6] text-xs mt-1">
                  Each <span className="font-semibold">@search/query.post</span> with 50-word title, content, tags, and image
                </p>
              </div>
              <button
                onClick={handleAddMore}
                className="px-4 py-2 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-medium transition-colors"
              >
                + Add More
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[#3B82F6] text-sm font-semibold">📝 Blog Post #1</h4>
                  <button className="px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-medium transition-colors flex items-center gap-2">
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Title *</label>
                    <input
                      type="text"
                      value={blogPost.title}
                      onChange={(e) => setBlogPost({ ...blogPost, title: e.target.value })}
                      placeholder="Enter blog title"
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] placeholder:text-[#64748B]"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Content</label>
                    <textarea
                      value={blogPost.content}
                      onChange={(e) => setBlogPost({ ...blogPost, content: e.target.value })}
                      rows={6}
                      placeholder="Write your blog content here..."
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none placeholder:text-[#64748B]"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Tags</label>
                    <input
                      type="text"
                      value={blogPost.tags}
                      onChange={(e) => setBlogPost({ ...blogPost, tags: e.target.value })}
                      placeholder="tag1, tag2, tag3"
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] placeholder:text-[#64748B]"
                    />
                    <p className="text-[#64748B] text-xs mt-1">Separate tags with commas</p>
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Image</label>
                    <button className="px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-[#3B82F6] hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Choose Image
                    </button>
                    <p className="text-[#64748B] text-xs mt-2">
                      Max 5MB Supported: JPG, PNG, WebP, GIF, Uploads to Cloudflare R2.
                    </p>
                  </div>
                </div>
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
                <span className="font-semibold">Author Rotation</span>{" "}
                <span className="text-[#22C55E]">ON</span>
              </label>
            </div>
            <p className="text-[#22C55E] text-xs mt-2">
              ✓ Authors will be randomly selected from the pool for each blog post
            </p>
          </div>

          <button
            onClick={handleCreateBulkBlogs}
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-3 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-medium transition-colors disabled:opacity-50"
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
              onClick={() => setGategorySubTab("category")}
              className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
                categorySubTab === "category" ? "text-[#3B82F6]" : "text-[#64748B] hover:text-white"
              }`}
            >
              Category Management
              {categorySubTab === "category" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />}
            </button>
            <button
              onClick={() => setGategorySubTab("subcategory")}
              className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
                categorySubTab === "subcategory" ? "text-[#3B82F6]" : "text-[#64748B] hover:text-white"
              }`}
            >
              Sub-Category Management
              {categorySubTab === "subcategory" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />}
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-semibold">Manage Categories</h2>
            <button
              onClick={() => setIsCreateCategoryModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-medium transition-colors"
            >
              + Create Category
            </button>
          </div>

          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="p-4 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)] flex items-center justify-between"
              >
                <div>
                  <h3 className="text-white text-base font-semibold mb-1">{category.name}</h3>
                  <p className="text-[#64748B] text-sm">Slug: {category.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors">
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItem(category);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AdminGlassCard>
      )}

      {/* Author Pool Tab */}
      {activeTab === "author" && (
        <AdminGlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-semibold">Manage Authors</h2>
            <button
              onClick={() => setIsCreateAuthorModalOpen(true)}
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
                <div>
                  <h3 className="text-white text-base font-semibold mb-1">{author.name}</h3>
                  <p className="text-[#3B82F6] text-sm">{author.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors">
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItem(author);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
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
            <p className="text-[#64748B] text-xs mt-2">Images will be named: base-name-index</p>
          </div>

          <div className="p-6 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.18)]">
            <h3 className="text-white text-base font-semibold mb-4">Processing Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Crop (%)</label>
                <div className="grid grid-cols-4 gap-2">
                  {["crop1", "crop2", "crop3", "crop4"].map((key) => (
                    <input
                      key={key}
                      type="number"
                      value={imageConfig[key as keyof typeof imageConfig] as string}
                      onChange={(e) => setImageConfig({ ...imageConfig, [key]: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Saturation (%)</label>
                <div className="grid grid-cols-2 gap-2">
                  {["saturation1", "saturation2"].map((key) => (
                    <input
                      key={key}
                      type="number"
                      value={imageConfig[key as keyof typeof imageConfig] as string}
                      onChange={(e) => setImageConfig({ ...imageConfig, [key]: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Brightness (%)</label>
                <div className="grid grid-cols-2 gap-2">
                  {["brightness1", "brightness2"].map((key) => (
                    <input
                      key={key}
                      type="number"
                      value={imageConfig[key as keyof typeof imageConfig] as string}
                      onChange={(e) => setImageConfig({ ...imageConfig, [key]: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Contrast (%)</label>
                <div className="grid grid-cols-2 gap-2">
                  {["contrast1", "contrast2"].map((key) => (
                    <input
                      key={key}
                      type="number"
                      value={imageConfig[key as keyof typeof imageConfig] as string}
                      onChange={(e) => setImageConfig({ ...imageConfig, [key]: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Rotation (degrees)</label>
                <div className="grid grid-cols-2 gap-2">
                  {["rotation1", "rotation2"].map((key) => (
                    <input
                      key={key}
                      type="number"
                      value={imageConfig[key as keyof typeof imageConfig] as string}
                      onChange={(e) => setImageConfig({ ...imageConfig, [key]: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Noise (%)</label>
                <div className="grid grid-cols-2 gap-2">
                  {["noise1", "noise2"].map((key) => (
                    <input
                      key={key}
                      type="number"
                      value={imageConfig[key as keyof typeof imageConfig] as string}
                      onChange={(e) => setImageConfig({ ...imageConfig, [key]: e.target.value })}
                      className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="convertWebP"
                  checked={imageConfig.convertWebP}
                  onChange={(e) => setImageConfig({ ...imageConfig, convertWebP: e.target.checked })}
                  className="w-4 h-4 rounded border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-[#3B82F6] focus:ring-[#3B82F6]"
                />
                <label htmlFor="convertWebP" className="text-white text-sm">
                  Convert to WebP format
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="stripEXIF"
                  checked={imageConfig.stripEXIF}
                  onChange={(e) => setImageConfig({ ...imageConfig, stripEXIF: e.target.checked })}
                  className="w-4 h-4 rounded border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-[#3B82F6] focus:ring-[#3B82F6]"
                />
                <label htmlFor="stripEXIF" className="text-white text-sm">
                  Strip EXIF metadata
                </label>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)]">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="bypassMode"
                checked={imageConfig.bypassMode}
                onChange={(e) => setImageConfig({ ...imageConfig, bypassMode: e.target.checked })}
                className="w-5 h-5 rounded border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-[#F59E0B] focus:ring-[#F59E0B] mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="bypassMode" className="text-[#F59E0B] text-sm font-semibold block mb-2">
                  🟡 Bypass Mode <span className="text-xs">(Beta)</span>
                </label>
                <p className="text-[#F59E0B] text-xs leading-relaxed">
                  When hidden backdrop is centralized on top of your Processing Settings for SEO dominance:
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleProcessImages}
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-3 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Process Images"}
          </button>
        </div>
      )}

      {/* Create Category Modal */}
      <AdminModal
        isOpen={isCreateCategoryModalOpen}
        onClose={() => setIsCreateCategoryModalOpen(false)}
        title="Create Category"
        primaryAction={{
          label: "Create",
          onClick: handleCreateCategory,
          loading: isLoading,
          variant: "primary",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsCreateCategoryModalOpen(false),
        }}
      >
        <div className="space-y-4">
          <AdminFormInput
            label="Category Name"
            required
            value={newCategory.name}
            onChange={(v) => setNewCategory({ ...newCategory, name: v })}
            placeholder="Enter category name"
          />
          <AdminFormInput
            label="Slug"
            value={newCategory.slug}
            onChange={(v) => setNewCategory({ ...newCategory, slug: v })}
            placeholder="category-slug"
          />
        </div>
      </AdminModal>

      {/* Create Author Modal */}
      <AdminModal
        isOpen={isCreateAuthorModalOpen}
        onClose={() => setIsCreateAuthorModalOpen(false)}
        title="Create Author"
        primaryAction={{
          label: "Create",
          onClick: handleCreateAuthor,
          loading: isLoading,
          variant: "primary",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsCreateAuthorModalOpen(false),
        }}
      >
        <div className="space-y-4">
          <AdminFormInput
            label="Author Name"
            required
            value={newAuthor.name}
            onChange={(v) => setNewAuthor({ ...newAuthor, name: v })}
            placeholder="Enter author name"
          />
          <AdminFormInput
            label="Description"
            value={newAuthor.description}
            onChange={(v) => setNewAuthor({ ...newAuthor, description: v })}
            placeholder="Author description"
          />
        </div>
      </AdminModal>

      {/* Delete Modal */}
      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        primaryAction={{
          label: "Delete",
          onClick:
            activeTab === "manual"
              ? handleDeleteBlog
              : activeTab === "category"
              ? handleDeleteCategory
              : handleDeleteAuthor,
          loading: isLoading,
          variant: "danger",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsDeleteModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to delete{" "}
          <span className="text-white font-medium">
            {selectedItem?.title || selectedItem?.name}
          </span>
          ? This action cannot be undone.
        </p>
      </AdminModal>
    </div>
  );
}
