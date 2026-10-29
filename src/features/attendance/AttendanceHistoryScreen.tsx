import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/api/client';
import { DailyAttendanceRecord, AttendanceStatus } from '../../types';
import { StatusBadge } from '../../components/feedback/StatusBadge';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/FeedbackComponents';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  X,
} from 'lucide-react';

export const AttendanceHistoryScreen: React.FC = () => {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 29)); // Oct 2026
  const [records, setRecords] = useState<DailyAttendanceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DailyAttendanceRecord | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<AttendanceStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isLoading, setIsLoading] = useState(true);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getAttendanceHistory(month, year);
      setRecords(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [month, year]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const filteredRecords = useMemo(() => {
    if (selectedFilter === 'all') return records;
    return records.filter((r) => r.status === selectedFilter);
  }, [records, selectedFilter]);

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 = Sun
    const totalDays = new Date(year, month, 0).getDate();
    const days: Array<{ dayNumber: number | null; record?: DailyAttendanceRecord }> = [];

    // Empty lead slots
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: null });
    }

    // Days in current month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const rec = records.find((r) => r.date === dateStr);
      days.push({ dayNumber: d, record: rec });
    }

    return days;
  }, [records, month, year]);

  const monthLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/attendance')}
            aria-label="Back to today attendance"
            className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Attendance History
            </h2>
            <p className="text-xs text-slate-500">Monthly audit log & punches</p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center p-0.5 bg-slate-200/80 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Month Navigator Bar */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {monthLabel}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Status Filter Scrollbar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {(
          [
            'all',
            'present',
            'late',
            'on_leave',
            'absent',
            'weekly_off',
            'holiday',
          ] as const
        ).map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-amber-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {filter === 'all'
                ? 'All Statuses'
                : filter.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          );
        })}
      </div>

      {/* View Content */}
      {isLoading ? (
        <LoadingState message="Fetching monthly attendance records..." />
      ) : viewMode === 'calendar' ? (
        /* Calendar Grid View */
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <span
                key={idx}
                className="text-[11px] font-semibold text-slate-400 py-1"
              >
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((slot, index) => {
              if (slot.dayNumber === null) {
                return <div key={index} className="h-10" />;
              }

              const rec = slot.record;
              const hasPunches = rec && rec.status !== 'weekly_off';

              let dotColor = 'bg-slate-300';
              if (rec?.status === 'present') dotColor = 'bg-emerald-500';
              if (rec?.status === 'late') dotColor = 'bg-amber-500';
              if (rec?.status === 'on_leave') dotColor = 'bg-blue-500';
              if (rec?.status === 'absent') dotColor = 'bg-rose-500';
              if (rec?.status === 'holiday') dotColor = 'bg-purple-500';

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => rec && setSelectedRecord(rec)}
                  className={`h-11 rounded-lg flex flex-col items-center justify-center p-1 text-xs transition-colors relative ${
                    rec ? 'hover:bg-slate-100 dark:hover:bg-slate-700' : 'opacity-40'
                  }`}
                >
                  <span className="font-medium tabular-nums text-slate-800 dark:text-slate-200">
                    {slot.dayNumber}
                  </span>
                  {hasPunches && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1 ${dotColor}`}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-2.5">
          {filteredRecords.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title="No records found"
              description="No attendance records match your selected filter criteria for this month."
            />
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {record.date}
                    </span>
                    <StatusBadge status={record.status} />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="tabular-nums">
                      IN: {record.firstIn || '--:--'}
                    </span>
                    <span>·</span>
                    <span className="tabular-nums">
                      OUT: {record.lastOut || '--:--'}
                    </span>
                    {record.lateMinutes > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-amber-600 font-medium">
                          {record.lateMinutes}m Late
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold tabular-nums text-slate-800 dark:text-slate-200 block">
                    {record.totalWorkingMinutes > 0
                      ? `${Math.floor(record.totalWorkingMinutes / 60)}h ${
                          record.totalWorkingMinutes % 60
                        }m`
                      : '--'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {record.punches.length} punches
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Daily Record Breakdown Drawer / Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {selectedRecord.date}
                </h3>
                <span className="text-xs text-slate-500">
                  {selectedRecord.shiftName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close detail modal"
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500">Attendance Status</span>
                <StatusBadge status={selectedRecord.status} />
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500">First Punch IN</span>
                <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                  {selectedRecord.firstIn || 'None'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500">Last Punch OUT</span>
                <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                  {selectedRecord.lastOut || 'None'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500">Total Work Duration</span>
                <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                  {Math.floor(selectedRecord.totalWorkingMinutes / 60)}h {selectedRecord.totalWorkingMinutes % 60}m
                </span>
              </div>
              {selectedRecord.remarks && (
                <div className="py-2 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-600 dark:text-slate-400">
                  {selectedRecord.remarks}
                </div>
              )}
            </div>

            {selectedRecord.punches.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Punch Log
                </h4>
                {selectedRecord.punches.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px]"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {p.type === 'in' ? 'IN' : 'OUT'} · {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-slate-400">GPS ±{p.accuracyMeters}m</span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedRecord(null)}
              className="w-full h-11 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
