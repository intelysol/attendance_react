import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.intelysol.hcm',
  appName: 'Intelysol HCM',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    Geolocation: {
      // High accuracy GPS verification for mobile employee attendance punches
    },
    App: {
      // Handles hardware back button and app lifecycle state
    },
  },
};

export default config;
