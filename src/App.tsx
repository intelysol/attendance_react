import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NetworkProvider } from './context/NetworkContext';
import { MobileFrame } from './components/layout/MobileFrame';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { LoadingState } from './components/feedback/LoadingState';

// Screens
import { LoginScreen } from './features/auth/LoginScreen';
import { HomeScreen } from './features/dashboard/HomeScreen';
import { AttendanceScreen } from './features/attendance/AttendanceScreen';
import { AttendanceHistoryScreen } from './features/attendance/AttendanceHistoryScreen';
import { LeaveScreen } from './features/leave/LeaveScreen';
import { PayslipsScreen } from './features/payslips/PayslipsScreen';
import { ProfileScreen } from './features/profile/ProfileScreen';

// Modals
import { NotificationsModal } from './features/notifications/NotificationsModal';
import { HolidaysModal } from './features/holidays/HolidaysModal';

function MainAppShell() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHolidays, setShowHolidays] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  // Native Android hardware back-button listener
  useEffect(() => {
    let listenerHandle: { remove: () => void } | null = null;

    try {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (showNotifications) {
          setShowNotifications(false);
          return;
        }
        if (showHolidays) {
          setShowHolidays(false);
          return;
        }
        if (canGoBack) {
          window.history.back();
        } else {
          CapApp.exitApp();
        }
      }).then((handle) => {
        listenerHandle = handle;
      });
    } catch {
      // In web browser context
    }

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [showNotifications, showHolidays]);

  if (isLoading) {
    return <LoadingState message="Initializing Intelysol HCM Mobile..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <BrowserRouter>
      <MobileFrame>
        {/* App Top Bar */}
        <AppHeader
          onOpenNotifications={() => setShowNotifications(true)}
          unreadNotificationsCount={unreadCount}
        />

        {/* Screen Routes */}
        <Routes>
          <Route
            path="/"
            element={<HomeScreen onOpenHolidays={() => setShowHolidays(true)} />}
          />
          <Route path="/attendance" element={<AttendanceScreen />} />
          <Route path="/attendance/history" element={<AttendanceHistoryScreen />} />
          <Route path="/leave" element={<LeaveScreen />} />
          <Route path="/payslips" element={<PayslipsScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Persistent Bottom Tab Bar */}
        <BottomNavigation />

        {/* Global Floating Modals */}
        <NotificationsModal
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          onNotificationsUpdated={() => setUnreadCount(0)}
        />

        <HolidaysModal
          isOpen={showHolidays}
          onClose={() => setShowHolidays(false)}
        />
      </MobileFrame>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <NetworkProvider>
      <AuthProvider>
        <MainAppShell />
      </AuthProvider>
    </NetworkProvider>
  );
}
