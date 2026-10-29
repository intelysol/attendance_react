import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api/client';
import { TodayAttendanceSummary } from '../../types';
import { AttendanceMap } from '../../components/attendance/AttendanceMap';
import { AttendancePunchCard } from '../../components/attendance/AttendancePunchCard';
import { PunchTimeline } from '../../components/attendance/PunchTimeline';
import { LoadingState } from '../../components/feedback/LoadingState';
import {
  geolocationService,
  LocationResult,
  GeofenceEvaluation,
} from '../../services/location/geolocationService';
import { MapPin, Navigation, Calendar, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AttendanceScreen: React.FC = () => {
  const { employee } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<TodayAttendanceSummary | null>(null);
  const [userLocation, setUserLocation] = useState<LocationResult | null>(null);
  const [geofenceEval, setGeofenceEval] = useState<GeofenceEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);

  const loadAttendance = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getTodayAttendance();
      setSummary(data);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCurrentGps = async () => {
    if (!employee) return;
    setIsRefreshingGps(true);
    try {
      const pos = await geolocationService.getCurrentPosition();
      setUserLocation(pos);
      const evalRes = geolocationService.evaluateGeofence(
        pos.latitude,
        pos.longitude,
        pos.accuracy,
        employee.branch.latitude,
        employee.branch.longitude,
        employee.branch.geofenceRadiusMeters
      );
      setGeofenceEval(evalRes);
    } catch (err) {
      console.warn('GPS refresh notice:', err);
    } finally {
      setIsRefreshingGps(false);
    }
  };

  useEffect(() => {
    loadAttendance();
    refreshCurrentGps();
  }, []);

  if (isLoading && !summary) {
    return <LoadingState message="Loading attendance status..." />;
  }

  const branch = employee?.branch;

  return (
    <div className="p-4 space-y-4">
      {/* Top Header Row with History shortcut */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            GPS Attendance
          </h2>
          <p className="text-xs text-slate-500">
            Real-time geofence verification
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/attendance/history')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span>Calendar</span>
        </button>
      </div>

      {/* Leaflet + OpenStreetMap Preview */}
      {branch && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {branch.name}
              </span>
            </span>

            <button
              type="button"
              disabled={isRefreshingGps}
              onClick={refreshCurrentGps}
              className="flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-700 font-medium"
            >
              <RefreshCw
                className={`w-3 h-3 ${isRefreshingGps ? 'animate-spin' : ''}`}
              />
              <span>Refresh GPS</span>
            </button>
          </div>

          <AttendanceMap
            branch={branch}
            userLocation={userLocation}
            distanceMeters={geofenceEval?.distanceMeters}
            isWithinGeofence={geofenceEval?.isWithinGeofence}
            className="h-52 w-full"
          />
        </div>
      )}

      {/* Punch Action Card */}
      {branch && (
        <AttendancePunchCard
          summary={summary}
          branch={branch}
          onPunchSuccess={loadAttendance}
          onLocationUpdate={(loc, evalRes) => {
            setUserLocation(loc);
            setGeofenceEval(evalRes);
          }}
        />
      )}

      {/* Today's Punch Events Log */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Today's Punches
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 tabular-nums">
            {summary?.punches.length || 0} events
          </span>
        </div>

        <PunchTimeline punches={summary?.punches || []} />
      </div>

      {/* Branch & Policy Info Box */}
      {branch && (
        <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1 text-slate-600 dark:text-slate-400">
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            Attendance Verification Policy
          </div>
          <p className="leading-relaxed text-[11px]">
            Punch submission requires high-accuracy GPS verification within the {branch.geofenceRadiusMeters}m geofence perimeter of {branch.name}. Client timestamps are logged for auditability, but server-time is authoritative.
          </p>
        </div>
      )}
    </div>
  );
};
