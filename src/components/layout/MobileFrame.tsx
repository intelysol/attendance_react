import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex justify-center selection:bg-amber-500 selection:text-white">
      {/* Mobile container centered on desktop with subtle shadow */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 dark:bg-slate-900 shadow-2xl relative flex flex-col border-x border-slate-200/60 dark:border-slate-800/60">
        <main className="flex-1 pb-20">{children}</main>
      </div>
    </div>
  );
};
