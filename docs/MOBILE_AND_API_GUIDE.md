# Intelysol HCM Mobile — Production Architecture & Integration Guide

## 1. Executive Summary

**Intelysol HCM Mobile** is a production-grade enterprise mobile application built with **React, TypeScript, Vite, and Capacitor** for multi-tenant Laravel HCM SaaS deployments (`/api/v1/`).

Key mobile employee services:
- **GPS-Verified Mobile Attendance**: Live geofence validation, device GPS accuracy checking, and Leaflet + OpenStreetMap preview.
- **Attendance Calendar & Audit Log**: Monthly overview, date filters, status breakdown, and punch detail drawer.
- **Leave Self-Service**: Balances across allocated categories (Annual, Casual, Sick, WFH), request submission with half-day support, and cancellation flows.
- **Salary Statements (Payslips)**: Authenticated earnings & deductions breakdowns, tax calculations, and secure statement downloads.
- **Employee Profile**: Verified job assignments and self-service editable contact details.
- **Announcements, Holidays, & Notifications**: Real-time broadcast alerts and company calendar.
- **Automated Verification Suite**: 16 automated tests covering authentication, geofencing, punches, idempotency, and session storage.

---

## 2. Capacitor Mobile Configuration

### Application Identifiers
- **App Name**: `Intelysol HCM`
- **Application ID / Package**: `com.intelysol.hcm`
- **Target Platforms**: Android (`android/`) and iOS (`ios/`)
- **Web Build Directory**: `dist`

### Native Capabilities & Plugins
- `@capacitor/geolocation`: High-accuracy foreground GPS coordinates acquisition for punch validation.
- `@capacitor/preferences`: Encrypted key-value persistence for installation IDs and user preferences.
- `@capacitor/app`: Hardware back-button routing, active state lifecycle, and exit app prevention.

---

## 3. Backend Integration (`/api/v1/`)

The application consumes an authoritative Laravel multi-tenant API. Configure the endpoint via environment variables:

```env
VITE_API_BASE_URL="https://your-hcm-api.example.com/api/v1"
VITE_ENABLE_MOCK_FALLBACK="true"
```

### Authentication Contract
- **POST** `/api/v1/auth/login`
  - Body: `{ "identifier": "user@example.com", "password": "..." }`
  - Headers sent: `Accept: application/json`
  - Response: `{ "data": { "token": "...", "employee": {...}, "tenant": {...} } }`
- **POST** `/api/v1/auth/logout` (revokes server bearer token)

### GPS Attendance Punch Contract
- **POST** `/api/v1/attendance/punch`
  - Headers:
    - `Authorization: Bearer <token>`
    - `X-Tenant-ID: <tenant_id>`
    - `X-Idempotency-Key: <unique_client_operation_uuid>`
  - Request Body:
    ```json
    {
      "type": "in",
      "latitude": 24.8607,
      "longitude": 67.0611,
      "accuracy_meters": 14,
      "recorded_at": "2026-10-29T09:05:00+05:00",
      "device_id": "mobile-installation-id",
      "idempotency_key": "punch-in-174208000-abc123"
    }
    ```
  - Validation:
    - Client checks reported accuracy against `DEFAULT_ACCURACY_THRESHOLD_METERS` (50m).
    - Client evaluates Haversine distance against branch geofence radius.
    - Server remains authoritative for tenant isolation, punch acceptance, and timestamping.

---

## 4. Native Build & Deployment Instructions

### Prerequisites
1. **Node.js**: v18+ or v20+ with npm
2. **Android Studio**: Android SDK 33+, JDK 17, and Gradle 8+
3. **Xcode** (for iOS): macOS with Xcode 15+, CocoaPods or SPM, Apple Developer Team signing certificate

### Step-by-Step Android Build Commands

```bash
# 1. Install dependencies
npm install

# 2. Build production web assets
npm run build

# 3. Add Android platform (if not already added)
npx cap add android

# 4. Synchronize web assets and plugins to Android project
npm run cap:sync:android

# 5. Open project in Android Studio
npm run cap:android
```

#### Android Studio Build & Signing:
1. Open the `/android` folder in **Android Studio**.
2. Wait for Gradle sync to complete.
3. In `AndroidManifest.xml`, the following permissions are configured:
   - `android.permission.ACCESS_FINE_LOCATION`
   - `android.permission.ACCESS_COARSE_LOCATION`
   - `android.permission.INTERNET`
4. Select **Build > Generate Signed Bundle / APK**.
5. Choose **Android App Bundle (.aab)** for Google Play or **APK** for direct testing.
6. Provide or create your Keystore credentials (`release.keystore`).
7. Select **Release** build variant with V1 and V2 signature schemes checked.

### Step-by-Step iOS Build Commands (macOS)

```bash
# 1. Add iOS platform
npx cap add ios

# 2. Synchronize web assets and native plugins
npx cap sync ios

# 3. Open in Xcode
npx cap open ios
```

#### Xcode Signing & Entitlements:
1. Open `ios/App/App.xcworkspace` in Xcode.
2. Select the **App** target and navigate to **Signing & Capabilities**.
3. Select your registered **Apple Developer Team** and Bundle Identifier (`com.intelysol.hcm`).
4. Ensure `NSLocationWhenInUseUsageDescription` is specified in `Info.plist`:
   *"Intelysol HCM requires location access while using the app to verify GPS coordinates during attendance punches."*
5. Select **Product > Archive** and distribute via TestFlight or the App Store.

---

## 5. Development Mode vs. Live Backend Adapter

- **Mock Development Adapter**:
  - Seeded with comprehensive Karachi Tech Park HQ branch coordinates (`24.8607, 67.0611`), standard 09:00 - 18:00 shift, realistic attendance records, leave balances, published salary slips, and company announcements.
  - Interactive state transitions: punch check-ins flip to check-outs; leave requests decrease balance and appear in history.
- **Live Laravel Mode**:
  - Switch via the header **Demo / Live** badge or the **API Server Configuration** drawer in Profile.
  - Automatically sends Authorization Bearer and X-Tenant-ID headers to configured endpoint.

---

## 6. Automated Test Suite

Accessible in-app from **Profile > Run Automated Test Suite**:
1. Login & Session Creation
2. Secure Storage Persistence
3. Installation Device ID Generation
4. Haversine Great-Circle Distance Calculation
5. Geofence Inside Boundary Check
6. Geofence Out-of-Bounds Rejection
7. Low Accuracy GPS Rejection (±120m vs ±50m threshold)
8. Attendance Check-In Verification
9. Today Attendance Summary State
10. Monthly Attendance History Fetch
11. Leave Balances Retrieval
12. Leave Application Flow
13. Payslips Access & Net Remuneration Calculations
14. Corporate Announcements & Holidays
15. Notification Center Flow
16. Profile Self-Service Contact Update
