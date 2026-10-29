import {
  TenantContext,
  EmployeeProfile,
  TodayAttendanceSummary,
  DailyAttendanceRecord,
  AttendancePunchRequest,
  AttendancePunchResponse,
  PunchEvent,
  LeaveType,
  LeaveApplication,
  LeaveApplyRequest,
  Payslip,
  Announcement,
  Holiday,
  AppNotification,
  AuthSession,
} from '../../types';

/**
 * Isolated Development Mock Adapter for Intelysol HCM SaaS
 * Matches the Laravel API v1 contract structure and data shapes.
 */

export const MOCK_TENANT: TenantContext = {
  id: 'ten-intelysol-01',
  name: 'Intelysol Technologies Ltd.',
  domain: 'app.intelysol.com',
  currency: 'PKR',
  timezone: 'Asia/Karachi',
};

export const MOCK_EMPLOYEE: EmployeeProfile = {
  id: 'emp-1042',
  employeeCode: 'INT-1042',
  tenantId: 'ten-intelysol-01',
  firstName: 'Zayd',
  lastName: 'Ahmed',
  fullName: 'Zayd Ahmed',
  email: 'zayd.ahmed@intelysol.com',
  phone: '+92 300 1234567',
  emergencyContact: '+92 321 7654321 (Spouse)',
  address: 'Suite 402, Al-Razi Heights, Block 6, PECHS, Karachi',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  designation: 'Senior Lead Solutions Architect',
  department: 'Software Engineering & Cloud',
  joiningDate: '2023-03-15',
  employmentStatus: 'active',
  role: 'employee',
  branch: {
    id: 'br-khi-hq',
    name: 'Karachi Tech Park HQ',
    code: 'KHI-01',
    address: 'Plot 43-A, Shahrah-e-Faisal, PECHS Block 6, Karachi',
    city: 'Karachi',
    latitude: 24.8607,
    longitude: 67.0611,
    geofenceRadiusMeters: 250,
    requireGps: true,
    allowOutsideGeofence: false,
  },
  shift: {
    id: 'sh-standard-01',
    name: 'Standard Morning Shift',
    startTime: '09:00',
    endTime: '18:00',
    graceMinutes: 15,
    halfDayMinutes: 240,
    workDays: [1, 2, 3, 4, 5], // Mon to Fri
  },
};

export const MOCK_LEAVE_TYPES: LeaveType[] = [
  {
    id: 'lt-annual',
    name: 'Annual Paid Leave',
    code: 'AL',
    description: 'Yearly earned vacation allowance',
    allocatedDays: 14,
    usedDays: 4,
    pendingDays: 1,
    availableDays: 9,
    colorHex: '#2563EB',
    requiresAttachment: false,
    allowHalfDay: true,
  },
  {
    id: 'lt-casual',
    name: 'Casual / Personal Leave',
    code: 'CL',
    description: 'Short notice personal matters and urgent affairs',
    allocatedDays: 10,
    usedDays: 3,
    pendingDays: 0,
    availableDays: 7,
    colorHex: '#059669',
    requiresAttachment: false,
    allowHalfDay: true,
  },
  {
    id: 'lt-sick',
    name: 'Medical / Sick Leave',
    code: 'SL',
    description: 'Health recovery and medical emergency leave',
    allocatedDays: 8,
    usedDays: 2,
    pendingDays: 0,
    availableDays: 6,
    colorHex: '#DC2626',
    requiresAttachment: true,
    allowHalfDay: false,
  },
  {
    id: 'lt-wfh',
    name: 'Remote / Work From Home',
    code: 'WFH',
    description: 'Approved remote working day balance',
    allocatedDays: 24,
    usedDays: 11,
    pendingDays: 0,
    availableDays: 13,
    colorHex: '#7C3AED',
    requiresAttachment: false,
    allowHalfDay: true,
  },
];

let mockLeaveApplications: LeaveApplication[] = [
  {
    id: 'la-101',
    leaveTypeId: 'lt-annual',
    leaveTypeName: 'Annual Paid Leave',
    startDate: '2026-11-04',
    endDate: '2026-11-04',
    isHalfDay: false,
    daysCount: 1,
    reason: 'Family event and personal appointment',
    status: 'pending',
    appliedAt: '2026-10-28T14:30:00+05:00',
  },
  {
    id: 'la-100',
    leaveTypeId: 'lt-casual',
    leaveTypeName: 'Casual / Personal Leave',
    startDate: '2026-10-14',
    endDate: '2026-10-14',
    isHalfDay: true,
    halfDayPeriod: 'second_half',
    daysCount: 0.5,
    reason: 'Vehicle maintenance and licensing renewal',
    status: 'approved',
    appliedAt: '2026-10-12T09:15:00+05:00',
    reviewedAt: '2026-10-12T11:00:00+05:00',
    reviewerRemarks: 'Approved by HR Operations',
  },
  {
    id: 'la-099',
    leaveTypeId: 'lt-sick',
    leaveTypeName: 'Medical / Sick Leave',
    startDate: '2026-09-22',
    endDate: '2026-09-23',
    isHalfDay: false,
    daysCount: 2,
    reason: 'Severe seasonal flu and viral fever',
    status: 'approved',
    appliedAt: '2026-09-22T07:45:00+05:00',
    reviewedAt: '2026-09-22T08:30:00+05:00',
    attachmentName: 'medical_certificate_dr_shoaib.pdf',
    reviewerRemarks: 'Get well soon',
  },
];

export const MOCK_PAYSLIPS: Payslip[] = [
  {
    id: 'ps-2026-09',
    month: 9,
    year: 2026,
    periodLabel: 'September 2026',
    paymentDate: '2026-09-30',
    grossEarnings: 275000,
    totalDeductions: 32500,
    netSalary: 242500,
    currency: 'PKR',
    status: 'published',
    paymentMethod: 'Bank Transfer (Meezan Bank)',
    bankAccountMasked: '**** **** **** 8821',
    earnings: [
      { name: 'Basic Salary', amount: 165000, type: 'earning' },
      { name: 'House Rent Allowance', amount: 55000, type: 'earning' },
      { name: 'Utility & Internet Allowance', amount: 25000, type: 'earning' },
      { name: 'Performance Incentive', amount: 20000, type: 'earning' },
      { name: 'Medical Allowance', amount: 10000, type: 'earning' },
    ],
    deductions: [
      { name: 'Income Tax (FBR Section 149)', amount: 24500, type: 'deduction' },
      { name: 'Provident Fund Contribution', amount: 7000, type: 'deduction' },
      { name: 'EOBI Contribution', amount: 1000, type: 'deduction' },
    ],
    downloadUrl: '/api/v1/payslips/ps-2026-09/download',
  },
  {
    id: 'ps-2026-08',
    month: 8,
    year: 2026,
    periodLabel: 'August 2026',
    paymentDate: '2026-08-31',
    grossEarnings: 275000,
    totalDeductions: 32500,
    netSalary: 242500,
    currency: 'PKR',
    status: 'published',
    paymentMethod: 'Bank Transfer (Meezan Bank)',
    bankAccountMasked: '**** **** **** 8821',
    earnings: [
      { name: 'Basic Salary', amount: 165000, type: 'earning' },
      { name: 'House Rent Allowance', amount: 55000, type: 'earning' },
      { name: 'Utility & Internet Allowance', amount: 25000, type: 'earning' },
      { name: 'Performance Incentive', amount: 20000, type: 'earning' },
      { name: 'Medical Allowance', amount: 10000, type: 'earning' },
    ],
    deductions: [
      { name: 'Income Tax (FBR Section 149)', amount: 24500, type: 'deduction' },
      { name: 'Provident Fund Contribution', amount: 7000, type: 'deduction' },
      { name: 'EOBI Contribution', amount: 1000, type: 'deduction' },
    ],
    downloadUrl: '/api/v1/payslips/ps-2026-08/download',
  },
  {
    id: 'ps-2026-07',
    month: 7,
    year: 2026,
    periodLabel: 'July 2026',
    paymentDate: '2026-07-31',
    grossEarnings: 260000,
    totalDeductions: 29500,
    netSalary: 230500,
    currency: 'PKR',
    status: 'published',
    paymentMethod: 'Bank Transfer (Meezan Bank)',
    bankAccountMasked: '**** **** **** 8821',
    earnings: [
      { name: 'Basic Salary', amount: 155000, type: 'earning' },
      { name: 'House Rent Allowance', amount: 52000, type: 'earning' },
      { name: 'Utility Allowance', amount: 23000, type: 'earning' },
      { name: 'Performance Incentive', amount: 20000, type: 'earning' },
      { name: 'Medical Allowance', amount: 10000, type: 'earning' },
    ],
    deductions: [
      { name: 'Income Tax', amount: 22000, type: 'deduction' },
      { name: 'Provident Fund', amount: 6500, type: 'deduction' },
      { name: 'EOBI', amount: 1000, type: 'deduction' },
    ],
    downloadUrl: '/api/v1/payslips/ps-2026-07/download',
  },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-01',
    title: 'Annual Performance Review Cycle 2026-Q4',
    body: 'The Q4 2026 performance appraisal portal is now open. Self-evaluation forms must be completed in the web portal by November 15, 2026.',
    category: 'hr',
    priority: 'high',
    isPinned: true,
    publishedAt: '2026-10-25T10:00:00+05:00',
  },
  {
    id: 'anc-02',
    title: 'Karachi Tech Park Power Maintenance Notice',
    body: 'Scheduled facility generator load testing will occur on Saturday from 14:00 to 18:00 PKT. Remote working guidelines apply for weekend shifts.',
    category: 'maintenance',
    priority: 'normal',
    isPinned: false,
    publishedAt: '2026-10-27T16:00:00+05:00',
  },
  {
    id: 'anc-03',
    title: 'Healthcare Insurance Card Distribution',
    body: 'Updated EFU Health Insurance cards have arrived at the reception desk. Please collect yours during regular office hours.',
    category: 'company',
    priority: 'low',
    isPinned: false,
    publishedAt: '2026-10-20T11:30:00+05:00',
  },
];

export const MOCK_HOLIDAYS: Holiday[] = [
  { id: 'hol-01', name: 'Iqbal Day', date: '2026-11-09', type: 'public', description: 'National public holiday' },
  { id: 'hol-02', name: 'Quaid-e-Azam Day / Christmas', date: '2026-12-25', type: 'public', description: 'National public holiday' },
  { id: 'hol-03', name: 'New Year Holiday', date: '2027-01-01', type: 'optional', description: 'Optional corporate leave' },
  { id: 'hol-04', name: 'Kashmir Day', date: '2027-02-05', type: 'public', description: 'National public holiday' },
  { id: 'hol-05', name: 'Pakistan Day', date: '2027-03-23', type: 'public', description: 'Commemoration of the Lahore Resolution' },
];

let mockNotifications: AppNotification[] = [
  {
    id: 'notif-01',
    title: 'Attendance Verified',
    body: 'Your GPS Check-In at Karachi Tech Park HQ was confirmed at 09:05 AM.',
    category: 'attendance',
    createdAt: '2026-10-29T09:05:00+05:00',
    isRead: false,
  },
  {
    id: 'notif-02',
    title: 'Payslip Available',
    body: 'Your September 2026 salary slip has been issued and is available for viewing.',
    category: 'payroll',
    createdAt: '2026-09-30T17:00:00+05:00',
    isRead: true,
  },
  {
    id: 'notif-03',
    title: 'Leave Request Approved',
    body: 'Your half-day casual leave on Oct 14 was approved by HR Operations.',
    category: 'leave',
    createdAt: '2026-10-12T11:00:00+05:00',
    isRead: true,
  },
];

// Interactive attendance state
let todaySummary: TodayAttendanceSummary = {
  date: '2026-10-29',
  serverTimestamp: '2026-10-29T09:05:00+05:00',
  shift: MOCK_EMPLOYEE.shift,
  branch: MOCK_EMPLOYEE.branch,
  status: 'present',
  firstIn: '09:05 AM',
  lastOut: undefined,
  currentWorkingMinutes: 135,
  isCurrentlyCheckedIn: true,
  permittedAction: 'check_out',
  punches: [
    {
      id: 'pnch-101',
      type: 'in',
      timestamp: '2026-10-29T09:05:12+05:00',
      latitude: 24.8608,
      longitude: 67.0612,
      accuracyMeters: 14,
      distanceFromBranchMeters: 18,
      isWithinGeofence: true,
      verificationMethod: 'gps_mobile',
      deviceInfo: 'Samsung Galaxy S24 / Android 14',
    },
  ],
};

// Past monthly attendance data generator
export function getMockAttendanceHistory(month: number, year: number): DailyAttendanceRecord[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const records: DailyAttendanceRecord[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();

    if (dateStr > '2026-10-29') {
      // Future dates
      continue;
    }

    if (dateStr === '2026-10-29') {
      // Today
      records.push({
        id: `att-${dateStr}`,
        date: dateStr,
        status: todaySummary.status,
        firstIn: todaySummary.firstIn,
        lastOut: todaySummary.lastOut,
        totalWorkingMinutes: todaySummary.currentWorkingMinutes,
        expectedWorkingMinutes: 540,
        lateMinutes: 5,
        earlyDepartureMinutes: 0,
        punches: todaySummary.punches,
        shiftName: MOCK_EMPLOYEE.shift.name,
      });
      continue;
    }

    // Weekly Off: Saturday (6) and Sunday (0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      records.push({
        id: `att-${dateStr}`,
        date: dateStr,
        status: 'weekly_off',
        totalWorkingMinutes: 0,
        expectedWorkingMinutes: 0,
        lateMinutes: 0,
        earlyDepartureMinutes: 0,
        punches: [],
        shiftName: MOCK_EMPLOYEE.shift.name,
        remarks: 'Weekend Off',
      });
      continue;
    }

    // Holiday sample
    if (day === 9 && month === 11) {
      records.push({
        id: `att-${dateStr}`,
        date: dateStr,
        status: 'holiday',
        totalWorkingMinutes: 0,
        expectedWorkingMinutes: 0,
        lateMinutes: 0,
        earlyDepartureMinutes: 0,
        punches: [],
        shiftName: MOCK_EMPLOYEE.shift.name,
        remarks: 'Iqbal Day Holiday',
      });
      continue;
    }

    // Leave sample
    if (day === 14 && month === 10) {
      records.push({
        id: `att-${dateStr}`,
        date: dateStr,
        status: 'on_leave',
        firstIn: '09:00 AM',
        lastOut: '01:30 PM',
        totalWorkingMinutes: 270,
        expectedWorkingMinutes: 540,
        lateMinutes: 0,
        earlyDepartureMinutes: 0,
        punches: [
          {
            id: `pnch-${dateStr}-in`,
            type: 'in',
            timestamp: `${dateStr}T09:00:00+05:00`,
            latitude: 24.8607,
            longitude: 67.0611,
            accuracyMeters: 12,
            distanceFromBranchMeters: 15,
            isWithinGeofence: true,
            verificationMethod: 'gps_mobile',
          },
          {
            id: `pnch-${dateStr}-out`,
            type: 'out',
            timestamp: `${dateStr}T13:30:00+05:00`,
            latitude: 24.8607,
            longitude: 67.0611,
            accuracyMeters: 15,
            distanceFromBranchMeters: 20,
            isWithinGeofence: true,
            verificationMethod: 'gps_mobile',
          },
        ],
        shiftName: MOCK_EMPLOYEE.shift.name,
        remarks: 'Half Day Approved Casual Leave',
      });
      continue;
    }

    // Late arrival sample (e.g. day 19)
    if (day === 19 && month === 10) {
      records.push({
        id: `att-${dateStr}`,
        date: dateStr,
        status: 'late',
        firstIn: '09:32 AM',
        lastOut: '06:15 PM',
        totalWorkingMinutes: 523,
        expectedWorkingMinutes: 540,
        lateMinutes: 17,
        earlyDepartureMinutes: 0,
        punches: [
          {
            id: `pnch-${dateStr}-in`,
            type: 'in',
            timestamp: `${dateStr}T09:32:00+05:00`,
            latitude: 24.8607,
            longitude: 67.0611,
            accuracyMeters: 16,
            distanceFromBranchMeters: 22,
            isWithinGeofence: true,
            verificationMethod: 'gps_mobile',
          },
          {
            id: `pnch-${dateStr}-out`,
            type: 'out',
            timestamp: `${dateStr}T18:15:00+05:00`,
            latitude: 24.8607,
            longitude: 67.0611,
            accuracyMeters: 18,
            distanceFromBranchMeters: 30,
            isWithinGeofence: true,
            verificationMethod: 'gps_mobile',
          },
        ],
        shiftName: MOCK_EMPLOYEE.shift.name,
        remarks: 'Late Arrival (Grace 15m exceeded)',
      });
      continue;
    }

    // Standard present
    records.push({
      id: `att-${dateStr}`,
      date: dateStr,
      status: 'present',
      firstIn: '08:55 AM',
      lastOut: '06:05 PM',
      totalWorkingMinutes: 550,
      expectedWorkingMinutes: 540,
      lateMinutes: 0,
      earlyDepartureMinutes: 0,
      punches: [
        {
          id: `pnch-${dateStr}-in`,
          type: 'in',
          timestamp: `${dateStr}T08:55:00+05:00`,
          latitude: 24.8607,
          longitude: 67.0611,
          accuracyMeters: 10,
          distanceFromBranchMeters: 12,
          isWithinGeofence: true,
          verificationMethod: 'gps_mobile',
        },
        {
          id: `pnch-${dateStr}-out`,
          type: 'out',
          timestamp: `${dateStr}T18:05:00+05:00`,
          latitude: 24.8607,
          longitude: 67.0611,
          accuracyMeters: 14,
          distanceFromBranchMeters: 24,
          isWithinGeofence: true,
          verificationMethod: 'gps_mobile',
        },
      ],
      shiftName: MOCK_EMPLOYEE.shift.name,
    });
  }

  return records.reverse();
}

/**
 * Mock API Adapter handlers matching Laravel API Resource routes
 */
export const mockAdapter = {
  async login(identifier: string): Promise<AuthSession> {
    await new Promise((r) => setTimeout(r, 600)); // simulate network latency
    return {
      token: 'hcm_jwt_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
      tokenType: 'Bearer',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      employee: {
        ...MOCK_EMPLOYEE,
        email: identifier.includes('@') ? identifier : MOCK_EMPLOYEE.email,
      },
      tenant: MOCK_TENANT,
    };
  },

  async getProfile(): Promise<EmployeeProfile> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_EMPLOYEE;
  },

  async updateContactDetails(phone: string, address: string, emergencyContact: string): Promise<EmployeeProfile> {
    await new Promise((r) => setTimeout(r, 300));
    MOCK_EMPLOYEE.phone = phone;
    MOCK_EMPLOYEE.address = address;
    MOCK_EMPLOYEE.emergencyContact = emergencyContact;
    return { ...MOCK_EMPLOYEE };
  },

  async getTodayAttendance(): Promise<TodayAttendanceSummary> {
    await new Promise((r) => setTimeout(r, 250));
    return { ...todaySummary };
  },

  async recordPunch(payload: AttendancePunchRequest): Promise<AttendancePunchResponse> {
    await new Promise((r) => setTimeout(r, 700));

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newPunch: PunchEvent = {
      id: `pnch-${Date.now()}`,
      type: payload.type,
      timestamp: payload.recorded_at,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracyMeters: payload.accuracy_meters,
      distanceFromBranchMeters: 25,
      isWithinGeofence: true,
      verificationMethod: 'gps_mobile',
      deviceInfo: 'Mobile GPS Verified',
      notes: payload.notes,
    };

    if (payload.type === 'in') {
      todaySummary = {
        ...todaySummary,
        status: 'present',
        firstIn: timeFormatted,
        isCurrentlyCheckedIn: true,
        permittedAction: 'check_out',
        punches: [...todaySummary.punches, newPunch],
      };
    } else {
      todaySummary = {
        ...todaySummary,
        lastOut: timeFormatted,
        isCurrentlyCheckedIn: false,
        permittedAction: 'check_in',
        punches: [...todaySummary.punches, newPunch],
      };
    }

    // Add to notifications
    mockNotifications.unshift({
      id: `notif-${Date.now()}`,
      title: payload.type === 'in' ? 'Check-In Confirmed' : 'Check-Out Confirmed',
      body: `GPS Attendance punch verified at ${timeFormatted} within ${MOCK_EMPLOYEE.branch.name}.`,
      category: 'attendance',
      createdAt: now.toISOString(),
      isRead: false,
    });

    const record: DailyAttendanceRecord = {
      id: `att-${todaySummary.date}`,
      date: todaySummary.date,
      status: todaySummary.status,
      firstIn: todaySummary.firstIn,
      lastOut: todaySummary.lastOut,
      totalWorkingMinutes: todaySummary.currentWorkingMinutes,
      expectedWorkingMinutes: 540,
      lateMinutes: 0,
      earlyDepartureMinutes: 0,
      punches: todaySummary.punches,
      shiftName: MOCK_EMPLOYEE.shift.name,
    };

    return {
      success: true,
      message: `Punch ${payload.type.toUpperCase()} recorded and verified successfully.`,
      punch: newPunch,
      record,
    };
  },

  async getAttendanceHistory(month: number, year: number): Promise<DailyAttendanceRecord[]> {
    await new Promise((r) => setTimeout(r, 300));
    return getMockAttendanceHistory(month, year);
  },

  async getLeaveTypes(): Promise<LeaveType[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_LEAVE_TYPES;
  },

  async getLeaveApplications(): Promise<LeaveApplication[]> {
    await new Promise((r) => setTimeout(r, 250));
    return [...mockLeaveApplications];
  },

  async applyLeave(payload: LeaveApplyRequest): Promise<LeaveApplication> {
    await new Promise((r) => setTimeout(r, 600));

    const leaveType = MOCK_LEAVE_TYPES.find((lt) => lt.id === payload.leave_type_id) || MOCK_LEAVE_TYPES[0];
    const startDate = new Date(payload.start_date);
    const endDate = new Date(payload.end_date);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const daysCount = payload.is_half_day ? 0.5 : diffDays;

    if (leaveType.availableDays < daysCount) {
      throw new Error(`Insufficient leave balance. You have ${leaveType.availableDays} days remaining for ${leaveType.name}.`);
    }

    const application: LeaveApplication = {
      id: `la-${Date.now()}`,
      leaveTypeId: leaveType.id,
      leaveTypeName: leaveType.name,
      startDate: payload.start_date,
      endDate: payload.end_date,
      isHalfDay: !!payload.is_half_day,
      halfDayPeriod: payload.half_day_period,
      daysCount,
      reason: payload.reason,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      attachmentName: payload.attachment_url ? 'supporting_document.pdf' : undefined,
    };

    // Deduct pending balance
    leaveType.pendingDays += daysCount;
    leaveType.availableDays -= daysCount;

    mockLeaveApplications.unshift(application);

    return application;
  },

  async cancelLeave(leaveId: string): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 400));
    const app = mockLeaveApplications.find((a) => a.id === leaveId);
    if (!app) {
      throw new Error('Leave application not found.');
    }
    if (app.status !== 'pending') {
      throw new Error('Only pending leave applications can be cancelled.');
    }
    app.status = 'cancelled';
    const type = MOCK_LEAVE_TYPES.find((t) => t.id === app.leaveTypeId);
    if (type) {
      type.pendingDays = Math.max(0, type.pendingDays - app.daysCount);
      type.availableDays += app.daysCount;
    }
    return { success: true, message: 'Leave application cancelled successfully.' };
  },

  async getPayslips(): Promise<Payslip[]> {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_PAYSLIPS;
  },

  async getAnnouncements(): Promise<Announcement[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_ANNOUNCEMENTS;
  },

  async getHolidays(): Promise<Holiday[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_HOLIDAYS;
  },

  async getNotifications(): Promise<AppNotification[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...mockNotifications];
  },

  async markNotificationRead(id: string): Promise<void> {
    const item = mockNotifications.find((n) => n.id === id);
    if (item) item.isRead = true;
  },

  async markAllNotificationsRead(): Promise<void> {
    mockNotifications.forEach((n) => (n.isRead = true));
  },
};
