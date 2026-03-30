'use client';

interface PageHeaderProps {
  title: string;
  description: string;
  primaryAction?: { label: string; onClick: () => void; icon?: React.ReactNode };
  secondaryActions?: Array<{ label: string; onClick: () => void; icon?: React.ReactNode }>;
}

export function AdminPageHeader({ title, description, primaryAction, secondaryActions }: PageHeaderProps) {
  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl lg:text-3xl font-semibold mb-2">{title}</h1>
          <p className="text-[#94A3B8] text-sm lg:text-base">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          {secondaryActions?.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors text-sm font-medium"
            >
              {action.icon}
              <span className="hidden lg:inline">{action.label}</span>
            </button>
          ))}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors shadow-lg shadow-[#3B82F6]/20"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
