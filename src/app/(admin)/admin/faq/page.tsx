'use client';

import { AdminGlassCard } from "@/components/admin/glass-card";
import { BookOpen, Plus, Edit, Trash2, Search } from "lucide-react";

const categories = [
  {
    id: 1,
    name: "How SMS Activation Works",
    articles: 8,
    color: "#3B82F6",
  },
  {
    id: 2,
    name: "Service Usage Guide",
    articles: 12,
    color: "#22C55E",
  },
  {
    id: 3,
    name: "Troubleshooting",
    articles: 15,
    color: "#F59E0B",
  },
  {
    id: 4,
    name: "Account Help",
    articles: 10,
    color: "#8B5CF6",
  },
];

const articles = [
  {
    id: 1,
    title: "Getting Started with SMS Activation",
    category: "How SMS Activation Works",
    views: 1245,
    lastUpdated: "2026-03-08",
    status: "Published",
  },
  {
    id: 2,
    title: "How to Choose the Right Service",
    category: "Service Usage Guide",
    views: 892,
    lastUpdated: "2026-03-05",
    status: "Published",
  },
  {
    id: 3,
    title: "What to Do If SMS Doesn't Arrive",
    category: "Troubleshooting",
    views: 2134,
    lastUpdated: "2026-03-10",
    status: "Published",
  },
  {
    id: 4,
    title: "Managing Your Account Balance",
    category: "Account Help",
    views: 756,
    lastUpdated: "2026-03-07",
    status: "Published",
  },
  {
    id: 5,
    title: "Understanding Pricing & Refunds",
    category: "Account Help",
    views: 1089,
    lastUpdated: "2026-03-06",
    status: "Draft",
  },
];

export default function AdminFaqPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-3xl font-semibold mb-2">Knowledge Base</h1>
        <p className="text-[#94A3B8]">
          Create and manage help articles to assist your users.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {categories.map((category) => (
          <AdminGlassCard key={category.id}>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <BookOpen className="w-6 h-6" style={{ color: category.color }} />
            </div>
            <h3 className="text-white font-semibold mb-2">{category.name}</h3>
            <p className="text-[#64748B] text-sm">{category.articles} articles</p>
          </AdminGlassCard>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search articles..."
            className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] w-96"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors">
          <Plus className="w-5 h-5" />
          Create Article
        </button>
      </div>

      <AdminGlassCard>
        <h3 className="text-white text-xl font-semibold mb-6">All Articles</h3>
        <div className="space-y-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-white font-semibold">{article.title}</h4>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      article.status === "Published"
                        ? "bg-[#22C55E]/20 text-[#22C55E]"
                        : "bg-[#F59E0B]/20 text-[#F59E0B]"
                    }`}
                  >
                    {article.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#64748B]">
                  <span>{article.category}</span>
                  <span>•</span>
                  <span>{article.views} views</span>
                  <span>•</span>
                  <span>Updated {article.lastUpdated}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                  title="Edit Article"
                >
                  <Edit className="w-5 h-5 text-[#F59E0B]" />
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                  title="Delete Article"
                >
                  <Trash2 className="w-5 h-5 text-[#EF4444]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </AdminGlassCard>
    </div>
  );
}
