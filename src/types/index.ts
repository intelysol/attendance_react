/**
 * Core Data Models & API Contracts for Intelysol HCM Mobile
 * Strict TypeScript types aligned with Laravel HCM multi-tenant SaaS backend (/api/v1/)
 */

export interface TenantContext {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  currency: string;
  timezone: string;
}

export interface EmployeeProfile {
  id: string;
  employeeCode: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  emergencyContact?: string;
  address?: string;
  avatarUrl?: string;
  designation: string;
  department: string;
  branch: Branch;
  shift: Shift;
  joiningDate: string; // YYYY-MM-DD
  employmentStatus: 'active' | 'probation' | 'notice_period' | 'resigned' | 'terminated';
  role: 'employee' | 'manager' | 'hr_admin';
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number; // typically 100 - 300 meters
  requireGps: boolean;
  allowOutsideGeofence: boolean; // if true, allows punch with warning flag
}

export interface Shift {
  id: string;
  name: string;
  startTime: string; // HH:mm format, e.g. "09:00"
  endTime: string;   // HH:mm format, e.g. "18:00"
  graceMinutes: number; // e.g. 15 minutes before marked as late
  halfDayMinutes: number;
  workDays: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export type AttendanceStatus =
  | 'present'
  | 'late'
  | 'on_leave'
  | 'absent'
  | 'weekly_off'
  | 'holiday'
  | 'incomplete_punch';

export interface PunchEvent {
  id: string;
  type: 'in' | 'out';
  timestamp: string; // ISO 8601
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  distanceFromBranchMeters?: number;
  isWithinGeofence: boolean;
  verificationMethod: 'gps_mobile' | 'biometric_device' | 'manual_override';
  deviceInfo?: string;
  notes?: string;
}

export interface DailyAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  firstIn?: string; // ISO or HH:mm
  lastOut?: string; // ISO or HH:mm
  totalWorkingMinutes: number;
  expectedWorkingMinutes: number;
  lateMinutes: number;
  earlyDepartureMinutes: number;
  punches: PunchEvent[];
  shiftName: string;
  remarks?: string;
}

export interface TodayAttendanceSummary {
  date: string;
  serverTimestamp: string;
  shift: Shift;
  branch: Branch;
  status: AttendanceStatus;
  firstIn?: string;
  lastOut?: string;
  currentWorkingMinutes: number;
  isCurrentlyCheckedIn: boolean;
  permittedAction: 'check_in' | 'check_out' | 'none';
  punches: PunchEvent[];
  lateWarning?: string;
  incompleteWarning?: string;
}

export interface AttendancePunchRequest {
  type: 'in' | 'out';
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  recorded_at: string; // ISO-8601 client timestamp
  device_id: string;
  idempotency_key: string;
  battery_level?: number;
  notes?: string;
}

export interface AttendancePunchResponse {
  success: boolean;
  message: string;
  record: DailyAttendanceRecord;
  punch: PunchEvent;
  warning?: string;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  description: string;
  allocatedDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
  colorHex?: string;
  requiresAttachment: boolean;
  allowHalfDay: boolean;
}

export interface LeaveApplication {
  id: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  isHalfDay: boolean;
  halfDayPeriod?: 'first_half' | 'second_half';
  daysCount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedAt: string;
  reviewedAt?: string;
  reviewerRemarks?: string;
  attachmentName?: string;
}

export interface LeaveApplyRequest {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  is_half_day?: boolean;
  half_day_period?: 'first_half' | 'second_half';
  reason: string;
  attachment_url?: string;
}

export interface PayslipItem {
  name: string;
  amount: number;
  type: 'earning' | 'deduction';
  isTaxable?: boolean;
}

export interface Payslip {
  id: string;
  month: number;
  year: number;
  periodLabel: string; // e.g. "October 2026"
  paymentDate: string;
  grossEarnings: number;
  totalDeductions: number;
  netSalary: number;
  currency: string;
  status: 'published' | 'draft';
  paymentMethod: string;
  bankAccountMasked?: string;
  earnings: PayslipItem[];
  deductions: PayslipItem[];
  downloadUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  category: 'company' | 'hr' | 'event' | 'maintenance';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isPinned: boolean;
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  type: 'public' | 'optional' | 'restricted';
  description?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  category: 'attendance' | 'leave' | 'payroll' | 'announcement';
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface AuthSession {
  token: string;
  tokenType: string;
  expiresAt: string;
  employee: EmployeeProfile;
  tenant: TenantContext;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    total?: number;
    currentPage?: number;
    lastPage?: number;
    perPage?: number;
  };
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}
