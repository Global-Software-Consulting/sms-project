'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
  Tag,
  RefreshCw,
  X,
  Save,
  Image
} from 'lucide-react';
import { Button, Alert } from '@/components/ui';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  views: number;
}

const samplePosts: BlogPost[] = [
  {
    id: '1',
    title: 'How to Verify WhatsApp Without Your Real Phone Number',
    slug: 'verify-whatsapp-without-real-number',
    excerpt: 'Learn how to create and verify a WhatsApp account using a virtual phone number for enhanced privacy.',
    content: '',
    coverImage: '/blog/whatsapp-verification.jpg',
    author: 'Admin',
    category: 'Guides',
    tags: ['whatsapp', 'verification', 'privacy'],
    status: 'published',
    publishedAt: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-14T08:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    views: 1250,
  },
  {
    id: '2',
    title: 'Top 10 Services That Require SMS Verification in 2024',
    slug: 'top-services-sms-verification-2024',
    excerpt: 'Discover the most popular platforms that require phone verification and how to handle them.',
    content: '',
    coverImage: '/blog/sms-services.jpg',
    author: 'Admin',
    category: 'News',
    tags: ['sms', 'verification', '2024'],
    status: 'published',
    publishedAt: '2024-01-10T14:00:00Z',
    createdAt: '2024-01-09T12:00:00Z',
    updatedAt: '2024-01-10T14:00:00Z',
    views: 890,
  },
  {
    id: '3',
    title: 'Understanding Online Privacy: A Complete Guide',
    slug: 'understanding-online-privacy-guide',
    excerpt: 'Everything you need to know about protecting your privacy online in the digital age.',
    content: '',
    coverImage: '/blog/privacy-guide.jpg',
    author: 'Admin',
    category: 'Guides',
    tags: ['privacy', 'security', 'guide'],
    status: 'draft',
    publishedAt: null,
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-18T09:00:00Z',
    views: 0,
  },
];

const categories = ['All', 'Guides', 'News', 'Tips', 'Updates'];

/**
 * Admin Blog Management Page
 * 
 * Features:
 * - List all blog posts
 * - Create/Edit/Delete posts
 * - Rich text editor
 * - Category and tag management
 * - Schedule posts
 */
export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(samplePosts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: 'Guides',
    tags: '',
    status: 'draft' as 'draft' | 'published' | 'scheduled',
  });

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchInput.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchInput.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesStatus = !selectedStatus || post.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Open editor for new post
  const handleNewPost = () => {
    setEditingPost(null);
    setPostForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImage: '',
      category: 'Guides',
      tags: '',
      status: 'draft',
    });
    setShowEditor(true);
  };

  // Open editor for existing post
  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      category: post.category,
      tags: post.tags.join(', '),
      status: post.status,
    });
    setShowEditor(true);
  };

  // Save post
  const handleSavePost = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingPost) {
        setPosts(prev => prev.map(p => 
          p.id === editingPost.id 
            ? { 
                ...p, 
                ...postForm, 
                tags: postForm.tags.split(',').map(t => t.trim()),
                updatedAt: new Date().toISOString(),
                publishedAt: postForm.status === 'published' ? new Date().toISOString() : p.publishedAt,
              } 
            : p
        ));
        setSuccess('Post updated successfully');
      } else {
        const newPost: BlogPost = {
          id: String(Date.now()),
          ...postForm,
          tags: postForm.tags.split(',').map(t => t.trim()),
          author: 'Admin',
          publishedAt: postForm.status === 'published' ? new Date().toISOString() : null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          views: 0,
        };
        setPosts(prev => [newPost, ...prev]);
        setSuccess('Post created successfully');
      }
      
      setShowEditor(false);
    } catch (err) {
      setError('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      setPosts(prev => prev.filter(p => p.id !== postId));
      setSuccess('Post deleted successfully');
    } catch (err) {
      setError('Failed to delete post');
    }
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border-default)',
        padding: '24px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>
                  Admin
                </Link>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Blog</span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Blog Management
              </h1>
            </div>
            <Button variant="primary" onClick={handleNewPost}>
              <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              New Post
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Alerts */}
        {error && (
          <div style={{ marginBottom: '24px' }}>
            <Alert variant="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        {success && (
          <div style={{ marginBottom: '24px' }}>
            <Alert variant="success" dismissible onDismiss={() => setSuccess(null)}>
              {success}
            </Alert>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }} className="lg:!grid-cols-4">
          <StatCard label="Total Posts" value={posts.length} />
          <StatCard label="Published" value={posts.filter(p => p.status === 'published').length} color="green" />
          <StatCard label="Drafts" value={posts.filter(p => p.status === 'draft').length} color="yellow" />
          <StatCard label="Total Views" value={posts.reduce((acc, p) => acc + p.views, 0)} color="blue" />
        </div>

        {/* Filters */}
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border-default)', 
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    paddingLeft: '40px',
                    paddingRight: '16px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                height: '44px',
                padding: '0 12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                minWidth: '150px'
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                height: '44px',
                padding: '0 12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                minWidth: '150px'
              }}
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        {/* Posts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="lg:!grid-cols-2 xl:!grid-cols-3">
          {filteredPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onEdit={() => handleEditPost(post)}
              onDelete={() => handleDeletePost(post.id)}
            />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-default)', 
            borderRadius: '16px',
            padding: '64px',
            textAlign: 'center'
          }}>
            <FileText style={{ width: '48px', height: '48px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>No posts found</p>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(4px)', 
          zIndex: 100, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '24px' 
        }}>
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderRadius: '16px', 
            padding: '24px', 
            maxWidth: '800px', 
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {editingPost ? 'Edit Post' : 'New Post'}
              </h3>
              <button onClick={() => setShowEditor(false)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) => {
                    setPostForm(prev => ({ 
                      ...prev, 
                      title: e.target.value,
                      slug: generateSlug(e.target.value)
                    }));
                  }}
                  placeholder="Enter post title"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Slug
                </label>
                <input
                  type="text"
                  value={postForm.slug}
                  onChange={(e) => setPostForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="post-url-slug"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Excerpt
                </label>
                <textarea
                  value={postForm.excerpt}
                  onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the post"
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '12px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Content
                </label>
                <textarea
                  value={postForm.content}
                  onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your post content here (Markdown supported)"
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '12px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Category
                  </label>
                  <select
                    value={postForm.category}
                    onChange={(e) => setPostForm(prev => ({ ...prev, category: e.target.value }))}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 12px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Status
                  </label>
                  <select
                    value={postForm.status}
                    onChange={(e) => setPostForm(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'scheduled' }))}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 12px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={postForm.tags}
                  onChange={(e) => setPostForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="tag1, tag2, tag3"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={postForm.coverImage}
                  onChange={(e) => setPostForm(prev => ({ ...prev, coverImage: e.target.value }))}
                  placeholder="/blog/image.jpg"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <Button variant="outline" fullWidth onClick={() => setShowEditor(false)}>
                Cancel
              </Button>
              <Button variant="primary" fullWidth onClick={handleSavePost} isLoading={loading}>
                <Save style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                {editingPost ? 'Update Post' : 'Create Post'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  const colors: Record<string, string> = {
    green: 'var(--success)',
    yellow: 'var(--warning)',
    blue: 'var(--info)',
  };

  return (
    <div style={{ 
      backgroundColor: 'var(--bg-card)', 
      border: '1px solid var(--border-default)', 
      borderRadius: '16px', 
      padding: '20px' 
    }}>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '24px', fontWeight: 700, color: color ? colors[color] : 'var(--text-primary)' }}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function PostCard({ post, onEdit, onDelete }: { post: BlogPost; onEdit: () => void; onDelete: () => void }) {
  const [showMenu, setShowMenu] = useState(false);

  const statusColors: Record<string, { bg: string; text: string }> = {
    published: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--success)' },
    draft: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)' },
    scheduled: { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--info)' },
  };

  return (
    <div style={{ 
      backgroundColor: 'var(--bg-card)', 
      border: '1px solid var(--border-default)', 
      borderRadius: '16px',
      overflow: 'hidden'
    }}>
      {/* Cover Image */}
      <div style={{ 
        height: '160px', 
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Image style={{ width: '32px', height: '32px', color: 'var(--text-muted)' }} />
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ 
            padding: '4px 10px', 
            borderRadius: '6px', 
            fontSize: '11px', 
            fontWeight: 600,
            backgroundColor: statusColors[post.status].bg,
            color: statusColors[post.status].text,
            textTransform: 'capitalize'
          }}>
            {post.status}
          </span>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                padding: '4px',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <MoreVertical style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
            </button>
            {showMenu && (
              <>
                <div 
                  style={{ position: 'fixed', inset: 0, zIndex: 10 }} 
                  onClick={() => setShowMenu(false)} 
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  padding: '4px',
                  minWidth: '120px',
                  zIndex: 20,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <button
                    onClick={() => { setShowMenu(false); onEdit(); }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px 12px', 
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      background: 'none',
                      border: 'none',
                      width: '100%',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    <Edit style={{ width: '14px', height: '14px' }} />
                    Edit
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); onDelete(); }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px 12px', 
                      borderRadius: '6px',
                      color: 'var(--danger)',
                      background: 'none',
                      border: 'none',
                      width: '100%',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.4 }}>
          {post.title}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          {post.excerpt.slice(0, 100)}...
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Tag style={{ width: '12px', height: '12px' }} />
            {post.category}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye style={{ width: '12px', height: '12px' }} />
            {post.views}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar style={{ width: '12px', height: '12px' }} />
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Not published'}
          </div>
        </div>
      </div>
    </div>
  );
}

