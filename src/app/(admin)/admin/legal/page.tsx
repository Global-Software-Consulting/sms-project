'use client';

import { AdminGlassCard } from '@/components/admin/glass-card';
import { FileText, Edit, Eye } from "lucide-react";

const pages = [
  {
    id: 1,
    title: "Privacy Policy",
    status: "Published",
    lastModified: "2026-03-05",
    author: "Admin",
  },
  {
    id: 2,
    title: "Terms of Use",
    status: "Published",
    lastModified: "2026-03-01",
    author: "Admin",
  },
  {
    id: 3,
    title: "Payment & Refund Policy",
    status: "Published",
    lastModified: "2026-02-28",
    author: "Admin",
  },
  {
    id: 4,
    title: "Legal Disclaimer",
    status: "Draft",
    lastModified: "2026-03-10",
    author: "Admin",
  },
  {
    id: 5,
    title: "Help Center",
    status: "Published",
    lastModified: "2026-02-25",
    author: "Admin",
  },
];

export default function AdminLegalPage() {
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
          <select className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]">
            <option>All Pages</option>
            <option>Published</option>
            <option>Draft</option>
          </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors">
          <FileText className="w-5 h-5" />
          Create New Page
        </button>
      </div>

      <AdminGlassCard>
        <div className="space-y-4">
          {pages.map((page) => (
            <div
              key={page.id}
              className="flex items-center justify-between p-4 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#3B82F6]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{page.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#64748B]">
                    <span>Modified: {page.lastModified}</span>
                    <span>•</span>
                    <span>by {page.author}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    page.status === "Published"
                      ? "bg-[#22C55E]/20 text-[#22C55E]"
                      : "bg-[#F59E0B]/20 text-[#F59E0B]"
                  }`}
                >
                  {page.status}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-5 h-5 text-[#3B82F6]" />
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5 text-[#F59E0B]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminGlassCard>

      <div className="mt-8">
        <AdminGlassCard>
          <h3 className="text-white text-xl font-semibold mb-4">Page Editor</h3>
          <p className="text-[#94A3B8] text-sm mb-6">
            Select a page from above to edit, or create a new page.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Page Title
              </label>
              <input
                type="text"
                placeholder="Enter page title"
                className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">Content</label>
              <textarea
                placeholder="Write your content here..."
                rows={10}
                className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors">
                Publish
              </button>
              <button className="px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] text-sm font-medium transition-colors">
                Save as Draft
              </button>
              <button className="flex items-center gap-2 px-4 py-3 rounded-xl text-[#94A3B8] hover:text-white transition-colors">
                <Eye className="w-5 h-5" />
                Preview
              </button>
            </div>
          </div>
        </AdminGlassCard>
      </div>
    </div>
  );
}
