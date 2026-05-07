interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
  }
  
  export function ErrorState({
    message = "Something went wrong",
    onRetry,
  }: ErrorStateProps) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#ef4444" strokeWidth="1.8"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="#ef4444"/>
          </svg>
        </div>
        <p className="text-sm text-slate-500">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-primary-500 font-medium hover:underline"
          >
            Try again
          </button>
        )}
      </div>
    );
  }