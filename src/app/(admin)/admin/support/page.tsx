'use client';

import React, { useState } from "react";
import { AdminDataTable } from "@/components/admin/data-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminFilterBar } from "@/components/admin/filter-bar";
import { AdminSlideOver } from "@/components/admin/slide-over";
import { AdminModal } from "@/components/admin/modal";
import { toast } from "sonner";
import { MessageSquare, Clock, CheckCircle, Send, Download } from "lucide-react";

const initialTicketsData = [
  {
    id: "TKT-001",
    subject: "Payment not processed",
    user: "john_doe",
    email: "john.doe@email.com",
    category: "Billing",
    priority: "high",
    status: "open",
    created: "2024-03-15 14:30",
    lastReply: "2024-03-15 15:45",
  },
  {
    id: "TKT-002",
    subject: "Cannot activate SMS service",
    user: "jane_smith",
    email: "jane.smith@email.com",
    category: "Technical",
    priority: "medium",
    status: "replied",
    created: "2024-03-14 10:20",
    lastReply: "2024-03-14 11:30",
  },
  {
    id: "TKT-003",
    subject: "Refund request for order #12345",
    user: "mike_wilson",
    email: "mike.wilson@email.com",
    category: "Refunds",
    priority: "high",
    status: "open",
    created: "2024-03-13 16:10",
    lastReply: "2024-03-13 16:10",
  },
  {
    id: "TKT-004",
    subject: "Question about API integration",
    user: "sarah_jones",
    email: "sarah.jones@email.com",
    category: "General",
    priority: "low",
    status: "closed",
    created: "2024-03-12 09:15",
    lastReply: "2024-03-12 14:20",
  },
];

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

export default function AdminSupportPage() {
  const [ticketsData, setTicketsData] = useState(initialTicketsData);
  const [showFilters, setShowFilters] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");

  const [activeTab, setActiveTab] = useState("all");

  const filteredTickets = ticketsData.filter((ticket) => {
    if (activeTab === "all") return true;
    return ticket.status === activeTab;
  });

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setTicketsData(
      ticketsData.map((ticket) =>
        ticket.id === selectedTicket.id
          ? { ...ticket, status: "replied", lastReply: new Date().toLocaleString() }
          : ticket
      )
    );

    setReplyMessage("");
    setIsLoading(false);
    toast.success("Reply sent successfully!");
  };

  const handleCloseTicket = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setTicketsData(
      ticketsData.map((ticket) =>
        ticket.id === selectedTicket.id ? { ...ticket, status: "closed" } : ticket
      )
    );

    setIsCloseModalOpen(false);
    setIsLoading(false);
    toast.success("Ticket closed successfully!");
  };

  const renderCell = (item: any, column: any) => {
    if (column.key === "subject") {
      return (
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#3B82F6]" />
          <span className="text-white font-medium truncate">{item.subject}</span>
        </div>
      );
    }

    if (column.key === "category") {
      const colors: Record<string, string> = {
        Billing: "bg-[#F59E0B]/20 text-[#F59E0B]",
        Technical: "bg-[#3B82F6]/20 text-[#3B82F6]",
        Refunds: "bg-[#EF4444]/20 text-[#EF4444]",
        General: "bg-[#64748B]/20 text-[#64748B]",
      };
      return (
        <span
          className={`px-3 py-1 rounded-lg text-xs font-medium ${
            colors[item.category] || "bg-[#64748B]/20 text-[#64748B]"
          }`}
        >
          {item.category}
        </span>
      );
    }

    if (column.key === "priority") {
      const colors: Record<string, string> = {
        high: "bg-[#EF4444]/20 text-[#EF4444]",
        medium: "bg-[#F59E0B]/20 text-[#F59E0B]",
        low: "bg-[#64748B]/20 text-[#64748B]",
      };
      return (
        <span
          className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${
            colors[item.priority]
          }`}
        >
          {item.priority}
        </span>
      );
    }

    if (column.key === "status") {
      const icons: Record<string, React.ReactElement> = {
        open: <Clock className="w-3 h-3" />,
        replied: <Send className="w-3 h-3" />,
        closed: <CheckCircle className="w-3 h-3" />,
      };
      const colors: Record<string, string> = {
        open: "bg-[#F59E0B]/20 text-[#F59E0B]",
        replied: "bg-[#3B82F6]/20 text-[#3B82F6]",
        closed: "bg-[#22C55E]/20 text-[#22C55E]",
      };
      return (
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium capitalize ${
            colors[item.status]
          }`}
        >
          {icons[item.status]}
          {item.status}
        </span>
      );
    }

    if (column.key === "actions") {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedTicket(item);
              setIsViewModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-[rgba(59,130,246,0.1)] hover:bg-[rgba(59,130,246,0.15)] text-[#3B82F6] text-xs font-medium transition-colors"
          >
            View Chat
          </button>
          {item.status !== "closed" && (
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

    return item[column.key];
  };

  const tabs = [
    { key: "all", label: "All Tickets", count: ticketsData.length },
    {
      key: "open",
      label: "Open",
      count: ticketsData.filter((t) => t.status === "open").length,
    },
    {
      key: "replied",
      label: "Replied",
      count: ticketsData.filter((t) => t.status === "replied").length,
    },
    {
      key: "closed",
      label: "Closed",
      count: ticketsData.filter((t) => t.status === "closed").length,
    },
  ];

  const filters = [
    {
      label: "Priority",
      options: ["High", "Medium", "Low"],
    },
    {
      label: "Category",
      options: ["Billing", "Technical", "Refunds", "General"],
    },
  ];

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
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-[#3B82F6] text-white"
                : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] text-[#94A3B8] hover:bg-[rgba(255,255,255,0.08)]"
            }`}
          >
            {tab.label}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.2)] text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <AdminFilterBar
        searchPlaceholder="Search tickets by ID, subject, or user..."
        onSearch={(value) => console.log("Search:", value)}
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <AdminDataTable
        columns={columns}
        data={filteredTickets}
        renderCell={renderCell}
      />

      <div className="flex flex-col lg:flex-row items-center justify-between mt-6 gap-4">
        <p className="text-[#94A3B8] text-sm">
          Showing 1 to {filteredTickets.length} of {filteredTickets.length}{" "}
          tickets
        </p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm hover:bg-[rgba(255,255,255,0.12)] transition-colors">
            Previous
          </button>
          <button className="px-4 py-2 rounded-xl bg-[#3B82F6] text-white text-sm hover:brightness-110 transition-all">
            1
          </button>
          <button className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm hover:bg-[rgba(255,255,255,0.12)] transition-colors">
            Next
          </button>
        </div>
      </div>

      {/* View Ticket Chat Slide-Over */}
      <AdminSlideOver
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setReplyMessage("");
        }}
        title={`Ticket ${selectedTicket?.id}`}
        footer={
          selectedTicket?.status !== "closed" && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
              >
                Close
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
          )
        }
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)]">
              <h3 className="text-white font-semibold mb-3">
                {selectedTicket.subject}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">User:</span>
                  <span className="text-white">{selectedTicket.user}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Email:</span>
                  <span className="text-white">{selectedTicket.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Created:</span>
                  <span className="text-white">{selectedTicket.created}</span>
                </div>
              </div>
            </div>

            {/* Conversation */}
            <div className="space-y-4">
              <h3 className="text-white text-base font-semibold">
                Conversation
              </h3>

              {/* User Message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-white text-sm font-semibold">
                  {selectedTicket.user.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white text-sm font-medium">
                      {selectedTicket.user}
                    </span>
                    <span className="text-[#64748B] text-xs">
                      {selectedTicket.created}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)]">
                    <p className="text-white text-sm">
                      Hi, I need help with my recent payment. The transaction
                      went through but my balance hasn't updated. Can you please
                      look into this?
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Reply (if replied) */}
              {selectedTicket.status === "replied" && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center text-white text-sm font-semibold">
                    A
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-sm font-medium">
                        Admin
                      </span>
                      <span className="text-[#64748B] text-xs">
                        {selectedTicket.lastReply}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]">
                      <p className="text-white text-sm">
                        Thank you for contacting us. We're looking into this
                        issue and will update your balance shortly.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reply Input */}
            {selectedTicket.status !== "closed" && (
              <div className="pt-6 border-t border-[rgba(255,255,255,0.18)]">
                <h3 className="text-white text-base font-semibold mb-4">
                  Send Reply
                </h3>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
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
            {selectedTicket?.id}
          </span>
          ?
        </p>
        <p className="text-[#64748B] text-sm mt-4">
          The user will be notified that their ticket has been resolved and
          closed.
        </p>
      </AdminModal>
    </div>
  );
}
