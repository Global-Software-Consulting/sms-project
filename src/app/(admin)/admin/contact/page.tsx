'use client';

import { useState, useEffect, useCallback } from "react";
import { AdminDataTable } from "@/components/admin/data-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminFilterBar } from "@/components/admin/filter-bar";
import { AdminSlideOver } from "@/components/admin/slide-over";
import { AdminModal } from "@/components/admin/modal";
import { toast } from "sonner";
import { Eye, Trash2, Download, Loader2, X, Inbox } from "lucide-react";
import {
  getAdminContacts,
  getAdminContactStats,
  markContactRead,
  archiveContact,
  deleteContact,
  type ContactSubmission,
  type ContactStats,
  type ContactStatus,
  type ContactQueryParams,
} from '@/lib/api/adminContactApi';

const columns = [
  { key: "id", label: "ID", width: "8%" },
  { key: "email", label: "Email", width: "20%" },
  { key: "subject", label: "Subject", width: "20%" },
  { key: "priority", label: "Priority", width: "10%" },
  { key: "status", label: "Status", width: "10%" },
  { key: "date", label: "Date", width: "14%" },
  { key: "actions", label: "Actions", width: "18%" },
];

const statusDisplay = (s: string) => {
  if (s === 'ARCHIVED' || s === 'REPLIED') return 'Closed';
  return 'Open';
};

const priorityColors: Record<string, string> = {
  HIGH: "bg-[#EF4444]/20 text-[#EF4444]",
  MEDIUM: "bg-[#F59E0B]/20 text-[#F59E0B]",
  LOW: "bg-[#64748B]/20 text-[#64748B]",
};

export default function AdminContactPage() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const data = await getAdminContactStats();
      setStats(data);
    } catch { /* stats optional */ }
    finally { setIsStatsLoading(false); }
  }, []);

  const fetchContacts = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const params: ContactQueryParams = {
        page,
        limit,
        status: (filterStatus as ContactStatus) || undefined,
        search: searchQuery || undefined,
      };
      const response = await getAdminContacts(params);
      setContacts(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotal(response.meta?.total || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch contacts");
    } finally {
      setIsPageLoading(false);
    }
  }, [page, filterStatus, searchQuery]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  // View contact — mark as read
  const handleView = async (contact: ContactSubmission) => {
    setSelectedContact(contact);
    setIsViewModalOpen(true);
    if (contact.status === 'NEW') {
      try {
        const updated = await markContactRead(contact.id);
        setSelectedContact(updated);
        fetchContacts();
        fetchStats();
      } catch { /* silent */ }
    }
  };

  // Close (archive)
  const handleCloseContact = async () => {
    if (!selectedContact) return;
    setIsLoading(true);
    try {
      await archiveContact(selectedContact.id);
      toast.success("Contact closed successfully!");
      setIsCloseModalOpen(false);
      setSelectedContact(null);
      fetchContacts();
      fetchStats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to close contact");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!selectedContact) return;
    setIsLoading(true);
    try {
      await deleteContact(selectedContact.id);
      toast.success("Contact deleted!");
      setIsDeleteModalOpen(false);
      setSelectedContact(null);
      fetchContacts();
      fetchStats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilterStatus("");
    setSearchQuery("");
    setPage(1);
  };

  const filters = [
    {
      label: "Status",
      options: ["OPEN", "CLOSED"],
      optionLabels: ["Open", "Closed"],
      value: filterStatus,
      onChange: (value: string) => { setFilterStatus(value); setPage(1); },
    },
  ];

  const renderCell = (item: ContactSubmission, column: any) => {
    if (column.key === "id") {
      return <span className="text-[#94A3B8] text-xs font-mono">{item.id.slice(0, 8)}</span>;
    }

    if (column.key === "email") {
      return <span className="text-white text-sm">{item.email}</span>;
    }

    if (column.key === "subject") {
      return (
        <span className="text-white text-sm truncate block max-w-[200px]">
          {item.subject || item.message?.slice(0, 50)}
        </span>
      );
    }

    if (column.key === "priority") {
      const p = item.priority?.toUpperCase() || "MEDIUM";
      return (
        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${priorityColors[p] || priorityColors.MEDIUM}`}>
          {p}
        </span>
      );
    }

    if (column.key === "status") {
      const display = statusDisplay(item.status);
      return (
        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${display === 'Closed' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'}`}>
          {display}
        </span>
      );
    }

    if (column.key === "date") {
      return <span className="text-white text-sm">{new Date(item.createdAt).toLocaleDateString()}</span>;
    }

    if (column.key === "actions") {
      return (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleView(item)}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title="View"
          >
            <Eye className="w-4 h-4 text-[#3B82F6] group-hover:scale-110 transition-transform" />
          </button>
          {item.status !== 'ARCHIVED' && item.status !== 'REPLIED' && (
            <button
              onClick={() => {
                setSelectedContact(item);
                setIsCloseModalOpen(true);
              }}
              className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
              title="Close"
            >
              <X className="w-4 h-4 text-[#EF4444] group-hover:scale-110 transition-transform" />
            </button>
          )}
          <button
            onClick={() => {
              setSelectedContact(item);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-[#EF4444] group-hover:scale-110 transition-transform" />
          </button>
        </div>
      );
    }

    return (item as any)[column.key];
  };

  return (
    <div className="p-4 lg:p-8">
      <AdminPageHeader
        title="Contact Form Management"
        description="View and manage customer inquiries and contact messages"
        secondaryActions={[
          {
            label: "Export",
            onClick: () => toast.info("Exporting contact data..."),
            icon: <Download className="w-5 h-5" />,
          },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] backdrop-blur-xl">
          <span className="text-[#94A3B8] text-sm">Total Messages</span>
          <p className="text-white text-3xl font-semibold mt-2">{isStatsLoading ? "..." : stats?.total ?? 0}</p>
        </div>
        <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] backdrop-blur-xl">
          <span className="text-[#94A3B8] text-sm">Open</span>
          <p className="text-[#F59E0B] text-3xl font-semibold mt-2">{isStatsLoading ? "..." : (stats?.new ?? 0) + (stats?.read ?? 0)}</p>
        </div>
        <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] backdrop-blur-xl">
          <span className="text-[#94A3B8] text-sm">Closed</span>
          <p className="text-[#22C55E] text-3xl font-semibold mt-2">{isStatsLoading ? "..." : (stats?.replied ?? 0) + (stats?.archived ?? 0)}</p>
        </div>
      </div>

      <AdminFilterBar
        searchPlaceholder="Search by email or message..."
        onSearch={(value) => { setSearchQuery(value); setPage(1); }}
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onApplyFilters={() => { setPage(1); fetchContacts(); }}
        onResetFilters={handleResetFilters}
      />

      {isPageLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
          <span className="ml-3 text-[#94A3B8]">Loading contacts...</span>
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-[#64748B]" />
          </div>
          <p className="text-white text-lg font-medium">No contact messages found</p>
          <p className="text-[#94A3B8] text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <AdminDataTable columns={columns} data={contacts} renderCell={renderCell} />

          <div className="flex flex-col lg:flex-row items-center justify-between mt-6 gap-4">
            <p className="text-[#94A3B8] text-sm">
              Showing {contacts.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
              {Math.min(page * limit, total)} of {total} contacts
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white text-sm hover:bg-[rgba(255,255,255,0.12)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${
                    page === i + 1
                      ? "bg-[#3B82F6] text-white"
                      : "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
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

      {/* View Contact Slide-Over */}
      <AdminSlideOver
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Contact Message Details"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
            >
              Close
            </button>
            {selectedContact && selectedContact.status !== 'ARCHIVED' && selectedContact.status !== 'REPLIED' && (
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setIsCloseModalOpen(true);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-medium transition-colors"
              >
                Mark as Closed
              </button>
            )}
          </div>
        }
      >
        {selectedContact && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8] text-sm">Name:</span>
                  <span className="text-white font-medium">{selectedContact.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8] text-sm">Email:</span>
                  <span className="text-white font-medium">{selectedContact.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8] text-sm">Subject:</span>
                  <span className="text-white font-medium">{selectedContact.subject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8] text-sm">Priority:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[selectedContact.priority?.toUpperCase()] || priorityColors.MEDIUM}`}>
                    {selectedContact.priority?.toUpperCase() || "MEDIUM"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8] text-sm">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusDisplay(selectedContact.status) === 'Closed' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'}`}>
                    {statusDisplay(selectedContact.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8] text-sm">Date:</span>
                  <span className="text-white">{new Date(selectedContact.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white text-base font-semibold mb-3">Message</h3>
              <div className="p-4 rounded-xl bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.2)]">
                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>
            </div>

            {selectedContact.replyMessage && (
              <div>
                <h3 className="text-white text-base font-semibold mb-3">Admin Reply</h3>
                <div className="p-4 rounded-xl bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]">
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedContact.replyMessage}
                  </p>
                  {selectedContact.repliedAt && (
                    <p className="text-[#64748B] text-xs mt-2">
                      Replied on {new Date(selectedContact.repliedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </AdminSlideOver>

      {/* Close Contact Modal */}
      <AdminModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Close Contact Message"
        primaryAction={{
          label: "Mark as Closed",
          onClick: handleCloseContact,
          loading: isLoading,
          variant: "primary",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsCloseModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to mark this contact message as closed?
        </p>
        <p className="text-[#64748B] text-sm mt-4">
          You can view closed messages anytime in the archives.
        </p>
      </AdminModal>

      {/* Delete Modal */}
      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Contact"
        primaryAction={{
          label: "Delete",
          onClick: handleDelete,
          loading: isLoading,
          variant: "danger",
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsDeleteModalOpen(false),
        }}
      >
        <p className="text-[#94A3B8]">
          Are you sure you want to delete this contact message from{" "}
          <span className="text-white font-medium">{selectedContact?.email}</span>?
        </p>
        <p className="text-[#EF4444] text-sm mt-4">
          This action cannot be undone.
        </p>
      </AdminModal>
    </div>
  );
}