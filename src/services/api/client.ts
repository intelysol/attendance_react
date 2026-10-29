import { APP_CONFIG } from '../../config/constants';
import { secureStorage } from '../storage/secureStorage';
import { mockAdapter } from './mockAdapter';
import {
  AuthSession,
  EmployeeProfile,
  TodayAttendanceSummary,
  DailyAttendanceRecord,
  AttendancePunchRequest,
  AttendancePunchResponse,
  LeaveType,
  LeaveApplication,
  LeaveApplyRequest,
  Payslip,
  Announcement,
  Holiday,
  AppNotification,
  ApiResponse,
} from '../../types';

export class ApiError extends Error {
  status: number;
  data?: unknown;
  validationErrors?: Record<string, string[]>;

  constructor(message: string, status = 500, data?: unknown, validationErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.validationErrors = validationErrors;
  }
}

class ApiClient {
  private baseUrl: string;
  private isDevMockMode = true; // Defaults to mock adapter in local development sandbox unless overridden

  constructor() {
    this.baseUrl = (import.meta.env.VITE_API_BASE_URL as string) || APP_CONFIG.DEFAULT_API_BASE_URL;
    // Check if user has toggled dev mode in local preferences
    const savedDevMode = localStorage.getItem(APP_CONFIG.DEV_MODE_STORAGE_KEY);
    if (savedDevMode !== null) {
      this.isDevMockMode = savedDevMode === 'true';
    }
  }

  setDevMockMode(enabled: boolean) {
    this.isDevMockMode = enabled;
    localStorage.setItem(APP_CONFIG.DEV_MODE_STORAGE_KEY, String(enabled));
  }

  getIsDevMockMode(): boolean {
    return this.isDevMockMode;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url.trim().replace(/\/$/, '');
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Internal HTTP fetch wrapper
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs = 15000
  ): Promise<T> {
    const session = await secureStorage.getSession();
    const headers = new Headers(options.headers || {});

    headers.set('Accept', 'application/json');
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (session?.token) {
      headers.set('Authorization', `Bearer ${session.token}`);
    }

    if (session?.tenant?.id) {
      headers.set('X-Tenant-ID', session.tenant.id);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        await secureStorage.clearSession();
        window.dispatchEvent(new CustomEvent('intelysol:session-expired'));
        throw new ApiError('Session expired. Please log in again.', 401);
      }

      if (response.status === 429) {
        throw new ApiError('Too many requests. Please wait a moment and try again.', 429);
      }

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const message = json?.message || `HTTP ${response.status}: Request failed`;
        const validationErrors = json?.errors;
        throw new ApiError(message, response.status, json, validationErrors);
      }

      return json as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof ApiError) throw err;

      const error = err as { name?: string; message?: string };
      if (error.name === 'AbortError') {
        throw new ApiError('Request timed out. Please check your network connection.', 408);
      }

      throw new ApiError(
        error.message || 'Unable to connect to HCM server. Please verify your connection.',
        0
      );
    }
  }

  // --- Auth APIs ---

  async login(identifier: string, password?: string): Promise<AuthSession> {
    if (this.isDevMockMode) {
      return mockAdapter.login(identifier);
    }
    try {
      const res = await this.request<ApiResponse<AuthSession>>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      return res.data;
    } catch (err) {
      if (this.isDevMockModeFallback(err)) {
        return mockAdapter.login(identifier);
      }
      throw err;
    }
  }

  async logout(): Promise<void> {
    try {
      if (!this.isDevMockMode) {
        await this.request('/auth/logout', { method: 'POST' });
      }
    } catch {
      // Continue client cleanup regardless of server revocation error
    } finally {
      await secureStorage.clearSession();
    }
  }

  // --- Profile APIs ---

  async getProfile(): Promise<EmployeeProfile> {
    if (this.isDevMockMode) return mockAdapter.getProfile();
    try {
      const res = await this.request<ApiResponse<EmployeeProfile>>('/profile');
      return res.data;
    } catch (err) {
      if (this.isDevMockModeFallback(err)) return mockAdapter.getProfile();
      throw err;
    }
  }

  async updateContactDetails(phone: string, address: string, emergencyContact: string): Promise<EmployeeProfile> {
    if (this.isDevMockMode) {
      return mockAdapter.updateContactDetails(phone, address, emergencyContact);
    }
    try {
      const res = await this.request<ApiResponse<EmployeeProfile>>('/profile/contact', {
        method: 'PUT',
        body: JSON.stringify({ phone, address, emergency_contact: emergencyContact }),
      });
      return res.data;
    } catch (err) {
      if (this.isDevMockModeFallback(err)) {
        return mockAdapter.updateContactDetails(phone, address, emergencyContact);
      }
      throw err;
    }
  }

  // --- Attendance APIs ---

  async getTodayAttendance(): Promise<TodayAttendanceSummary> {
    if (this.isDevMockMode) return mockAdapter.getTodayAttendance();
    try {
      const res = await this.request<ApiResponse<TodayAttendanceSummary>>('/attendance/today');
      return res.data;
    } catch (err) {
      if (this.isDevMockModeFallback(err)) return mockAdapter.getTodayAttendance();
      throw err;
    }
  }

  async recordPunch(payload: AttendancePunchRequest): Promise<AttendancePunchResponse> {
    if (this.isDevMockMode) return mockAdapter.recordPunch(payload);
    try {
      const res = await this.request<ApiResponse<AttendancePunchResponse>>('/attendance/punch', {
        method: 'POST',
        headers: {
          'X-Idempotency-Key': payload.idempotency_key,
        },
        body: JSON.stringify(payload),
      });
      return res.data;
    } catch (err) {
      if (this.isDevMockModeFallback(err)) return mockAdapter.recordPunch(payload);
      throw err;
    }
  }

  async getAttendanceHistory(month: number, year: number): Promise<DailyAttendanceRecord[]> {
    if (this.isDevMockMode) return mockAdapter.getAttendanceHistory(month, year);
    try {
      const res = await this.request<ApiResponse<DailyAttendanceRecord[]>>(
        `/attendance/history?month=${month}&year=${year}`
      );
      return res.data;
    } catch (err) {
      if (this.isDevMockModeFallback(err)) return mockAdapter.getAttendanceHistory(month, year);
      throw err;
    }
  }

  // --- Leave APIs ---

  async getLeaveTypes(): Promise<LeaveType[]> {
    if (this.isDevMockMode) return mockAdapter.getLeaveTypes();
    try {
      const res = await this.request<ApiResponse<LeaveType[]>>('/leaves/types');
      return res.data;
    } catch (err) {
      if (this.isDevMockModeFallback(err)) return mockAdapter.getLeaveTypes();
      throw err;
    }
  }

  async getLeaveApplications(): Promise<LeaveApplication[]> {
    if (this.isDevMockMode) return mockAdapter.getLeaveApplications();
    try {
      const res = await this.request<ApiResponse<LeaveApplication[]>>('/leaves/applications');
      return res.data;
    } catch (err) {
      if (this.isDevMockModeFallback(err)) return mockAdapter.getLeaveApplications();
      throw err;
    }
  }

  async applyLeave(payload: LeaveApplyRequest): Promise<LeaveApplication> {
    if (this.isDevMockMode) return mockAdapter.applyLeave(payload);
    try {
      const res = await this.request<ApiResponse<LeaveApplication>>('/leaves/apply', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    } catch (err) {
      if (this.isDevMockModeFallback(err)) return mockAdapter.applyLeave(payload);
      throw err;
    }
  }

  async cancelLeave(leaveId: string): Promise<{ success: boolean; message: string }> {
    if (this.isDevMockMode) return mockAdapter.cancelLeave(leaveId);
    try {
      const res = await this.request<{ success: boolean; message: string }>(`/leaves/${leaveId}/cancel`, {
        method: 'POST',
      });
      return res;
    } catch (err) {
      if (this.isDevMockModeFallback(err)) return mockAdapter.cancelLeave(leaveId);
      throw err;
    }
  }

  // --- Payslips APIs ---

  async getPayslips(): Promise<Payslip[]> {
    if (this.isDevMockMode) return mockAdapter.getPayslips();
    try {
      const res = await this.request<ApiResponse<Payslip[]>>('/payslips');
      return res.data;
    } catch (err) {
      if (this.isDevMockModeFallback(err)) return mockAdapter.getPayslips();
      throw err;
    }
  }

  // --- Announcements, Holidays & Notifications ---

  async getAnnouncements(): Promise<Announcement[]> {
    if (this.isDevMockMode) return mockAdapter.getAnnouncements();
    try {
      const res = await this.request<ApiResponse<Announcement[]>>('/announcements');
      return res.data;
    } catch (err) {
      if (this.isDevMockModeFallback(err)) return mockAdapter.getAnnouncements();
      throw err;
    }
  }

  async getHolidays(): Promise<Holiday[]> {
    if (this.isDevMockMode) return mockAdapter.getHolidays();
    try {
      const res = await this.request<ApiResponse<Holiday[]>>('/holidays');
      return res.data;
    } catch (err) {
      if (this.isDevMockModeFallback(err)) return mockAdapter.getHolidays();
      throw err;
    }
  }

  async getNotifications(): Promise<AppNotification[]> {
    if (this.isDevMockMode) return mockAdapter.getNotifications();
    try {
      const res = await this.request<ApiResponse<AppNotification[]>>('/notifications');
      return res.data;
    } catch (err) {
      if (this.isDevMockModeFallback(err)) return mockAdapter.getNotifications();
      throw err;
    }
  }

  async markNotificationRead(id: string): Promise<void> {
    if (this.isDevMockMode) return mockAdapter.markNotificationRead(id);
    try {
      await this.request(`/notifications/${id}/read`, { method: 'POST' });
    } catch {
      // Ignore
    }
  }

  async markAllNotificationsRead(): Promise<void> {
    if (this.isDevMockMode) return mockAdapter.markAllNotificationsRead();
    try {
      await this.request('/notifications/read-all', { method: 'POST' });
    } catch {
      // Ignore
    }
  }

  private isDevMockModeFallback(err: unknown): boolean {
    const error = err as { status?: number };
    // If backend is unreachable or not implemented yet (404/500/0), use mock in development
    return (
      import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true' ||
      error.status === 0 ||
      error.status === 404 ||
      error.status === 502
    );
  }
}

export const apiClient = new ApiClient();
