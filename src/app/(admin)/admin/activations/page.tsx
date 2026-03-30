'use client';

import { AdminDataTable } from '@/components/admin/data-table';
import { Search, Filter, X, Eye, Clock } from "lucide-react";

const activationsData = [
  {
    id: "ACT-10001",
    user: "john_doe",
    country: "🇺🇸 United States",
    service: "WhatsApp",
    phoneNumber: "+1 555-0123",
    status: "Active",
    createdTime: "2026-03-11 09:45",
    expirationTime: "2026-03-11 10:15",
  },
  {
    id: "ACT-10002",
    user: "jane_smith",
    country: "🇬🇧 United Kingdom",
    service: "Telegram",
    phoneNumber: "+44 20-7946-0958",
    status: "Completed",
    createdTime: "2026-03-11 09:30",
    expirationTime: "2026-03-11 10:00",
  },
  {
    id: "ACT-10003",
    user: "mike_wilson",
    country: "🇨🇦 Canada",
    service: "Instagram",
    phoneNumber: "+1 416-555-0198",
    status: "Waiting for SMS",
    createdTime: "2026-03-11 09:35",
    expirationTime: "2026-03-11 10:05",
  },
  {
    id: "ACT-10004",
    user: "sarah_jones",
    country: "🇦🇺 Australia",
    service: "Facebook",
    phoneNumber: "+61 2-8234-5678",
    status: "Cancelled",
    createdTime: "2026-03-11 09:20",
    expirationTime: "2026-03-11 09:50",
  },
  {
    id: "ACT-10005",
    user: "alex_brown",
    country: "🇺🇸 United States",
    service: "Twitter",
    phoneNumber: "+1 555-0156",
    status: "Expired",
    createdTime: "2026-03-11 08:45",
    expirationTime: "2026-03-11 09:15",
  },
];

const columns = [
  { key: "id", label: "Activation ID", width: "10%" },
  { key: "user", label: "User", width: "10%" },
  { key: "country", label: "Country", width: "14%" },
  { key: "service", label: "Service", width: "10%" },
  { key: "phoneNumber", label: "Phone Number", width: "14%" },
  { key: "status", label: "Status", width: "12%" },
  { key: "createdTime", label: "Created", width: "12%" },
  { key: "expirationTime", label: "Expires", width: "10%" },
  { key: "actions", label: "Actions", width: "8%" },
];

export default function AdminActivationsPage() {
  const renderCell = (item: any, column: any) => {
    if (column.key === "status") {
      const statusColors: Record<string, string> = {
        Active: "bg-[#3B82F6]/20 text-[#3B82F6]",
        "Waiting for SMS": "bg-[#F59E0B]/20 text-[#F59E0B]",
        Completed: "bg-[#22C55E]/20 text-[#22C55E]",
        Cancelled: "bg-[#64748B]/20 text-[#64748B]",
        Expired: "bg-[#EF4444]/20 text-[#EF4444]",
      };

      return (
        <span
          className={`px-3 py-1 rounded-lg text-xs font-medium ${
            statusColors[item.status]
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
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-[#3B82F6]" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
            title="Extend Time"
          >
            <Clock className="w-4 h-4 text-[#F59E0B]" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4 text-[#EF4444]" />
          </button>
        </div>
      );
    }

    return item[column.key];
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-3xl font-semibold mb-2">SMS Activations</h1>
        <p className="text-[#94A3B8]">
          Monitor and manage all SMS activations in real-time.
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search activations..."
              className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-[#64748B] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] w-80"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors">
            <Filter className="w-5 h-5" />
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]">
            <option>All Status</option>
            <option>Active</option>
            <option>Waiting for SMS</option>
            <option>Completed</option>
            <option>Cancelled</option>
            <option>Expired</option>
          </select>
        </div>
      </div>

      <AdminDataTable columns={columns} data={activationsData} renderCell={renderCell} />
    </div>
  );
}
