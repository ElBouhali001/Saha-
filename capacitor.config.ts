
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a970c992092847a2a6ea693b68e09ab2',
  appName: 'medipatient-medic',
  webDir: 'dist',
  server: {
    url: 'https://a970c992-0928-47a2-a6ea-693b68e09ab2.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;
