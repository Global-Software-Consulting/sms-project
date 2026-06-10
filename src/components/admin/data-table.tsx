'use client';
import { ReactNode } from 'react';
import { AdminGlassCard } from './glass-card';
import { Inbox } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  width?: string;
  [key: string]: any;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  renderCell?: (item: any, column: Column) => ReactNode;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function AdminDataTable({ columns, data, renderCell, emptyIcon, emptyTitle, emptyDescription }: DataTableProps) {
  return (
    <AdminGlassCard>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.1)]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-left py-4 px-4 text-[#94A3B8] text-xs font-semibold uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
                      {emptyIcon || <Inbox className="w-8 h-8 text-[#64748B]" />}
                    </div>
                    <p className="text-white text-lg font-medium">{emptyTitle || 'No data found'}</p>
                    <p className="text-[#94A3B8] text-sm mt-1">{emptyDescription || 'Try adjusting your search or filters'}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="py-4 px-4 text-white text-sm">
                      {renderCell ? renderCell(item, column) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminGlassCard>
  );
}
