import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api/client';
import {
  TodayAttendanceSummary,
  Announcement,
  LeaveType,
  Payslip,
} from '../../types';
import { AttendancePunchCard } from '../../components/attendance/AttendancePunchCard';
import { LoadingState } from '../../components/feedback/LoadingState';
import {
  Clock,
  CalendarDays,
  Receipt,
  Palmtree,
  CalendarCheck,
  ChevronRight,
  Megaphone,
  Briefcase,
  Layers,
} from 'lucide-react';

interface HomeScreenProps {
  onOpenHolidays: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenHolidays }) => {
  const navigate = useNavigate();
  const { employee, tenant } = useAuth();

  const [todaySummary, setTodaySummary] = useState<TodayAttendanceSummary | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [latestPayslip, setLatestPayslip] = useState<Payslip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [todayRes, annRes, leaveRes, payRes] = await Promise.all([
        apiClient.getTodayAttendance().catch(() => null),
        apiClient.getAnnouncements().catch(() => []),
        apiClient.getLeaveTypes().catch(() => []),
        apiClient.getPayslips().catch(() => []),
      ]);

      if (todayRes) setTodaySummary(todayRes);
      setAnnouncements(annRes);
      setLeaveTypes(leaveRes);
      if (payRes && payRes.length > 0) {
        setLatestPayslip(payRes[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalLeaveBalance = leaveTypes.reduce((acc, curr) => acc + curr.availableDays, 0);

  if (isLoading && !todaySummary) {
    return <LoadingState message="Loading your employee dashboard..." />;
  }

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="p-4 space-y-4">
      {/* Date & Shift Kicker */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {currentDateFormatted}
        </span>
        <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
          <Briefcase className="w-3 h-3 text-slate-400" />
          <span>{employee?.employeeCode}</span>
        </span>
      </div>

      {/* Attendance Action & Punch Card */}
      {employee && (
        <AttendancePunchCard
          summary={todaySummary}
          branch={employee.branch}
          onPunchSuccess={loadDashboardData}
        />
      )}

      {/* Monthly Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-medium text-slate-500">Present (Oct)</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            21 <span className="text-xs font-normal text-slate-400">/ 23 days</span>
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
            <span>1 Late arrival</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-medium text-slate-500">Leave Balance</span>
            <Palmtree className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {totalLeaveBalance} <span className="text-xs font-normal text-slate-400">days</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Across 4 categories</span>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Quick Services
        </h2>
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => navigate('/attendance')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5 shadow-xs">
              <Clock className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 text-center leading-tight">
              Attendance
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/leave')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5 shadow-xs">
              <CalendarDays className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 text-center leading-tight">
              Apply Leave
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/payslips')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 shadow-xs">
              <Receipt className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 text-center leading-tight">
              Payslips
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenHolidays}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1.5 shadow-xs">
              <Palmtree className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 text-center leading-tight">
              Holidays
            </span>
          </button>
        </div>
      </div>

      {/* Latest Published Payslip Preview Card */}
      {latestPayslip && (
        <div
          onClick={() => navigate('/payslips')}
          className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400">
              Latest Issued Payslip
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center font-medium">
              View Breakdown <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block">
                {latestPayslip.periodLabel}
              </span>
              <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {tenant?.currency || 'PKR'} {latestPayslip.netSalary.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 tabular-nums">
              Disbursed on {latestPayslip.paymentDate}
            </span>
          </div>
        </div>
      )}

      {/* Company Announcements Carousel / Card */}
      {announcements.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-600" />
              <h2 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Announcements
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 tabular-nums">
              {announcements.length} updates
            </span>
          </div>

          <div className="space-y-3">
            {announcements.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {item.title}
                  </h3>
                  {item.isPinned && (
                    <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                      Pinned
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {item.body}
                </p>
                <div className="text-[10px] text-slate-400 mt-2">
                  {new Date(item.publishedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
