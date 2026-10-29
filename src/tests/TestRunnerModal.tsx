import React, { useState } from 'react';
import { runAllAutomatedTests, TestCaseResult } from './testSuite';
import { CheckCircle2, XCircle, Play, Loader2, X, ShieldCheck } from 'lucide-react';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [results, setResults] = useState<TestCaseResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const res = await runAllAutomatedTests();
      setResults(res);
    } finally {
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-150 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Automated Verification Suite
              </h3>
              <p className="text-[11px] text-slate-400">Section 18 test specifications</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action / Status Summary */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-3 flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              {totalCount > 0 ? `${passedCount} / ${totalCount} Passed` : 'Ready to Run'}
            </span>
            <span className="text-[10px] text-slate-400">
              {totalCount > 0
                ? `${Math.round((passedCount / totalCount) * 100)}% specifications verified`
                : 'Runs all 16 mobile test cases'}
            </span>
          </div>

          <button
            type="button"
            disabled={isRunning}
            onClick={handleRunTests}
            className="px-3.5 py-1.5 bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Tests</span>
              </>
            )}
          </button>
        </div>

        {/* Test Result List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tap "Run Tests" to execute all automated test specifications.
            </div>
          ) : (
            results.map((r, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5"
              >
                {r.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {r.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {r.durationMs}ms
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Category: {r.category} · {r.message}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full h-11 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs shrink-0"
        >
          Close
        </button>
      </div>
    </div>
  );
};
