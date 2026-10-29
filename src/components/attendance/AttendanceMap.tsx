import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Branch } from '../../types';
import { LocationResult } from '../../services/location/geolocationService';

interface AttendanceMapProps {
  branch: Branch;
  userLocation: LocationResult | null;
  distanceMeters?: number;
  isWithinGeofence?: boolean;
  className?: string;
}

export const AttendanceMap: React.FC<AttendanceMapProps> = ({
  branch,
  userLocation,
  distanceMeters,
  isWithinGeofence,
  className = 'h-48 w-full',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const branchMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map centered at branch
      const map = L.map(mapContainerRef.current, {
        center: [branch.latitude, branch.longitude],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      // Add OpenStreetMap tile layer (no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size once rendered
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    const map = mapInstanceRef.current;

    // Custom SVG Icon for Branch HQ
    const branchIcon = L.divIcon({
      className: 'custom-branch-marker',
      html: `
        <div style="background-color: #0f172a; color: #f59e0b; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid #ffffff;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
            <path d="M9 22v-4h6v4"/>
            <path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/>
            <path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/>
            <path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    // Place or update Branch marker
    if (branchMarkerRef.current) {
      branchMarkerRef.current.setLatLng([branch.latitude, branch.longitude]);
    } else {
      branchMarkerRef.current = L.marker([branch.latitude, branch.longitude], {
        icon: branchIcon,
      })
        .addTo(map)
        .bindPopup(`<b>${branch.name}</b><br/>${branch.address}`);
    }

    // Geofence Circle (e.g. 250m around branch)
    const circleColor = isWithinGeofence ? '#059669' : '#d97706';
    if (geofenceCircleRef.current) {
      geofenceCircleRef.current.setLatLng([branch.latitude, branch.longitude]);
      geofenceCircleRef.current.setRadius(branch.geofenceRadiusMeters);
      geofenceCircleRef.current.setStyle({
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.12,
        weight: 1.5,
      });
    } else {
      geofenceCircleRef.current = L.circle([branch.latitude, branch.longitude], {
        radius: branch.geofenceRadiusMeters,
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.12,
        weight: 1.5,
      }).addTo(map);
    }

    // User Location Marker & Accuracy Circle
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="background-color: ${isWithinGeofence ? '#059669' : '#dc2626'}; color: #ffffff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid #ffffff;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/>
            </svg>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.latitude, userLocation.longitude]);
      } else {
        userMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], {
          icon: userIcon,
        })
          .addTo(map)
          .bindPopup('<b>Your Current Location</b><br/>GPS Verified');
      }

      // Accuracy radius around user
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([userLocation.latitude, userLocation.longitude]);
        accuracyCircleRef.current.setRadius(userLocation.accuracy);
      } else {
        accuracyCircleRef.current = L.circle(
          [userLocation.latitude, userLocation.longitude],
          {
            radius: userLocation.accuracy,
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.08,
            weight: 1,
            dashArray: '3, 6',
          }
        ).addTo(map);
      }

      // Fit map bounds to show both user and branch
      const bounds = L.latLngBounds([
        [branch.latitude, branch.longitude],
        [userLocation.latitude, userLocation.longitude],
      ]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
    } else {
      map.setView([branch.latitude, branch.longitude], 16);
    }
  }, [branch, userLocation, isWithinGeofence]);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[180px]" />

      {/* Floating Status Bar Overlay */}
      <div className="absolute bottom-2 left-2 right-2 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-lg px-3 py-2 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] shadow-sm">
        <div className="flex items-center gap-1.5 truncate">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isWithinGeofence ? 'bg-emerald-500' : userLocation ? 'bg-amber-500' : 'bg-slate-400'
            }`}
          />
          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
            {branch.name} ({branch.geofenceRadiusMeters}m geofence)
          </span>
        </div>

        {distanceMeters !== undefined && (
          <span className="shrink-0 font-semibold tabular-nums text-slate-700 dark:text-slate-300 ml-2">
            {distanceMeters}m away
          </span>
        )}
      </div>
    </div>
  );
};
