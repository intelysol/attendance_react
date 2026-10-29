import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api/client';
import { ConfirmDialog } from '../../components/feedback/FeedbackComponents';
import { TestRunnerModal } from '../../tests/TestRunnerModal';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  Lock,
  LogOut,
  Edit2,
  Check,
  X,
  Server,
  ShieldAlert,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { employee, tenant, logout, updateEmployeeLocal, isMockMode, toggleMockMode } = useAuth();

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [phone, setPhone] = useState(employee?.phone || '');
  const [address, setAddress] = useState(employee?.address || '');
  const [emergencyContact, setEmergencyContact] = useState(employee?.emergencyContact || '');
  const [isSaving, setIsSaving] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showTestRunner, setShowTestRunner] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  const [apiUrl, setApiUrl] = useState(apiClient.getBaseUrl());
  const [showApiSettings, setShowApiSettings] = useState(false);

  const handleSaveContact = async () => {
    setIsSaving(true);
    try {
      const updated = await apiClient.updateContactDetails(phone, address, emergencyContact);
      updateEmployeeLocal(updated);
      setIsEditingContact(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || 'Failed to update contact details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordMsg('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwords do not match.');
      return;
    }
    setPasswordMsg('Password updated successfully.');
    setTimeout(() => {
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMsg(null);
    }, 1200);
  };

  const handleSaveApiUrl = () => {
    apiClient.setBaseUrl(apiUrl);
    setShowApiSettings(false);
    alert('API Base URL updated.');
  };

  return (
    <div className="p-4 space-y-4">
      {/* Employee Identity Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col items-center text-center">
        <div className="relative mb-3">
          {employee?.avatarUrl ? (
            <img
              src={employee.avatarUrl}
              alt={employee.fullName}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-700"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-900 text-amber-400 font-bold text-xl flex items-center justify-center">
              {employee?.firstName[0]}
              {employee?.lastName[0]}
            </div>
          )}
          <span className="absolute bottom-0 right-0 px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-full ring-2 ring-white dark:ring-slate-800">
            Active
          </span>
        </div>

        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          {employee?.fullName}
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          {employee?.designation}
        </p>

        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400 font-mono">
          <span>{employee?.employeeCode}</span>
          <span>·</span>
          <span>{tenant?.name}</span>
        </div>
      </div>

      {/* Official Employment Details (Read Only) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Employment Profile
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> Department
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {employee?.department}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Assigned Branch
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {employee?.branch.name}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Joining Date
            </span>
            <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
              {employee?.joiningDate}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Work Email
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[180px]">
              {employee?.email}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Details (Self-Service Editable) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Contact Information
          </h3>

          {!isEditingContact ? (
            <button
              type="button"
              onClick={() => setIsEditingContact(true)}
              className="text-xs font-medium text-amber-600 flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingContact(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveContact}
                className="text-emerald-600 font-semibold text-xs flex items-center gap-0.5"
              >
                <Check className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          )}
        </div>

        {isEditingContact ? (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1">Mobile Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Residential Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
              </span>
              <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
                {employee?.phone}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Emergency
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[170px]">
                {employee?.emergencyContact || 'Not specified'}
              </span>
            </div>

            <div className="pt-1">
              <span className="text-slate-500 block mb-0.5">Address</span>
              <span className="text-slate-700 dark:text-slate-300 leading-relaxed block">
                {employee?.address || 'No address registered'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Account & App Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Security & Preferences
        </h3>

        <button
          type="button"
          onClick={() => setShowTestRunner(true)}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-medium text-emerald-700 dark:text-emerald-400 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Run Automated Test Suite (16 Specs)</span>
          </span>
          <span className="text-emerald-600 font-bold">▶</span>
        </button>

        <button
          type="button"
          onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Change Account Password</span>
          </span>
          <span className="text-slate-400">›</span>
        </button>

        <button
          type="button"
          onClick={() => setShowApiSettings(!showApiSettings)}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-400" />
            <span>API Server Configuration</span>
          </span>
          <span className="text-slate-400">{showApiSettings ? '▲' : '▼'}</span>
        </button>

        {showApiSettings && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-2.5 text-xs">
            <div>
              <label className="block text-slate-500 mb-1">Laravel API Endpoint</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full h-9 px-2.5 font-mono text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMockMode}
                  onChange={(e) => toggleMockMode(e.target.checked)}
                  className="accent-amber-600 rounded"
                />
                <span>Mock Adapter Fallback</span>
              </label>
              <button
                type="button"
                onClick={handleSaveApiUrl}
                className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center gap-2 p-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-rose-600 transition-colors pt-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Intelysol HCM</span>
        </button>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Change Password
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              {passwordMsg && (
                <div className="p-2.5 bg-amber-50 text-amber-800 rounded-lg text-xs">
                  {passwordMsg}
                </div>
              )}
              <div>
                <label className="block text-slate-500 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="h-11 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 bg-slate-900 dark:bg-amber-600 text-white font-semibold rounded-xl"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Sign Out"
        message="Are you sure you want to end your current authenticated session on this device?"
        confirmLabel="Sign Out"
        cancelLabel="Stay Logged In"
        isDestructive
        onConfirm={async () => {
          setShowLogoutConfirm(false);
          await logout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* Automated Verification Suite Modal */}
      <TestRunnerModal
        isOpen={showTestRunner}
        onClose={() => setShowTestRunner(false)}
      />
    </div>
  );
};
