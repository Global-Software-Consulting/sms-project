"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Tag,
  ChevronLeft,
  ChevronRight,
  PenTool,
} from "lucide-react";

// Blog categories
const categories = [
  { id: "all", name: "All Posts" },
  { id: "guides", name: "Guides" },
  { id: "news", name: "News" },
  { id: "tutorials", name: "Tutorials" },
  { id: "tips", name: "Tips & Tricks" },
];

// Mock blog posts
const blogPosts = [
  {
    id: "1",
    slug: "complete-guide-sms-verification",
    title: "The Complete Guide to SMS Verification in 2026",
    excerpt: "Learn everything you need to know about SMS verification, from how it works to best practices for implementation.",
    category: "guides",
    author: "BestSMSHQ Team",
    date: "2026-02-20",
    readTime: "8 min read",
    featured: true,
  },
  {
    id: "2",
    slug: "top-10-services-sms-activation",
    title: "Top 10 Services That Require SMS Activation",
    excerpt: "Discover the most popular platforms that require phone verification and how to easily verify your accounts.",
    category: "guides",
    author: "BestSMSHQ Team",
    date: "2026-02-18",
    readTime: "5 min read",
    featured: false,
  },
  {
    id: "3",
    slug: "api-integration-tutorial",
    title: "How to Integrate BestSMSHQ API in Your Application",
    excerpt: "A step-by-step tutorial on integrating our SMS verification API into your web or mobile application.",
    category: "tutorials",
    author: "Dev Team",
    date: "2026-02-15",
    readTime: "12 min read",
    featured: true,
  },
  {
    id: "4",
    slug: "crypto-payments-announcement",
    title: "New: Pay with 10+ Cryptocurrencies",
    excerpt: "We've expanded our crypto payment options. Now accept BTC, ETH, USDT, and 7 more cryptocurrencies.",
    category: "news",
    author: "BestSMSHQ Team",
    date: "2026-02-12",
    readTime: "3 min read",
    featured: false,
  },
  {
    id: "5",
    slug: "privacy-tips-online-verification",
    title: "5 Privacy Tips for Online Verification",
    excerpt: "Protect your privacy while verifying accounts online. Learn the best practices for anonymous verification.",
    category: "tips",
    author: "Security Team",
    date: "2026-02-10",
    readTime: "6 min read",
    featured: false,
  },
  {
    id: "6",
    slug: "whatsapp-verification-guide",
    title: "How to Verify WhatsApp Without Your Personal Number",
    excerpt: "A detailed guide on creating and verifying WhatsApp accounts using virtual phone numbers.",
    category: "tutorials",
    author: "BestSMSHQ Team",
    date: "2026-02-08",
    readTime: "7 min read",
    featured: false,
  },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Filter posts
  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = activeCategory === "all" || post.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  // Featured posts
  const featuredPosts = blogPosts.filter((post) => post.featured).slice(0, 2);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="relative overflow-hidden">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative hero-bg-overlay" style={{ paddingTop: '160px', paddingBottom: '60px' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        
        {/* Geometric Shapes */}
        <div className="absolute top-32 left-10 w-32 h-32 border-2 border-accent-gold/20 rotate-45 animate-float" />
        <div className="absolute top-60 right-20 w-24 h-24 border-2 border-accent-gold/10 rotate-12" />
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent-gold/10 rounded-full blur-[150px]" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="badge-premium mb-8 animate-fade-in">
              <PenTool className="w-4 h-4" />
              <span>Blog</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary leading-[1.1] mb-6 heading-uppercase animate-slide-up">
              News, Guides &
              <br />
              <span className="text-gold-gradient glow-gold-text">Tutorials</span>
            </h1>

            {/* Tagline */}
            <p className="tagline-italic text-lg lg:text-xl max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Stay updated with the latest news, tips, and tutorials about SMS verification
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="glass-card p-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-14 pl-12 pr-4 bg-bg-secondary/50 border border-border-default rounded-full text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURED POSTS
          ============================================ */}
      {!searchQuery && activeCategory === "all" && (
        <section className="py-16 bg-bg-secondary relative">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="text-2xl font-bold text-text-primary mb-8 uppercase tracking-wide">
              Featured Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <div className="glass-card glass-card-hover p-8 h-full card-lift group">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 text-xs font-medium bg-accent-gold/10 text-accent-gold rounded-full capitalize uppercase">
                          {post.category}
                        </span>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-accent-gold transition-colors uppercase">
                        {post.title}
                      </h3>
                      <p className="text-text-secondary mb-6 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                          <User className="w-4 h-4" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          CATEGORY FILTER
          ============================================ */}
      <section className="py-8 border-b border-border-default">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setCurrentPage(1);
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wide transition-all ${
                  activeCategory === category.id
                    ? "bg-gold-gradient text-bg-primary shadow-gold"
                    : "glass-card text-text-secondary hover:text-accent-gold"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          BLOG POSTS GRID
          ============================================ */}
      <section className="py-16 relative">
        <div className="container mx-auto px-6 lg:px-12">
          {paginatedPosts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <div className="glass-card glass-card-hover p-6 h-full card-lift group">
                      <div className="flex flex-col h-full">
                        {/* Placeholder for image */}
                        <div className="h-48 bg-bg-secondary rounded-xl mb-4 flex items-center justify-center">
                          <Tag className="w-12 h-12 text-accent-gold/30" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-2 py-1 text-xs font-medium bg-accent-gold/10 text-accent-gold rounded-full capitalize uppercase">
                            {post.category}
                          </span>
                          <span className="text-xs text-text-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent-gold transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-sm text-text-secondary mb-4 flex-1 line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-text-muted">
                          <span>{post.author}</span>
                          <span>{formatDate(post.date)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 rounded-xl glass-card text-text-secondary hover:text-accent-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-12 h-12 rounded-xl font-semibold transition-all ${
                        currentPage === page
                          ? "bg-gold-gradient text-bg-primary shadow-gold"
                          : "glass-card text-text-secondary hover:text-accent-gold"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-xl glass-card text-text-secondary hover:text-accent-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card p-12 text-center">
              <Search className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-bold text-text-primary mb-2">No Articles Found</h3>
              <p className="text-text-secondary mb-6">
                {searchQuery
                  ? `No articles matching "${searchQuery}"`
                  : "No articles in this category yet"}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="btn-pill btn-pill-secondary"
              >
                View All Articles
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          NEWSLETTER CTA
          ============================================ */}
      <section className="py-20 bg-bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/10 via-bg-secondary to-bg-secondary" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-gold/15 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-4 heading-uppercase">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-text-secondary mb-8">
              Get the latest articles, guides, and updates delivered to your inbox.
            </p>
            <div className="glass-card p-2 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-14 px-6 bg-bg-secondary/50 border border-border-default rounded-full text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold transition-colors"
              />
              <button className="btn-pill btn-pill-primary h-14 flex items-center gap-2 justify-center">
                Subscribe
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
