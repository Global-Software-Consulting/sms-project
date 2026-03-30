'use client';
import { ReactNode } from 'react';
import { AdminGlassCard } from './glass-card';

interface Column {
  key: string;
  label: string;
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  renderCell?: (item: any, column: Column) => ReactNode;
}

export function AdminDataTable({ columns, data, renderCell }: DataTableProps) {
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
            {data.map((item, index) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </AdminGlassCard>
  );
}
