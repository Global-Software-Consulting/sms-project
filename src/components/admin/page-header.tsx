'use client';

interface PageHeaderProps {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }>;
}

export function AdminPageHeader({
  title,
  description,
  primaryAction,
  secondaryActions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-semibold text-white lg:text-3xl">
            {title}
          </h1>
          <p className="text-sm text-[#94A3B8] lg:text-base">{description}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          {secondaryActions?.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] sm:w-auto sm:justify-start"
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#3B82F6]/20 transition-colors hover:bg-[#2563EB] sm:w-auto sm:justify-start"
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
