'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AdminDataTable } from "@/components/admin/data-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminFilterBar } from "@/components/admin/filter-bar";
import { AdminSlideOver } from "@/components/admin/slide-over";
import { AdminModal } from "@/components/admin/modal";
import { toast } from "sonner";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Send,
  Download,
  Loader2,
  AlertCircle,
  Inbox,
} from "lucide-react";
import {
  getAdminTicketStats,
  getAdminTickets,
  getAdminTicketDetail,
  updateAdminTicket,
  replyToTicket,
  type AdminTicketStats,
  type AdminTicket,
  type AdminTicketQueryParams,
} from '@/lib/api/adminTicketsApi';
import type { TicketMessage, TicketStatus, TicketPriority } from '@/lib/api/ticketsApi';

const columns = [
  { key: "id", label: "Ticket ID", width: "10%" },
  { key: "subject", label: "Subject", width: "20%" },
  { key: "user", label: "User", width: "12%" },
  { key: "category", label: "Category", width: "12%" },
  { key: "priority", label: "Priority", width: "10%" },
  { key: "status", label: "Status", width: "10%" },
  { key: "created", label: "Created", width: "14%" },
  { key: "actions", label: "Actions", width: "12%" },
];

const statusMap: Record<string, TicketStatus> = {
  open: 'OPEN',
  pending: 'PENDING',
  in_progress: 'IN_PROGRESS',
  resolved: 'RESOLVED',
  closed: 'CLOSED',
};

const categoryColors: Record<string, string> = {
  BILLING: "bg-[#F59E0B]/20 text-[#F59E0B]",
  TECHNICAL: "bg-[#3B82F6]/20 text-[#3B82F6]",
  REFUND: "bg-[#EF4444]/20 text-[#EF4444]",
  PAYMENT: "bg-[#F59E0B]/20 text-[#F59E0B]",
  ORDER: "bg-[#8B5CF6]/20 text-[#8B5CF6]",
  ACCOUNT: "bg-[#22C55E]/20 text-[#22C55E]",
  OTHER: "bg-[#64748B]/20 text-[#64748B]",
};

const priorityColors: Record<string, string> = {
  HIGH: "bg-[#EF4444]/20 text-[#EF4444]",
  URGENT: "bg-[#EF4444]/20 text-[#EF4444]",
  NORMAL: "bg-[#F59E0B]/20 text-[#F59E0B]",
  LOW: "bg-[#64748B]/20 text-[#64748B]",
};

const statusColors: Record<string, string> = {
  OPEN: "bg-[#F59E0B]/20 text-[#F59E0B]",
  PENDING: "bg-[#F59E0B]/20 text-[#F59E0B]",
  IN_PROGRESS: "bg-[#3B82F6]/20 text-[#3B82F6]",
  WAITING_CUSTOMER: "bg-[#8B5CF6]/20 text-[#8B5CF6]",
  RESOLVED: "bg-[#22C55E]/20 text-[#22C55E]",
  CLOSED: "bg-[#22C55E]/20 text-[#22C55E]",
};

const statusIcons: Record<string, React.ReactElement> = {
  OPEN: <Clock className="w-3 h-3" />,
  PENDING: <Clock className="w-3 h-3" />,
  IN_PROGRESS: <Loader2 className="w-3 h-3" />,
  WAITING_CUSTOMER: <AlertCircle className="w-3 h-3" />,
  RESOLVED: <CheckCircle className="w-3 h-3" />,
  CLOSED: <CheckCircle className="w-3 h-3" />,
};

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    OPEN: 'Open', PENDING: 'Pending', IN_PROGRESS: 'In Progress',
    WAITING_CUSTOMER: 'Waiting', RESOLVED: 'Resolved', CLOSED: 'Closed',
  };
  return map[s] || s;
};

const categoryLabel = (c: string) => {
  const map: Record<string, string> = {
    BILLING: 'Billing', TECHNICAL: 'Technical', REFUND: 'Refunds',
    PAYMENT: 'Payment', ORDER: 'Order', ACCOUNT: 'Account', OTHER: 'General',
  };
  return map[c] || c;
};

export default function AdminSupportPage() {
  // Data
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [stats, setStats] = useState<AdminTicketStats | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);

  // Loading
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Filters
  const [activeTab, setActiveTab] = useState("all");
  const [filterPriority, setFilterPriority] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const data = await getAdminTicketStats();
      setStats(data);
    } catch {
      // Stats are optional, don't block page
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const params: AdminTicketQueryParams = {
        page,
        limit,
        status: activeTab !== 'all' ? statusMap[activeTab] : undefined,
        priority: (filterPriority as TicketPriority) || undefined,
      };
      const response = await getAdminTickets(params);
      setTickets(response.tickets || []);
      setTotalPages(response.totalPages || 1);
      setTotal(response.total || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch tickets");
    } finally {
      setIsPageLoading(false);
    }
  }, [page, activeTab, filterPriority]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Open chat
  const handleViewChat = async (ticket: AdminTicket) => {
    setSelectedTicket(ticket);
    setMessages([]);
    setIsViewModalOpen(true);
    setIsChatLoading(true);
    try {
      const detail = await getAdminTicketDetail(ticket.id);
      setMessages(detail.messages || []);
      // Update ticket with latest data
      if (detail.ticket) setSelectedTicket(detail.ticket);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load chat");
    } finally {
      setIsChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  // Send reply
  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    setIsLoading(true);
    try {
      const newMessage = await replyToTicket(selectedTicket.id, replyMessage.trim());
      setMessages((prev) => [...prev, newMessage]);
      setReplyMessage("");
      toast.success("Reply sent successfully!");
      fetchTickets();
      fetchStats();
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send reply");
    } finally {
      setIsLoading(false);
    }
  };

  // Close ticket
  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    setIsLoading(true);
    try {
      await updateAdminTicket(selectedTicket.id, { status: 'CLOSED' });
      toast.success("Ticket closed successfully!");
      setIsCloseModalOpen(false);
      setSelectedTicket(null);
      fetchTickets();
      fetchStats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to close ticket");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tickets locally by search
  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.ticketNumber?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q) ||
      t.user?.username?.toLowerCase().includes(q) ||
      t.user?.email?.toLowerCase().includes(q)
    );
  });

  // Tab counts from stats — use activeTab total for current tab
  const tabCounts: Record<string, number> = {
    all: stats?.totalTickets ?? 0,
    open: stats?.openTickets ?? 0,
    pending: stats?.pendingTickets ?? 0,
    resolved: stats?.resolvedTickets ?? 0,
    closed: stats ? (stats.totalTickets - stats.openTickets - stats.pendingTickets - stats.resolvedTickets) : 0,
  };
  // Override current tab count with actual API total
  if (activeTab && !isPageLoading) {
    tabCounts[activeTab] = total;
  }

  const tabs = [
    { key: "all", label: "All Tickets", count: tabCounts.all },
    { key: "open", label: "Open", count: tabCounts.open },
    { key: "pending", label: "Pending", count: tabCounts.pending },
    { key: "resolved", label: "Resolved", count: tabCounts.resolved },
    { key: "closed", label: "Closed", count: tabCounts.closed },
  ];

  const filters = [
    {
      label: "Priority",
      options: ["LOW", "NORMAL", "HIGH"],
      optionLabels: ["Low", "Normal", "High"],
      value: filterPriority,
      onChange: (value: string) => { setFilterPriority(value); setPage(1); },
    },
  ];

  const handleResetFilters = () => {
    setFilterPriority("");
    setSearchQuery("");
    setPage(1);
  };

  const renderCell = (item: AdminTicket, column: any) => {
    if (column.key === "id") {
      return <span className="text-white font-mono text-sm">{item.ticketNumber || item.id.slice(0, 8)}</span>;
    }

    if (column.key === "subject") {
      return (
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
          <span className="text-white font-medium truncate">{item.subject}</span>
        </div>
      );
    }

    if (column.key === "user") {
      return <span className="text-white text-sm">{item.user?.username || item.user?.email || "N/A"}</span>;
    }

    if (column.key === "category") {
      return (
        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${categoryColors[item.category] || categoryColors.OTHER}`}>
          {categoryLabel(item.category)}
        </span>
      );
    }

    if (column.key === "priority") {
      return (
        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${priorityColors[item.priority] || priorityColors.LOW}`}>
          {item.priority}
        </span>
      );
    }

    if (column.key === "status") {
      return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${statusColors[item.status] || statusColors.OPEN}`}>
          {statusIcons[item.status] || statusIcons.OPEN}
          {statusLabel(item.status)}
        </span>
      );
    }

    if (column.key === "created") {
      return <span className="text-white text-sm">{new Date(item.createdAt).toLocaleString()}</span>;
    }

    if (column.key === "actions") {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewChat(item)}
            className="px-3 py-1.5 rounded-lg bg-[rgba(59,130,246,0.1)] hover:bg-[rgba(59,130,246,0.15)] text-[#3B82F6] text-xs font-medium transition-colors"
          >
            View Chat
          </button>
          {item.status !== "CLOSED" && item.status !== "RESOLVED" && (
            <button
              onClick={() => {
                setSelectedTicket(item);
                setIsCloseModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.15)] text-[#EF4444] text-xs font-medium transition-colors"
            >
              Close
            </button>
          )}
        </div>
      );
    }

    return (item as any)[column.key];
  };

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Support Tickets"
        description="Manage customer support tickets and respond to inquiries"
        secondaryActions={[
          {
            label: "Export",
            onClick: () => toast.info("Exporting tickets data..."),
            icon: <Download className="w-5 h-5" />,
          },
        ]}
      />

      {/* Status Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-[#3B82F6] text-white"
                : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]"
            }`}
          >
            {tab.label}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.2)] text-xs">
              {isStatsLoading ? "..." : tab.count}
            </span>
          </button>
        ))}
      </div>

      <AdminFilterBar
        searchPlaceholder="Search tickets by ID, subject, or user..."
        onSearch={(value) => setSearchQuery(value)}
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onApplyFilters={() => { setPage(1); fetchTickets(); }}
        onResetFilters={handleResetFilters}
      />

      {isPageLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
          <span className="ml-3 text-[#94A3B8]">Loading tickets...</span>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-[#64748B]" />
          </div>
          <p className="text-white text-lg font-medium">No tickets found</p>
          <p className="text-[#94A3B8] text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <AdminDataTable
            columns={columns}
            data={filteredTickets}
            renderCell={renderCell}
          />

          {/* Pagination */}
          <div className="flex flex-col lg:flex-row items-center justify-between mt-6 gap-4">
            <p className="text-[#94A3B8] text-sm">
              Showing {filteredTickets.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
              {Math.min(page * limit, total)} of {total} tickets
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm hover:bg-[rgba(255,255,255,0.12)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      page === pageNum
                        ? "bg-[#3B82F6] text-white hover:brightness-110"
                        : "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm hover:bg-[rgba(255,255,255,0.12)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* View Ticket Chat Slide-Over */}
      <AdminSlideOver
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setReplyMessage("");
          setMessages([]);
        }}
        title={`Ticket ${selectedTicket?.ticketNumber || selectedTicket?.id?.slice(0, 8) || ''}`}
        footer={
          selectedTicket && selectedTicket.status !== "CLOSED" && selectedTicket.status !== "RESOLVED" ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
              >
                Close Panel
              </button>
              <button
                onClick={handleSendReply}
                disabled={isLoading || !replyMessage.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          ) : undefined
        }
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)]">
              <h3 className="text-white font-semibold mb-3">{selectedTicket.subject}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">User:</span>
                  <span className="text-white">{selectedTicket.user?.username || selectedTicket.user?.email || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Email:</span>
                  <span className="text-white">{selectedTicket.user?.email || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Category:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[selectedTicket.category] || categoryColors.OTHER}`}>
                    {categoryLabel(selectedTicket.category)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Priority:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[selectedTicket.priority] || priorityColors.LOW}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Status:</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusColors[selectedTicket.status] || statusColors.OPEN}`}>
                    {statusIcons[selectedTicket.status]}
                    {statusLabel(selectedTicket.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Created:</span>
                  <span className="text-white">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Conversation */}
            <div className="space-y-4">
              <h3 className="text-white text-base font-semibold">Conversation</h3>

              {isChatLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
                  <span className="ml-2 text-[#94A3B8] text-sm">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#64748B] text-sm">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${
                          msg.isStaff ? 'bg-[#22C55E]' : 'bg-[#3B82F6]'
                        }`}
                      >
                        {msg.isStaff ? 'A' : (msg.senderName?.charAt(0)?.toUpperCase() || 'U')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-sm font-medium">
                            {msg.isStaff ? (msg.senderName || 'Admin') : msg.senderName}
                          </span>
                          <span className="text-[#64748B] text-xs">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-xl ${
                            msg.isStaff
                              ? 'bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]'
                              : 'bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)]'
                          }`}
                        >
                          <p className="text-white text-sm whitespace-pre-wrap">{msg.message}</p>
                          {msg.imageUrl && (
                            <img
                              src={msg.imageUrl}
                              alt="Attachment"
                              className="mt-2 max-w-full rounded-lg max-h-48 object-contain cursor-pointer"
                              onClick={() => window.open(msg.imageUrl!, '_blank')}
                            />
                          )}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {msg.attachments.map((attachment, idx) => (
                                <img
                                  key={idx}
                                  src={attachment.url}
                                  alt={attachment.originalName || 'Attachment'}
                                  className="max-w-full rounded-lg max-h-48 object-contain cursor-pointer"
                                  onClick={() => window.open(attachment.url, '_blank')}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Reply Input */}
            {selectedTicket.status !== "CLOSED" && selectedTicket.status !== "RESOLVED" && (
              <div className="pt-6 border-t border-[rgba(255,255,255,0.18)]">
                <h3 className="text-white text-base font-semibold mb-4">Send Reply</h3>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleSendReply();
                    }
                  }}
                  placeholder="Type your reply here... (Ctrl+Enter to send)"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
                />
              </div>
            )}
          </div>
        )}
      </AdminSlideOver>

      {/* Close Ticket Modal */}
      <AdminModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Close Ticket"
        primaryAction={{
          label: "Close Ticket",
          onClick: handleCloseTicket,
          loading: isLoading,
          variant: "primary",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsCloseModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to close ticket{" "}
          <span className="text-white font-medium">
            {selectedTicket?.ticketNumber || selectedTicket?.id?.slice(0, 8)}
          </span>
          ?
        </p>
        <p className="text-[#64748B] text-sm mt-4">
          The user will be notified that their ticket has been resolved and closed.
        </p>
      </AdminModal>
    </div>
  );
}