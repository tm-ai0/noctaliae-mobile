// ============================================
// 🌙 NOCTALIÆ - ANALYTICS CONFIGURATION
// ============================================

import * as Amplitude from '@amplitude/analytics-react-native';
import Constants from 'expo-constants';

// ============================================
// CONFIGURATION
// ============================================

const AMPLITUDE_API_KEY = process.env.AMPLITUDE_API_KEY || '';

const isProduction = !__DEV__;

// ============================================
// INITIALIZATION
// ============================================

let isInitialized = false;

export async function initAnalytics() {
  if (!AMPLITUDE_API_KEY && isProduction) {
    console.warn('⚠️ Amplitude API key not configured. Analytics disabled.');
    return;
  }
  
  if (isInitialized) {
    console.log('ℹ️ Analytics already initialized');
    return;
  }
  
  try {
    // Nouvelle API Amplitude v2+
    Amplitude.init(AMPLITUDE_API_KEY);
    
    isInitialized = true;
    console.log('✅ Analytics initialized');
    
  } catch (error) {
    console.error('❌ Analytics initialization failed:', error);
  }
}

// ============================================
// EVENT TRACKING
// ============================================

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (!isInitialized) {
    if (__DEV__) {
      console.log(`📊 [DEV] Event: ${eventName}`, properties);
    }
    return;
  }
  
  try {
    Amplitude.track(eventName, properties);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * Track screen view
 */
export function trackScreen(screenName: string, properties?: Record<string, any>) {
  trackEvent('screen_viewed', {
    screen_name: screenName,
    ...properties,
  });
}

// ============================================
// USER IDENTIFICATION
// ============================================

/**
 * Set user ID
 */
export function identifyUser(userId: string) {
  if (!isInitialized) return;
  
  try {
    Amplitude.setUserId(userId);
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
  if (!isInitialized) return;
  
  try {
    const identify = new Amplitude.Identify();
    
    Object.keys(properties).forEach((key) => {
      identify.set(key, properties[key]);
    });
    
    Amplitude.identify(identify);
  } catch (error) {
    console.error('Failed to set user properties:', error);
  }
}

/**
 * Clear user data (logout)
 */
export function clearUser() {
  if (!isInitialized) return;
  
  try {
    Amplitude.reset();
  } catch (error) {
    console.error('Failed to clear user:', error);
  }
}

// ============================================
// PREDEFINED EVENTS FOR NOCTALIÆ
// ============================================

export const Analytics = {
  // App lifecycle
  appOpened: () => {
    trackEvent('app_opened');
  },
  
  appClosed: () => {
    trackEvent('app_closed');
  },
  
  // Dream recording
  recordingStarted: () => {
    trackEvent('dream_recording_started');
  },
  
  recordingStopped: (duration: number) => {
    trackEvent('dream_recording_stopped', { duration_seconds: Math.floor(duration) });
  },
  
  recordingError: (error: string) => {
    trackEvent('dream_recording_error', { error_message: error });
  },
  
  // Dream analysis
  analysisStarted: (model: string, type: string) => {
    trackEvent('dream_analysis_started', { 
      model,
      analysis_type: type,
    });
  },
  
  analysisCompleted: (model: string, duration: number, type: string) => {
    trackEvent('dream_analysis_completed', {
      model,
      analysis_type: type,
      duration_seconds: Math.floor(duration),
    });
  },
  
  analysisError: (model: string, error: string) => {
    trackEvent('dream_analysis_error', {
      model,
      error_message: error,
    });
  },
  
  // Chat
  chatMessageSent: (model: string, messageLength: number) => {
    trackEvent('chat_message_sent', {
      model,
      message_length: messageLength,
    });
  },
  
  chatConversationStarted: (dreamId: string) => {
    trackEvent('chat_conversation_started', { dream_id: dreamId });
  },
  
  // UI interactions
  themeChanged: (oldTheme: string, newTheme: string) => {
    trackEvent('theme_changed', {
      old_theme: oldTheme,
      new_theme: newTheme,
    });
  },
  
  settingsChanged: (setting: string, value: any) => {
    trackEvent('settings_changed', {
      setting_name: setting,
      setting_value: value,
    });
  },
  
  // Premium
  premiumViewed: () => {
    trackEvent('premium_viewed');
  },
  
  premiumActivated: () => {
    trackEvent('premium_activated');
  },
  
  // Errors
  errorOccurred: (errorType: string, errorMessage: string, context?: string) => {
    trackEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      context,
    });
  },
  
  // Rate limiting
  rateLimitHit: (endpoint: string) => {
    trackEvent('rate_limit_hit', { endpoint });
  },
};

// ============================================
// PRIVACY HELPERS
// ============================================

/**
 * Opt out of analytics (RGPD compliance)
 */
export function optOut() {
  if (!isInitialized) return;
  
  try {
    Amplitude.setOptOut(true);
    console.log('✅ Analytics opt-out enabled');
  } catch (error) {
    console.error('Failed to opt out:', error);
  }
}

/**
 * Opt in to analytics
 */
export function optIn() {
  if (!isInitialized) return;
  
  try {
    Amplitude.setOptOut(false);
    console.log('✅ Analytics opt-in enabled');
  } catch (error) {
    console.error('Failed to opt in:', error);
  }
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
1. DANS App.js/App.tsx :

import { initAnalytics } from './src/config/analytics.config';

export default function App() {
  useEffect(() => {
    initAnalytics();
  }, []);
  
  return <YourApp />;
}

2. TRACK EVENTS :

import { Analytics } from '@/config/analytics.config';

// Recording
Analytics.recordingStarted();
Analytics.recordingStopped(30);

// Analysis
Analytics.analysisStarted('claude-sonnet-4', 'deep');
Analytics.analysisCompleted('claude-sonnet-4', 5.2, 'deep');

// Chat
Analytics.chatMessageSent('claude-sonnet-4', 150);

// Theme
Analytics.themeChanged('midnight', 'aurora');

3. SCREEN TRACKING :

import { trackScreen } from '@/config/analytics.config';

// Dans useEffect de chaque screen
useEffect(() => {
  trackScreen('HomeScreen');
}, []);

4. USER IDENTIFICATION :

import { identifyUser, setUserProperties } from '@/config/analytics.config';

// Lors de la connexion
identifyUser('user123');
setUserProperties({
  is_premium: true,
  preferred_model: 'claude-sonnet-4',
  theme: 'midnight',
});

5. PRIVACY (RGPD) :

import { optOut, optIn } from '@/config/analytics.config';

// Dans les settings
if (user.analyticsEnabled) {
  optIn();
} else {
  optOut();
}

6. CRÉER VOTRE COMPTE AMPLITUDE :

a) Va sur https://amplitude.com/
b) Crée un compte gratuit (10M events/mois gratuit)
c) Crée un nouveau projet "Noctaliæ"
d) Copie l'API Key
e) Ajoute-la dans ton .env :

AMPLITUDE_API_KEY=xxxxxxxxxxxxxxxxxxxxx

f) Installe le package :

npm install @amplitude/analytics-react-native

g) Redémarre l'app et vérifie dans Amplitude dashboard
*/
