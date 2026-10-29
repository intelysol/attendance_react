import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api/client';
import { LeaveType, LeaveApplication, LeaveApplyRequest } from '../../types';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState, ConfirmDialog } from '../../components/feedback/FeedbackComponents';
import {
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  X,
  Palmtree,
} from 'lucide-react';

export const LeaveScreen: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [cancellingLeaveId, setCancellingLeaveId] = useState<string | null>(null);

  // Form State
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [startDate, setStartDate] = useState('2026-11-05');
  const [endDate, setEndDate] = useState('2026-11-05');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState<'first_half' | 'second_half'>('first_half');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadLeaveData = async () => {
    try {
      setIsLoading(true);
      const [types, apps] = await Promise.all([
        apiClient.getLeaveTypes(),
        apiClient.getLeaveApplications(),
      ]);
      setLeaveTypes(types);
      setApplications(apps);
      if (types.length > 0 && !selectedTypeId) {
        setSelectedTypeId(types[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedTypeId) {
      setFormError('Please select a leave category.');
      return;
    }
    if (!startDate || !endDate) {
      setFormError('Please select start and end dates.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setFormError('End date cannot precede start date.');
      return;
    }
    if (!reason.trim()) {
      setFormError('Please provide a reason for the leave application.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: LeaveApplyRequest = {
        leave_type_id: selectedTypeId,
        start_date: startDate,
        end_date: endDate,
        is_half_day: isHalfDay,
        half_day_period: isHalfDay ? halfDayPeriod : undefined,
        reason: reason.trim(),
      };

      await apiClient.applyLeave(payload);
      setShowApplyModal(false);
      setReason('');
      setIsHalfDay(false);
      await loadLeaveData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFormError(error.message || 'Failed to submit leave application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingLeaveId) return;
    try {
      await apiClient.cancelLeave(cancellingLeaveId);
      setCancellingLeaveId(null);
      await loadLeaveData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || 'Failed to cancel application.');
    }
  };

  if (isLoading && leaveTypes.length === 0) {
    return <LoadingState message="Loading leave balances and history..." />;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Leave Management
          </h2>
          <p className="text-xs text-slate-500">Balances & self-service requests</p>
        </div>

        <button
          type="button"
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-amber-600 rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Apply Leave</span>
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-2 gap-3">
        {leaveTypes.map((type) => (
          <div
            key={type.id}
            className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {type.name}
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                {type.code}
              </span>
            </div>

            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {type.availableDays}
              </span>
              <span className="text-xs text-slate-400">/ {type.allocatedDays} left</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <span>Used: {type.usedDays}d</span>
              {type.pendingDays > 0 && (
                <span className="text-amber-600 font-medium">
                  {type.pendingDays}d pending
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Leave Applications History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Application Requests
        </h3>

        {applications.length === 0 ? (
          <EmptyState
            icon={Palmtree}
            title="No leave requests"
            description="You have not submitted any leave applications recently."
          />
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const isPending = app.status === 'pending';
              const isApproved = app.status === 'approved';
              const isRejected = app.status === 'rejected';

              return (
                <div
                  key={app.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {app.leaveTypeName}
                    </span>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {app.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="tabular-nums">
                      {app.startDate === app.endDate
                        ? app.startDate
                        : `${app.startDate} to ${app.endDate}`}
                    </span>
                    <span>·</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {app.daysCount} {app.daysCount === 1 ? 'day' : 'days'}
                    </span>
                    {app.isHalfDay && (
                      <span className="text-[10px] text-amber-600 font-medium">
                        ({app.halfDayPeriod === 'first_half' ? 'First Half' : 'Second Half'})
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                    "{app.reason}"
                  </p>

                  {app.reviewerRemarks && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60 mb-2">
                      <span className="font-medium text-slate-800 dark:text-slate-200">HR Note:</span>{' '}
                      {app.reviewerRemarks}
                    </div>
                  )}

                  {isPending && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setCancellingLeaveId(app.id)}
                        className="text-[11px] font-medium text-rose-600 hover:text-rose-700 px-2 py-1 rounded"
                      >
                        Cancel Request
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                New Leave Application
              </h3>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-3.5 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              {/* Leave Type Selector */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Leave Category
                </label>
                <select
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium"
                >
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.availableDays} days remaining)
                    </option>
                  ))}
                </select>
              </div>

              {/* Half-day toggle */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <span className="font-medium text-slate-800 dark:text-slate-200 block">
                    Half Day
                  </span>
                  <span className="text-[10px] text-slate-400">0.5 day deduction</span>
                </div>
                <input
                  type="checkbox"
                  checked={isHalfDay}
                  onChange={(e) => setIsHalfDay(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
              </div>

              {isHalfDay && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Select Half
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHalfDayPeriod('first_half')}
                      className={`h-9 rounded-lg font-medium transition-colors ${
                        halfDayPeriod === 'first_half'
                          ? 'bg-slate-900 text-white dark:bg-amber-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      First Half
                    </button>
                    <button
                      type="button"
                      onClick={() => setHalfDayPeriod('second_half')}
                      className={`h-9 rounded-lg font-medium transition-colors ${
                        halfDayPeriod === 'second_half'
                          ? 'bg-slate-900 text-white dark:bg-amber-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Second Half
                    </button>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-10 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-10 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Reason for Leave
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the reason for this absence..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="h-11 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 bg-slate-900 dark:bg-amber-600 text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancellingLeaveId}
        title="Cancel Leave Application"
        message="Are you sure you want to withdraw this pending leave request? This cannot be undone."
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep Request"
        isDestructive
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancellingLeaveId(null)}
      />
    </div>
  );
};
