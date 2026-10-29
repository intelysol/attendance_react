import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api/client';
import { Payslip } from '../../types';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/FeedbackComponents';
import {
  Receipt,
  Download,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  X,
  FileCheck,
} from 'lucide-react';

export const PayslipsScreen: React.FC = () => {
  const { employee, tenant } = useAuth();

  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const loadPayslips = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getPayslips();
      setPayslips(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayslips();
  }, []);

  const handleDownload = (payslip: Payslip) => {
    setIsDownloading(true);
    // Simulate secure document stream generation
    setTimeout(() => {
      setIsDownloading(false);
      const content = `Intelysol HCM - Official Salary Statement\nPeriod: ${payslip.periodLabel}\nEmployee: ${employee?.fullName} (${employee?.employeeCode})\nNet Salary: ${tenant?.currency || 'PKR'} ${payslip.netSalary.toLocaleString()}\nDisbursed to: ${payslip.paymentMethod} (${payslip.bankAccountMasked})\nPayment Date: ${payslip.paymentDate}\nStatus: Verified and Published`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip_${payslip.year}_${payslip.month}_${employee?.employeeCode || 'INT'}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }, 800);
  };

  if (isLoading && payslips.length === 0) {
    return <LoadingState message="Loading payroll statements..." />;
  }

  const currency = tenant?.currency || 'PKR';

  return (
    <div className="p-4 space-y-4">
      {/* Top Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Salary Statements
        </h2>
        <p className="text-xs text-slate-500">
          Official monthly remuneration and tax records
        </p>
      </div>

      {payslips.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No payslips available"
          description="Your payroll records will appear here as soon as they are approved and published by HR."
        />
      ) : (
        <div className="space-y-3">
          {payslips.map((slip) => (
            <div
              key={slip.id}
              onClick={() => setSelectedPayslip(slip)}
              className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {slip.periodLabel}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded">
                  Published
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Net Disbursed Salary
                  </span>
                  <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    {currency} {slip.netSalary.toLocaleString()}
                  </span>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <span className="block">Gross: {currency} {slip.grossEarnings.toLocaleString()}</span>
                  <span className="block text-rose-600">
                    Deductions: -{currency} {slip.totalDeductions.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-700/60">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-slate-400" />
                  <span>{slip.bankAccountMasked || 'Bank Transfer'}</span>
                </span>
                <span>Paid: {slip.paymentDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payslip Breakdown Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Salary Slip · {selectedPayslip.periodLabel}
                </h3>
                <span className="text-xs text-slate-500">
                  {employee?.fullName} ({employee?.employeeCode})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayslip(null)}
                aria-label="Close payslip breakdown"
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Earnings Breakdown */}
            <div className="mb-4">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Earnings
              </h4>
              <div className="space-y-1.5 text-xs">
                {selectedPayslip.earnings.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/80"
                  >
                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {currency} {item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-1 font-bold text-emerald-700 dark:text-emerald-400">
                  <span>Gross Earnings</span>
                  <span className="tabular-nums">
                    {currency} {selectedPayslip.grossEarnings.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div className="mb-4">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Deductions & Taxes
              </h4>
              <div className="space-y-1.5 text-xs">
                {selectedPayslip.deductions.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/80"
                  >
                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                      -{currency} {item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-1 font-bold text-rose-700 dark:text-rose-400">
                  <span>Total Deductions</span>
                  <span className="tabular-nums">
                    -{currency} {selectedPayslip.totalDeductions.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Salary Box */}
            <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between mb-4">
              <span className="text-xs font-medium">Net Disbursed Salary</span>
              <span className="text-lg font-bold tabular-nums">
                {currency} {selectedPayslip.netSalary.toLocaleString()}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1 mb-4">
              <div>Bank: {selectedPayslip.paymentMethod}</div>
              <div>Account: {selectedPayslip.bankAccountMasked}</div>
              <div>Payment Date: {selectedPayslip.paymentDate}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPayslip(null)}
                className="h-11 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isDownloading}
                onClick={() => handleDownload(selectedPayslip)}
                className="h-11 bg-amber-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Downloading...' : 'Download Statement'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
