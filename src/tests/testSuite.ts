/**
 * Automated Verification & Testing Suite for Intelysol HCM Mobile
 * Validates domain logic, API clients, geofence formulas, and session workflows.
 */

import { apiClient } from '../services/api/client';
import { geolocationService, calculateDistanceMeters } from '../services/location/geolocationService';
import { secureStorage } from '../services/storage/secureStorage';
import { MOCK_EMPLOYEE } from '../services/api/mockAdapter';

export interface TestCaseResult {
  name: string;
  category: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export async function runAllAutomatedTests(): Promise<TestCaseResult[]> {
  const results: TestCaseResult[] = [];

  const runTest = async (
    name: string,
    category: string,
    fn: () => Promise<void> | void
  ) => {
    const start = performance.now();
    try {
      await fn();
      results.push({
        name,
        category,
        passed: true,
        message: 'Assertion passed successfully',
        durationMs: Math.round(performance.now() - start),
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      results.push({
        name,
        category,
        passed: false,
        message: error.message || 'Assertion failed',
        durationMs: Math.round(performance.now() - start),
      });
    }
  };

  // 1. Login & Token Session
  await runTest('1. Login & Session Creation', 'Authentication', async () => {
    const session = await apiClient.login('zayd.ahmed@intelysol.com');
    if (!session || !session.token) throw new Error('Expected valid token returned');
    if (session.employee.employeeCode !== 'INT-1042') throw new Error('Employee code mismatch');
  });

  // 2. Token Storage and Retrieval
  await runTest('2. Secure Storage Persistence', 'Authentication', async () => {
    const session = await secureStorage.getSession();
    if (!session) throw new Error('Session should be saved in secure storage');
  });

  // 3. Device Installation ID
  await runTest('3. Installation Device ID Generation', 'Device & Security', async () => {
    const devId = await secureStorage.getDeviceId();
    if (!devId || !devId.startsWith('mobile-')) throw new Error('Expected unique mobile device ID');
  });

  // 4. GPS Haversine Distance Formula
  await runTest('4. Haversine Distance Calculation', 'Geolocation', () => {
    // Distance between Karachi HQ (24.8607, 67.0611) and a nearby point (24.8610, 67.0611) ~ 33m
    const dist = calculateDistanceMeters(24.8607, 67.0611, 24.8610, 67.0611);
    if (dist < 20 || dist > 45) {
      throw new Error(`Distance calculated (${dist}m) was out of expected 33m bounds`);
    }
  });

  // 5. Geofence Evaluation Within Radius
  await runTest('5. Geofence Inside Boundary Check', 'Geolocation', () => {
    const evaluation = geolocationService.evaluateGeofence(
      24.8608,
      67.0612,
      12, // accuracy 12m
      24.8607,
      67.0611,
      250 // geofence radius 250m
    );
    if (!evaluation.isWithinGeofence) {
      throw new Error('Point inside 250m geofence evaluated as outside');
    }
    if (!evaluation.isAccuracyAcceptable) {
      throw new Error('12m accuracy should be deemed acceptable under 50m threshold');
    }
  });

  // 6. Geofence Evaluation Outside Radius
  await runTest('6. Geofence Out-of-Bounds Rejection', 'Geolocation', () => {
    // 5 km away
    const evaluation = geolocationService.evaluateGeofence(
      24.9000,
      67.1200,
      15,
      24.8607,
      67.0611,
      250
    );
    if (evaluation.isWithinGeofence) {
      throw new Error('Point 5km away must not be within 250m geofence');
    }
  });

  // 7. Poor GPS Accuracy Handling
  await runTest('7. Low Accuracy GPS Rejection', 'Geolocation', () => {
    const evaluation = geolocationService.evaluateGeofence(
      24.8608,
      67.0612,
      120, // poor accuracy ±120m
      24.8607,
      67.0611,
      250,
      50 // threshold 50m
    );
    if (evaluation.isAccuracyAcceptable) {
      throw new Error('GPS accuracy ±120m should fail accuracy threshold (±50m)');
    }
  });

  // 8. Attendance Punch Submission & State Update
  await runTest('8. Attendance Check-In Verification', 'Attendance', async () => {
    const res = await apiClient.recordPunch({
      type: 'in',
      latitude: 24.8608,
      longitude: 67.0612,
      accuracy_meters: 15,
      recorded_at: new Date().toISOString(),
      device_id: 'test-device-uuid',
      idempotency_key: `test-punch-${Date.now()}`,
    });
    if (!res.success) throw new Error('Punch failed to register');
    if (!res.punch.isWithinGeofence) throw new Error('Punch should be marked within geofence');
  });

  // 9. Attendance Summary API
  await runTest('9. Today Attendance Summary State', 'Attendance', async () => {
    const summary = await apiClient.getTodayAttendance();
    if (!summary || !summary.shift) throw new Error('Expected shift in summary');
    if (summary.punches.length === 0) throw new Error('Summary should reflect punch events');
  });

  // 10. Attendance Monthly History & Filtering
  await runTest('10. Monthly Attendance History Fetch', 'Attendance', async () => {
    const history = await apiClient.getAttendanceHistory(10, 2026);
    if (!Array.isArray(history) || history.length === 0) {
      throw new Error('Expected non-empty monthly history');
    }
  });

  // 11. Leave Types & Balances
  await runTest('11. Leave Balances Retrieval', 'Leave Management', async () => {
    const types = await apiClient.getLeaveTypes();
    if (types.length < 3) throw new Error('Expected multiple leave categories');
    const annual = types.find((t) => t.code === 'AL');
    if (!annual || annual.availableDays < 0) throw new Error('Invalid annual leave balance');
  });

  // 12. Leave Application Submission & Validation
  await runTest('12. Leave Application Flow', 'Leave Management', async () => {
    const types = await apiClient.getLeaveTypes();
    const app = await apiClient.applyLeave({
      leave_type_id: types[0].id,
      start_date: '2026-11-20',
      end_date: '2026-11-20',
      reason: 'Automated test suite leave application verification',
    });
    if (!app || app.status !== 'pending') {
      throw new Error('Leave application must be in pending status');
    }
  });

  // 13. Payslip List & Breakdown
  await runTest('13. Payslips Access & Calculations', 'Payroll', async () => {
    const slips = await apiClient.getPayslips();
    if (slips.length === 0) throw new Error('Expected published payslips');
    const first = slips[0];
    if (first.netSalary !== first.grossEarnings - first.totalDeductions) {
      throw new Error('Net salary must equal Gross Earnings minus Total Deductions');
    }
  });

  // 14. Announcements & Holidays
  await runTest('14. Corporate Announcements & Holidays', 'HR Services', async () => {
    const [announcements, holidays] = await Promise.all([
      apiClient.getAnnouncements(),
      apiClient.getHolidays(),
    ]);
    if (announcements.length === 0) throw new Error('No announcements returned');
    if (holidays.length === 0) throw new Error('No holidays returned');
  });

  // 15. Notification Mark-As-Read
  await runTest('15. Notification Center Flow', 'Notifications', async () => {
    const notifs = await apiClient.getNotifications();
    if (notifs.length === 0) throw new Error('No notifications found');
    await apiClient.markAllNotificationsRead();
  });

  // 16. Employee Contact Update
  await runTest('16. Profile Self-Service Contact Update', 'Profile', async () => {
    const updated = await apiClient.updateContactDetails(
      '+92 300 9999999',
      'Suite 505, PECHS Karachi',
      '+92 300 8888888'
    );
    if (updated.phone !== '+92 300 9999999') throw new Error('Contact update was not reflected');
  });

  return results;
}
