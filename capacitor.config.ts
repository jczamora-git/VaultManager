import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.vaultkey.app',
  appName: 'Vaultify',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
