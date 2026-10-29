import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api/client';
import { Holiday } from '../../types';
import { Palmtree, Calendar, X } from 'lucide-react';

interface HolidaysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HolidaysModal: React.FC<HolidaysModalProps> = ({ isOpen, onClose }) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    if (isOpen) {
      apiClient.getHolidays().then(setHolidays).catch(() => []);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-150 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Palmtree className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Company Holiday Calendar
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
          {holidays.map((h) => {
            const isPublic = h.type === 'public';
            return (
              <div
                key={h.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    {h.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-slate-500 mt-0.5 text-[11px]">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="tabular-nums">{h.date}</span>
                    {h.description && (
                      <>
                        <span>·</span>
                        <span>{h.description}</span>
                      </>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                    isPublic
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {h.type}
                </span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full h-11 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs shrink-0"
        >
          Done
        </button>
      </div>
    </div>
  );
};
