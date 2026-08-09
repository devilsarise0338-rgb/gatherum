import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ 
  title = "Something went wrong", 
  message = "We couldn't load this data. Please try again.", 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center bg-red-50/50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30" role="alert">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-500 mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-full font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
