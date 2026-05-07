interface EmptyStateProps {
    message?: string;
    description?: string;
  }
  
  export function EmptyState({
    message = "No data found",
    description,
  }: EmptyStateProps) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="#94a3b8" strokeWidth="1.8"/>
            <line x1="8" y1="12" x2="16" y2="12" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">{message}</p>
        {description && (
          <p className="text-xs text-slate-400 text-center max-w-xs">{description}</p>
        )}
      </div>
    );
  }