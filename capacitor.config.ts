import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mediaforge.app',
  appName: 'MediaForge',
  webDir: 'src',
  server: {
    androidScheme: 'https',
    // For development, you can use your local server
    // url: 'http://192.168.1.x:3000',
    // cleartext: true,
  },
  plugins: {
    // Filesystem plugin for saving downloads
    Filesystem: {
      // Request storage permissions on Android
    },
    // Share plugin for sharing downloaded files
    Share: {},
    // Splash screen
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: true,
      spinnerColor: '#6366f1',
    },
    // Status bar
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f172a',
    },
  },
  android: {
    // Allow mixed content for development
    allowMixedContent: true,
    // Custom URL scheme
    // appendUserAgent: 'MediaForge-Android',
  },
  ios: {
    // iOS specific config
    contentInset: 'automatic',
    // appendUserAgent: 'MediaForge-iOS',
  },
};

export default config;
