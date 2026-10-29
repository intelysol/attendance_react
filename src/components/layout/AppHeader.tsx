import React from 'react';
import { Bell, WifiOff, MapPin, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNetwork } from '../../context/NetworkContext';

interface AppHeaderProps {
  onOpenNotifications: () => void;
  unreadNotificationsCount?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenNotifications,
  unreadNotificationsCount = 0,
}) => {
  const { employee, tenant, isMockMode, toggleMockMode } = useAuth();
  const { isOnline } = useNetwork();

  const getInitials = (name?: string) => {
    if (!name) return 'IH';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Offline banner if disconnected */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1 text-[11px] font-medium flex items-center justify-center gap-1.5 text-center">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>Offline mode · Showing cached data · Real-time attendance disabled</span>
        </div>
      )}

      <div className="px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: User Avatar + Tenant Context */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {employee?.avatarUrl ? (
              <img
                src={employee.avatarUrl}
                alt={employee.fullName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-semibold text-xs flex items-center justify-center tracking-wider">
                {getInitials(employee?.fullName)}
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                isOnline ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
              title={isOnline ? 'Connected' : 'Offline'}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {employee?.fullName || 'Intelysol HCM'}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
              <span>{employee?.designation || 'Employee'}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-0.5 truncate">
                <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                <span className="truncate">{employee?.branch?.city || 'HQ'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Mock / Live Switch + Notification trigger */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => toggleMockMode(!isMockMode)}
            title={isMockMode ? 'Dev Mock Mode Active: Click to switch to Live API' : 'Live API Active: Click for Mock Adapter'}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[10px] font-semibold transition-colors px-2 ${
              isMockMode
                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>{isMockMode ? 'Demo' : 'Live'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label="View notifications"
            className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5 stroke-[1.8]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2 right-2 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-amber-600 rounded-full">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
