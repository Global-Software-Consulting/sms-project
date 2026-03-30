'use client';

import { useState } from "react";
import { AdminDataTable } from "@/components/admin/data-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminFilterBar } from "@/components/admin/filter-bar";
import { AdminSlideOver } from "@/components/admin/slide-over";
import { AdminModal } from "@/components/admin/modal";
import { toast } from "sonner";
import { Eye, X, Download } from "lucide-react";

const initialContactsData = [
  {
    id: "CNT-001",
    email: "john.doe@email.com",
    message: "I have a question about pricing for bulk orders",
    status: "open",
    priority: "medium",
    date: "2024-03-15 14:30",
  },
  {
    id: "CNT-002",
    email: "jane.smith@email.com",
    message: "Unable to access my account after password reset",
    status: "open",
    priority: "high",
    date: "2024-03-14 10:20",
  },
  {
    id: "CNT-003",
    email: "mike.wilson@email.com",
    message: "Interested in enterprise plan features",
    status: "closed",
    priority: "low",
    date: "2024-03-13 16:10",
  },
];

const columns = [
  { key: "id", label: "ID", width: "10%" },
  { key: "email", label: "Email", width: "25%" },
  { key: "message", label: "Message", width: "35%" },
  { key: "priority", label: "Priority", width: "12%" },
  { key: "status", label: "Status", width: "10%" },
  { key: "actions", label: "Actions", width: "8%" },
];

export default function AdminContactPage() {
  const [contactsData, setContactsData] = useState(initialContactsData);
  const [showFilters, setShowFilters] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCloseContact = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setContactsData(
      contactsData.map((contact) =>
        contact.id === selectedContact.id
          ? { ...contact, status: "closed" }
          : contact
      )
    );

    setIsCloseModalOpen(false);
    setIsLoading(false);
    toast.success("Contact message closed successfully!");
  };

  const renderCell = (item: any, column: any) => {
    if (column.key === "message") {
      return (
        <span className="text-white text-sm truncate block max-w-md">
          {item.message}
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
      return (
        <span
          className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${
            item.status === "open"
              ? "bg-[#F59E0B]/20 text-[#F59E0B]"
              : "bg-[#22C55E]/20 text-[#22C55E]"
          }`}
        >
          {item.status}
        </span>
      );
    }

    if (column.key === "actions") {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedContact(item);
              setIsViewModalOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors group"
            title="View Message"
          >
            <Eye className="w-4 h-4 text-[#3B82F6] group-hover:scale-110 transition-transform" />
          </button>
          {item.status === "open" && (
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
        </div>
      );
    }

    return item[column.key];
  };

  const filters = [
    {
      label: "Status",
      options: ["Open", "Closed"],
    },
    {
      label: "Priority",
      options: ["High", "Medium", "Low"],
    },
  ];

  const totalCount = contactsData.length;
  const openCount = contactsData.filter((c) => c.status === "open").length;
  const closedCount = contactsData.filter((c) => c.status === "closed").length;

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
          <p className="text-white text-3xl font-semibold mt-2">{totalCount}</p>
        </div>
        <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] backdrop-blur-xl">
          <span className="text-[#94A3B8] text-sm">Open</span>
          <p className="text-white text-3xl font-semibold mt-2">{openCount}</p>
        </div>
        <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)] backdrop-blur-xl">
          <span className="text-[#94A3B8] text-sm">Closed</span>
          <p className="text-white text-3xl font-semibold mt-2">{closedCount}</p>
        </div>
      </div>

      <AdminFilterBar
        searchPlaceholder="Search by email or message..."
        onSearch={(value) => console.log("Search:", value)}
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <AdminDataTable columns={columns} data={contactsData} renderCell={renderCell} />

      {/* View Message Slide-Over */}
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
            {selectedContact?.status === "open" && (
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
                <div>
                  <span className="text-[#94A3B8] text-sm">Contact ID:</span>
                  <p className="text-white font-medium">{selectedContact.id}</p>
                </div>
                <div>
                  <span className="text-[#94A3B8] text-sm">Email:</span>
                  <p className="text-white font-medium">{selectedContact.email}</p>
                </div>
                <div>
                  <span className="text-[#94A3B8] text-sm">Date:</span>
                  <p className="text-white font-medium">{selectedContact.date}</p>
                </div>
                <div>
                  <span className="text-[#94A3B8] text-sm">Priority:</span>
                  <span
                    className={`ml-2 px-3 py-1 rounded-lg text-xs font-medium capitalize ${
                      selectedContact.priority === "high"
                        ? "bg-[#EF4444]/20 text-[#EF4444]"
                        : selectedContact.priority === "medium"
                        ? "bg-[#F59E0B]/20 text-[#F59E0B]"
                        : "bg-[#64748B]/20 text-[#64748B]"
                    }`}
                  >
                    {selectedContact.priority}
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8] text-sm">Status:</span>
                  <span
                    className={`ml-2 px-3 py-1 rounded-lg text-xs font-medium capitalize ${
                      selectedContact.status === "open"
                        ? "bg-[#F59E0B]/20 text-[#F59E0B]"
                        : "bg-[#22C55E]/20 text-[#22C55E]"
                    }`}
                  >
                    {selectedContact.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white text-base font-semibold mb-3">Message</h3>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)]">
                <p className="text-white text-sm leading-relaxed">
                  {selectedContact.message}
                </p>
              </div>
            </div>
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
    </div>
  );
}
