import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl flex flex-col items-center max-w-xs text-center border border-slate-100 dark:border-slate-800">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Loader2 className="w-7 h-7 text-amber-600 animate-spin mb-2" />
      <p className="text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
};
