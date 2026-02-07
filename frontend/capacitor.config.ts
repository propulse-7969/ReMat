import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.remat.app',
  appName: 'Remat-App',
  webDir: 'dist',
  server: {
    androidScheme: 'http',  
    cleartext: true,        
  }
};

export default config;
