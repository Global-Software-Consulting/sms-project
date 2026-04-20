'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Calendar, User, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/config/api-client.config';
import { API_ENDPOINTS } from '@/config/server.config';
import { formatDistanceToNow } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  category?: { id: string; name: string; slug: string } | string;
  author?: { id: string; name: string; avatar?: string } | string;
  tags?: string[];
  publishedAt?: string;
  createdAt: string;
  readTime?: number;
  status?: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.BLOG.ROOT, {
        params: { limit: 50 },
      });
      const data = response.data;
      const list = Array.isArray(data) ? data : data.data || data.posts || [];
      // Only show published posts
      setPosts(list.filter((p: BlogPost) => p.status !== 'DRAFT' && p.status !== 'ARCHIVED'));
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(q) ||
      (post.excerpt || '').toLowerCase().includes(q) ||
      (typeof post.category === 'object' ? post.category?.name || '' : post.category || '').toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const getCategoryName = (category: BlogPost['category']) => {
    if (!category) return null;
    if (typeof category === 'string') return category;
    return category.name;
  };

  const getAuthorName = (author: BlogPost['author']) => {
    if (!author) return null;
    if (typeof author === 'string') return author;
    return author.name;
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">Blog</h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-xl">
            Latest news, guides, and updates from BestSMSHQ
          </p>

          {posts.length > 0 && (
            <div className="relative mx-auto max-w-2xl">
              <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 [border-color:var(--glass-border)] pl-12 text-base backdrop-blur-[var(--glass-blur)] [background:var(--glass-primary)]"
              />
            </div>
          )}
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-20" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No posts match your search' : 'No blog posts yet. Check back soon!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => {
              const categoryName = getCategoryName(post.category);
              const authorName = getAuthorName(post.author);
              const coverImg = post.coverImage || post.thumbnailUrl || post.imageUrl;

              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                  <Card className="h-full overflow-hidden transition-all duration-180 hover:-translate-y-1 hover:[box-shadow:var(--glass-shadow-3),var(--glow-accent)]">
                    {coverImg && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={coverImg}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {categoryName && (
                          <Badge variant="secondary" className="text-xs">
                            {categoryName}
                          </Badge>
                        )}
                        {post.readTime && (
                          <span className="text-muted-foreground text-xs">{post.readTime} min read</span>
                        )}
                      </div>
                      <CardTitle className="group-hover:text-primary line-clamp-2 text-lg transition-colors">
                        {post.title}
                      </CardTitle>
                      {post.excerpt && (
                        <CardDescription className="line-clamp-2">
                          {post.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        {authorName && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{authorName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
