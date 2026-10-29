import React from 'react';
import { PunchEvent } from '../../types';
import { ArrowDownLeft, ArrowUpRight, ShieldCheck, MapPin } from 'lucide-react';

interface PunchTimelineProps {
  punches: PunchEvent[];
}

export const PunchTimeline: React.FC<PunchTimelineProps> = ({ punches }) => {
  if (punches.length === 0) {
    return (
      <div className="py-6 px-4 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500">No attendance punches recorded today yet.</p>
      </div>
    );
  }

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-2.5">
      {punches.map((punch, idx) => {
        const isPunchIn = punch.type === 'in';

        return (
          <div
            key={punch.id || idx}
            className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  isPunchIn
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                }`}
              >
                {isPunchIn ? (
                  <ArrowDownLeft className="w-5 h-5 stroke-[2.2]" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {isPunchIn ? 'Check-In' : 'Check-Out'}
                  </span>
                  <span className="text-[10px] text-slate-400">·</span>
                  <span className="text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300">
                    {formatTime(punch.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>GPS Verified</span>
                  </span>
                  {punch.distanceFromBranchMeters !== undefined && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{punch.distanceFromBranchMeters}m from HQ</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono text-slate-400 block tabular-nums">
                ±{punch.accuracyMeters}m
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
