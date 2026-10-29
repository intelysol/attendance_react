import { AttendanceStatus } from '../types';

export const APP_CONFIG = {
  APP_NAME: 'Intelysol HCM',
  APP_VERSION: '1.4.0',
  APP_BUILD: '20261029',
  APP_ID: 'com.intelysol.hcm',
  API_PREFIX: '/api/v1',
  DEFAULT_API_BASE_URL: (import.meta.env.VITE_API_BASE_URL as string) || 'https://your-hcm-api.example.com/api/v1',
  DEFAULT_ACCURACY_THRESHOLD_METERS: 50, // maximum permitted GPS accuracy radius for punch
  MAX_GEOFENCE_EXPANSION_METERS: 25,     // grace radius buffer
  SESSION_STORAGE_KEY: 'intelysol_auth_session',
  DEVICE_ID_STORAGE_KEY: 'intelysol_device_id',
  PREFERENCES_STORAGE_KEY: 'intelysol_user_prefs',
  OFFLINE_CACHE_KEY: 'intelysol_offline_cache',
  DEV_MODE_STORAGE_KEY: 'intelysol_dev_mode_enabled',
};

export const STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
  }
> = {
  present: {
    label: 'Present',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    borderClass: 'border-emerald-200 dark:border-emerald-800/60',
    dotClass: 'bg-emerald-500',
  },
  late: {
    label: 'Late',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    textClass: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-200 dark:border-amber-800/60',
    dotClass: 'bg-amber-500',
  },
  on_leave: {
    label: 'On Leave',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    textClass: 'text-blue-700 dark:text-blue-400',
    borderClass: 'border-blue-200 dark:border-blue-800/60',
    dotClass: 'bg-blue-500',
  },
  absent: {
    label: 'Absent',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40',
    textClass: 'text-rose-700 dark:text-rose-400',
    borderClass: 'border-rose-200 dark:border-rose-800/60',
    dotClass: 'bg-rose-500',
  },
  weekly_off: {
    label: 'Weekly Off',
    bgClass: 'bg-slate-100 dark:bg-slate-800/60',
    textClass: 'text-slate-600 dark:text-slate-400',
    borderClass: 'border-slate-200 dark:border-slate-700',
    dotClass: 'bg-slate-400',
  },
  holiday: {
    label: 'Holiday',
    bgClass: 'bg-purple-50 dark:bg-purple-950/40',
    textClass: 'text-purple-700 dark:text-purple-400',
    borderClass: 'border-purple-200 dark:border-purple-800/60',
    dotClass: 'bg-purple-500',
  },
  incomplete_punch: {
    label: 'Incomplete Punch',
    bgClass: 'bg-orange-50 dark:bg-orange-950/40',
    textClass: 'text-orange-700 dark:text-orange-400',
    borderClass: 'border-orange-200 dark:border-orange-800/60',
    dotClass: 'bg-orange-500',
  },
};
