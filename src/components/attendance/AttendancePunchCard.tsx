import React, { useState } from 'react';
import {
  TodayAttendanceSummary,
  Branch,
  AttendancePunchRequest,
} from '../../types';
import { StatusBadge } from '../feedback/StatusBadge';
import {
  geolocationService,
  LocationResult,
  GeofenceEvaluation,
} from '../../services/location/geolocationService';
import { secureStorage } from '../../services/storage/secureStorage';
import {
  MapPin,
  Compass,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface AttendancePunchCardProps {
  summary: TodayAttendanceSummary | null;
  branch: Branch;
  onPunchSuccess: () => void;
  onLocationUpdate?: (loc: LocationResult, evalResult: GeofenceEvaluation) => void;
}

export const AttendancePunchCard: React.FC<AttendancePunchCardProps> = ({
  summary,
  branch,
  onPunchSuccess,
  onLocationUpdate,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);
  const [currentEval, setCurrentEval] = useState<GeofenceEvaluation | null>(null);

  const nextActionType: 'in' | 'out' = summary?.isCurrentlyCheckedIn ? 'out' : 'in';

  const handlePerformPunch = async () => {
    setErrorMessage(null);
    setSuccessFeedback(null);
    setIsLocating(true);

    try {
      // Step 1: Check / Request GPS permissions
      await geolocationService.requestPermissions();

      // Step 2: Acquire current GPS position
      const position = await geolocationService.getCurrentPosition();

      // Step 3: Evaluate Geofence against assigned Branch
      const evalResult = geolocationService.evaluateGeofence(
        position.latitude,
        position.longitude,
        position.accuracy,
        branch.latitude,
        branch.longitude,
        branch.geofenceRadiusMeters
      );

      setCurrentEval(evalResult);
      if (onLocationUpdate) {
        onLocationUpdate(position, evalResult);
      }

      // Step 4: Validate accuracy threshold
      if (!evalResult.isAccuracyAcceptable) {
        throw new Error(evalResult.statusMessage);
      }

      // Step 5: Check branch geofence policy
      if (!evalResult.isWithinGeofence && !branch.allowOutsideGeofence) {
        throw new Error(
          `Out of bounds: You are ${evalResult.distanceMeters}m from ${branch.name}. Punch is only permitted within ${branch.geofenceRadiusMeters}m.`
        );
      }

      setIsLocating(false);
      setIsSubmitting(true);

      // Step 6: Construct Idempotency & Mobile Punch Request
      const deviceId = await secureStorage.getDeviceId();
      const idempotencyKey = `punch-${nextActionType}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const payload: AttendancePunchRequest = {
        type: nextActionType,
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy_meters: position.accuracy,
        recorded_at: new Date().toISOString(),
        device_id: deviceId,
        idempotency_key: idempotencyKey,
      };

      // Import dynamically or use apiClient
      const { apiClient } = await import('../../services/api/client');
      const response = await apiClient.recordPunch(payload);

      setSuccessFeedback(
        `Punch ${nextActionType === 'in' ? 'Check-In' : 'Check-Out'} verified at ${
          response.record.firstIn || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }`
      );

      // Refresh parent state
      onPunchSuccess();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Failed to verify GPS attendance punch.');
    } finally {
      setIsLocating(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all">
      {/* Top Row: Shift & Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Today's Shift
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {summary?.shift.name || 'Standard Morning Shift'}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <span className="tabular-nums">
              {summary?.shift.startTime || '09:00'} - {summary?.shift.endTime || '18:00'}
            </span>
            <span>·</span>
            <span>Grace: {summary?.shift.graceMinutes ?? 15}m</span>
          </div>
        </div>

        {summary && <StatusBadge status={summary.status} />}
      </div>

      {/* Working Time & Punches Grid */}
      <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl mb-4 border border-slate-100 dark:border-slate-800/80">
        <div className="text-center">
          <span className="text-[10px] text-slate-400 block font-medium">First IN</span>
          <span className="text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-200">
            {summary?.firstIn || '--:--'}
          </span>
        </div>
        <div className="text-center border-x border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-slate-400 block font-medium">Last OUT</span>
          <span className="text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-200">
            {summary?.lastOut || '--:--'}
          </span>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-slate-400 block font-medium">Worked</span>
          <span className="text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-200">
            {summary
              ? `${Math.floor(summary.currentWorkingMinutes / 60)}h ${summary.currentWorkingMinutes % 60}m`
              : '0h 0m'}
          </span>
        </div>
      </div>

      {/* Branch & Geofence Notice */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
        <span className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">{branch.name}</span>
        </span>
        <span className="text-[11px] text-slate-400 shrink-0">
          Geofence: {branch.geofenceRadiusMeters}m
        </span>
      </div>

      {/* Success Feedback Alert */}
      {successFeedback && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successFeedback}</span>
        </div>
      )}

      {/* Error Feedback Alert */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-start gap-2 text-xs text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Primary Punch CTA Button with Native Hitbox */}
      <button
        type="button"
        disabled={isLocating || isSubmitting}
        onClick={handlePerformPunch}
        className={`w-full min-h-[50px] px-4 rounded-xl font-medium text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 ${
          nextActionType === 'in'
            ? 'bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-500'
            : 'bg-amber-600 hover:bg-amber-700'
        }`}
      >
        {isLocating ? (
          <>
            <Compass className="w-4 h-4 animate-spin text-amber-300" />
            <span>Locking GPS Coordinates...</span>
          </>
        ) : isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Submitting Verification...</span>
          </>
        ) : nextActionType === 'in' ? (
          <>
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Verify & Check In (GPS)</span>
          </>
        ) : (
          <>
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>Verify & Check Out (GPS)</span>
          </>
        )}
      </button>

      {/* Evaluation info if obtained */}
      {currentEval && (
        <p className="text-[11px] text-center text-slate-400 mt-2.5">
          {currentEval.statusMessage}
        </p>
      )}
    </div>
  );
};
