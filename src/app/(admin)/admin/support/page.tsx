'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AdminDataTable } from '@/components/admin/data-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminFilterBar } from '@/components/admin/filter-bar';
import { AdminSlideOver } from '@/components/admin/slide-over';
import { AdminModal } from '@/components/admin/modal';
import { toast } from 'sonner';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Send,
  Download,
  Loader2,
  AlertCircle,
  Inbox,
  MoreVertical,
  Eye,
  XCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import type {
  TicketMessage,
  TicketStatus,
  TicketPriority,
} from '@/lib/api/ticketsApi';

const columns = [
  { key: 'id', label: 'Ticket ID', width: '10%' },
  { key: 'subject', label: 'Subject', width: '20%' },
  { key: 'user', label: 'User', width: '12%' },
  { key: 'category', label: 'Category', width: '12%' },
  { key: 'priority', label: 'Priority', width: '10%' },
  { key: 'status', label: 'Status', width: '10%' },
  { key: 'created', label: 'Created', width: '14%' },
  { key: 'actions', label: 'Actions', width: '12%' },
];

const statusMap: Record<string, TicketStatus> = {
  open: 'OPEN',
  pending: 'PENDING',
  in_progress: 'IN_PROGRESS',
  resolved: 'RESOLVED',
  closed: 'CLOSED',
};

const categoryColors: Record<string, string> = {
  BILLING: 'bg-[#F59E0B]/20 text-[#F59E0B]',
  TECHNICAL: 'bg-[#3B82F6]/20 text-[#3B82F6]',
  REFUND: 'bg-[#EF4444]/20 text-[#EF4444]',
  PAYMENT: 'bg-[#F59E0B]/20 text-[#F59E0B]',
  ORDER: 'bg-[#8B5CF6]/20 text-[#8B5CF6]',
  ACCOUNT: 'bg-[#22C55E]/20 text-[#22C55E]',
  OTHER: 'bg-[#64748B]/20 text-[#64748B]',
};

const priorityColors: Record<string, string> = {
  HIGH: 'bg-[#EF4444]/20 text-[#EF4444]',
  URGENT: 'bg-[#EF4444]/20 text-[#EF4444]',
  NORMAL: 'bg-[#F59E0B]/20 text-[#F59E0B]',
  LOW: 'bg-[#64748B]/20 text-[#64748B]',
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-[#F59E0B]/20 text-[#F59E0B]',
  PENDING: 'bg-[#F59E0B]/20 text-[#F59E0B]',
  IN_PROGRESS: 'bg-[#3B82F6]/20 text-[#3B82F6]',
  WAITING_CUSTOMER: 'bg-[#8B5CF6]/20 text-[#8B5CF6]',
  RESOLVED: 'bg-[#22C55E]/20 text-[#22C55E]',
  CLOSED: 'bg-[#22C55E]/20 text-[#22C55E]',
};

const statusIcons: Record<string, React.ReactElement> = {
  OPEN: <Clock className="h-3 w-3" />,
  PENDING: <Clock className="h-3 w-3" />,
  IN_PROGRESS: <Loader2 className="h-3 w-3" />,
  WAITING_CUSTOMER: <AlertCircle className="h-3 w-3" />,
  RESOLVED: <CheckCircle className="h-3 w-3" />,
  CLOSED: <CheckCircle className="h-3 w-3" />,
};

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    OPEN: 'Open',
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    WAITING_CUSTOMER: 'Waiting',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
  };
  return map[s] || s;
};

const categoryLabel = (c: string) => {
  const map: Record<string, string> = {
    BILLING: 'Billing',
    TECHNICAL: 'Technical',
    REFUND: 'Refunds',
    PAYMENT: 'Payment',
    ORDER: 'Order',
    ACCOUNT: 'Account',
    OTHER: 'General',
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
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(
    null,
  );
  const [replyMessage, setReplyMessage] = useState('');

  // Filters
  const [activeTab, setActiveTab] = useState('all');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
      toast.error(error?.response?.data?.message || 'Failed to fetch tickets');
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
      toast.error(error?.response?.data?.message || 'Failed to load chat');
    } finally {
      setIsChatLoading(false);
      setTimeout(
        () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
        100,
      );
    }
  };

  // Live chat updates: backend pushes `ticket:message` over the socket
  // (forwarded by NotificationContext as a window event). Append the
  // message to the open chat without polling; bump the list row's
  // response count so the ticket list stays in sync.
  useEffect(() => {
    const handler = (evt: Event) => {
      const detail = (evt as CustomEvent).detail as
        | { ticketId: string; message: any }
        | undefined;
      if (!detail?.ticketId || !detail?.message) return;

      if (selectedTicket && detail.ticketId === selectedTicket.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === detail.message.id)) return prev;
          return [...prev, detail.message];
        });
        setTimeout(
          () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
          50,
        );
      }

      setTickets((prev) =>
        prev.map((t) =>
          t.id === detail.ticketId
            ? { ...t, responses: (t.responses || 0) + 1 }
            : t,
        ),
      );
    };
    window.addEventListener('ticket:message', handler);
    return () => window.removeEventListener('ticket:message', handler);
  }, [selectedTicket]);

  // Send reply
  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    setIsLoading(true);
    try {
      const newMessage = await replyToTicket(
        selectedTicket.id,
        replyMessage.trim(),
      );
      setMessages((prev) => {
        // Socket echo may have already appended this message — dedup
        // by id so admins don't see their own reply twice.
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      setReplyMessage('');
      toast.success('Reply sent successfully!');
      fetchTickets();
      fetchStats();
      setTimeout(
        () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
        100,
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send reply');
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
      toast.success('Ticket closed successfully!');
      setIsCloseModalOpen(false);
      setSelectedTicket(null);
      fetchTickets();
      fetchStats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to close ticket');
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
    closed: stats
      ? stats.totalTickets -
        stats.openTickets -
        stats.pendingTickets -
        stats.resolvedTickets
      : 0,
  };
  // Override current tab count with actual API total
  if (activeTab && !isPageLoading) {
    tabCounts[activeTab] = total;
  }

  const tabs = [
    { key: 'all', label: 'All Tickets', count: tabCounts.all },
    { key: 'open', label: 'Open', count: tabCounts.open },
    { key: 'pending', label: 'Pending', count: tabCounts.pending },
    { key: 'resolved', label: 'Resolved', count: tabCounts.resolved },
    { key: 'closed', label: 'Closed', count: tabCounts.closed },
  ];

  const filters = [
    {
      label: 'Priority',
      options: ['LOW', 'NORMAL', 'HIGH'],
      optionLabels: ['Low', 'Normal', 'High'],
      value: filterPriority,
      onChange: (value: string) => {
        setFilterPriority(value);
        setPage(1);
      },
    },
  ];

  const handleResetFilters = () => {
    setFilterPriority('');
    setSearchQuery('');
    setPage(1);
  };

  const renderCell = (item: AdminTicket, column: any) => {
    if (column.key === 'id') {
      return (
        <span className="font-mono text-sm text-white">
          {item.ticketNumber || item.id.slice(0, 8)}
        </span>
      );
    }

    if (column.key === 'subject') {
      return (
        <div
          className="flex max-w-[260px] items-center gap-2"
          title={item.subject}
        >
          <MessageSquare className="h-4 w-4 flex-shrink-0 text-[#3B82F6]" />
          <span className="min-w-0 flex-1 truncate font-medium text-white">
            {item.subject}
          </span>
        </div>
      );
    }

    if (column.key === 'user') {
      return (
        <span className="text-sm text-white">
          {item.user?.username || item.user?.email || 'N/A'}
        </span>
      );
    }

    if (column.key === 'category') {
      return (
        <span
          className={`rounded-lg px-3 py-1 text-xs font-medium ${categoryColors[item.category] || categoryColors.OTHER}`}
        >
          {categoryLabel(item.category)}
        </span>
      );
    }

    if (column.key === 'priority') {
      return (
        <span
          className={`rounded-lg px-3 py-1 text-xs font-medium ${priorityColors[item.priority] || priorityColors.LOW}`}
        >
          {item.priority}
        </span>
      );
    }

    if (column.key === 'status') {
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium whitespace-nowrap ${statusColors[item.status] || statusColors.OPEN}`}
        >
          {statusIcons[item.status] || statusIcons.OPEN}
          {statusLabel(item.status)}
        </span>
      );
    }

    if (column.key === 'created') {
      return (
        <span className="text-sm text-white">
          {new Date(item.createdAt).toLocaleString()}
        </span>
      );
    }

    if (column.key === 'actions') {
      const canClose = item.status !== 'CLOSED' && item.status !== 'RESOLVED';
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open ticket actions"
              className="size-icon inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] !p-0 text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[160px] border-[rgba(255,255,255,0.1)] bg-[#1E293B] p-1 text-white"
          >
            <DropdownMenuItem
              onSelect={() => handleViewChat(item)}
              className="cursor-pointer text-white focus:bg-[rgba(59,130,246,0.15)] focus:text-white"
            >
              <Eye className="mr-2 h-4 w-4 text-[#3B82F6]" />
              View Chat
            </DropdownMenuItem>
            {canClose && (
              <DropdownMenuItem
                onSelect={() => {
                  setSelectedTicket(item);
                  setIsCloseModalOpen(true);
                }}
                className="cursor-pointer text-[#EF4444] focus:bg-[rgba(239,68,68,0.12)] focus:text-[#EF4444]"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Close ticket
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
            label: 'Export',
            onClick: () => toast.info('Exporting tickets data...'),
            icon: <Download className="h-5 w-5" />,
          },
        ]}
      />

      {/* Status Tabs */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-[#3B82F6] text-white'
                : 'border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]'
            }`}
          >
            {tab.label}
            <span className="ml-2 rounded-full bg-[rgba(255,255,255,0.2)] px-2 py-0.5 text-xs">
              {isStatsLoading ? '...' : tab.count}
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
        onApplyFilters={() => {
          setPage(1);
          fetchTickets();
        }}
        onResetFilters={handleResetFilters}
      />

      {isPageLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
          <span className="ml-3 text-[#94A3B8]">Loading tickets...</span>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)]">
            <Inbox className="h-8 w-8 text-[#64748B]" />
          </div>
          <p className="text-lg font-medium text-white">No tickets found</p>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <>
          <AdminDataTable
            columns={columns}
            data={filteredTickets}
            renderCell={renderCell}
          />

          {/* Pagination */}
          <div className="mt-6 flex flex-col items-center justify-between gap-4 lg:flex-row">
            <p className="text-sm text-[#94A3B8]">
              Showing {filteredTickets.length > 0 ? (page - 1) * limit + 1 : 0}{' '}
              to {Math.min(page * limit, total)} of {total} tickets
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`rounded-xl px-4 py-2 text-sm transition-all ${
                      page === pageNum
                        ? 'bg-[#3B82F6] text-white hover:brightness-110'
                        : 'border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.12)]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
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
          setReplyMessage('');
          setMessages([]);
        }}
        title={`Ticket ${selectedTicket?.ticketNumber || selectedTicket?.id?.slice(0, 8) || ''}`}
        footer={
          selectedTicket &&
          selectedTicket.status !== 'CLOSED' &&
          selectedTicket.status !== 'RESOLVED' ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                Close Panel
              </button>
              <button
                onClick={handleSendReply}
                disabled={isLoading || !replyMessage.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
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
            <div className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] p-4">
              <h3 className="mb-3 font-semibold text-white">
                {selectedTicket.subject}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">User:</span>
                  <span className="text-white">
                    {selectedTicket.user?.username ||
                      selectedTicket.user?.email ||
                      'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Email:</span>
                  <span className="text-white">
                    {selectedTicket.user?.email || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Category:</span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${categoryColors[selectedTicket.category] || categoryColors.OTHER}`}
                  >
                    {categoryLabel(selectedTicket.category)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Priority:</span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${priorityColors[selectedTicket.priority] || priorityColors.LOW}`}
                  >
                    {selectedTicket.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Status:</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${statusColors[selectedTicket.status] || statusColors.OPEN}`}
                  >
                    {statusIcons[selectedTicket.status]}
                    {statusLabel(selectedTicket.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Created:</span>
                  <span className="text-white">
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Conversation */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">
                Conversation
              </h3>

              {isChatLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
                  <span className="ml-2 text-sm text-[#94A3B8]">
                    Loading messages...
                  </span>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-[#64748B]">No messages yet</p>
                </div>
              ) : (
                <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
                          msg.isStaff ? 'bg-[#22C55E]' : 'bg-[#3B82F6]'
                        }`}
                      >
                        {msg.isStaff
                          ? 'A'
                          : msg.senderName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {msg.isStaff
                              ? msg.senderName || 'Admin'
                              : msg.senderName}
                          </span>
                          <span className="text-xs text-[#64748B]">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div
                          className={`rounded-xl p-3 ${
                            msg.isStaff
                              ? 'border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.1)]'
                              : 'border border-[rgba(59,130,246,0.2)] bg-[rgba(59,130,246,0.1)]'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap text-white">
                            {msg.message}
                          </p>
                          {msg.imageUrl && (
                            <img
                              src={msg.imageUrl}
                              alt="Attachment"
                              className="mt-2 max-h-48 max-w-full cursor-pointer rounded-lg object-contain"
                              onClick={() =>
                                window.open(msg.imageUrl!, '_blank')
                              }
                            />
                          )}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {msg.attachments.map((attachment, idx) => (
                                <img
                                  key={idx}
                                  src={attachment.url}
                                  alt={attachment.originalName || 'Attachment'}
                                  className="max-h-48 max-w-full cursor-pointer rounded-lg object-contain"
                                  onClick={() =>
                                    window.open(attachment.url, '_blank')
                                  }
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
            {selectedTicket.status !== 'CLOSED' &&
              selectedTicket.status !== 'RESOLVED' && (
                <div className="border-t border-[rgba(255,255,255,0.18)] pt-6">
                  <h3 className="mb-4 text-base font-semibold text-white">
                    Send Reply
                  </h3>
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
                    className="w-full resize-none rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white placeholder:text-[#64748B] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
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
          label: 'Close Ticket',
          onClick: handleCloseTicket,
          loading: isLoading,
          variant: 'primary',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setIsCloseModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to close ticket{' '}
          <span className="font-medium text-white">
            {selectedTicket?.ticketNumber || selectedTicket?.id?.slice(0, 8)}
          </span>
          ?
        </p>
        <p className="mt-4 text-sm text-[#64748B]">
          The user will be notified that their ticket has been resolved and
          closed.
        </p>
      </AdminModal>
    </div>
  );
}
