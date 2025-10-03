import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.terranovision.app',
  appName: 'TerranoVision',
  server: {
    url: 'http://terranovision.cloud',
    cleartext: true
  },
  android: {
    buildOptions: {
      releaseType: 'APK'
    }
  }
};

export default config;
