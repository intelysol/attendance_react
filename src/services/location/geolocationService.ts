import { Geolocation, Position, PermissionStatus } from '@capacitor/geolocation';
import { APP_CONFIG } from '../../config/constants';

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface GeofenceEvaluation {
  distanceMeters: number;
  isWithinGeofence: boolean;
  geofenceRadiusMeters: number;
  accuracyMeters: number;
  isAccuracyAcceptable: boolean;
  accuracyThresholdMeters: number;
  statusMessage: string;
}

/**
 * Calculate Great-Circle distance between two coordinates using the Haversine formula (in meters)
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

class GeolocationService {
  /**
   * Check current device permission state
   */
  async checkPermissions(): Promise<PermissionStatus> {
    try {
      return await Geolocation.checkPermissions();
    } catch {
      // In web browser preview or environments without native wrapper
      if ('permissions' in navigator) {
        try {
          const res = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          return {
            location: res.state as 'prompt' | 'granted' | 'denied',
            coarseLocation: res.state as 'prompt' | 'granted' | 'denied',
          };
        } catch {
          // Fall through
        }
      }
      return { location: 'prompt', coarseLocation: 'prompt' };
    }
  }

  /**
   * Request location permission from user
   */
  async requestPermissions(): Promise<PermissionStatus> {
    try {
      return await Geolocation.requestPermissions();
    } catch {
      return this.checkPermissions();
    }
  }

  /**
   * Acquire current GPS location with high accuracy
   */
  async getCurrentPosition(timeoutMs = 12000): Promise<LocationResult> {
    try {
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 10000,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: Math.round(position.coords.accuracy),
        altitude: position.coords.altitude,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      };
    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };
      // Fallback to browser navigator.geolocation if Capacitor plugin fails in web preview
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: Math.round(pos.coords.accuracy),
                altitude: pos.coords.altitude,
                speed: pos.coords.speed,
                timestamp: pos.timestamp,
              });
            },
            (navErr) => {
              let message = 'Failed to obtain GPS fix.';
              if (navErr.code === 1) {
                message = 'Location permission was denied. Please allow location access in your device settings to verify attendance.';
              } else if (navErr.code === 2) {
                message = 'GPS position unavailable. Please ensure Location/GPS is turned on in your device.';
              } else if (navErr.code === 3) {
                message = 'Location request timed out. Please try again in an area with clear GPS reception.';
              }
              reject(new Error(message));
            },
            {
              enableHighAccuracy: true,
              timeout: timeoutMs,
              maximumAge: 10000,
            }
          );
        });
      }

      let message = 'GPS location error: ' + (error.message || 'Unable to retrieve location');
      if (error.code === 1) {
        message = 'Location permission was denied. Please grant location permissions in device settings.';
      }
      throw new Error(message);
    }
  }

  /**
   * Evaluate whether employee's location is within permitted branch geofence
   */
  evaluateGeofence(
    userLat: number,
    userLon: number,
    userAccuracy: number,
    branchLat: number,
    branchLon: number,
    geofenceRadius: number,
    accuracyThreshold = APP_CONFIG.DEFAULT_ACCURACY_THRESHOLD_METERS
  ): GeofenceEvaluation {
    const distanceMeters = calculateDistanceMeters(userLat, userLon, branchLat, branchLon);
    const isAccuracyAcceptable = userAccuracy <= accuracyThreshold;
    const isWithinGeofence = distanceMeters <= geofenceRadius + APP_CONFIG.MAX_GEOFENCE_EXPANSION_METERS;

    let statusMessage = '';
    if (!isAccuracyAcceptable) {
      statusMessage = `GPS accuracy is ±${userAccuracy}m (required: ±${accuracyThreshold}m). Please step outdoors or wait for GPS lock.`;
    } else if (isWithinGeofence) {
      statusMessage = `Verified within branch geofence (${distanceMeters}m away). Ready to punch.`;
    } else {
      statusMessage = `You are ${distanceMeters}m from the assigned branch (permitted radius: ${geofenceRadius}m).`;
    }

    return {
      distanceMeters,
      isWithinGeofence,
      geofenceRadiusMeters: geofenceRadius,
      accuracyMeters: userAccuracy,
      isAccuracyAcceptable,
      accuracyThresholdMeters: accuracyThreshold,
      statusMessage,
    };
  }
}

export const geolocationService = new GeolocationService();
