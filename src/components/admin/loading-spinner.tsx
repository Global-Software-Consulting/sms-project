'use client';

export function AdminLoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div
        className={`${sizeClasses[size]} border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full animate-spin`}
      />
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-12 bg-[rgba(255,255,255,0.05)] rounded-lg animate-pulse flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
